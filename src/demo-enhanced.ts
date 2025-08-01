import * as dotenv from 'dotenv';
import { ClassificationEngine } from './classification/engine';
import { TicketInput } from './types/ticket';

// Load environment variables
dotenv.config();

async function runEnhancedDemo() {
  console.log('🚀 Enhanced Customer Ticket Classification Demo\n');

  const engine = new ClassificationEngine(
    process.env.OPENAI_API_KEY!,
    70,
    3,
    'gpt-4o'
  );

  // Test cases with different severity levels
  const testTickets: Array<{ name: string; ticket: TicketInput }> = [
    {
      name: "Critical System Outage",
      ticket: {
        subject: "URGENT: Complete system down - all users affected",
        description: "Our entire platform is completely inaccessible. All users are getting 500 errors. This started 30 minutes ago and is affecting our entire customer base. We need immediate assistance as this is costing us thousands per minute.",
        customerInfo: {
          name: "Sarah Johnson",
          email: "sarah.johnson@enterprise.com",
          priority: "VIP"
        },
        source: "api"
      }
    },
    {
      name: "VIP Customer Login Issue",
      ticket: {
        subject: "Cannot access my premium account",
        description: "I'm a premium subscriber and I can't log into my account. I've tried resetting my password multiple times but it's not working. I have an important presentation tomorrow and need access to my files urgently.",
        customerInfo: {
          name: "Michael Chen",
          email: "m.chen@company.com",
          priority: "VIP"
        },
        source: "web"
      }
    },
    {
      name: "Billing Question",
      ticket: {
        subject: "Question about my invoice",
        description: "Hi, I received my monthly invoice and noticed a charge I don't recognize. Could you please help me understand what the 'Premium Features' charge is for? I don't recall upgrading my plan.",
        customerInfo: {
          name: "Emma Davis",
          email: "emma.davis@email.com",
          priority: "Standard"
        },
        source: "email"
      }
    },
    {
      name: "Feature Request",
      ticket: {
        subject: "Suggestion for dark mode",
        description: "I love using your application but would really appreciate a dark mode option. It would be great for working late hours and would reduce eye strain. Many users in the community have been asking for this feature.",
        customerInfo: {
          name: "Alex Rodriguez",
          email: "alex.r@gmail.com",
          priority: "Standard"
        },
        source: "web"
      }
    },
    {
      name: "Security Concern",
      ticket: {
        subject: "Suspicious activity on my account",
        description: "I noticed some login attempts from locations I've never been to. I'm concerned my account might be compromised. I've already changed my password but want to make sure my data is secure. Please investigate this immediately.",
        customerInfo: {
          name: "Jennifer Wilson",
          email: "j.wilson@company.org",
          priority: "Standard"
        },
        source: "web"
      }
    }
  ];

  for (const testCase of testTickets) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 TEST CASE: ${testCase.name}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      const startTime = Date.now();
      const result = await engine.processTicket(`TEST-${Date.now()}`, testCase.ticket);
      const processingTime = Date.now() - startTime;

      console.log(`\n📊 CLASSIFICATION RESULTS:`);
      console.log(`   Category: ${result.classification.category}`);
      console.log(`   Priority: ${result.classification.priority}`);
      console.log(`   Severity: ${result.classification.severity}`);
      console.log(`   Impact Level: ${result.classification.impactLevel}`);
      console.log(`   Urgency Level: ${result.classification.urgencyLevel}`);
      console.log(`   Confidence: ${result.classification.confidence}%`);
      console.log(`   Escalation Required: ${result.classification.escalationRequired ? 'Yes' : 'No'}`);
      console.log(`   Estimated Resolution: ${result.classification.estimatedResolutionTime}`);
      
      console.log(`\n📝 SUMMARY:`);
      console.log(`   ${result.classification.summary}`);
      
      console.log(`\n🏷️  TAGS:`);
      console.log(`   ${result.classification.tags.join(', ')}`);
      
      console.log(`\n🔧 RESOLUTION STEPS:`);
      result.classification.resolutionSteps.forEach((step, index) => {
        console.log(`   ${index + 1}. ${step}`);
      });
      
      console.log(`\n💬 PERSONALIZED RESPONSE:`);
      console.log(`   ${result.classification.personalizedResponse}`);
      
      console.log(`\n🤔 REASONING:`);
      console.log(`   ${result.classification.reasoning}`);
      
      console.log(`\n⏱️  PROCESSING TIME: ${processingTime}ms`);
      console.log(`🤖 MODEL: ${result.modelVersion}`);
      
    } catch (error) {
      console.error(`❌ Error processing ticket: ${error}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ Enhanced Demo Complete!');
  console.log(`${'='.repeat(60)}`);
}

// Run the demo
if (require.main === module) {
  runEnhancedDemo().catch(console.error);
}

export { runEnhancedDemo };