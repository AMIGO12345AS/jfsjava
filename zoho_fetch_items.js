const axios = require('axios');
const { getHeaders, getApiDomain } = require('./zoho_token_manager');

async function fetchItems() {
    const organizationId = "892673756";
    const apiDomain = getApiDomain();
    const headers = await getHeaders(organizationId);

    // Endpoint for items (products/services)
    const url = `${apiDomain}/books/v3/items`;

    try {
        const response = await axios.get(url, { headers });
        const items = response.data;
        console.log("Successfully fetched items.");
        console.log(JSON.stringify(items, null, 2));
        return items;
    } catch (error) {
        console.log(`Error fetching items: ${error.message}`);
        if (error.response) {
            console.log(`Response status: ${error.response.status}`);
            console.log(`Response body: ${error.response.data}`);
        }
        throw error;
    }
}

// Execute the function if this file is run directly
if (require.main === module) {
    fetchItems();
}

module.exports = { fetchItems };