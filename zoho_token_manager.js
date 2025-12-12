const fs = require('fs').promises;
const axios = require('axios');

class ZohoTokenManager {
    /**
     * Manages Zoho OAuth access tokens using a refresh token.
     * Automatically refreshes when token is expired or about to expire.
     */
    
    constructor(clientId, clientSecret, refreshToken, tokenFile = 'zoho_token.json') {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.refreshToken = refreshToken;
        this.tokenFile = tokenFile;
        this.accessToken = null;
        this.expiresAt = 0; // Unix timestamp when token expires
        this.apiDomain = "https://www.zohoapis.com";
        this.loadToken();
    }
    
    async loadToken() {
        /** Load token from file if exists and not expired. */
        try {
            const data = await fs.readFile(this.tokenFile, 'utf8');
            const tokenData = JSON.parse(data);
            this.accessToken = tokenData.access_token;
            this.expiresAt = tokenData.expires_at || 0;
            
            // If token is still valid (with 60 seconds buffer), use it
            if (this.accessToken && this.expiresAt > Math.floor(Date.now() / 1000) + 60) {
                return;
            }
        } catch (error) {
            // File doesn't exist or is invalid, continue to refresh
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
            
            // Save to file
            await this.saveToken();
        } catch (error) {
            throw new Error(`Failed to refresh access token: ${error.message}`);
        }
    }
    
    async saveToken() {
        /** Save token data to file. */
        const data = {
            'access_token': this.accessToken,
            'expires_at': this.expiresAt
        };
        await fs.writeFile(this.tokenFile, JSON.stringify(data, null, 2));
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
        tokenManager = new ZohoTokenManager(CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN);
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
    ZohoTokenManager,
    getTokenManager,
    getHeaders,
    getApiDomain
};