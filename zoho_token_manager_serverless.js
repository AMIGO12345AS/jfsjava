const axios = require('axios');

class ZohoTokenManagerServerless {
    /**
     * Token manager optimized for serverless environments.
     * Uses environment variables for credentials and in‑memory caching.
     */
    
    constructor() {
        this.clientId = process.env.ZOHO_CLIENT_ID;
        this.clientSecret = process.env.ZOHO_CLIENT_SECRET;
        this.refreshToken = process.env.ZOHO_REFRESH_TOKEN;
        this.organizationId = process.env.ZOHO_ORGANIZATION_ID || "892673756";
        this.apiDomain = "https://www.zohoapis.com";
        
        // In‑memory cache for this instance
        this._accessToken = null;
        this._expiresAt = 0;
        
        if (!this.clientId || !this.clientSecret || !this.refreshToken) {
            throw new Error("Missing environment variables: ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN");
        }
    }
    
    async _refreshAccessToken() {
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
            
            this._accessToken = tokenData.access_token;
            const expiresIn = tokenData.expires_in || 3600;
            this._expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
            
            return this._accessToken;
        } catch (error) {
            throw new Error(`Failed to refresh access token: ${error.message}`);
        }
    }
    
    async getAccessToken() {
        /** Return a valid access token, refreshing if needed. */
        if (!this._accessToken || this._expiresAt <= Math.floor(Date.now() / 1000) + 60) {
            await this._refreshAccessToken();
        }
        return this._accessToken;
    }
    
    async getHeaders() {
        /** Return headers for API requests. */
        return {
            "Authorization": `Bearer ${await this.getAccessToken()}`,
            "X-com-zoho-books-organizationid": this.organizationId,
            "Content-Type": "application/json"
        };
    }
}

// Singleton instance
let tokenManager = null;

function getTokenManager() {
    if (!tokenManager) {
        tokenManager = new ZohoTokenManagerServerless();
    }
    return tokenManager;
}

async function getHeaders() {
    const manager = getTokenManager();
    return await manager.getHeaders();
}

function getApiDomain() {
    return "https://www.zohoapis.com";
}

module.exports = {
    ZohoTokenManagerServerless,
    getTokenManager,
    getHeaders,
    getApiDomain
};