# Serverless Proxy Deployment Guide - JavaScript/Node.js Version

This guide explains how to deploy the Zoho Books API proxy as a serverless function on various platforms using JavaScript/Node.js.

## Prerequisites

- Zoho Books account with API access
- Client ID, Client Secret, and Refresh Token
- Git repository with the code
- Node.js 14+ installed locally

## Environment Variables

Set these environment variables on your deployment platform:

- `ZOHO_CLIENT_ID`: Your Zoho client ID
- `ZOHO_CLIENT_SECRET`: Your Zoho client secret
- `ZOHO_REFRESH_TOKEN`: Your Zoho refresh token
- `ZOHO_ORGANIZATION_ID`: Your Zoho organization ID (default: 892673756)

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Create `vercel.json`** in your project root:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "api.js"
       }
     ]
   }
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Option 2: Netlify Functions

1. **Create `netlify.toml`**:
   ```toml
   [build]
     command = "npm install"
     publish = "."

   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/api/:splat"
     status = 200

   [build.environment]
     NODE_VERSION = "16"
   ```

2. **Create `netlify/functions/api.js`** (move the file to this location)

3. **Deploy** via Netlify dashboard or CLI

### Option 3: AWS Lambda

1. **Install Serverless Framework**:
   ```bash
   npm install -g serverless
   ```

2. **Create `serverless.yml`**:
   ```yaml
   service: zoho-books-proxy

   provider:
     name: aws
     runtime: nodejs16.x
     region: us-east-1
     environment:
       ZOHO_CLIENT_ID: ${env:ZOHO_CLIENT_ID}
       ZOHO_CLIENT_SECRET: ${env:ZOHO_CLIENT_SECRET}
       ZOHO_REFRESH_TOKEN: ${env:ZOHO_REFRESH_TOKEN}

   functions:
     api:
       handler: api.handler
       events:
         - http:
             path: /{proxy+}
             method: any
             cors: true
   ```

3. **Deploy**:
   ```bash
   serverless deploy
   ```

## Frontend Integration

After deploying the proxy, update your HTML/JS frontend to use the new endpoints:

```javascript
// Replace localhost:8080 with your deployed URL
const API_BASE = 'https://your-deployed-url.vercel.app';

// Fetch invoices
fetch(`${API_BASE}/api/invoices`)
  .then(response => response.json())
  .then(data => console.log(data));

// Create invoice
fetch(`${API_BASE}/api/invoices`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(invoiceData)
});
```

## Local Development

1. **Set environment variables**:
   ```bash
   export ZOHO_CLIENT_ID="your-client-id"
   export ZOHO_CLIENT_SECRET="your-client-secret"
   export ZOHO_REFRESH_TOKEN="your-refresh-token"
   ```

2. **Run locally**:
   ```bash
   # For Express server
   npm start
   
   # For serverless function
   npm run serverless
   ```

3. **Test endpoints**:
   ```bash
   curl http://localhost:5000/api/invoices
   # or
   curl http://localhost:8080/api/invoices
   ```

## Security Considerations

- Never commit credentials to version control
- Use environment variables for all secrets
- Consider adding API rate limiting
- Use HTTPS in production
- Consider adding authentication to your proxy endpoints

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure your proxy includes CORS headers
2. **Token refresh failures**: Verify your refresh token is valid
3. **Environment variables**: Double-check all required variables are set
4. **Dependencies**: Ensure `axios` library is available

### Testing Token Refresh

Test token refresh independently:
```javascript
node -e "
const axios = require('axios');
const data = new URLSearchParams();
data.append('refresh_token', 'your-refresh-token');
data.append('client_id', 'your-client-id');
data.append('client_secret', 'your-client-secret');
data.append('grant_type', 'refresh_token');

axios.post('https://accounts.zoho.com/oauth/v2/token', data)
  .then(r => console.log(r.status, r.data))
  .catch(e => console.error(e.message));
"
```

## File Structure

```
project/
├── api.js                    # Main serverless function
├── app.js                    # Express server (alternative)
├── zoho_token_manager_serverless.js  # Token management
├── zoho_token_manager.js     # Alternative token manager
├── package.json              # Node.js dependencies
├── vercel.json              # Vercel configuration (optional)
├── netlify.toml             # Netlify configuration (optional)
└── serverless.yml           # AWS Lambda configuration (optional)
```

## Support

For issues with:
- Zoho API: Check Zoho Books documentation
- Deployment: Refer to platform-specific documentation
- Code: Review error logs and test locally first