import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Customer Ticket Classification API',
      version: '1.0.0',
      description: 'AI-powered ticket classification system using LangChain and OpenAI',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : `http://localhost:${process.env.PORT || 8000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key for admin endpoints (set in environment variables)'
        }
      },
      schemas: {
        TicketInput: {
          type: 'object',
          required: ['subject', 'description'],
          properties: {
            subject: {
              type: 'string',
              description: 'Ticket subject/title',
              example: 'Cannot login to my account'
            },
            description: {
              type: 'string',
              description: 'Detailed description of the issue',
              example: 'I have been trying to login for the past hour but keep getting an error message saying invalid credentials.'
            },
            customerInfo: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'user@example.com'
                },
                name: {
                  type: 'string',
                  example: 'John Doe'
                },
                priority: {
                  type: 'string',
                  enum: ['VIP', 'Standard'],
                  example: 'Standard'
                }
              }
            },
            source: {
              type: 'string',
              enum: ['email', 'web', 'api'],
              example: 'web'
            },
            language: {
              type: 'string',
              example: 'en'
            }
          }
        },
        ClassificationResult: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['Technical', 'Billing', 'General Inquiry', 'Bug Report', 'Feature Request', 'Account', 'Security', 'Performance', 'Integration'],
              example: 'Account'
            },
            priority: {
              type: 'string',
              enum: ['Low', 'Medium', 'High', 'Critical', 'Urgent'],
              example: 'High'
            },
            severity: {
              type: 'string',
              enum: ['Minor', 'Moderate', 'Major', 'Critical', 'Emergency'],
              example: 'Major'
            },
            confidence: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              example: 85
            },
            summary: {
              type: 'string',
              example: 'User unable to login due to authentication issues'
            },
            suggestedResponse: {
              type: 'string',
              example: 'Thank you for contacting us. I understand you are having trouble logging into your account...'
            },
            personalizedResponse: {
              type: 'string',
              example: 'Dear John, thank you for contacting us. I understand you are having trouble logging into your account...'
            },
            resolutionSteps: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Verify account credentials', 'Check for account lockout', 'Reset password if necessary', 'Test login functionality']
            },
            estimatedResolutionTime: {
              type: 'string',
              example: '2-4 hours'
            },
            escalationRequired: {
              type: 'boolean',
              example: false
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['login', 'authentication', 'account-access']
            },
            reasoning: {
              type: 'string',
              example: 'Classified as Account issue due to login problems mentioned in description'
            },
            impactLevel: {
              type: 'string',
              enum: ['Individual', 'Department', 'Organization', 'System-wide'],
              example: 'Individual'
            },
            urgencyLevel: {
              type: 'string',
              enum: ['Can wait', 'Normal', 'Soon', 'ASAP', 'Immediate'],
              example: 'Soon'
            }
          }
        },
        TicketResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                ticketId: {
                  type: 'string',
                  example: 'TICKET-1234567890-abc123'
                },
                classification: {
                  $ref: '#/components/schemas/ClassificationResult'
                },
                processingTime: {
                  type: 'number',
                  example: 1250
                },
                needsManualReview: {
                  type: 'boolean',
                  example: false
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Validation failed'
            },
            message: {
              type: 'string',
              example: 'Subject is required'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);