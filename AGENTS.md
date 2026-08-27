# Project Overview: Telephony Call Bot & CRM Lead Conversion Engine

## Core Concept
This project is **strictly a Call Bot & Telephony Voice Intelligence Engine**, NOT an automated customer-facing text chatbot.

### Key Workflows:
1. **Speech-to-Text & Audio Diarization**: When a sales agent speaks with a customer during an active call (via Softphone, Inbound/Outbound, or live microphone), the system transcribes both audio streams in real-time.
2. **Real-Time Lead Extraction**: The AI analyzes the conversation turn-by-turn to extract essential CRM lead fields strictly from caller statements:
   - Full Name
   - Phone Number (ANI / Caller ID auto-detection or dialogue)
   - Company Name
   - Email Address
   - Product / Service Interest
   - Industry
   - Location / City
   - Customer Requirement / Scope of Work
3. **Agent Copilot Suggested Questions**:
   - **Agent-Facing Only**: Copilot Suggested Questions are strictly displayed as real-time coaching suggestions for the human agent. They are NOT automated chat replies and are NOT part of the conversation transcript until spoken.
   - **Manual Execution**: The agent reviews the suggested questions and chooses to ask them verbally to the customer.
   - **Dynamic Updating**: Suggested questions dynamically change on every turn based on the information already collected and the lead fields that remain missing. Once a piece of information is provided (e.g., Name, Company, or Requirement), the system immediately ceases suggesting questions for that field and advances to the next logical qualification stage (e.g., Timeline, Stakeholders, Email verification, or Demo scheduling).
4. **CRM Lead Conversion**: The agent reviews the extracted fields with transparency confidence scores and commits the lead directly into Zoho CRM with a single click.
