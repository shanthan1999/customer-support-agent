# Postman API Testing Guide

## Quick Start

1. **Set up environment**:
   ```bash
   cp .env.example .env
   # Add your OPENAI_API_KEY to .env
   npm install
   ```

2. **Start the server**:
   ```bash
   npm run dev
   ```

3. **Import Postman collection**:
   - Open Postman
   - Click "Import" → "Upload Files"
   - Select `postman-collection.json`

## API Endpoints Overview

### 🎯 Core Ticket Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/tickets` | Submit new ticket | No |
| GET | `/api/tickets/:id` | Get specific ticket | No |
| GET | `/api/tickets` | List tickets with filters | No |
| PUT | `/api/tickets/:id/feedback` | Submit feedback | No |
| POST | `/api/tickets/batch` | Process multiple tickets | No |

### 📊 Analytics Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/stats` | Get classification stats | No |
| GET | `/api/analytics/trends` | Get trends over time | No |

### ⚙️ Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/config` | Get system config | Yes |
| PUT | `/api/admin/config/confidence-threshold` | Update threshold | Yes |
| POST | `/api/admin/memory/clear` | Clear AI memory | Yes |
| GET | `/api/admin/health` | System health check | Yes |

## Testing Workflow

### Step 1: Health Check
```
GET http://localhost:8000/health
```
Expected: `200 OK` with system status

### Step 2: Submit Different Severity Tickets

#### Critical Priority Ticket
```json
POST /api/tickets
{
  "subject": "URGENT: Complete system outage - all users affected",
  "description": "Our entire platform is down. All customers are getting 500 errors...",
  "customerInfo": {
    "email": "cto@enterprise-client.com",
    "name": "John Smith",
    "priority": "VIP"
  },
  "source": "email"
}
```

#### High Priority Ticket
```json
POST /api/tickets
{
  "subject": "Payment processing error on checkout",
  "description": "When customers try to complete their purchase, they get an error...",
  "customerInfo": {
    "priority": "Standard"
  },
  "source": "web"
}
```

#### Medium Priority Ticket
```json
POST /api/tickets
{
  "subject": "Dashboard loading slowly",
  "description": "The main dashboard is taking 10-15 seconds to load...",
  "source": "web"
}
```

#### Low Priority Ticket
```json
POST /api/tickets
{
  "subject": "How to export my data?",
  "description": "Hi, I would like to know how I can export all my data...",
  "source": "web"
}
```

### Step 3: Observe Different Response Styles

Each ticket will receive:
- **Category**: Technical, Billing, General Inquiry, etc.
- **Priority**: Critical, High, Medium, Low
- **Confidence Score**: 0-100%
- **Severity-Based Response**: Tone matches urgency level

### Step 4: Test Filtering and Analytics

#### Filter by Priority
```
GET /api/tickets?priority=Critical&limit=5
```

#### Filter by Category
```
GET /api/tickets?category=Technical&limit=10
```

#### Get Statistics
```
GET /api/analytics/stats
```

#### Get Trends
```
GET /api/analytics/trends?period=day
```

### Step 5: Test Admin Features (with API Key)

Add header: `x-api-key: your-api-key`

#### Get Configuration
```
GET /api/admin/config
```

#### Update Confidence Threshold
```json
PUT /api/admin/config/confidence-threshold
{
  "threshold": 80
}
```

## Expected Response Formats

### Ticket Classification Response
```json
{
  "success": true,
  "data": {
    "ticketId": "TICKET-1704123456789-abc123def",
    "classification": {
      "category": "Technical",
      "priority": "Critical",
      "confidence": 95,
      "summary": "Complete system outage affecting all users",
      "suggestedResponse": "We are immediately escalating this critical system outage...",
      "tags": ["outage", "system", "critical", "urgent"],
      "reasoning": "This is a critical system failure requiring immediate attention..."
    },
    "processingTime": 1250,
    "needsManualReview": false
  }
}
```

### Analytics Response
```json
{
  "success": true,
  "data": {
    "total": 15,
    "byCategory": {
      "Technical": 8,
      "Billing": 3,
      "General Inquiry": 4
    },
    "byPriority": {
      "Critical": 2,
      "High": 5,
      "Medium": 6,
      "Low": 2
    },
    "averageConfidence": 87,
    "averageProcessingTime": 1150,
    "lowConfidenceCount": 1
  }
}
```

## Testing Different Scenarios

### 1. Severity-Based Response Testing
Submit tickets with different urgency levels and observe how the AI adapts its response tone:

- **Critical**: Urgent, apologetic, action-oriented
- **High**: Professional, empathetic, solution-focused
- **Medium**: Helpful, friendly, informative
- **Low**: Courteous, educational, patient

### 2. Confidence Threshold Testing
1. Submit ambiguous tickets
2. Check if confidence < 70% triggers manual review flag
3. Update threshold via admin endpoint
4. Retest with same ticket types

### 3. Memory Context Testing
1. Submit similar tickets in sequence
2. Observe how later classifications reference earlier ones
3. Clear memory via admin endpoint
4. Submit same tickets again and compare results

### 4. Batch Processing Testing
Submit multiple tickets at once:
```json
POST /api/tickets/batch
[
  {"subject": "Login issue", "description": "Cannot log in..."},
  {"subject": "Billing question", "description": "Charged twice..."},
  {"subject": "Feature request", "description": "Need dark mode..."}
]
```

### 5. Error Handling Testing
- Submit invalid data (missing required fields)
- Use invalid API keys for admin endpoints
- Test rate limiting (make 100+ requests quickly)
- Submit extremely long descriptions

## Postman Environment Variables

Set these in your Postman environment:

| Variable | Value | Description |
|----------|-------|-------------|
| `baseUrl` | `http://localhost:8000` | API base URL |
| `apiKey` | `your-api-key` | Admin API key |

## Common Issues & Solutions

### 1. "Classification failed" errors
- Check if `OPENAI_API_KEY` is set in `.env`
- Verify OpenAI API key is valid and has credits
- Check network connectivity

### 2. Rate limiting errors
- Wait for rate limit window to reset
- Reduce request frequency
- Check rate limit headers in response

### 3. Memory issues
- Clear classification memory via admin endpoint
- Restart server to reset all state
- Check server logs for memory usage

## Performance Benchmarks

Expected performance metrics:
- **Classification Time**: 800-2000ms per ticket
- **Confidence Score**: 70-95% for clear tickets
- **Throughput**: 30-60 tickets/minute (with rate limiting)
- **Memory Usage**: Stable with periodic cleanup

## Next Steps

After testing the API endpoints:
1. Integrate with your existing support platform
2. Set up MongoDB for persistent storage
3. Implement user authentication
4. Add monitoring and alerting
5. Deploy to production environment