import requests
import json
from datetime import datetime, timedelta
from zoho_token_manager import get_headers, get_api_domain

organization_id = "892673756"
api_domain = get_api_domain()
headers = get_headers(organization_id)

# Endpoint for creating invoices
url = f"{api_domain}/books/v3/invoices"

# Sample invoice data
today = datetime.now().strftime("%Y-%m-%d")
due_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")

invoice_data = {
    "customer_id": "6630269000001113041",  # Customer Zero2Cento from fetched invoices
    "date": today,
    "due_date": due_date,
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
}

try:
    response = requests.post(url, headers=headers, json=invoice_data)
    response.raise_for_status()
    result = response.json()
    print("Invoice created successfully!")
    print(json.dumps(result, indent=2))
except requests.exceptions.RequestException as e:
    print(f"Error creating invoice: {e}")
    if response is not None:
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")