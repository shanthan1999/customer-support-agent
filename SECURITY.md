# Security Guidelines

## Environment Variables

This application requires several environment variables to be set. **Never commit these to version control.**

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# OpenAI API Key - Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string_here

# Application Configuration
NODE_ENV=development
PORT=8000
CONFIDENCE_THRESHOLD=70

# Admin API Key - Generate a secure random string
API_KEY=your_secure_api_key_here
```

### Security Best Practices

1. **API Keys**: 
   - Use strong, randomly generated API keys
   - Rotate keys regularly
   - Never expose keys in client-side code

2. **MongoDB**:
   - Use MongoDB Atlas with proper authentication
   - Enable IP whitelisting
   - Use strong passwords

3. **Environment Variables**:
   - Never commit `.env` files to version control
   - Use different keys for development/production
   - Consider using a secrets management service in production

4. **CORS**:
   - Configure CORS origins appropriately for your environment
   - Don't use wildcard origins in production

## Reporting Security Issues

If you discover a security vulnerability, please email [security@yourcompany.com] instead of using the issue tracker.