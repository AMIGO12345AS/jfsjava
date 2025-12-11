import requests
import json
from zoho_token_manager import get_headers, get_api_domain

organization_id = "892673756"
api_domain = get_api_domain()
headers = get_headers(organization_id)

# Endpoint for invoices
url = f"{api_domain}/books/v3/invoices"

try:
    response = requests.get(url, headers=headers)
    response.raise_for_status()  # Raise HTTPError for bad responses
    invoices = response.json()
    print("Successfully fetched invoices.")
    print(json.dumps(invoices, indent=2))
except requests.exceptions.RequestException as e:
    print(f"Error fetching invoices: {e}")
    if response is not None:
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")