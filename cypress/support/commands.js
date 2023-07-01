
/// <reference types="cypress" />
/// <reference types="../support" />
const apiUrl = Cypress.env('API_URL');
const apiToken = Cypress.env('authToken');
const headers = {
    'Accept': 'application/json, text/json, text/x-json, text/javascript, application/xml, text/xml',
    'Authorization': `Bearer ${apiToken}`
};
const {login: userName, password} = Cypress.env('admin_user');


Cypress.Commands.add('newGetSignalRToken', () => {
    const apiUrl = Cypress.env('API_URL');
    const relUri = `${apiUrl}bff-api/KycSignalR/Authorize`;


    return cy.api({
        method: 'GET',
        url: relUri,
    }).then((response) => {
        expect(response.status).to.eq(200);
        return response.body.token;
    });
});
Cypress.Commands.add('updateWebhookUrl', (url) => {
    const relUri = '/Admin/UpdateWebhook';
    const _userDTO = Cypress.env('admin_user');

    const body = {
        UseBasicAuthentication: false,
        Username: _userDTO.login,
        Password: _userDTO.password,
        Url: url,
    };

    cy.request({
        method: 'POST',
        url: relUri,
        body: body,
        headers: {
            'Authorization': `Bearer ${Cypress.env('clientSecret')}`
        }
    }).then((response) => {
        expect(response.status).to.eq(200)
        const content = response.body
        const result = content.success.toString()
        return result
    })
})
Cypress.Commands.add('getCaseProgress', (caseId, caseType) => {
    const apiUrl = Cypress.env('API_URL');
    const relUri = `/case${caseType}/${caseId}/refresh?IsAMLCheckCase=false`;

    return cy.api({
        headers: {
            authorization: `Bearer ${Cypress.env('authToken')}`
        },
        method: 'GET',
        url: apiUrl + relUri,
    }).then((response) => {
        expect(response.status).to.eq(200);
        return response.body;
    });
});
Cypress.Commands.add('createIndividual', (individualData) => {
    return cy.api({
        method: 'POST',
        url: apiUrl+'/Individuals',
        headers: {
            'Authorization': `Bearer ${Cypress.env('authToken')}`,
            'Content-Type': 'application/json-patch+json'
        },
        body: individualData
    });
});
Cypress.Commands.add('waitForIndividualCaseStatus', (caseId, status) => {
    const attempts = 40;
    const delayBetweenStatusCheck = 15000;

    const checkStatus = (attempt) => {
        if (attempt === 0) {
            throw new Error(`Case ${caseId} was not moved to status ${status} in ${delayBetweenStatusCheck * attempts / 1000} sec.`);
        }

        return cy.getCaseProgress(caseId, 'individual').then((caseProgress) => {
            const currentStatus = caseProgress.IndividualProfile.CurrentStatus;

            if (currentStatus !== status) {
                cy.wait(delayBetweenStatusCheck);
                checkStatus(attempt - 1);
            }
        });
    };

    return checkStatus(attempts);
});
const spok = require("cy-spok");
Cypress.Commands.add('getClientCredentials', () => {
         cy.request({
            method: 'POST',
            url: 'https://sharedaccountsstage.knowyourcustomer.com/connect/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: true,
            body: {
                'grant_type': 'client_credentials',
                'client_id': Cypress.env('clientId'),
                'client_secret': Cypress.env('clientSecret'),
                'audience': 'PublicApi'
            }
        }).then((response) => {
             expect(response).to.have.property("status", 200);
             expect(response.body)
                 .to.have.property("access_token")
             Cypress.env("authToken", response.body.access_token);
        });
    });
Cypress.Commands.add('login', (username = userName, password = password) => {
    cy.visit('/Account/Login?ReturnUrl=%2F');
    cy.get('#Email').type(username);
    cy.get('#Password').type(password);
    cy.get('.button-login').click();
    cy.url().should('contains', '/reactapp/caselist/live');
})
Cypress.Commands.add('loginSession', (username, password) => {
    cy.session((session) => {
        session.visit('/Account/Login?ReturnUrl=%2F');
        session.get('#Email').type(username);
        session.get('#Password').type(password);
        session.get('.button-login').click();
        session.url().should('contain', 'reactapp/caselist/live');
    });
});
// Log in and retrieve the __RequestVerificationToken value
// cypress/support/commands.js

Cypress.Commands.add('loginAndGetRequestVerificationToken', () => {
    const {login, password} = Cypress.env('admin_user');
    const loginUrl = `${Cypress.env('payoneerUrl')}account/login?ReturnUrl=%2Fapp`;

    return cy.request(loginUrl).then((response) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(response.body, 'text/html');
        const requestVerificationToken = doc.querySelector(
            'input[name="__RequestVerificationToken"]'
        ).value;
        const bUrl = Cypress.env('payoneerUrl');
        const loginPayload = {
            __RequestVerificationToken: requestVerificationToken,
            Email: login,
            Password: password,
            ReturnUrl: '/app',
        };

        return cy.request({
            method: 'POST',
            url: `${bUrl}Account/Login`,
            form: true,
            body: loginPayload,
        }).then(() => {
            return requestVerificationToken;
        });
    });
});

Cypress.Commands.add('getSignalRToken', () => {
    const apiUrl = Cypress.env('API_URL');
    const relativeUri = `${apiUrl}bff-api/KycSignalR/Authorize`;

    return cy
        .request({
            method: 'GET',
            url: relativeUri,
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then((response) => {
            expect(response.status).to.eq(200);
            const token = response.body.token;
            expect(token).to.exist;
            Cypress.env("authToken", token);
        });
});


Cypress.Commands.add('postImportCase', (companyInfo) => {
    return cy.api({
        method: 'POST',
        url: `${apiUrl}/companies/import`,
        headers: headers,
        body: companyInfo
    });
});
Cypress.Commands.add('getCaseInfo', (caseCommonId) => {
    return cy.api({
        method: 'GET',
        url: `${apiUrl}/companies/${caseCommonId}`,
        headers: headers
    });
});
Cypress.Commands.add('companyCaseWaitForReadyStatus', (caseId, waitTimeInMinutes = 18) => {
    const maxAttempts = 15;
    const waitTime = (waitTimeInMinutes * 60000) / maxAttempts;
    let attempts = 0;

    function checkStatus() {
        attempts++;
        return cy.getCaseInfo(caseId).then((response) => {
            const caseStatusId = response.body.caseDetail.details.common.statusId;
            if (caseStatusId !== 3 && attempts < maxAttempts) {
                cy.wait(waitTime);
                return checkStatus();
            }
            if (caseStatusId !== 3) {
                throw new Error(`Case ${caseId} was not moved to Ready status after ${waitTimeInMinutes} minutes. Current status is ${response.body.caseDetail.details.common.statusName}`);
            }
        });
    }

    return checkStatus();
});
Cypress.Commands.add('postUpdateCaseProperties', (caseCommonId, properties) => {
    return cy.api({
        method: 'POST',
        url: `${apiUrl}/companies/${caseCommonId}/properties`,
        headers: headers,
        body: properties
    });
});
Cypress.Commands.add('getListOfCaseSteps', (caseCommonId) => {
    return cy.api({
        method: 'GET',
        url: `${apiUrl}/casesteps/${caseCommonId}`,
        headers: headers
    });
});
Cypress.Commands.add('markAllStepsPassed', (caseId) => {
    return cy.getListOfCaseSteps(caseId).then((response) => {
        const caseSectionsList = response.body;

        caseSectionsList.forEach((section) => {
            const notReviewedSteps = section.steps.filter(x => x.status.toUpperCase() === 'NOTREVIEWED' || x.status === 'SystemUpdated');
            const filteredSteps = notReviewedSteps.filter(s => s.name !== 'Company Identity' && s.name !== 'Identity');

            filteredSteps.forEach((step) => {
                cy.updateStepStatus(caseId, step.caseStepId, 'Passed', false);
            });
        });
    });
});
Cypress.Commands.add('updateStepStatus', (caseCommonId, stepId, status,isCollapsed) => {
    return cy.api({
        method: 'PATCH',
        url: `${apiUrl}/casesteps/${caseCommonId}/status/${stepId}`,
        headers: headers,
        body: {
            status,
            isCollapsed
        }
    });
});
Cypress.Commands.add('patchCloseOpenCompanyCase', (caseCommonId, statusNeedToBeSet, newUser) => {
    return cy.api({
        method: 'PATCH',
        url: `${apiUrl}/companies/${caseCommonId}/status`,
        headers: headers,
        body: {
            status: statusNeedToBeSet
        }
    });
});
Cypress.Commands.add('requestMyInfoDocument', (caseId, phoneNumber = '+905355671388', expectError = false) => {
    const removeSpecialCharacters = (input) => input.replace(/[^\w]/g, '');

    const apiUrl = Cypress.env('API_URL');
    const authToken = Cypress.env('authToken');
    const body = {
        caseCommonId: caseId,
        documents: ['myInfo'],
        email: '',
        phone: phoneNumber,
        allowEdit: true,
        documentRequestMethodType: 4,
    };

    cy.request({
        method: 'POST',
        url: `${apiUrl}/individuals/${caseId}/documents/request`,
        headers: {
            'Accept': 'application/json, text/json, text/x-json, text/javascript, application/xml, text/xml',
            'Authorization': `Bearer ${authToken}`,
        },
        body,
    }).then((response) => {
        if (expectError) {
            expect(response.status).to.eq(400);
        } else {
            expect(response.status).to.eq(200);
        }

        const clearAccessCode = removeSpecialCharacters(response.body.accessCode);
        cy.log('Access code:', clearAccessCode);

        // You can either return the entire response body
        // return response.body;

        // Or just the clearAccessCode, depending on your use case
        return clearAccessCode;
    });
});

Cypress.Commands.add('openUploadPortal', () => {
    cy.visit(Cypress.env('uploadPortalUrl'));
    cy.lighthouse({
        accessibility: 50,
        "best-practices": 50,
        seo: 50,
        pwa: 20,
    });
});

Cypress.Commands.add('enterAccessCodeAndGoToUploadPortal', (code) => {
    cy.get("[data-element='access-code-input']").type(code);
    cy.get("[data-element='login-button']").click();
});
Cypress.Commands.add('loginWithUIAsAdmin', () => {
    const adminUser = Cypress.env('admin_user');
    const apiUrl = Cypress.env('API_URL');
    const appUrl = Cypress.config().baseUrl;

    cy.visit(appUrl);

    cy.get('#Email').type(adminUser.login);
    cy.get('#Password').type(adminUser.password);
    cy.get('.button-login').click();

    cy.request({
        method: 'GET',
        url: `${apiUrl}bff-api/KycSignalR/Authorize`,
        headers: {
            'Authorization': `Bearer ${Cypress.env('authToken')}`,
        },
    }).then((response) => {
        expect(response.status).to.eq(200);
        const signalRToken = response.body.token;
        Cypress.env('signalRToken', signalRToken);
    });
});

