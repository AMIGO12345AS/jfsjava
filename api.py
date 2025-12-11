import os
import json
import logging
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import requests
from zoho_token_manager_serverless import get_headers, get_api_domain

# Configure logging
logging.basicConfig(level=logging.INFO)

ORGANIZATION_ID = os.getenv("ZOHO_ORGANIZATION_ID", "892673756")
API_DOMAIN = get_api_domain()

class ServerlessHandler(BaseHTTPRequestHandler):
    """Simple HTTP handler for serverless environment."""
    
    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        if path == '/api/invoices':
            self._handle_get_invoices()
        elif path == '/api/items':
            self._handle_get_items()
        elif path == '/health':
            self._handle_health()
        else:
            self.send_response(404)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())
    
    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        if path == '/api/invoices':
            self._handle_post_invoices()
        else:
            self.send_response(404)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())
    
    def _handle_health(self):
        self.send_response(200)
        self._set_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'status': 'ok'}).encode())
    
    def _handle_get_invoices(self):
        try:
            headers = get_headers()
            url = f"{API_DOMAIN}/books/v3/invoices"
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            invoices = data.get('invoices', [])
            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'invoices': invoices, 'count': len(invoices)}).encode())
        except Exception as e:
            logging.error(f"Error fetching invoices: {e}")
            self.send_response(500)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
    
    def _handle_get_items(self):
        try:
            headers = get_headers()
            url = f"{API_DOMAIN}/books/v3/items"
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            items = data.get('items', [])
            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'items': items, 'count': len(items)}).encode())
        except Exception as e:
            logging.error(f"Error fetching items: {e}")
            self.send_response(500)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
    
    def _handle_post_invoices(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length else b'{}'
            invoice_data = json.loads(body)
            
            # Validate required fields
            required = ['customer_id', 'date', 'due_date', 'currency_code', 'line_items']
            for field in required:
                if field not in invoice_data:
                    self.send_response(400)
                    self._set_cors_headers()
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': f'Missing field: {field}'}).encode())
                    return
            
            payload = {
                'customer_id': invoice_data['customer_id'],
                'date': invoice_data['date'],
                'due_date': invoice_data['due_date'],
                'currency_code': invoice_data['currency_code'],
                'line_items': invoice_data['line_items']
            }
            if 'notes' in invoice_data:
                payload['notes'] = invoice_data['notes']
            
            headers = get_headers()
            url = f"{API_DOMAIN}/books/v3/invoices"
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            invoice = result.get('invoice', {})
            
            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'invoice_id': invoice.get('invoice_id'),
                'invoice_number': invoice.get('invoice_number'),
                'message': 'Invoice created successfully'
            }).encode())
        except requests.exceptions.RequestException as e:
            error_detail = e.response.text if e.response else str(e)
            logging.error(f"Request error: {error_detail}")
            self.send_response(500)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Failed to create invoice', 'details': error_detail}).encode())
        except Exception as e:
            logging.error(f"Unexpected error: {e}")
            self.send_response(500)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

# For local testing
if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    server = HTTPServer(('0.0.0.0', port), ServerlessHandler)
    logging.info(f'Server running on port {port}')
    server.serve_forever()