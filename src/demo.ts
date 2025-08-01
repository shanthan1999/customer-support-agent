import * as dotenv from 'dotenv';
import { ClassificationEngine } from './classification/engine';
import { TicketInput } from './types/ticket';

// Load environment variables
dotenv.config();

async function demonstrateClassification() {
  const openAIApiKey = process.env.OPENAI_API_KEY;
  
  if (!openAIApiKey) {
    console.error('OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  // Initialize the classification engine
  const engine = new ClassificationEngine(openAIApiKey, 70, 3);

  // Sample tickets with different severity levels
  const sampleTickets: Array<{ ticketId: string; ticket: TicketInput }> = [
    {
      ticketId: 'TICKET-001',
      ticket: {
        subject: 'URGENT: Complete system outage - customers cannot access platform',
        description: 'Our entire platform is down. All customers are getting 500 errors when trying to log in. This started 30 minutes ago and is affecting all users. Revenue is being lost every minute this continues.',
        customerInfo: {
          email: 'cto@enterprise-client.com',
          name: 'John Smith',
          priority: 'VIP'
        },
        source: 'email',
        language: 'en'
      }
    },
    {
      ticketId: 'TICKET-002',
      ticket: {
        subject: 'Payment processing error on checkout',
        description: 'When customers try to complete their purchase, they get an error message saying "Payment could not be processed". This is happening for about 20% of transactions since yesterday.',
        customerInfo: {
          email: 'support@retailer.com',
          name: 'Sarah Johnson',
          priority: 'Standard'
        },
        source: 'web',
        language: 'en'
      }
    },
    {
      ticketId: 'TICKET-003',
      ticket: {
        subject: 'How to export my data?',
        description: 'Hi, I would like to know how I can export all my data from your platform. I need it for my records. Is there a way to do this from the dashboard?',
        customerInfo: {
          email: 'user@example.com',
          name: 'Mike Wilson',
          priority: 'Standard'
        },
        source: 'web',
        language: 'en'
      }
    },
    {
      ticketId: 'TICKET-004',
      ticket: {
        subject: 'Feature request: Dark mode support',
        description: 'It would be great if you could add dark mode support to the application. Many users prefer dark themes, especially when working late hours. This would improve user experience significantly.',
        customerInfo: {
          email: 'developer@startup.com',
          name: 'Alex Chen',
          priority: 'Standard'
        },
        source: 'api',
        language: 'en'
      }
    }
  ];

  console.log('🎯 Starting Ticket Classification Demonstration\n');
  console.log('=' .repeat(80));

  try {
    // Process each ticket individually to show detailed results
    for (const { ticketId, ticket } of sampleTickets) {
      console.log(`\n📋 Processing ${ticketId}`);
      console.log('-'.repeat(50));
      console.log(`Subject: ${ticket.subject}`);
      console.log(`Customer: ${ticket.customerInfo?.name} (${ticket.customerInfo?.priority})`);
      
      try {
        const result = await engine.processTicket(ticketId, ticket);
        
        console.log('\n✅ Classification Results:');
        console.log(`   Category: ${result.classification.category}`);
        console.log(`   Priority: ${result.classification.priority}`);
        console.log(`   Confidence: ${result.classification.confidence}%`);
        console.log(`   Processing Time: ${result.processingTime}ms`);
        
        console.log('\n📝 Summary:');
        console.log(`   ${result.classification.summary}`);
        
        console.log('\n🏷️  Tags:');
        console.log(`   ${result.classification.tags.join(', ')}`);
        
        console.log('\n🤔 AI Reasoning:');
        console.log(`   ${result.classification.reasoning}`);
        
        console.log('\n💬 Suggested Response:');
        console.log(`   ${result.classification.suggestedResponse}`);
        
        // Check if manual review is needed
        if (result.classification.confidence < 70) {
          console.log('\n⚠️  FLAGGED FOR MANUAL REVIEW (Low Confidence)');
        }
        
        console.log('\n' + '='.repeat(80));
        
        // Add delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed to process ${ticketId}:`, error);
      }
    }

    // Demonstrate batch processing
    console.log('\n🚀 Demonstrating Batch Processing...\n');
    
    const batchResults = await engine.batchProcessTickets(sampleTickets);
    
    console.log(`✅ Batch processing completed: ${batchResults.length} tickets processed`);
    
    // Show summary statistics
    const priorityCounts = batchResults.reduce((acc, result) => {
      acc[result.classification.priority] = (acc[result.classification.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const categoryCounts = batchResults.reduce((acc, result) => {
      acc[result.classification.category] = (acc[result.classification.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n📊 Summary Statistics:');
    console.log('Priority Distribution:', priorityCounts);
    console.log('Category Distribution:', categoryCounts);
    
    const avgConfidence = batchResults.reduce((sum, result) => 
      sum + result.classification.confidence, 0) / batchResults.length;
    console.log(`Average Confidence: ${avgConfidence.toFixed(1)}%`);
    
    const avgProcessingTime = batchResults.reduce((sum, result) => 
      sum + result.processingTime, 0) / batchResults.length;
    console.log(`Average Processing Time: ${avgProcessingTime.toFixed(0)}ms`);

  } catch (error) {
    console.error('❌ Demonstration failed:', error);
  }
}

// Run the demonstration
if (require.main === module) {
  demonstrateClassification()
    .then(() => {
      console.log('\n🎉 Demonstration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Demonstration failed:', error);
      process.exit(1);
    });
}

export { demonstrateClassification };