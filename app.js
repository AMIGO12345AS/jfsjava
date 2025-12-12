const express = require('express');
const path = require('path');
const axios = require('axios');
const { getHeaders, getApiDomain } = require('./zoho_token_manager');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuration
// ORGANIZATION_ID is now fetched from environment by token manager
const API_DOMAIN = getApiDomain();

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Fetch invoices from Zoho Books
app.get('/api/invoices', async (req, res) => {
    try {
        const headers = await getHeaders();
        const url = `${API_DOMAIN}/books/v3/invoices`;
        const response = await axios.get(url, { headers });
        const data = response.data;
        
        // Simplify response for frontend
        const invoices = data.invoices || [];
        res.json({
            'invoices': invoices,
            'count': invoices.length
        });
    } catch (error) {
        console.error('Error fetching invoices:', error.message);
        res.status(500).json({'error': error.message});
    }
});

// Fetch items from Zoho Books
app.get('/api/items', async (req, res) => {
    try {
        const headers = await getHeaders();
        const url = `${API_DOMAIN}/books/v3/items`;
        const response = await axios.get(url, { headers });
        const data = response.data;
        const items = data.items || [];
        res.json({
            'items': items,
            'count': items.length
        });
    } catch (error) {
        console.error('Error fetching items:', error.message);
        res.status(500).json({'error': error.message});
    }
});

// Fetch contacts from Zoho Books
app.get('/api/contacts', async (req, res) => {
    try {
        const headers = await getHeaders();
        const url = `${API_DOMAIN}/books/v3/contacts`;
        const response = await axios.get(url, { headers });
        const data = response.data;
        const contacts = data.contacts || [];
        res.json({
            'contacts': contacts,
            'count': contacts.length
        });
    } catch (error) {
        console.error('Error fetching contacts:', error.message);
        res.status(500).json({'error': error.message});
    }
});

// Create a new invoice in Zoho Books
app.post('/api/invoices', async (req, res) => {
    try {
        const invoiceData = req.body;
        
        // Validate required fields
        const required = ['customer_id', 'date', 'due_date', 'currency_code', 'line_items'];
        for (const field of required) {
            if (!invoiceData[field]) {
                return res.status(400).json({'error': `Missing field: ${field}`});
            }
        }
        
        // Prepare payload for Zoho
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
        const url = `${API_DOMAIN}/books/v3/invoices`;
        const response = await axios.post(url, payload, { headers });
        const result = response.data;
        
        // Extract relevant info for frontend
        const invoice = result.invoice || {};
        res.json({
            'invoice_id': invoice.invoice_id,
            'invoice_number': invoice.invoice_number,
            'message': 'Invoice created successfully'
        });
    } catch (error) {
        console.error('Error creating invoice:', error.message);
        
        // Try to get error details from response
        let errorDetail = error.message;
        if (error.response && error.response.data) {
            errorDetail = error.response.data;
        }
        
        res.status(500).json({
            'error': 'Failed to create invoice', 
            'details': errorDetail
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;