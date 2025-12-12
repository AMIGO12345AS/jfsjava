const axios = require('axios');
const { getHeaders, getApiDomain } = require('./zoho_token_manager');

async function createInvoice() {
    const organizationId = "892673756";
    const apiDomain = getApiDomain();
    const headers = await getHeaders(organizationId);

    // Endpoint for creating invoices
    const url = `${apiDomain}/books/v3/invoices`;

    // Sample invoice data
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const invoiceData = {
        "customer_id": "6630269000001113041",  // Customer Zero2Cento from fetched invoices
        "date": today,
        "due_date": dueDateStr,
        "currency_code": "AED",
        "line_items": [
            {
                "name": "Sample Product",
                "description": "This is a test invoice created via API",
                "quantity": 2,
                "rate": 150.0
            },
            {
                "name": "Sample Service",
                "description": "Consulting service",
                "quantity": 1,
                "rate": 300.0
            }
        ],
        "notes": "Thank you for your business!"
    };

    try {
        const response = await axios.post(url, invoiceData, { headers });
        const result = response.data;
        console.log("Invoice created successfully!");
        console.log(JSON.stringify(result, null, 2));
        return result;
    } catch (error) {
        console.log(`Error creating invoice: ${error.message}`);
        if (error.response) {
            console.log(`Response status: ${error.response.status}`);
            console.log(`Response body: ${error.response.data}`);
        }
        throw error;
    }
}

// Execute the function if this file is run directly
if (require.main === module) {
    createInvoice();
}

module.exports = { createInvoice };