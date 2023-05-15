const fs = require("fs");
const path = require("path");
const {exec} = require("child_process");
const {spawn} = require("child_process");
const openai = require("openai");

// Load the OpenAI API key from the openai_key.txt file
//const apiKey = fs.readFileSync("openai_key.txt", "utf-8").trim();
openai.apiKey = "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";

async function runCypressTest(testPath, options = []) {
    const cmd = `npx cypress run --spec ${testPath} ${options.join(' ')}`;

    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`Cypress test failed with exit code: ${error.code}`);
                reject({message: stderr, code: error.code});
            } else {
                console.log("Cypress test completed successfully.");
                resolve(stdout);
            }
        });
    });
}

async function sendErrorToGPT4(testPath, errorMessage) {
    const testContent = fs.readFileSync(testPath, "utf-8");

    const prompt = `
Act as Gleb Bahmutov, Cypress and JavaScript guru, please help me fix the following Cypress test:

${testContent}

Here is the error message:

${errorMessage}

Please provide your suggested changes and explanations in JSON format. Remember to stick to the exact format as described below:

[
  {
    "operation": "Replace",
    "line": 5,
    "content": "cy.visit('/login')",
    "explanation": "Changed the visit URL to the correct login page."
  }
]
`;

    const response = await openai.ChatCompletion.create({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: prompt}],
        temperature: 1.0,
    });

    return response.choices[0].message.content.trim();
}

async function applyChanges(testPath, changesJson) {
    const originalTestLines = fs.readFileSync(testPath, "utf-8").split("\n");

    const changes = JSON.parse(changesJson);
    const operationChanges = changes.filter((change) => "operation" in change);
    const explanations = changes
        .filter((change) => "explanation" in change)
        .map((change) => change.explanation);

    operationChanges.sort((a, b) => b.line - a.line);

    const updatedTestLines = [...originalTestLines];
    operationChanges.forEach(({operation, line, content}) => {
        if (operation === "Replace") {
            updatedTestLines[line - 1] = content;
        } else if (operation === "Delete") {
            updatedTestLines.splice(line - 1, 1);
        } else if (operation === "InsertAfter") {
            updatedTestLines.splice(line, 0, content);
        }
    });

    fs.writeFileSync(testPath, updatedTestLines.join("\n"), "utf-8");

    console.log("\nExplanations:");
    explanations.forEach((explanation) => {
        console.log(`- ${explanation}`);
    });
}

(async function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.error("Usage: node AItestRunAndHeal.js <test_path>");
        process.exit(1);
    }

    const testPath = path.resolve(args[0]);

    // Make a backup of the original test
    const backupTestPath = `${testPath}.bak`;
    fs.copyFileSync(testPath, backupTestPath);
    const maxRetries = 5;  // Set your desired maximum number of retries
    let retryCount = 0;
    while (retryCount < maxRetries) {
        try {
            const output = await runCypressTest(testPath);
            console.log("Cypress test ran successfully.");
            console.log("Output:", output);
            break;
        } catch (error) {
            console.log("Cypress test failed. Trying to fix...");
            console.log("Error output:", error.message);

            try {
                const jsonResponse = await sendErrorToGPT4(testPath, error.message);
                await applyChanges(testPath, jsonResponse);
                console.log("Changes applied. Rerunning...");
                retryCount++;
            } catch (gptError) {
                console.error("An error occurred while communicating with GPT-4.");
                console.error(gptError);
                break;
            }
        }
    }
    if (retryCount >= maxRetries) {
        console.error(`Maximum retries (${maxRetries}) exceeded. Stopping the script.`);
    }
})();

