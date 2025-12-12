const axios = require('axios');
const { getHeaders, getApiDomain } = require('./zoho_token_manager');

async function fetchInvoices() {
    const organizationId = "892673756";
    const apiDomain = getApiDomain();
    const headers = await getHeaders(organizationId);

    // Endpoint for invoices
    const url = `${apiDomain}/books/v3/invoices`;

    try {
        const response = await axios.get(url, { headers });
        const invoices = response.data;
        console.log("Successfully fetched invoices.");
        console.log(JSON.stringify(invoices, null, 2));
        return invoices;
    } catch (error) {
        console.log(`Error fetching invoices: ${error.message}`);
        if (error.response) {
            console.log(`Response status: ${error.response.status}`);
            console.log(`Response body: ${error.response.data}`);
        }
        throw error;
    }
}

// Execute the function if this file is run directly
if (require.main === module) {
    fetchInvoices();
}

module.exports = { fetchInvoices };