const fs = require("fs");
const path = require("path");
const {spawn} = require("child_process");
const openai = require("openai");

// Load the OpenAI API key from the openai_key.txt file
const apiKey = fs.readFileSync("openai_key.txt", "utf-8").trim();
openai.apiKey = apiKey;

async function runCypressTest(testPath, options = []) {
    return new Promise((resolve, reject) => {
        const cypress = spawn("cypress", ["run", "--spec", testPath, ...options]);

        let output = "";
        let errorOutput = "";

        cypress.stdout.on("data", (data) => {
            output += data.toString();
        });

        cypress.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });

        cypress.on("close", (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject({message: errorOutput, code});
            }
        });
    });
}

async function sendErrorToGPT4(testPath, errorMessage) {
    const testContent = fs.readFileSync(testPath, "utf-8");

    const prompt = `
Gleb Bahmutov, as a Cypress and JavaScript guru, please help me fix the following Cypress test:

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
        model: "gpt-4",
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
        console.error("Usage: node cypress_fixer.js <test_path>");
        process.exit(1);
    }

    const testPath = path.resolve(args[0]);

    // Make a backup of the original test
    const backupTestPath = `${testPath}.bak`;
    fs.copyFileSync(testPath, backupTestPath);

    while (true) {
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
            } catch (gptError) {
                console.error("An error occurred while communicating with GPT-4.");
                console.error(gptError);
                break;
            }
        }
    }
})();

