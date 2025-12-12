# Zoho Books Manager - JavaScript/Node.js Version

A complete JavaScript/Node.js implementation of the Zoho Books API management system, converted from the original Python version. This application provides a web interface for managing Zoho Books invoices, items, and contacts.

## Features

- 📊 **Invoice Management**: View, create, and manage invoices
- 📦 **Item Management**: Browse and manage products/services
- 👥 **Contact Management**: View customers and vendors
- 🔐 **OAuth Integration**: Secure token-based authentication
- 🌐 **Serverless Ready**: Deploy to Vercel, Netlify, or AWS Lambda
- 📱 **Responsive UI**: Bootstrap-based mobile-friendly interface

## Quick Start

### Prerequisites

- Node.js 14+ installed
- Zoho Books account with API access
- API credentials (Client ID, Client Secret, Refresh Token)

### Installation

1. **Clone or download the project**
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your Zoho credentials
   ```

4. **Run the application**:
   ```bash
   # Express server version
   npm start
   
   # Or serverless function version
   npm run serverless
   ```

5. **Open your browser** to `http://localhost:5000`

## Project Structure

```
├── app.js                           # Express web server
├── api.js                           # Serverless function handler
├── zoho_token_manager.js             # Token management (file-based)
├── zoho_token_manager_serverless.js   # Token management (serverless)
├── zoho_refresh_token.js             # Token refresh utility
├── zoho_fetch.js                    # Invoice fetching
├── zoho_fetch_items.js              # Item fetching
├── zoho_post_invoice.js             # Invoice creation
├── test_contacts.js                 # Contact testing
├── templates/
│   └── index.html                   # Web interface
├── package.json                     # Dependencies and scripts
├── vercel.json                      # Vercel deployment config
├── .env.example                     # Environment variables template
└── README.md                        # This file
```

## API Endpoints

- `GET /api/invoices` - Fetch all invoices
- `GET /api/items` - Fetch all items
- `GET /api/contacts` - Fetch all contacts
- `POST /api/invoices` - Create new invoice

## Deployment Options

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

### Netlify

Configure `netlify.toml` and deploy via Netlify dashboard.

### AWS Lambda

Use Serverless Framework with `serverless.yml` configuration.

## Environment Variables

Required environment variables:

- `ZOHO_CLIENT_ID`: Your Zoho client ID
- `ZOHO_CLIENT_SECRET`: Your Zoho client secret
- `ZOHO_REFRESH_TOKEN`: Your Zoho refresh token
- `ZOHO_ORGANIZATION_ID`: Your Zoho organization ID (default: 892673756)

## Development

### Running Tests

```bash
# Test individual components
node zoho_refresh_token.js
node zoho_fetch.js
node zoho_fetch_items.js
node zoho_post_invoice.js
node test_contacts.js
```

### Development Mode

```bash
npm run dev  # Uses nodemon for auto-restart
```

## Security Notes

- Never commit `.env` file to version control
- Use environment variables for all sensitive data
- Token refresh is handled automatically
- CORS headers are configured for cross-origin requests

## Migration from Python

This is a complete conversion from the original Python version. All functionality has been preserved:

| Python File | JavaScript Equivalent |
|-------------|---------------------|
| `app.py` | `app.js` |
| `api.py` | `api.js` |
| `zoho_token_manager.py` | `zoho_token_manager.js` |
| `zoho_token_manager_serverless.py` | `zoho_token_manager_serverless.js` |
| `zoho_refresh_token.py` | `zoho_refresh_token.js` |
| `zoho_fetch.py` | `zoho_fetch.js` |
| `zoho_fetch_items.py` | `zoho_fetch_items.js` |
| `zoho_post_invoice.py` | `zoho_post_invoice.js` |
| `test_contacts.py` | `test_contacts.js` |

## Troubleshooting

1. **Token Issues**: Verify your Zoho credentials are correct
2. **CORS Errors**: Ensure proper headers are set (included by default)
3. **Module Not Found**: Run `npm install` to install dependencies
4. **Port Already in Use**: Change PORT in `.env` or use `PORT=3000 npm start`

## Support

For issues related to:
- **Zoho API**: Check Zoho Books API documentation
- **Deployment**: Refer to platform-specific docs
- **Code Issues**: Check console logs and test individual components

## License

MIT License