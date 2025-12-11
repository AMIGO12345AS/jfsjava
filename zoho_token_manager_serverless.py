import os
import requests
import json
import time

class ZohoTokenManagerServerless:
    """
    Token manager optimized for serverless environments.
    Uses environment variables for credentials and in‑memory caching.
    """
    
    def __init__(self):
        self.client_id = os.getenv("ZOHO_CLIENT_ID")
        self.client_secret = os.getenv("ZOHO_CLIENT_SECRET")
        self.refresh_token = os.getenv("ZOHO_REFRESH_TOKEN")
        self.organization_id = os.getenv("ZOHO_ORGANIZATION_ID", "892673756")
        self.api_domain = "https://www.zohoapis.com"
        
        # In‑memory cache for this instance
        self._access_token = None
        self._expires_at = 0
        
        if not self.client_id or not self.client_secret or not self.refresh_token:
            raise ValueError("Missing environment variables: ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN")
    
    def _refresh_access_token(self):
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
        
        self._access_token = token_data["access_token"]
        expires_in = token_data.get("expires_in", 3600)
        self._expires_at = time.time() + expires_in
        
        return self._access_token
    
    def get_access_token(self):
        """Return a valid access token, refreshing if needed."""
        if not self._access_token or self._expires_at <= time.time() + 60:
            self._refresh_access_token()
        return self._access_token
    
    def get_headers(self):
        """Return headers for API requests."""
        return {
            "Authorization": f"Bearer {self.get_access_token()}",
            "X-com-zoho-books-organizationid": self.organization_id,
            "Content-Type": "application/json"
        }


# Singleton instance
_token_manager = None

def get_token_manager():
    global _token_manager
    if _token_manager is None:
        _token_manager = ZohoTokenManagerServerless()
    return _token_manager

def get_headers():
    return get_token_manager().get_headers()

def get_api_domain():
    return "https://www.zohoapis.com"
