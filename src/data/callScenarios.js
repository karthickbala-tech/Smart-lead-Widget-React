export const CALL_SCENARIOS = [
    {
        id: "scenario-1",
        title: "Arjun Kumar • BrightWave Technologies (CRM Solution)",
        caller: {
            name: "Arjun Kumar",
            phone: "+91 98765 43210",
            company: "BrightWave Technologies",
            email: "arjun.kumar@brightwave.com",
            title: "Operations Director",
            location: "Chennai, Tamil Nadu",
            industry: "Retail and E-commerce",
            crmLeadMatch: "Potential New Lead",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
        },
        transcript: [
            {
                id: "t-101",
                sender: "customer",
                speaker: "Arjun Kumar",
                text: "Hi, my name is Arjun Kumar.",
                time: "00:04",
                sentiment: "neutral"
            },
            {
                id: "t-102",
                sender: "agent",
                speaker: "Agent (You)",
                text: "Hello Arjun! Great to connect with you. Which company are you representing today?",
                time: "00:10",
                sentiment: "neutral"
            },
            {
                id: "t-103",
                sender: "customer",
                speaker: "Arjun Kumar",
                text: "I work for BrightWave Technologies in the retail and e-commerce sector.",
                time: "00:18",
                sentiment: "positive"
            },
            {
                id: "t-104",
                sender: "agent",
                speaker: "Agent (You)",
                text: "Thanks Arjun. Could you tell me a little about what solution you're looking for?",
                time: "00:25",
                sentiment: "neutral"
            },
            {
                id: "t-105",
                sender: "customer",
                speaker: "Arjun Kumar",
                text: "We're looking for a CRM and customer management solution.",
                time: "00:34",
                sentiment: "positive"
            },
            {
                id: "t-106",
                sender: "agent",
                speaker: "Agent (You)",
                text: "Could you tell me more about your specific feature requirements and goals?",
                time: "00:42",
                sentiment: "neutral"
            },
            {
                id: "t-107",
                sender: "customer",
                speaker: "Arjun Kumar",
                text: "We need a centralized CRM system to manage customer information, track leads, monitor sales activities, manage customer support requests, and provide reports and dashboards.",
                time: "00:58",
                sentiment: "positive"
            },
            {
                id: "t-108",
                sender: "agent",
                speaker: "Agent (You)",
                text: "That fits our platform perfectly. What is the best email and location to send the proposal?",
                time: "01:08",
                sentiment: "neutral"
            },
            {
                id: "t-109",
                sender: "customer",
                speaker: "Arjun Kumar",
                text: "My email is arjun.kumar@brightwave.com and we are located in Chennai, Tamil Nadu. My direct phone is +91 98765 43210.",
                time: "01:22",
                sentiment: "positive"
            }
        ]
    },
    {
        id: "scenario-2",
        title: "Karthick Bala • ABC Private Limited (CTI Integration)",
        caller: {
            name: "Karthick Bala",
            phone: "+1 (555) 382-9014",
            company: "ABC Private Limited",
            email: "karthick.bala@abcprivate.com",
            title: "VP of Engineering",
            location: "San Jose, CA",
            industry: "Software & Technology",
            crmLeadMatch: "Potential New Lead",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80"
        },
        transcript: [
            {
                id: "t-1",
                sender: "customer",
                speaker: "Karthick Bala",
                text: "Hello, good morning! I'm calling to inquire about integrating your RingCentral telephony widget with our Zoho CRM setup.",
                time: "00:04",
                sentiment: "positive"
            },
            {
                id: "t-2",
                sender: "agent",
                speaker: "Agent (You)",
                text: "Good morning! Thank you for reaching out to SmartLead support. I'd be glad to assist you. May I know your name and company?",
                time: "00:11",
                sentiment: "neutral"
            },
            {
                id: "t-3",
                sender: "customer",
                speaker: "Karthick Bala",
                text: "Yes, my name is Karthick Bala. I'm the VP of Engineering at ABC Private Limited.",
                time: "00:18",
                sentiment: "positive"
            },
            {
                id: "t-4",
                sender: "agent",
                speaker: "Agent (You)",
                text: "Great to connect with you, Karthick. How many agent seats are you planning to deploy, and what specific telephony capabilities do you need?",
                time: "00:27",
                sentiment: "neutral"
            },
            {
                id: "t-5",
                sender: "customer",
                speaker: "Karthick Bala",
                text: "We have around 150 contact center agents. We need real-time dual-channel call transcription, automated lead capture into Zoho CRM, and webhook events for custom analytics.",
                time: "00:39",
                sentiment: "positive"
            },
            {
                id: "t-6",
                sender: "agent",
                speaker: "Agent (You)",
                text: "That sounds like a great fit for our Enterprise CTI tier. Could you share your business email and location so I can prepare a customized architecture blueprint for you?",
                time: "00:50",
                sentiment: "neutral"
            },
            {
                id: "t-7",
                sender: "customer",
                speaker: "Karthick Bala",
                text: "Certainly! My email is karthick.bala@abcprivate.com and our primary engineering office is located in San Jose, California. Our expected annual budget for this is around $24,000.",
                time: "01:04",
                sentiment: "positive"
            },
            {
                id: "t-8",
                sender: "agent",
                speaker: "Agent (You)",
                text: "Got all those details, Karthick. I have captured your requirements, and I am creating the Zoho CRM Lead profile right now with our technical sales team assigned.",
                time: "01:18",
                sentiment: "positive"
            }
        ]
    },
    {
        id: "scenario-3",
        title: "Dr. Sarah Jenkins • CloudPeak Health (HIPAA Telephony)",
        caller: {
            name: "Dr. Sarah Jenkins",
            phone: "+1 (415) 890-2341",
            company: "CloudPeak Health Systems",
            email: "s.jenkins@cloudpeakhealth.io",
            title: "Chief Information Officer",
            location: "Boston, MA",
            industry: "Healthcare & Life Sciences",
            crmLeadMatch: "VIP Account Inbound",
            avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=160&auto=format&fit=crop&q=80"
        },
        transcript: [
            {
                id: "t-201",
                sender: "customer",
                speaker: "Dr. Sarah Jenkins",
                text: "Hi there, I'm calling regarding our hospital network's migration from legacy PBX to RingCentral and Zoho CRM.",
                time: "00:03",
                sentiment: "neutral"
            },
            {
                id: "t-202",
                sender: "agent",
                speaker: "Agent (You)",
                text: "Hello Dr. Jenkins, welcome to our solutions line. Could you share more about your compliance and volume requirements?",
                time: "00:10",
                sentiment: "neutral"
            },
            {
                id: "t-203",
                sender: "customer",
                speaker: "Dr. Sarah Jenkins",
                text: "My name is Dr. Sarah Jenkins. We are CloudPeak Health Systems based in Boston. We require strict HIPAA compliance, encrypted call audio recording, and automated patient intake lead routing into Zoho.",
                time: "00:24",
                sentiment: "positive"
            },
            {
                id: "t-204",
                sender: "agent",
                speaker: "Agent (You)",
                text: "Understood. Our SmartLead integration features end-to-end BAA compliance and automated PII masking. Can I confirm your direct work email?",
                time: "00:35",
                sentiment: "positive"
            },
            {
                id: "t-205",
                sender: "customer",
                speaker: "Dr. Sarah Jenkins",
                text: "Yes, you can reach me at s.jenkins@cloudpeakhealth.io and phone +1 (415) 890-2341. We want to start proof-of-concept next month.",
                time: "00:44",
                sentiment: "positive"
            }
        ]
    },
    {
        id: "scenario-4",
        title: "Marcus Vance • Nexus Logistics (Webhook Dispatch)",
        caller: {
            name: "Marcus Vance",
            phone: "+1 (312) 678-4421",
            company: "Nexus Logistics Worldwide",
            email: "mvance@nexuslogistics.com",
            title: "Director of Fleet Operations",
            location: "Chicago, IL",
            industry: "Logistics & Supply Chain",
            crmLeadMatch: "Existing Opportunity",
            avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&auto=format&fit=crop&q=80"
        },
        transcript: [
            {
                id: "t-301",
                sender: "customer",
                speaker: "Marcus Vance",
                text: "Good afternoon. This is Marcus Vance with Nexus Logistics in Chicago. We need emergency telephony dispatch routing integrated into our CRM driver records.",
                time: "00:05",
                sentiment: "urgent"
            },
            {
                id: "t-302",
                sender: "agent",
                speaker: "Agent (You)",
                text: "Hello Marcus, I understand the urgency. What is your dispatch fleet size and target response time threshold?",
                time: "00:14",
                sentiment: "neutral"
            },
            {
                id: "t-303",
                sender: "customer",
                speaker: "Marcus Vance",
                text: "We manage 320 freight vehicles across North America. We need sub-second screen pops when drivers call in. My email is mvance@nexuslogistics.com and direct line is +1 (312) 678-4421.",
                time: "00:26",
                sentiment: "positive"
            }
        ]
    }
];
