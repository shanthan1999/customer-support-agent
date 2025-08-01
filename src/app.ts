import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { rateLimiter } from './middleware/validation';
import { errorHandler, notFoundHandler } from './middleware/error';
import ticketsRouter from './routes/tickets';
import analyticsRouter from './routes/analytics';
import adminRouter from './routes/admin';

// Load environment variables
dotenv.config();

const app = express();

// Middleware - Enhanced CORS for Swagger UI
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8000', 'http://127.0.0.1:8000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Accept'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add request ID for tracking
app.use((req, res, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || 
    `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  next();
});

// Rate limiting (100 requests per minute)
app.use(rateLimiter(100, 60000));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API documentation endpoint
const apiDocumentation = {
  name: 'Customer Ticket Classification API',
  version: '1.0.0',
  description: 'AI-powered ticket classification system using LangChain and OpenAI',
  baseUrl: process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : `http://localhost:${process.env.PORT || 8000}`,
  endpoints: {
    tickets: {
      'POST /api/tickets': {
        description: 'Submit a new ticket for classification',
        body: {
          subject: 'string (required)',
          description: 'string (required)',
          customerInfo: {
            email: 'string (optional)',
            name: 'string (optional)',
            priority: 'VIP | Standard (optional)'
          },
          source: 'email | web | api (optional)',
          language: 'string (optional)'
        },
        response: {
          ticketId: 'string',
          classification: 'ClassificationResult',
          processingTime: 'number',
          needsManualReview: 'boolean'
        }
      },
      'GET /api/tickets/:id': {
        description: 'Retrieve a specific ticket',
        parameters: { id: 'ticket ID' },
        response: 'Full ticket with classification'
      },
      'GET /api/tickets': {
        description: 'List tickets with filtering',
        queryParams: {
          category: 'string (optional)',
          priority: 'Low | Medium | High | Critical (optional)',
          source: 'email | web | api (optional)',
          limit: 'number (default: 10)',
          offset: 'number (default: 0)',
          startDate: 'ISO date string (optional)',
          endDate: 'ISO date string (optional)'
        }
      },
      'PUT /api/tickets/:id/feedback': {
        description: 'Submit classification feedback',
        body: {
          correct: 'boolean',
          actualCategory: 'string (optional)',
          actualPriority: 'string (optional)',
          comments: 'string (optional)'
        }
      },
      'POST /api/tickets/batch': {
        description: 'Process multiple tickets (max 10)',
        body: 'Array of ticket objects'
      }
    },
    analytics: {
      'GET /api/analytics/stats': 'Get classification statistics',
      'GET /api/analytics/trends': 'Get classification trends over time'
    },
    admin: {
      'GET /api/admin/config': 'Get system configuration (requires API key)',
      'PUT /api/admin/config/confidence-threshold': 'Update confidence threshold',
      'POST /api/admin/memory/clear': 'Clear classification memory',
      'GET /api/admin/health': 'System health check'
    }
  },
  authentication: {
    optional: 'Most endpoints work without authentication',
    required: 'Admin endpoints require x-api-key header',
    note: 'API key must be set in environment variables'
  },
  examples: {
    submitTicket: {
      url: 'POST /api/tickets',
      body: {
        subject: 'Cannot login to my account',
        description: 'I have been trying to login for the past hour but keep getting an error message saying invalid credentials. I am sure my password is correct.',
        customerInfo: {
          email: 'user@example.com',
          name: 'John Doe',
          priority: 'Standard'
        },
        source: 'web'
      }
    }
  }
};

app.get('/api', (req, res) => {
  res.json(apiDocumentation);
});

// Swagger UI Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Customer Ticket Classification API',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
}));

// JSON API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json(swaggerSpec);
});

// Routes
app.use('/api/tickets', ticketsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/admin', adminRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;