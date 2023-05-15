const {defineConfig} = require("cypress");
const faker = require("faker");
const {SwaggerValidation} = require('@jc21/cypress-swagger-validation');

module.exports = defineConfig({

    env: {
        API_URL: "https://api-stage.knowyourcustomer.com/v2",
        payoneerUrl: "https://payoneer-sta.knowyourcustomer.com/",
        signalrUrl: "https://signalr-stage.knowyourcustomer.com/kyc-hub",
        uploadPortalUrl: "https://upload.payoneer-sta.knowyourcustomer.com/dashboard/singpass-myinfo?brand=payoneer",
        sharedAccountUrl: "https://sharedaccountsstage.knowyourcustomer.com",
        usePublicApiToken: true,
        clientId: "23c1bee93b434c64b7d100a27f6eceea",
        clientSecret: "c5c43a88e47f490e8eda3daaa76fc23c",
        clientId2: "73aa6cdf461c48f4b45bf4a0d3a7859f",
        clientSecret2: "1a284083abe9437ca2f717fa1d5a0a65",
        webHookBaseUrl: "https://webhook.site/",
        webHookKey: "c23569df-6c1a-4256-907a-6124e81d37e3",
        caseCommonId: "32426",
        another_user: {
            login: "autotesting.email@knowyourcustomer.com",
            password: "TstPs1!1",
        },
        admin_user: {
            login: "autotesting3@knowyourcustomer.com",
            password: "TstPs1!",
        },
        authToken: "",
    },
    e2e: {
        baseUrl: "https://payoneer-sta.knowyourcustomer.com/",
        experimentalStudio: true,
        setupNodeEvents(on, config) {
            on('task', SwaggerValidation(config));
            return config;
            // implement node event listeners here
        },
    },
});
