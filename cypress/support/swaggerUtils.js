const generateRequestObject = (swaggerSchema, path, method) => {
    const operation = swaggerSchema.paths[path][method.toLowerCase()];
    const baseUrl = `${swaggerSchema.schemes[0]}://${swaggerSchema.host}${swaggerSchema.basePath}`;

    return {
        method: method.toUpperCase(),
        url: baseUrl + path,
        headers: operation.parameters
            .filter((param) => param.in === 'header')
            .reduce((headers, param) => {
                headers[param.name] = ''; // Set default or example value if available
                return headers;
            }, {}),
    };
};

const generateResponseObject = (swaggerSchema, path, method) => {
    const operation = swaggerSchema.paths[path][method.toLowerCase()];
    const response = operation.responses['200'];

    return response;
};

const generateTestData = (swaggerSchema, path, method) => {
    const operation = swaggerSchema.paths[path][method.toLowerCase()];
    const parameters = operation.parameters;

    // Generate test data based on parameter schema
    // You can create a custom function to generate test data
    // or use a library like 'json-schema-faker' to generate test data automatically
};

export const swaggerUtils = {
    generateRequestObject,
    generateResponseObject,
    generateTestData,
};
