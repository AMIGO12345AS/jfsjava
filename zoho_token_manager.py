import requests
import json
import time
import os

class ZohoTokenManager:
    """
    Manages Zoho OAuth access tokens using a refresh token.
    Automatically refreshes when token is expired or about to expire.
    """
    
    def __init__(self, client_id, client_secret, refresh_token, token_file='zoho_token.json'):
        self.client_id = client_id
        self.client_secret = client_secret
        self.refresh_token = refresh_token
        self.token_file = token_file
        self.access_token = None
        self.expires_at = 0  # Unix timestamp when token expires
        self.api_domain = "https://www.zohoapis.com"
        self.load_token()
    
    def load_token(self):
        """Load token from file if exists and not expired."""
        if os.path.exists(self.token_file):
            try:
                with open(self.token_file, 'r') as f:
                    data = json.load(f)
                    self.access_token = data.get('access_token')
                    self.expires_at = data.get('expires_at', 0)
                    # If token is still valid (with 60 seconds buffer), use it
                    if self.access_token and self.expires_at > time.time() + 60:
                        return
            except (json.JSONDecodeError, KeyError):
                pass
        # If no valid token, refresh
        self.refresh_access_token()
    
    def refresh_access_token(self):
        """Request a new access token using refresh token."""
        token_url = "https://accounts.zoho.com/oauth/v2/token"
        params = {
            "refresh_token": self.refresh_token,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "refresh_token"
        }
        
        response = requests.post(token_url, data=params)
        response.raise_for_status()
        token_data = response.json()
        
        self.access_token = token_data['access_token']
        expires_in = token_data.get('expires_in', 3600)
        self.expires_at = time.time() + expires_in
        
        # Save to file
        self.save_token()
    
    def save_token(self):
        """Save token data to file."""
        data = {
            'access_token': self.access_token,
            'expires_at': self.expires_at
        }
        with open(self.token_file, 'w') as f:
            json.dump(data, f)
    
    def get_access_token(self):
        """Return a valid access token, refreshing if necessary."""
        if not self.access_token or self.expires_at <= time.time() + 60:
            self.refresh_access_token()
        return self.access_token
    
    def get_headers(self, organization_id):
        """Return headers for API requests."""
        return {
            "Authorization": f"Bearer {self.get_access_token()}",
            "X-com-zoho-books-organizationid": organization_id,
            "Content-Type": "application/json"
        }


# Global instance with your credentials (replace with your actual credentials)
# For security, consider using environment variables or a config file.
CLIENT_ID = "1000.HDGHY0XGKKAYE40GIKBSL62HSPYH5C"
CLIENT_SECRET = "2b45c7e397b1efeb36823f8fe7d843d577ed8cbf22"
REFRESH_TOKEN = "1000.4863931bd91eb83f4fc9cf0e98fa60ed.d5a2f65d0410b43e979f9ea6119ad157"

_token_manager = None

def get_token_manager():
    """Singleton to get token manager instance."""
    global _token_manager
    if _token_manager is None:
        _token_manager = ZohoTokenManager(CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN)
    return _token_manager

def get_headers(organization_id="892673756"):
    """Convenience function to get headers for API calls."""
    return get_token_manager().get_headers(organization_id)

def get_api_domain():
    return "https://www.zohoapis.com"