const http = require('http');
const url = require('url');
const { getHeaders, getApiDomain } = require('./zoho_token_manager_serverless');

// Configure logging
const ORGANIZATION_ID = process.env.ZOHO_ORGANIZATION_ID || "892673756";
const API_DOMAIN = getApiDomain();

class ServerlessHandler {
    /** Simple HTTP handler for serverless environment. */
    
    constructor() {
        this.headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        };
    }
    
    setCorsHeaders(res) {
        for (const [key, value] of Object.entries(this.headers)) {
            res.setHeader(key, value);
        }
    }
    
    async handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const path = parsedUrl.pathname;
        
        // Set CORS headers for all responses
        this.setCorsHeaders(res);
        
        // Handle OPTIONS requests for CORS
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }
        
        try {
            if (req.method === 'GET' && path === '/api/invoices') {
                await this.handleGetInvoices(req, res);
            } else if (req.method === 'GET' && path === '/api/items') {
                await this.handleGetItems(req, res);
            } else if (req.method === 'GET' && path === '/health') {
                await this.handleHealth(req, res);
            } else if (req.method === 'POST' && path === '/api/invoices') {
                await this.handlePostInvoices(req, res);
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({'error': 'Not found'}));
            }
        } catch (error) {
            console.error('Request handling error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({'error': 'Internal server error'}));
        }
    }
    
    async handleHealth(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({'status': 'ok'}));
    }
    
    async handleGetInvoices(req, res) {
        try {
            const headers = await getHeaders();
            const axios = require('axios');
            const response = await axios.get(`${API_DOMAIN}/books/v3/invoices`, { headers });
            const data = response.data;
            const invoices = data.invoices || [];
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({'invoices': invoices, 'count': invoices.length}));
        } catch (error) {
            console.error(`Error fetching invoices: ${error.message}`);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({'error': error.message}));
        }
    }
    
    async handleGetItems(req, res) {
        try {
            const headers = await getHeaders();
            const axios = require('axios');
            const response = await axios.get(`${API_DOMAIN}/books/v3/items`, { headers });
            const data = response.data;
            const items = data.items || [];
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({'items': items, 'count': items.length}));
        } catch (error) {
            console.error(`Error fetching items: ${error.message}`);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({'error': error.message}));
        }
    }
    
    async handlePostInvoices(req, res) {
        try {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', async () => {
                try {
                    const invoiceData = JSON.parse(body || '{}');
                    
                    // Validate required fields
                    const required = ['customer_id', 'date', 'due_date', 'currency_code', 'line_items'];
                    for (const field of required) {
                        if (!invoiceData[field]) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({'error': `Missing field: ${field}`}));
                            return;
                        }
                    }
                    
                    const payload = {
                        'customer_id': invoiceData.customer_id,
                        'date': invoiceData.date,
                        'due_date': invoiceData.due_date,
                        'currency_code': invoiceData.currency_code,
                        'line_items': invoiceData.line_items
                    };
                    
                    if (invoiceData.notes) {
                        payload.notes = invoiceData.notes;
                    }
                    
                    const headers = await getHeaders();
                    const axios = require('axios');
                    const response = await axios.post(`${API_DOMAIN}/books/v3/invoices`, payload, { headers });
                    const result = response.data;
                    const invoice = result.invoice || {};
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        'invoice_id': invoice.invoice_id,
                        'invoice_number': invoice.invoice_number,
                        'message': 'Invoice created successfully'
                    }));
                } catch (error) {
                    console.error(`Error in POST invoice: ${error.message}`);
                    let errorDetail = error.message;
                    if (error.response && error.response.data) {
                        errorDetail = error.response.data;
                    }
                    
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({'error': 'Failed to create invoice', 'details': errorDetail}));
                }
            });
        } catch (error) {
            console.error(`Error handling POST invoice: ${error.message}`);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({'error': 'Failed to process request'}));
        }
    }
}

// Create serverless handler instance
const handler = new ServerlessHandler();

// Export for serverless platforms
module.exports = async (req, res) => {
    await handler.handleRequest(req, res);
};

// For local testing
if (require.main === module) {
    const port = process.env.PORT || 8080;
    const server = http.createServer(async (req, res) => {
        await handler.handleRequest(req, res);
    });
    
    server.listen(port, '0.0.0.0', () => {
        console.log(`Server running on port ${port}`);
    });
}