import { Router, Request, Response } from 'express';
import { ClassificationEngine } from '../classification/engine';
import { validateBody, validateQuery, TicketSubmissionSchema, FeedbackSchema, QueryParamsSchema } from '../middleware/validation';
import { optionalAuth } from '../middleware/auth';
import { TicketInput } from '../types/ticket';

const router = Router();

// Lazy initialization of classification engine
let engine: ClassificationEngine | null = null;

function getEngine(): ClassificationEngine {
  if (!engine) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    engine = new ClassificationEngine(
      apiKey,
      parseInt(process.env.CONFIDENCE_THRESHOLD || '70'),
      3,
      process.env.MODEL_NAME || 'gpt-4o'
    );
  }
  return engine;
}

// In-memory storage for demo (replace with MongoDB in production)
const tickets = new Map<string, any>();
const feedback = new Map<string, any[]>();

// Generate ticket ID
function generateTicketId(): string {
  return `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Submit a new ticket for classification
 *     description: Submit a customer support ticket for AI-powered classification and response generation
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketInput'
 *     responses:
 *       201:
 *         description: Ticket successfully classified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketResponse'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', 
  optionalAuth,
  validateBody(TicketSubmissionSchema),
  async (req: Request, res: Response) => {
    try {
      const ticketInput: TicketInput = req.body;
      const ticketId = generateTicketId();
      
      console.log(`Processing new ticket: ${ticketId}`);
      
      // Classify the ticket
      const classification = await getEngine().processTicket(ticketId, ticketInput);
      
      // Store ticket with classification
      const ticket = {
        ticketId,
        ...ticketInput,
        classification: classification.classification,
        status: 'classified',
        createdAt: new Date(),
        updatedAt: new Date(),
        processingTime: classification.processingTime
      };
      
      tickets.set(ticketId, ticket);
      
      res.status(201).json({
        success: true,
        data: {
          ticketId,
          classification: classification.classification,
          processingTime: classification.processingTime,
          needsManualReview: classification.classification.confidence < 70
        }
      });
      
    } catch (error) {
      console.error('Ticket submission error:', error);
      res.status(500).json({
        error: 'Failed to process ticket',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Retrieve a specific ticket
 *     description: Get details of a specific ticket including its classification
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *         example: TICKET-1234567890-abc123
 *     responses:
 *       200:
 *         description: Ticket found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       404:
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', 
  optionalAuth,
  (req: Request, res: Response) => {
    try {
      const ticketId = req.params.id;
      const ticket = tickets.get(ticketId);
      
      if (!ticket) {
        return res.status(404).json({
          error: 'Ticket not found',
          message: `Ticket with ID ${ticketId} does not exist`
        });
      }
      
      res.json({
        success: true,
        data: ticket
      });
      
    } catch (error) {
      console.error('Ticket retrieval error:', error);
      res.status(500).json({
        error: 'Failed to retrieve ticket',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/tickets
 * List tickets with filtering and pagination
 */
router.get('/', 
  optionalAuth,
  validateQuery(QueryParamsSchema),
  (req: Request, res: Response) => {
    try {
      const { category, priority, source, limit = 10, offset = 0, startDate, endDate } = req.query as any;
      
      let filteredTickets = Array.from(tickets.values());
      
      // Apply filters
      if (category) {
        filteredTickets = filteredTickets.filter(t => 
          t.classification?.category?.toLowerCase() === category.toLowerCase()
        );
      }
      
      if (priority) {
        filteredTickets = filteredTickets.filter(t => 
          t.classification?.priority === priority
        );
      }
      
      if (source) {
        filteredTickets = filteredTickets.filter(t => t.source === source);
      }
      
      if (startDate) {
        filteredTickets = filteredTickets.filter(t => 
          new Date(t.createdAt) >= new Date(startDate)
        );
      }
      
      if (endDate) {
        filteredTickets = filteredTickets.filter(t => 
          new Date(t.createdAt) <= new Date(endDate)
        );
      }
      
      // Sort by creation date (newest first)
      filteredTickets.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Apply pagination
      const total = filteredTickets.length;
      const paginatedTickets = filteredTickets.slice(offset, offset + limit);
      
      res.json({
        success: true,
        data: {
          tickets: paginatedTickets,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total
          }
        }
      });
      
    } catch (error) {
      console.error('Ticket listing error:', error);
      res.status(500).json({
        error: 'Failed to retrieve tickets',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);/**
 
* PUT /api/tickets/:id/feedback
 * Submit feedback on ticket classification
 */
router.put('/:id/feedback', 
  optionalAuth,
  validateBody(FeedbackSchema),
  (req: Request, res: Response) => {
    try {
      const ticketId = req.params.id;
      const feedbackData = req.body;
      
      const ticket = tickets.get(ticketId);
      if (!ticket) {
        return res.status(404).json({
          error: 'Ticket not found',
          message: `Ticket with ID ${ticketId} does not exist`
        });
      }
      
      // Store feedback
      const feedbackEntry = {
        ...feedbackData,
        ticketId,
        submittedAt: new Date(),
        originalClassification: ticket.classification
      };
      
      if (!feedback.has(ticketId)) {
        feedback.set(ticketId, []);
      }
      feedback.get(ticketId)!.push(feedbackEntry);
      
      // Update ticket with feedback
      ticket.feedback = feedbackEntry;
      ticket.updatedAt = new Date();
      tickets.set(ticketId, ticket);
      
      res.json({
        success: true,
        message: 'Feedback submitted successfully',
        data: {
          ticketId,
          feedbackId: feedbackEntry.submittedAt.getTime()
        }
      });
      
    } catch (error) {
      console.error('Feedback submission error:', error);
      res.status(500).json({
        error: 'Failed to submit feedback',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/tickets/batch
 * Process multiple tickets at once
 */
router.post('/batch', 
  optionalAuth,
  (req: Request, res: Response) => {
    const batchSchema = TicketSubmissionSchema.array().max(10, 'Maximum 10 tickets per batch');
    
    try {
      const ticketsData = batchSchema.parse(req.body);
      
      // Process tickets in batch
      const batchPromise = ticketsData.map(async (ticketInput, index) => {
        const ticketId = `BATCH-${Date.now()}-${index}`;
        
        try {
          const classification = await getEngine().processTicket(ticketId, ticketInput);
          
          const ticket = {
            ticketId,
            ...ticketInput,
            classification: classification.classification,
            status: 'classified',
            createdAt: new Date(),
            updatedAt: new Date(),
            processingTime: classification.processingTime
          };
          
          tickets.set(ticketId, ticket);
          
          return {
            ticketId,
            success: true,
            classification: classification.classification,
            processingTime: classification.processingTime
          };
        } catch (error) {
          return {
            ticketId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });
      
      Promise.all(batchPromise).then(results => {
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        res.json({
          success: true,
          data: {
            results,
            summary: {
              total: results.length,
              successful,
              failed
            }
          }
        });
      }).catch(error => {
        res.status(500).json({
          error: 'Batch processing failed',
          message: error.message
        });
      });
      
    } catch (error) {
      res.status(400).json({
        error: 'Invalid batch request',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;