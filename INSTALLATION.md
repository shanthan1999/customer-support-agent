# Customer Ticket Classification System - Installation Guide

## 📦 Package Contents

This package contains a complete AI-powered customer ticket classification system with the following components:

- **LangChain Integration**: Advanced AI classification using OpenAI GPT models
- **Severity-Based Responses**: Different response tones based on ticket priority
- **REST API**: Complete API with 15+ endpoints for ticket management
- **Memory Context**: AI maintains conversation context for improved accuracy
- **Analytics**: Real-time statistics and trend analysis
- **Postman Collection**: Ready-to-use API testing collection

## 🚀 Quick Installation

### Step 1: Extract Files
Extract all files maintaining the directory structure:
```
customer-ticket-classification/
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
├── postman-collection.json
├── POSTMAN_GUIDE.md
└── src/
    ├── types/ticket.ts
    ├── classification/
    ├── middleware/
    ├── routes/
    ├── app.ts
    ├── server.ts
    └── demo.ts
```

### Step 2: Install Dependencies
```bash
cd customer-ticket-classification
npm install
```

### Step 3: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` file and add your OpenAI API key:
```
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### Step 4: Start the System
```bash
# Start development server
npm run dev

# Or run the demo
npm run demo
```

### Step 5: Test with Postman
1. Open Postman
2. Import `postman-collection.json`
3. Set environment variables:
   - `baseUrl`: `http://localhost:8000`
   - `apiKey`: `your-api-key`
4. Run the collection to test all endpoints

## 🎯 Verification

### Test the API is working:
```bash
curl http://localhost:8000/health
```

### Submit a test ticket:
```bash
curl -X POST http://localhost:8000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test ticket",
    "description": "This is a test ticket to verify the system is working",
    "source": "api"
  }'
```

## 📋 Required Files Checklist

### Configuration (3 files)
- [ ] `package.json` - Dependencies and scripts
- [ ] `tsconfig.json` - TypeScript configuration  
- [ ] `.env.example` - Environment template

### Documentation (3 files)
- [ ] `README.md` - Complete setup guide
- [ ] `postman-collection.json` - API testing collection
- [ ] `POSTMAN_GUIDE.md` - Detailed API guide

### Source Code (15 files)
- [ ] `src/types/ticket.ts` - TypeScript interfaces
- [ ] `src/classification/prompts.ts` - AI prompt templates
- [ ] `src/classification/memory.ts` - Context memory
- [ ] `src/classification/chains.ts` - LangChain orchestration
- [ ] `src/classification/engine.ts` - Main classification engine
- [ ] `src/classification/engine.test.ts` - Unit tests
- [ ] `src/middleware/auth.ts` - Authentication
- [ ] `src/middleware/error.ts` - Error handling
- [ ] `src/middleware/validation.ts` - Request validation
- [ ] `src/routes/tickets.ts` - Ticket endpoints
- [ ] `src/routes/analytics.ts` - Analytics endpoints
- [ ] `src/routes/admin.ts` - Admin endpoints
- [ ] `src/app.ts` - Express app setup
- [ ] `src/server.ts` - Server startup
- [ ] `src/demo.ts` - Demo script

**Total: 21 files (~83 KB)**

## 🔧 System Requirements

- **Node.js**: Version 18 or higher
- **OpenAI API Key**: Required for AI classification
- **Memory**: 512MB RAM minimum
- **Storage**: 200MB free space (including node_modules)

## 🚀 Available Commands

```bash
npm run dev     # Start development server with hot reload
npm run demo    # Run classification demo with sample tickets
npm run build   # Build TypeScript to JavaScript
npm run start   # Start production server
npm run test    # Run unit tests
```

## 🎯 Key Features to Test

1. **Severity Classification**: Submit tickets with different urgency levels
2. **Response Generation**: Observe how AI adapts response tone to severity
3. **Memory Context**: Submit similar tickets and see contextual improvements
4. **Batch Processing**: Process multiple tickets simultaneously
5. **Analytics**: View real-time classification statistics
6. **Admin Controls**: Manage system configuration

## 🔍 Troubleshooting

### Common Issues:

1. **"Classification failed" errors**
   - Verify `OPENAI_API_KEY` is set correctly in `.env`
   - Check OpenAI API key has sufficient credits
   - Ensure internet connectivity

2. **Port already in use**
   - Change `PORT=3001` in `.env` file
   - Or kill process using port 3000

3. **Module not found errors**
   - Run `npm install` again
   - Delete `node_modules` and run `npm install`

4. **TypeScript compilation errors**
   - Ensure Node.js version 18+
   - Run `npm run build` to check for errors

## 📊 Expected Performance

- **Classification Time**: 800-2000ms per ticket
- **Confidence Score**: 70-95% for clear tickets  
- **API Response Time**: <100ms (excluding AI processing)
- **Memory Usage**: ~100MB base + AI processing

## 🎉 Success Indicators

You'll know the system is working correctly when:

1. ✅ Server starts without errors on `npm run dev`
2. ✅ Health check returns `200 OK` at `/health`
3. ✅ Demo script processes sample tickets successfully
4. ✅ Postman collection runs without authentication errors
5. ✅ Different ticket types receive appropriate severity classifications
6. ✅ Response tones match the ticket priority levels

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs for detailed error messages
3. Verify all 21 required files are present
4. Ensure OpenAI API key is valid and has credits

## 🔄 Next Steps

Once the system is running:
1. Customize prompt templates in `src/classification/prompts.ts`
2. Adjust confidence thresholds via admin API
3. Integrate with your existing support platform
4. Set up MongoDB for persistent storage
5. Deploy to production environment

---

**Package Size**: ~83 KB (source code) + ~50-100MB (dependencies after npm install)
**Installation Time**: 2-5 minutes
**Setup Difficulty**: Easy (just need OpenAI API key)