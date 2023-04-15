import {fetchSwaggerSchema} from '../support/swaggerParser';
import {generateTests} from '../support/generateTests';
import * as path from "path";

describe('API tests with Swagger', () => {
    let swaggerSchema;
    let testCases;

    before(async () => {
        const swaggerUrl = 'https://api-stage.knowyourcustomer.com/swagger/v2/swagger.json';
        swaggerSchema = await fetchSwaggerSchema(swaggerUrl);
        testCases = generateTests(swaggerSchema);
    });

    testCases.forEach(({request, response, testData}, index) => {
        it(`Test case ${index}: ${request.method} ${request.url}`, () => {
            // Set environment variable data (e.g., login, url, and password)
            request.headers['Authorization'] = `Bearer ${Cypress.env('access_token')}`;
            request.url = request.url.replace('{url}', Cypress.env('url'));

            // Use cy.api, cy.spok, and cypress-swagger-validation to create tests
            cy.api({
                method: request.method,
                url: request.url,
                headers: request.headers,
                body: testData,
            }).then((response) => {
                // Use cypress-swagger-validation to validate the response
                cy.validateSwagger(swaggerSchema, request.method, path, response);

                // Use cy.spok for additional response validations
                cy.spok(responseObject, response.body);

                // Add any other custom validations and assertions
            });
        });
    });
});
