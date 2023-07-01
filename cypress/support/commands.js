Cypress.Commands.add('getSwagger', () => {
    return cy.request('https://api-stage.knowyourcustomer.com/swagger/v2/swagger.json');
});

Cypress.Commands.add('getTestData', () => {
    return cy.fixture('test_data.json');
});

Cypress.Commands.add('apiRequest', (method, url, body) => {
    return cy.request({
        method: method,
        url: url,
        body: body,
        failOnStatusCode: false
    });
});