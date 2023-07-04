import _ from "cypress/types/lodash";

describe("Jurisdiction search", () => {
    let companies = [];
    before(() => {
        cy.fixture('jurisdictions.json').then((data) => {
            companies = data;
        });
        Cypress.config('baseUrl', Cypress.env('APP_URL'));
        const {login, password} = Cypress.env('admin_user');
        cy.loginAndGetRequestVerificationToken();
        cy.getClientCredentials();
    });
    beforeEach(() => {
        cy.intercept('POST', '/api/case/search').as('companySearch');
    });
    const failedTests = ["Germany", "Jersey"]
    failedTests.forEach((test) => {
        const country = test;
        const companyName = _.sample(companies[country]);

        it(`Test Jurisdiction search for ${country}`, () => {
            cy.visit("/reactapp/case/search");
            cy.log(`Searching for ${companyName} in ${country}`);
            cy.get("[data-element='jurisdiction-input']").type(country).type("{enter}");
            cy.get("[data-element='company-name-or-number-input']").type(companyName);
            cy.get("[data-element='search-button']").click();

        });
    });
});
