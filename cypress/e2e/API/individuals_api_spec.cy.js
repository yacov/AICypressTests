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
                caseDetail: {
                    details: {
                        individual: {
                            firstName: individualData.firstName,
                            lastName: individualData.lastName,
                            countryCodeISO31662: spok.string,
                            country: spok.string,
                            nameTransposition: spok.type('boolean'),
                        },
                        isCaseAMLPositive: spok.type('boolean'),
                        common: {
                            typeString: 'Individual',
                            status: spok.string,
                            isVisible: spok.type('boolean'),
                            isVisibleInLiveCases: spok.type('boolean'),
                        },
                        caseAddress: {
                            country: spok.string,
                            rawAddress: spok.string,
                        }
                    }
                }
            }));
        });
    })
});
