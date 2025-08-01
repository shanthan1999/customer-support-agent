import { PromptTemplate } from "@langchain/core/prompts";

export const CLASSIFICATION_PROMPT = new PromptTemplate({
  template: `You are an expert customer support ticket classifier. Analyze the following ticket and provide a comprehensive structured classification.

TICKET INFORMATION:
Subject: {subject}
Description: {description}
Customer Name: {customerName}
Customer Priority: {customerPriority}
Source: {source}

CLASSIFICATION CATEGORIES:
- Technical: Software bugs, system errors, integration issues, API problems
- Billing: Payment problems, subscription issues, refunds, invoicing
- General Inquiry: Questions, information requests, how-to guides
- Bug Report: Confirmed software defects requiring fixes
- Feature Request: New functionality suggestions, enhancements
- Account: Login issues, profile changes, permissions, security
- Security: Data breaches, unauthorized access, security vulnerabilities
- Performance: Slow response times, system lag, optimization issues
- Integration: Third-party service issues, API connectivity problems

PRIORITY LEVELS (Business Impact):
- Urgent: Complete system outage, security breach, data loss affecting all users
- Critical: Major functionality broken, significant business impact, VIP customer critical issues
- High: Important features not working, moderate business impact, multiple users affected
- Medium: Minor bugs, individual user issues, standard requests
- Low: General questions, feature requests, cosmetic issues

SEVERITY LEVELS (Technical Impact):
- Emergency: System completely down, data corruption, security breach
- Critical: Core functionality broken, major features unavailable
- Major: Important features impacted, workarounds available
- Moderate: Minor functionality issues, limited impact
- Minor: Cosmetic issues, enhancement requests

IMPACT LEVELS:
- System-wide: Affects entire platform/service
- Organization: Affects entire customer organization
- Department: Affects specific department/team
- Individual: Affects single user

URGENCY LEVELS:
- Immediate: Must be resolved within 1 hour
- ASAP: Must be resolved within 4 hours
- Soon: Must be resolved within 24 hours
- Normal: Standard resolution timeframe (2-3 days)
- Can wait: Low priority, can be scheduled

PREVIOUS CONTEXT:
{history}

Please provide your analysis in the following JSON format:
{{
  "category": "one of the categories above",
  "priority": "Urgent/Critical/High/Medium/Low",
  "severity": "Emergency/Critical/Major/Moderate/Minor",
  "confidence": number between 0-100,
  "summary": "brief 1-2 sentence summary of the issue",
  "reasoning": "detailed explanation of your classification decision",
  "tags": ["relevant", "keywords", "from", "ticket"],
  "suggestedResponse": "professional response template without customer name",
  "personalizedResponse": "personalized response using customer name if provided",
  "resolutionSteps": ["step 1", "step 2", "step 3", "etc - specific actionable steps"],
  "estimatedResolutionTime": "realistic time estimate (e.g., '2-4 hours', '1-2 business days')",
  "escalationRequired": true/false,
  "impactLevel": "System-wide/Organization/Department/Individual",
  "urgencyLevel": "Immediate/ASAP/Soon/Normal/Can wait"
}}

RESPONSE GUIDELINES BY PRIORITY:
- Urgent: Immediate acknowledgment, emergency escalation, hourly updates, senior engineer assignment
- Critical: Immediate response, escalate to specialists, provide workarounds, regular updates
- High: Quick professional response, assign experienced agent, provide timeline and alternatives
- Medium: Friendly helpful response, provide solution steps, set realistic expectations
- Low: Courteous response, provide information/guidance, can be handled in normal queue

RESOLUTION STEPS GUIDELINES:
- Emergency/Critical: Include immediate mitigation steps, escalation procedures, communication plan
- Major: Provide troubleshooting steps, workarounds, escalation path if needed
- Moderate: Give step-by-step resolution guide, additional resources
- Minor: Provide simple instructions, documentation links, tips

Ensure all responses are professional, empathetic, and match the severity level.`,
  inputVariables: ["subject", "description", "customerName", "customerPriority", "source", "history"]
});

export const RESPONSE_GENERATION_PROMPT = new PromptTemplate({
  template: `Generate a comprehensive, personalized customer support response for this classified ticket:

TICKET CLASSIFICATION:
Category: {category}
Priority: {priority}
Severity: {severity}
Summary: {summary}
Customer Name: {customerName}
Customer Priority: {customerPriority}
Impact Level: {impactLevel}
Urgency Level: {urgencyLevel}
Escalation Required: {escalationRequired}

TICKET CONTENT:
Subject: {subject}
Description: {description}

RESPONSE TONE GUIDELINES BY PRIORITY:
- Urgent: Immediate, apologetic, emergency-focused, executive-level attention
- Critical: Urgent, empathetic, solution-focused, senior specialist involvement
- High: Professional, concerned, proactive, experienced agent handling
- Medium: Helpful, friendly, informative, standard professional service
- Low: Courteous, educational, patient, can be handled by junior agents

PERSONALIZATION REQUIREMENTS:
- Always use customer's name if provided (Dear [Name] or Hello [Name])
- Reference their specific issue details
- Acknowledge their customer priority level if VIP
- Match communication style to their urgency level

Generate a response that includes:
1. Personalized greeting using customer name
2. Acknowledgment of the specific issue with empathy appropriate to severity
3. Clear explanation of next steps and timeline
4. Specific resolution steps or immediate actions being taken
5. Contact information for follow-up
6. Professional closing with agent/team identification

RESPONSE STRUCTURE:
- Greeting: Personalized with customer name
- Acknowledgment: Show understanding of their issue and its impact
- Action Plan: What we're doing immediately
- Resolution Steps: Specific steps being taken
- Timeline: Realistic expectations for resolution
- Escalation Info: If applicable, mention senior team involvement
- Contact Info: How they can reach us for updates
- Closing: Professional sign-off

Response:`,
  inputVariables: ["category", "priority", "severity", "summary", "customerName", "customerPriority", "subject", "description", "impactLevel", "urgencyLevel", "escalationRequired"]
});