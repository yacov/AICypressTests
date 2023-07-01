const testData = require('../fixtures/test_data.json');
const commands = require('../support/commands.js');

describe('api_tests', () => {
  before(() => {
    cy.visit('https://api-stage.knowyourcustomer.com/swagger/v2/swagger.json');
  });

  it('should load swagger specification', () => {
    cy.request('GET', '/swagger/v2/swagger.json').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('swagger', '2.0');
    });
  });

  testData.forEach((test) => {
    it(`should pass test: ${test.description}`, () => {
      cy.request({
        method: test.method,
        url: test.path,
        body: test.body,
      }).then((response) => {
        expect(response.status).to.eq(test.expectedStatus);
        if (test.expectedBody) {
          expect(response.body).to.deep.equal(test.expectedBody);
        }
      });
    });
  });
});