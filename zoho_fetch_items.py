import requests
import json
from zoho_token_manager import get_headers, get_api_domain

organization_id = "892673756"
api_domain = get_api_domain()
headers = get_headers(organization_id)

# Endpoint for items (products/services)
url = f"{api_domain}/books/v3/items"

try:
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    items = response.json()
    print("Successfully fetched items.")
    print(json.dumps(items, indent=2))
except requests.exceptions.RequestException as e:
    print(f"Error fetching items: {e}")
    if response is not None:
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")