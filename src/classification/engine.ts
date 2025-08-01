import { TicketClassificationChain } from "./chains";
import { TicketInput, ClassificationResult, TicketClassification } from "../types/ticket";

export class ClassificationEngine {
  private classificationChain: TicketClassificationChain;
  private confidenceThreshold: number;
  private retryAttempts: number;
  private modelName: string;

  constructor(
    openAIApiKey: string,
    confidenceThreshold: number = 70,
    retryAttempts: number = 3,
    modelName: string = "gpt-4o-mini"
  ) {
    this.classificationChain = new TicketClassificationChain(openAIApiKey, modelName);
    this.confidenceThreshold = confidenceThreshold;
    this.retryAttempts = retryAttempts;
    this.modelName = modelName;
  }

  async processTicket(
    ticketId: string,
    ticket: TicketInput
  ): Promise<TicketClassification> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    // Retry logic with exponential backoff
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`Processing ticket ${ticketId}, attempt ${attempt}`);
        
        const classification = await this.classificationChain.classifyWithConfidenceCheck(
          ticket,
          this.confidenceThreshold
        );

        const processingTime = Date.now() - startTime;

        const result: TicketClassification = {
          ticketId,
          classification: {
            category: classification.category,
            priority: classification.priority,
            severity: classification.severity,
            confidence: classification.confidence,
            summary: classification.summary,
            suggestedResponse: classification.suggestedResponse,
            personalizedResponse: classification.personalizedResponse,
            resolutionSteps: classification.resolutionSteps,
            estimatedResolutionTime: classification.estimatedResolutionTime,
            escalationRequired: classification.escalationRequired,
            tags: classification.tags,
            reasoning: classification.reasoning,
            impactLevel: classification.impactLevel,
            urgencyLevel: classification.urgencyLevel
          },
          classifiedAt: new Date(),
          modelVersion: this.modelName,
          processingTime
        };

        // Log successful classification
        this.logClassification(ticketId, result, classification.needsManualReview);

        return result;

      } catch (error) {
        lastError = error as Error;
        console.error(`Classification attempt ${attempt} failed for ticket ${ticketId}:`, error);

        // Exponential backoff delay
        if (attempt < this.retryAttempts) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If all retries failed, throw the last error
    throw new Error(`Failed to classify ticket ${ticketId} after ${this.retryAttempts} attempts: ${lastError?.message}`);
  }

  async batchProcessTickets(
    tickets: Array<{ ticketId: string; ticket: TicketInput }>
  ): Promise<TicketClassification[]> {
    const results: TicketClassification[] = [];
    const errors: Array<{ ticketId: string; error: string }> = [];

    for (const { ticketId, ticket } of tickets) {
      try {
        const result = await this.processTicket(ticketId, ticket);
        results.push(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ ticketId, error: errorMessage });
        console.error(`Batch processing failed for ticket ${ticketId}:`, errorMessage);
      }
    }

    if (errors.length > 0) {
      console.warn(`Batch processing completed with ${errors.length} errors:`, errors);
    }

    return results;
  }

  private logClassification(
    ticketId: string,
    classification: TicketClassification,
    needsManualReview: boolean
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ticketId,
      category: classification.classification.category,
      priority: classification.classification.priority,
      severity: classification.classification.severity,
      confidence: classification.classification.confidence,
      impactLevel: classification.classification.impactLevel,
      urgencyLevel: classification.classification.urgencyLevel,
      escalationRequired: classification.classification.escalationRequired,
      estimatedResolutionTime: classification.classification.estimatedResolutionTime,
      processingTime: classification.processingTime,
      needsManualReview,
      modelVersion: classification.modelVersion
    };

    console.log('Classification completed:', JSON.stringify(logEntry, null, 2));
  }

  // Method to get classification statistics
  getClassificationStats(): {
    confidenceThreshold: number;
    retryAttempts: number;
    modelVersion: string;
  } {
    return {
      confidenceThreshold: this.confidenceThreshold,
      retryAttempts: this.retryAttempts,
      modelVersion: this.modelName
    };
  }

  // Method to update confidence threshold
  updateConfidenceThreshold(threshold: number): void {
    if (threshold < 0 || threshold > 100) {
      throw new Error('Confidence threshold must be between 0 and 100');
    }
    this.confidenceThreshold = threshold;
    console.log(`Confidence threshold updated to ${threshold}`);
  }

  // Method to clear classification memory
  async clearMemory(): Promise<void> {
    await this.classificationChain.clearMemory();
    console.log('Classification memory cleared');
  }
}