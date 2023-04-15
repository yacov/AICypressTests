// cypress/support/helper.js

const faker = require('faker');

const generateRandomIndividualDetails = () => {
    const individualDetails = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        nationalityCodeiso31662: 'GB', // Use 'GB' as the ISO 3166-2 code for the United Kingdom
        birthDate: faker.date.past(30, '2000-01-01').toISOString().split('T')[0],
        addressLine1: faker.address.streetAddress(),
        addressLine2: faker.address.secondaryAddress(),
        postcode: faker.address.zipCode(),
        city: faker.address.city(),
        province: faker.address.state(),
        countryCodeiso31662: 'GB', // Use 'GB' as the ISO 3166-2 code for the United Kingdom
        journeyName: null, // Set to null since it's nullable
        properties: [], // Add an empty array since the model includes a properties array
        isManuallyCreated: true,
        isVisibleInLiveCases: true,
        rawAddress: null, // Set to null since it's nullable
        nameTransposition: false, // Set to false or true depending on your requirement
        userId: null, // Set to null since it's nullable
    };

    return individualDetails;
};

const createIndividualData = (individualDetails) => {
    const individualData = {
        firstName: individualDetails.firstName,
        lastName: individualDetails.lastName,
        journeyName: 'Individuals'
    };
cy.log(individualData);
    return individualData;
};

module.exports = {
    generateRandomIndividualDetails,
    createIndividualData,
};

