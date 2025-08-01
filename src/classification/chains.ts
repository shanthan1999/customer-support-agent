import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { CLASSIFICATION_PROMPT, RESPONSE_GENERATION_PROMPT } from "./prompts";
import { TicketClassificationMemory } from "./memory";
import { TicketInput, ClassificationResult } from "../types/ticket";
import { TextCleaner } from "../utils/textCleaner";

// Define the expected output schema
const ClassificationSchema = z.object({
  category: z.string(),
  priority: z.enum(["Urgent", "Critical", "High", "Medium", "Low"]),
  severity: z.enum(["Emergency", "Critical", "Major", "Moderate", "Minor"]),
  confidence: z.number().min(0).max(100),
  summary: z.string(),
  reasoning: z.string(),
  tags: z.array(z.string()),
  suggestedResponse: z.string(),
  personalizedResponse: z.string(),
  resolutionSteps: z.array(z.string()),
  estimatedResolutionTime: z.string(),
  escalationRequired: z.boolean(),
  impactLevel: z.enum(["System-wide", "Organization", "Department", "Individual"]),
  urgencyLevel: z.enum(["Immediate", "ASAP", "Soon", "Normal", "Can wait"])
});

type ClassificationSchemaType = z.infer<typeof ClassificationSchema>;

export class TicketClassificationChain {
  private llm: ChatOpenAI;
  private memory: TicketClassificationMemory;

  constructor(apiKey: string, modelName: string = "gpt-4o-mini") {
    this.llm = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: modelName,
      temperature: 0.1, // Low temperature for consistent classification
      maxTokens: 1000
    });

    this.memory = TicketClassificationMemory.getInstance();
  }

  async classifyTicket(ticket: TicketInput): Promise<ClassificationResult> {
    try {
      const startTime = Date.now();

      // Get relevant history for context
      const history = await this.memory.getRelevantHistory();

      // Prepare input for classification
      const input = {
        subject: ticket.subject,
        description: ticket.description,
        customerName: ticket.customerInfo?.name || 'Valued Customer',
        customerPriority: ticket.customerInfo?.priority || 'Standard',
        source: ticket.source || 'unknown',
        history: history
      };

      // Format the prompt and invoke the LLM directly
      const formattedPrompt = await CLASSIFICATION_PROMPT.format(input);
      const classificationResult = await this.llm.invoke(formattedPrompt);

      // Parse the structured output
      let parsedResult: ClassificationSchemaType;

      try {
        // Extract text content from the message
        const textContent = typeof classificationResult.content === 'string' 
          ? classificationResult.content 
          : classificationResult.content.toString();
        
        // Clean the response text first to handle newlines and formatting issues
        const cleanedText = TextCleaner.cleanResponse(textContent);
        
        // Try to parse as JSON first
        const jsonResult = JSON.parse(cleanedText);
        parsedResult = ClassificationSchema.parse(jsonResult);
      } catch (parseError) {
        // Fallback: try to extract JSON from text using regex
        try {
          const textContent = typeof classificationResult.content === 'string' 
            ? classificationResult.content 
            : classificationResult.content.toString();
          
          // Clean the text before regex matching
          const cleanedText = TextCleaner.cleanResponse(textContent);
          const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const extractedJson = JSON.parse(jsonMatch[0]);
            parsedResult = ClassificationSchema.parse(extractedJson);
          } else {
            throw new Error("No JSON found in response");
          }
        } catch (fallbackError) {
          // Final fallback: create a basic classification
          parsedResult = {
            category: "General Inquiry",
            priority: "Medium" as const,
            severity: "Moderate" as const,
            confidence: 50,
            summary: "Unable to parse classification result",
            reasoning: "Classification parsing failed, using default values",
            tags: ["parsing-error"],
            suggestedResponse: "Thank you for contacting us. We'll review your request and get back to you soon.",
            personalizedResponse: `Dear ${ticket.customerInfo?.name || 'Valued Customer'}, thank you for contacting us. We'll review your request and get back to you soon.`,
            resolutionSteps: ["Review ticket details", "Assign to appropriate team", "Provide resolution"],
            estimatedResolutionTime: "1-2 business days",
            escalationRequired: false,
            impactLevel: "Individual" as const,
            urgencyLevel: "Normal" as const
          };
        }
      }

      // Generate enhanced response based on classification
      const enhancedResponse = await this.generateSeverityBasedResponse(
        ticket,
        parsedResult
      );

      // Clean all text fields to remove newlines and normalize formatting
      const cleanedResult = TextCleaner.cleanStructuredData(parsedResult);
      const cleanedEnhancedResponse = TextCleaner.cleanResponse(enhancedResponse);

      const result: ClassificationResult = {
        ...cleanedResult,
        personalizedResponse: cleanedEnhancedResponse,
        priority: parsedResult.priority as 'Low' | 'Medium' | 'High' | 'Critical' | 'Urgent',
        severity: parsedResult.severity as 'Minor' | 'Moderate' | 'Major' | 'Critical' | 'Emergency',
        impactLevel: parsedResult.impactLevel as 'Individual' | 'Department' | 'Organization' | 'System-wide',
        urgencyLevel: parsedResult.urgencyLevel as 'Can wait' | 'Normal' | 'Soon' | 'ASAP' | 'Immediate'
      };

      // Add to memory for future context
      await this.memory.addClassificationContext(
        `${ticket.subject}: ${ticket.description}`,
        JSON.stringify(result)
      );

      const processingTime = Date.now() - startTime;
      console.log(`Classification completed in ${processingTime}ms`);

      return result;

    } catch (error) {
      console.error('Classification error:', error);
      throw new Error(`Failed to classify ticket: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateSeverityBasedResponse(
    ticket: TicketInput,
    classification: ClassificationSchemaType
  ): Promise<string> {
    try {
      const responseInput = {
        category: classification.category,
        priority: classification.priority,
        severity: classification.severity,
        summary: classification.summary,
        customerName: ticket.customerInfo?.name || 'Valued Customer',
        customerPriority: ticket.customerInfo?.priority || 'Standard',
        subject: ticket.subject,
        description: ticket.description,
        impactLevel: classification.impactLevel,
        urgencyLevel: classification.urgencyLevel,
        escalationRequired: classification.escalationRequired.toString()
      };

      const formattedResponsePrompt = await RESPONSE_GENERATION_PROMPT.format(responseInput);
      const responseResult = await this.llm.invoke(formattedResponsePrompt);
      
      // Extract text content from the message
      const textContent = typeof responseResult.content === 'string' 
        ? responseResult.content 
        : responseResult.content.toString();
      
      // Clean the response text to remove newlines and normalize formatting
      return TextCleaner.cleanResponse(textContent);
    } catch (error) {
      console.error('Response generation error:', error);
      // Fallback to the personalized response or suggested response
      const fallbackResponse = classification.personalizedResponse || classification.suggestedResponse;
      return TextCleaner.cleanResponse(fallbackResponse);
    }
  }

  // Method to get classification with confidence threshold check
  async classifyWithConfidenceCheck(
    ticket: TicketInput,
    confidenceThreshold: number = 70
  ): Promise<ClassificationResult & { needsManualReview: boolean }> {
    const result = await this.classifyTicket(ticket);

    return {
      ...result,
      needsManualReview: result.confidence < confidenceThreshold
    };
  }

  // Method to batch classify multiple tickets
  async batchClassify(tickets: TicketInput[]): Promise<ClassificationResult[]> {
    const results: ClassificationResult[] = [];

    for (const ticket of tickets) {
      try {
        const result = await this.classifyTicket(ticket);
        results.push(result);

        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to classify ticket: ${ticket.subject}`, error);
        // Continue with other tickets
      }
    }

    return results;
  }

  // Method to clear memory (useful for testing or reset)
  async clearMemory(): Promise<void> {
    await this.memory.clearMemory();
  }
}