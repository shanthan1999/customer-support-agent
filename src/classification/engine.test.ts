import { ClassificationEngine } from './engine';
import { TicketInput } from '../types/ticket';

// Mock the OpenAI API for testing
jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    call: jest.fn().mockResolvedValue({
      text: JSON.stringify({
        category: 'Technical',
        priority: 'High',
        confidence: 85,
        summary: 'System outage affecting all users',
        reasoning: 'Critical system failure requires immediate attention',
        tags: ['outage', 'system', 'critical'],
        suggestedResponse: 'We are aware of the system outage and our team is working to resolve it immediately.'
      })
    })
  }))
}));

describe('ClassificationEngine', () => {
  let engine: ClassificationEngine;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    engine = new ClassificationEngine(mockApiKey, 70, 3);
  });

  describe('processTicket', () => {
    it('should classify a critical ticket correctly', async () => {
      const ticket: TicketInput = {
        subject: 'System is down',
        description: 'Complete system outage affecting all users',
        customerInfo: {
          email: 'test@example.com',
          name: 'Test User',
          priority: 'VIP'
        },
        source: 'email'
      };

      const result = await engine.processTicket('TEST-001', ticket);

      expect(result.ticketId).toBe('TEST-001');
      expect(result.classification.category).toBe('Technical');
      expect(result.classification.priority).toBe('High');
      expect(result.classification.confidence).toBe(85);
      expect(result.classification.summary).toContain('System outage');
      expect(result.classification.suggestedResponse).toContain('aware of the system outage');
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should handle confidence threshold correctly', () => {
      expect(engine.getClassificationStats().confidenceThreshold).toBe(70);
      
      engine.updateConfidenceThreshold(80);
      expect(engine.getClassificationStats().confidenceThreshold).toBe(80);
    });

    it('should throw error for invalid confidence threshold', () => {
      expect(() => engine.updateConfidenceThreshold(-10)).toThrow();
      expect(() => engine.updateConfidenceThreshold(110)).toThrow();
    });
  });

  describe('batchProcessTickets', () => {
    it('should process multiple tickets', async () => {
      const tickets = [
        {
          ticketId: 'BATCH-001',
          ticket: {
            subject: 'Login issue',
            description: 'Cannot log into account',
            source: 'web' as const
          }
        },
        {
          ticketId: 'BATCH-002',
          ticket: {
            subject: 'Billing question',
            description: 'Question about my invoice',
            source: 'email' as const
          }
        }
      ];

      const results = await engine.batchProcessTickets(tickets);

      expect(results).toHaveLength(2);
      expect(results[0].ticketId).toBe('BATCH-001');
      expect(results[1].ticketId).toBe('BATCH-002');
    });
  });
});