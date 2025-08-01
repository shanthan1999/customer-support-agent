import { BufferMemory } from "langchain/memory";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";

export class TicketClassificationMemory {
  private memory: BufferMemory;
  private static instance: TicketClassificationMemory;

  private constructor() {
    this.memory = new BufferMemory({
      chatHistory: new ChatMessageHistory(),
      memoryKey: "history",
      returnMessages: true
    });
  }

  public static getInstance(): TicketClassificationMemory {
    if (!TicketClassificationMemory.instance) {
      TicketClassificationMemory.instance = new TicketClassificationMemory();
    }
    return TicketClassificationMemory.instance;
  }

  public async addClassificationContext(
    ticketInfo: string, 
    classification: string
  ): Promise<void> {
    await this.memory.saveContext(
      { input: `Ticket: ${ticketInfo}` },
      { output: `Classification: ${classification}` }
    );
  }

  public async getRelevantHistory(): Promise<string> {
    const memoryVariables = await this.memory.loadMemoryVariables({});
    const history = memoryVariables.history;
    
    if (!history || history.length === 0) {
      return "No previous classification history available.";
    }

    // Get last 5 classifications for context
    const recentHistory = history.slice(-5);
    return recentHistory.map((msg: any) => 
      `${msg._getType()}: ${msg.content}`
    ).join('\n');
  }

  public async clearMemory(): Promise<void> {
    await this.memory.clear();
  }

  public getMemory(): BufferMemory {
    return this.memory;
  }
}