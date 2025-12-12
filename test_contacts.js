const axios = require('axios');
const { getHeaders, getApiDomain } = require('./zoho_token_manager');

async function testContacts() {
    const organizationId = "892673756";
    const apiDomain = getApiDomain();
    const headers = await getHeaders(organizationId);

    // Endpoint for contacts
    const url = `${apiDomain}/books/v3/contacts`;

    try {
        const response = await axios.get(url, { headers });
        const contacts = response.data;
        console.log("Successfully fetched contacts.");
        console.log(JSON.stringify(contacts, null, 2));
        return contacts;
    } catch (error) {
        console.log(`Error fetching contacts: ${error.message}`);
        if (error.response) {
            console.log(`Response status: ${error.response.status}`);
            console.log(`Response body: ${error.response.data}`);
        }
        throw error;
    }
}

// Execute the function if this file is run directly
if (require.main === module) {
    testContacts();
}

module.exports = { testContacts };