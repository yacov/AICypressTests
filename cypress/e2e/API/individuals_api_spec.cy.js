// cypress/integration/individuals_api_spec.cy.js
/// <reference types="cypress" />
const {generateRandomIndividualDetails, createIndividualData} = require('../../support/helper');
import spok from 'cy-spok'

describe('Individuals API', () => {

before(() => {
    Cypress.config('baseUrl', Cypress.env('API_URL'));

  cy.getClientCredentials()
});


    it('should create a new individual case', () => {
        const individualDetails = generateRandomIndividualDetails();
        const individualData = createIndividualData(individualDetails);

        cy.createIndividual(individualData).then((response) => {
            cy.wrap(response).should('have.nested.property', 'status', 200);
            cy.wrap(response.body).should(spok({
                caseNumber: spok.string,
                caseType: spok.string,
                caseStatus: spok.string,
                firstName: individualData.firstName,
                lastName: individualData.lastName,
                birthDate: individualData.birthDate,
                addressLine1: individualData.addressLine1,
                addressLine2: individualData.addressLine2,
                postcode: individualData.postcode,
                city: individualData.city,
                province: individualData.province,
                journeyName: individualData.journeyName,
                properties: individualData.properties,
                isManuallyCreated: true,
                isVisibleInLiveCases: true,
                rawAddress: individualData.rawAddress,
                nameTransposition: individualData.nameTransposition,
                userId: individualData.userId
            }));
        });
    })
});
