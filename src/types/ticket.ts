export interface TicketInput {
  subject: string;
  description: string;
  customerInfo?: {
    email?: string;
    name?: string;
    priority?: 'VIP' | 'Standard';
  };
  source?: 'email' | 'web' | 'api';
  language?: string;
}

export interface ClassificationResult {
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical' | 'Urgent';
  severity: 'Minor' | 'Moderate' | 'Major' | 'Critical' | 'Emergency';
  confidence: number;
  summary: string;
  suggestedResponse: string;
  personalizedResponse: string;
  resolutionSteps: string[];
  estimatedResolutionTime: string;
  escalationRequired: boolean;
  tags: string[];
  reasoning: string;
  impactLevel: 'Individual' | 'Department' | 'Organization' | 'System-wide';
  urgencyLevel: 'Can wait' | 'Normal' | 'Soon' | 'ASAP' | 'Immediate';
}

export interface TicketClassification {
  ticketId: string;
  classification: ClassificationResult;
  classifiedAt: Date;
  modelVersion: string;
  processingTime: number;
}