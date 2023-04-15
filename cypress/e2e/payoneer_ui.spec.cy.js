// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// type definitions for custom commands like "createDefaultTodos"
/// <reference types="../support" />

// check this file using TypeScript if available
// @ts-check
const {generateRandomIndividualDetails, createIndividualData} = require("../support/helper");
describe('Payoneer UI', () => {
    before(() => {
        Cypress.config('baseUrl', Cypress.env('payoneerUrl'));
        cy.loginAndGetRequestVerificationToken();
        cy.getClientCredentials();
        const { login, password } = Cypress.env('admin_user');


        const individualDetails = generateRandomIndividualDetails();
        const individualData = createIndividualData(individualDetails);
        cy.createIndividual(individualData).then((response) => {
            expect(response.status).to.eq(200);
            Cypress.env("caseCommonId", response.body.caseDetail.details.common.caseCommonId);
        })
        // Create a random individual case using API for Payoneer customer
        // Wait until the individual case status is 'Ready'
    });

    it('Should request My Info documents using the API and open the Upload Portal', () => {
        // Request My Info documents using the API
        const { login, password } = Cypress.env('admin_user');
        cy.requestMyInfoDocument(Cypress.env("caseCommonId")).then((accessCode) => {
            cy.openUploadPortal();
            cy.enterAccessCodeAndGoToUploadPortal(accessCode);
        });
    });
});
