import requests
import json

# OAuth credentials
client_id = "1000.HDGHY0XGKKAYE40GIKBSL62HSPYH5C"
client_secret = "2b45c7e397b1efeb36823f8fe7d843d577ed8cbf22"
refresh_token = "1000.4863931bd91eb83f4fc9cf0e98fa60ed.d5a2f65d0410b43e979f9ea6119ad157"

# Token endpoint
token_url = "https://accounts.zoho.com/oauth/v2/token"

# Parameters for refresh token grant
params = {
    "refresh_token": refresh_token,
    "client_id": client_id,
    "client_secret": client_secret,
    "grant_type": "refresh_token"
}

try:
    response = requests.post(token_url, data=params)
    response.raise_for_status()
    token_data = response.json()
    print("Successfully obtained new access token.")
    print(json.dumps(token_data, indent=2))
    
    access_token = token_data.get("access_token")
    if access_token:
        print(f"\nNew access token: {access_token}")
        # Optionally save to a file or environment variable
    else:
        print("No access_token in response.")
except requests.exceptions.RequestException as e:
    print(f"Error fetching access token: {e}")
    if response is not None:
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")