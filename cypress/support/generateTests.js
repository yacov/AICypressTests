import {swaggerUtils} from './swaggerUtils';

const filterBySummary = (summary) => {
    // Define the keywords you want to filter by
    const keywords = ['Creates a new individual case'];

    // Check if any keyword exists in the summary
    return keywords.some((keyword) => summary.includes(keyword));
};

export const generateTests = (swaggerSchema) => {
    const testCases = [];

    Object.entries(swaggerSchema.paths).forEach(([path, methods]) => {
        Object.entries(methods).forEach(([method, operation]) => {
            const summary = operation.summary;

            if (filterBySummary(summary)) {
                const requestObject = swaggerUtils.generateRequestObject(swaggerSchema, path, method);
                const responseObject = swaggerUtils.generateResponseObject(swaggerSchema, path, method);
                const testData = swaggerUtils.generateTestData(swaggerSchema, path, method);

                testCases.push({
                    request: requestObject,
                    response: responseObject,
                    testData,
                });
            }
        });
    });
testCases.should('have.length');
    return testCases;
};
