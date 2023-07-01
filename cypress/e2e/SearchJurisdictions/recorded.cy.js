describe("Jurisdiction search", () => {
    before(() => {
        Cypress.config('baseUrl', Cypress.env('APP_URL'));
        const {login, password} = Cypress.env('admin_user');
        cy.loginAndGetRequestVerificationToken();
        cy.getClientCredentials();
    });
    const failedTests = Cypress.env("failedTests");
    failedTests.forEach((test) => {
        const country = test.country;
        const companyName = test.companyName;

        it(`Test Jurisdiction search for ${country}`, () => {
            cy.visit("/reactapp/case/search");
            cy.get("[data-element='jurisdiction-input']").click();
            cy.get("[data-element='jurisdiction-input']").type(country);
            cy.get("[data-element='company-name-or-number-input']").type(companyName);
            cy.get("[data-element='search-button").click();
            cy.location("href").should("eq", "undefined");
        });
    });
});
