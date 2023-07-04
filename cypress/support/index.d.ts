

declare namespace Cypress {
    interface Chainable<Subject> {
        newGetSignalRToken(): Chainable<string>;

        updateWebhookUrl(url: string): Chainable<string>;

        getCaseProgress(caseId: string, caseType: string): Chainable<any>;

        createIndividual(individualData: object): Chainable<Response>;

        waitForIndividualCaseStatus(caseId: string, status: string): Chainable<void>;

        getClientCredentials(): Chainable<void>;

        login(username: string, password: string): Chainable<void>;

        loginSession(username: string, password: string): Chainable<void>;

        postImportCase(companyInfo: object): Chainable<Response>;

        getCaseInfo(caseCommonId: string): Chainable<Response>;

        companyCaseWaitForReadyStatus(caseId: string, waitTimeInMinutes?: number): Chainable<void>;

        postUpdateCaseProperties(caseCommonId: string, properties: object): Chainable<Response>;

        getListOfCaseSteps(caseCommonId: string): Chainable<Response>;

        markAllStepsPassed(caseId: string): Chainable<void>;

        updateStepStatus(caseCommonId: string, stepId: string, status: string, isCollapsed: boolean): Chainable<Response>;

        patchCloseOpenCompanyCase(caseCommonId: string, statusNeedToBeSet: string, newUser: object): Chainable<Response>;

        postRequestIndividualCaseDocuments(caseCommonId: string, body: object): Chainable<Response>;

        requestMyInfoDocument(caseId: string, phoneNumber?: string, expectError?: boolean): Chainable<any>;

        openUploadPortal(): Chainable<void>;

        enterAccessCodeAndGoToUploadPortal(code: string): Chainable<void>;

        loginAndGetRequestVerificationToken(): Chainable<void>;
    }
}
