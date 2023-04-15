///@ts-check
describe('Waystone DG 11', () => {
    before(() => {
        Cypress.config('baseUrl', Cypress.env('API_URL'));

        cy.getApiKey().then((token) => {
            Cypress.env('authToken', token);
        });
    });
    it('Check No Review Date Assigned When 1 Step Is Rejected', () => {
        const companyInfo = {
            entityName: 'API 1 Step Rejected Limited',
            codeiso31662: 'GB',
            companyType: 'Liability Company (LLC) (Non-Cayman or Cayman)'
        };

        cy.postImportCase(companyInfo)
            .then((response) => {
                const caseId = response.body.details.common.caseCommonId;
                return cy.companyCaseWaitForReadyStatus(caseId);
            })
            .then((caseId) => {
                const properties = [
                    {dataType: 'Case Reviewed by', data: Cypress.env('apiKeyAltFnOne')},
                    {dataType: 'Review date', data: '18/11/2020'},
                    {dataType: 'Case Accepted by', data: Cypress.env('apiKeyAltFnOne')},
                    {dataType: 'Accepted date', data: '19/11/2020'}
                ];

                return cy.postUpdateCaseProperties(caseId, properties);
            })
            .then((response) => {
                response.should((res) => {
                    expect(res.status).to.equal(200);
                });

                return response.body.caseCommonId;
            })
            .then((caseId) => {
                return cy.getListOfCaseSteps(caseId);
            })
            .then((response) => {
                const allCaseSteps = response.body;
                const identitySteps = allCaseSteps.filter(x => x.group === 'Identity')[0];
                const randomStep = identitySteps.steps[0];
                return {caseId, randomStep};
            })
            .then(({caseId, randomStep}) => {
                return cy.markAllStepsPassed(caseId)
                    .then(() => cy.updateStepStatus(caseId, randomStep.caseStepId, 'Failed', false));
            })
            .then(({caseId}) => {
                return cy.patchCloseOpenCompanyCase(caseId, 'Closed', true);
            })
            .then((response) => {
                response.should((res) => {
                    expect(res.status).to.equal(200);
                });

                return response.body.caseCommonId;
            })
            .then((caseId) => {
                return cy.getCaseInfo(caseId);
            })
            .then((response) => {
                expect(response.body.caseDetail.details.caseReviewDate).to.be.null;
            });
    });
});
