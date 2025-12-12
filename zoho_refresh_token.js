const axios = require('axios');

// OAuth credentials
const clientId = "1000.HDGHY0XGKKAYE40GIKBSL62HSPYH5C";
const clientSecret = "2b45c7e397b1efeb36823f8fe7d843d577ed8cbf22";
const refreshToken = "1000.4863931bd91eb83f4fc9cf0e98fa60ed.d5a2f65d0410b43e979f9ea6119ad157";

// Token endpoint
const tokenUrl = "https://accounts.zoho.com/oauth/v2/token";

// Parameters for refresh token grant
const params = new URLSearchParams();
params.append("refresh_token", refreshToken);
params.append("client_id", clientId);
params.append("client_secret", clientSecret);
params.append("grant_type", "refresh_token");

async function refreshAccessToken() {
    try {
        const response = await axios.post(tokenUrl, params);
        const tokenData = response.data;
        
        console.log("Successfully obtained new access token.");
        console.log(JSON.stringify(tokenData, null, 2));
        
        const accessToken = tokenData.access_token;
        if (accessToken) {
            console.log(`\nNew access token: ${accessToken}`);
            // Optionally save to a file or environment variable
        } else {
            console.log("No access_token in response.");
        }
    } catch (error) {
        console.log(`Error fetching access token: ${error.message}`);
        if (error.response) {
            console.log(`Response status: ${error.response.status}`);
            console.log(`Response body: ${error.response.data}`);
        }
    }
}

// Execute the function
refreshAccessToken();