import SwaggerParser from 'swagger-parser';
import axios from 'axios';

export const fetchSwaggerSchema = async (swaggerUrl) => {
    try {
        const response = await axios.get(swaggerUrl);
        const api = await SwaggerParser.validate(response.data);

        return api;
    } catch (error) {
        console.error(`Error fetching and parsing Swagger schema: ${error}`);
        return null;
    }
};
