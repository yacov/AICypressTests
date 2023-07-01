const {defineConfig} = require("cypress");
const faker = require("faker");
const {SwaggerValidation} = require('@jc21/cypress-swagger-validation');
const {lighthouse, prepareAudit} = require("@cypress-audit/lighthouse");
const {pa11y} = require("@cypress-audit/pa11y");
module.exports = defineConfig({
  projectId: '7nsf69',

    env: {
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
            on("before:browser:launch", (browser = {}, launchOptions) => {
                prepareAudit(launchOptions);
            });

            on("task", {
                lighthouse: lighthouse({performance: 80, accessibility: 100, 'best-practices': 90, seo: 90, pwa: 100}),
                pa11y: pa11y(),
                SwaggerValidation: SwaggerValidation(config)
            });

            return config;
        }
    },
});
