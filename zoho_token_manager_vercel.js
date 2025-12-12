const axios = require('axios');

class ZohoTokenManagerVercel {
    /**
     * Manages Zoho OAuth access tokens using a refresh token for Vercel serverless environment.
     * Uses memory instead of file system for token storage.
     */
    
    constructor(clientId, clientSecret, refreshToken) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.refreshToken = refreshToken;
        this.accessToken = null;
        this.expiresAt = 0; // Unix timestamp when token expires
        this.apiDomain = "https://www.zohoapis.com";
    }
    
    async loadToken() {
        /** Load token from memory if not expired. */
        // If token is still valid (with 60 seconds buffer), use it
        if (this.accessToken && this.expiresAt > Math.floor(Date.now() / 1000) + 60) {
            return;
        }
        
        // If no valid token, refresh
        await this.refreshAccessToken();
    }
    
    async refreshAccessToken() {
        /** Request a new access token using refresh token. */
        const tokenUrl = "https://accounts.zoho.com/oauth/v2/token";
        const params = new URLSearchParams();
        params.append("refresh_token", this.refreshToken);
        params.append("client_id", this.clientId);
        params.append("client_secret", this.clientSecret);
        params.append("grant_type", "refresh_token");
        
        try {
            const response = await axios.post(tokenUrl, params);
            const tokenData = response.data;
            
            this.accessToken = tokenData.access_token;
            const expiresIn = tokenData.expires_in || 3600;
            this.expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
            
            console.log('Token refreshed successfully');
        } catch (error) {
            throw new Error(`Failed to refresh access token: ${error.message}`);
        }
    }
    
    async getAccessToken() {
        /** Return a valid access token, refreshing if necessary. */
        if (!this.accessToken || this.expiresAt <= Math.floor(Date.now() / 1000) + 60) {
            await this.refreshAccessToken();
        }
        return this.accessToken;
    }
    
    async getHeaders(organizationId) {
        /** Return headers for API requests. */
        return {
            "Authorization": `Bearer ${await this.getAccessToken()}`,
            "X-com-zoho-books-organizationid": organizationId,
            "Content-Type": "application/json"
        };
    }
}

// Global instance with your credentials (replace with your actual credentials)
// For security, consider using environment variables or a config file.
const CLIENT_ID = "1000.HDGHY0XGKKAYE40GIKBSL62HSPYH5C";
const CLIENT_SECRET = "2b45c7e397b1efeb36823f8fe7d843d577ed8cbf22";
const REFRESH_TOKEN = "1000.4863931bd91eb83f4fc9cf0e98fa60ed.d5a2f65d0410b43e979f9ea6119ad157";

let tokenManager = null;

function getTokenManager() {
    /** Singleton to get token manager instance. */
    if (!tokenManager) {
        tokenManager = new ZohoTokenManagerVercel(CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN);
    }
    return tokenManager;
}

async function getHeaders(organizationId = "892673756") {
    /** Convenience function to get headers for API calls. */
    const manager = getTokenManager();
    return await manager.getHeaders(organizationId);
}

function getApiDomain() {
    return "https://www.zohoapis.com";
}

module.exports = {
    ZohoTokenManagerVercel,
    getTokenManager,
    getHeaders,
    getApiDomain
};