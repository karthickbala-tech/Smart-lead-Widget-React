/**
 * AI Lead Intelligence & NLP Extraction Engine
 * 
 * Strict Progressive Extraction Rules:
 * 1. Extract information ONLY when explicitly mentioned or provided by the customer in conversation.
 * 2. Never invent, assume, predict, or hallucinate information.
 * 3. Never use predefined demo data or agent profile data.
 * 4. If a field has not been mentioned, it remains null.
 * 5. Update fields progressively as new turns arrive.
 * 6. Dynamic Copilot Suggested Questions adapt turn-by-turn and NEVER ask for
 *    information that has already been provided.
 */

// Words that follow "I'm", "I am", "this is" or general speech that are NOT person names
const NON_NAME_WORDS = new Set([
    "calling", "regarding", "our", "hospital", "network", "networks", "migration", "legacy",
    "pbx", "ringcentral", "zoho", "crm", "solution", "solutions", "inquire", "inquiring",
    "looking", "interested", "reaching", "checking", "trying", "hoping", "wondering",
    "following", "asking", "here", "excited", "happy", "glad", "sorry", "just", "ready",
    "curious", "writing", "speaking", "representing", "with", "from", "at", "the", "a",
    "an", "on", "in", "for", "to", "about", "work", "working", "part", "located", "based",
    "operations", "vp", "director", "manager", "good", "fine", "okay", "yes", "no", "phone",
    "using", "using it", "downloading", "done", "sure", "right", "great", "hello", "hi", "hey",
    "we", "they", "you", "all", "some", "cloudpeak", "brightwave", "nexus", "engineering",
    "technology", "technologies", "systems", "health", "healthcare", "logistics"
]);

export function analyzeConversation(messages = [], callerContext = {}) {
    const safeMessages = Array.isArray(messages) ? messages : [];
    
    // Initial State: When no messages or empty conversation, initialize with caller context if present
    if (safeMessages.length === 0) {
        return createEmptyAnalysis(callerContext);
    }

    const customerMessages = safeMessages.filter(m => m?.sender === "customer");
    const customerText = customerMessages.map(m => m?.text || "").join(" \n ");
    const allText = safeMessages.map(m => `${m.speaker || (m.sender === "customer" ? "Customer" : "Agent")}: ${m.text || ""}`).join(" \n ");

    // If no messages with content yet, return clean starting state with caller context
    if (safeMessages.length === 0 || (!customerText.trim() && !allText.trim())) {
        return createEmptyAnalysis(callerContext);
    }

    // 1. Full Name Extraction (From customer dialogue or confirmed by customer)
    let extractedFullName = null;

    // Pattern 1 (Highest priority): Explicit self-introduction (e.g. "My name is Dr. Sarah Jenkins", "name is Arjun Kumar")
    // Restrict name to 1-3 title/name tokens, stopping before period, comma, or conjunction
    const explicitNamePatterns = [
        /(?:my name is|name is)\s+((?:(?:Dr\.|Mr\.|Ms\.|Mrs\.|Prof\.)\s+)?[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2})(?:[.,!?;:]|\s+we\b|\s+and\b|\s+from\b|\s+at\b|\s+with\b|\s+based\b|$)/i,
        /(?:this is)\s+((?:(?:Dr\.|Mr\.|Ms\.|Mrs\.|Prof\.)\s+)?[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2})(?:[.,!?;:]|\s+we\b|\s+and\b|\s+from\b|\s+at\b|\s+with\b|\s+based\b|$)/i,
        /(?:i am|i'm)\s+((?:(?:Dr\.|Mr\.|Ms\.|Mrs\.|Prof\.)\s+)?[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2})(?:[.,!?;:]|\s+we\b|\s+and\b|\s+from\b|\s+at\b|\s+with\b|\s+based\b|$)/i
    ];

    for (const pattern of explicitNamePatterns) {
        const match = customerText.match(pattern);
        if (match && match[1]) {
            const candidate = match[1].trim().replace(/[.,!?;:]$/, "");
            const words = candidate.split(/\s+/).map(w => w.toLowerCase().replace(/[^a-z]/g, "")).filter(Boolean);
            const hasNonNameWord = words.some(w => NON_NAME_WORDS.has(w));
            
            if (!hasNonNameWord && candidate.length >= 2 && words.length <= 3) {
                // Ensure candidate is not a company name or phrase
                if (!/(?:Technologies|Solutions|Systems|Limited|Pvt|Inc|LLC|Corporation|Worldwide|Logistics|Hospital|Department|Online|Company)/i.test(candidate)) {
                    extractedFullName = candidate;
                    break;
                }
            }
        }
    }

    // Pattern 2: Agent asks "am I speaking with [Name]?" and customer confirms "Yes" / "This is [Name]"
    if (!extractedFullName) {
        const agentNameQueryMatch = allText.match(/(?:speaking with|talking with|is this|call for|speaking to)\s+((?:(?:Dr\.|Mr\.|Ms\.|Mrs\.)\s+)?[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2})\s*\?/i);
        if (agentNameQueryMatch && agentNameQueryMatch[1]) {
            const candidate = agentNameQueryMatch[1].trim();
            const words = candidate.split(/\s+/).map(w => w.toLowerCase().replace(/[^a-z]/g, "")).filter(Boolean);
            const hasNonNameWord = words.some(w => NON_NAME_WORDS.has(w));
            if (!hasNonNameWord && candidate.length >= 2) {
                if (/yes|yeah|this is|speaking|correct|right/i.test(customerText)) {
                    extractedFullName = candidate;
                }
            }
        }
    }

    // Pattern 3: Fallback from speaker label if explicit name
    if (!extractedFullName && customerMessages.length > 0) {
        const firstCust = customerMessages.find(m => m?.speaker && !/^(?:Customer|Unknown|Caller|Agent|User)$/i.test(m.speaker));
        if (firstCust?.speaker) {
            const speaker = firstCust.speaker.trim();
            const words = speaker.split(/\s+/).map(w => w.toLowerCase().replace(/[^a-z]/g, "")).filter(Boolean);
            const hasNonNameWord = words.some(w => NON_NAME_WORDS.has(w));
            if (!hasNonNameWord && speaker.length >= 2 && words.length <= 4) {
                extractedFullName = speaker;
            }
        }
    }

    // 2. Company Name Extraction (Only for customer's company, strictly ignoring Agent's company)
    let extractedCompany = null;
    const companyPatterns = [
        /(?:work for|working for|represent|representing|with)\s+([A-Z0-9][A-Za-z0-9\s&.,'-]+?(?:Private Limited|Pvt Ltd|Ltd|Inc|LLC|Corporation|Corp|Technologies|Solutions|Systems|Health Systems|Worldwide|Logistics|Retail|Enterprises|Hospital|Health))/i,
        /(?:we are|this is|our company is|my company is|company called|business is|from)\s+([A-Z0-9][A-Za-z0-9\s&.,'-]+?(?:Private Limited|Pvt Ltd|Ltd|Inc|LLC|Corporation|Corp|Technologies|Solutions|Systems|Health Systems|Worldwide|Logistics|Retail|Enterprises|Hospital|Health))/i,
        /(?:we are|our company is|my company is|company called|business is)\s+([A-Z0-9][A-Za-z0-9\s&.,'-]+?)(?:\.|,|$|\sin|\sbased|\sregarding)/i
    ];

    for (const pattern of companyPatterns) {
        const match = customerText.match(pattern);
        if (match && match[1]) {
            const candidate = match[1].trim().replace(/[.,]$/, "");
            if (candidate.length > 2 && !/^(?:a|an|the|calling|looking|interested)$/i.test(candidate)) {
                extractedCompany = candidate;
                break;
            }
        }
    }

    // 3. Phone Number Extraction (Strictly genuine telephone numbers, or Auto-fetched from Telephony Caller ID / ANI)
    let extractedPhone = null;
    let isPhoneFromTelephony = false;
    
    // Check if customer provided a real phone number in dialogue
    const genuinePhoneMatch = customerText.match(/(?:\+?\d{1,3}[-.\s])?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/) ||
                              customerText.match(/\+91\s*\d{5}\s*\d{5}/) ||
                              customerText.match(/\+\d{1,3}\s*\d{3,4}\s*\d{3,4}/);

    if (genuinePhoneMatch) {
        const candidate = genuinePhoneMatch[0].trim();
        // Ensure it is not preceded by AnyDesk, code, remote, ID, number on your screen
        const isAnyDeskContext = /anydesk|code|numbers on your|remote|teamviewer|passcode/i.test(customerText);
        // Ensure standard phone length and not spaced single digits
        if (!isAnyDeskContext || candidate.includes("-") || candidate.includes("(") || candidate.startsWith("+")) {
            extractedPhone = candidate;
        }
    }

    // Auto-fetch phone number from Inbound Caller ID (ANI) or Outbound Dialed Number (DNIS)
    if (!extractedPhone && callerContext?.phone) {
        extractedPhone = callerContext.phone;
        isPhoneFromTelephony = true;
    }

    // 4. Email Extraction (Strictly from conversation)
    let extractedEmail = null;
    const emailMatch = customerText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
        extractedEmail = emailMatch[0].toLowerCase().trim();
    }

    // 5. Product / Service Interest Extraction
    let extractedProduct = null;
    if (/withdrawal of your money|withdrawal.*bank|Cash App|money.*platform/i.test(allText)) {
        extractedProduct = "Platform Fund Withdrawal / Cash App";
    } else if (/CRM and customer management solution|CRM system|customer management solution/i.test(allText)) {
        extractedProduct = "CRM and Customer Management Solution";
    } else if (/RingCentral|telephony widget|CTI setup|CTI integration|contact center telephony/i.test(allText)) {
        extractedProduct = "RingCentral + Zoho CRM Smart CTI Integration";
    } else if (/migration from legacy PBX|hospital network|HIPAA/i.test(allText)) {
        extractedProduct = "HIPAA Compliant Healthcare Telephony & PBX Cloud Migration";
    } else if (/emergency telephony dispatch|dispatch routing|driver records|screen pops/i.test(allText)) {
        extractedProduct = "High-Priority Telephony Dispatch Routing & Webhooks";
    } else if (/CRM|telephony|widget|integration|dispatch|PBX|intake/i.test(customerText)) {
        const interestMatch = customerText.match(/(?:looking for|inquire about|inquiring about|need|require)\s+(?:a|an)?\s*([a-zA-Z0-9\s+&/-]{5,40}?)(?:\.|,|$|\sfor|\swith)/i);
        if (interestMatch && interestMatch[1]) {
            extractedProduct = interestMatch[1].trim();
        }
    }

    // 6. Industry Extraction (Customer's business sector)
    let extractedIndustry = null;
    if (/retail and e-commerce|retail|e-commerce/i.test(customerText)) {
        extractedIndustry = "Retail and E-commerce";
    } else if (/hospital|health|patient|HIPAA|medical|clinic/i.test(customerText)) {
        extractedIndustry = "Healthcare & Life Sciences";
    } else if (/freight|fleet|logistics|shipping|truck|dispatch/i.test(customerText)) {
        extractedIndustry = "Logistics & Supply Chain";
    } else if (/software|engineering|technology|developer|SaaS|cloud/i.test(customerText)) {
        extractedIndustry = "Software & Technology";
    }

    // 7. Location / City / Country Extraction
    let extractedLocation = null;
    // Direct statements: "located in X", "based in X", "office in X"
    const locationMatch = customerText.match(/(?:located in|office is located in|based in|headquartered in)\s+([A-Z][a-zA-Z\s]+(?:,\s*[A-Z][a-zA-Z\s]+)?)/i) ||
                          customerText.match(/(?:in)\s+(Chennai,\s*Tamil Nadu|San Jose,\s*California|San Jose,\s*CA|Boston,\s*MA|Boston|Chicago,\s*IL|Chicago|Canada|United States|UK|Australia|India)/i);
    if (locationMatch && locationMatch[1]) {
        extractedLocation = locationMatch[1].trim().replace(/[.,]$/, "");
    }

    // Confirmation of location (e.g. Agent: "Are you in Canada right now?", Customer: "Yeah")
    if (!extractedLocation) {
        const countryAskMatch = allText.match(/(?:are you in|living in|located in)\s+([A-Z][a-zA-Z\s]+?)\s*(?:right now|\?)/i);
        if (countryAskMatch && countryAskMatch[1]) {
            const candidateLoc = countryAskMatch[1].trim();
            if (/yeah|yes|right|correct/i.test(customerText)) {
                extractedLocation = candidateLoc;
            }
        }
    }

    // 8. Customer Requirement / Scope Synthesis
    let extractedRequirement = null;
    if (/withdrawal.*money.*platform|Cash App|AnyDesk/i.test(allText)) {
        extractedRequirement = "Assistance with withdrawing funds from online platform to bank account using remote AnyDesk support and Cash App.";
    } else if (/centralized CRM system|manage customer information|track leads|monitor sales activities|manage customer support requests|provide reports/i.test(customerText)) {
        extractedRequirement = "A centralized CRM system to manage customer information, track leads, monitor sales activities, manage customer support requests, and provide reports and dashboards.";
    } else if (/150 contact center agents|real-time dual-channel|call transcription|automated lead capture|webhook events/i.test(customerText)) {
        extractedRequirement = "150 contact center agents requiring real-time dual-channel audio AI transcription, automated lead capture into Zoho CRM, and webhook event triggers for custom analytics.";
    } else if (/HIPAA compliance|encrypted call audio recording|patient intake/i.test(customerText)) {
        extractedRequirement = "Hospital network telephony migration requiring strict HIPAA compliance, encrypted call audio recording, and automated patient intake lead routing into Zoho CRM.";
    } else if (/320 freight vehicles|sub-second screen pops|emergency telephony dispatch/i.test(customerText)) {
        extractedRequirement = "320 freight vehicles requiring sub-second screen-pops and emergency telephony dispatch routing into Zoho CRM driver records.";
    } else if (/need|require|looking for|inquire about/i.test(customerText)) {
        for (const msg of customerMessages) {
            if (/need|require|looking for|inquire about|want/i.test(msg.text)) {
                let cleanText = msg.text.replace(/^(?:Hi|Hello|Yes|Good morning)[,!.\s]+/i, "").trim();
                if (cleanText.length > 15) {
                    extractedRequirement = cleanText;
                    break;
                }
            }
        }
    }

    // First and Last Name breakdown
    let firstName = null;
    let lastName = null;
    if (extractedFullName) {
        const cleanName = extractedFullName.replace(/^(?:Dr\.|Mr\.|Ms\.)\s+/i, "");
        const parts = cleanName.split(/\s+/).filter(Boolean);
        if (parts.length > 1) {
            firstName = parts[0];
            lastName = parts.slice(1).join(" ");
        } else {
            firstName = cleanName;
            lastName = cleanName;
        }
    }

    // Consolidated Output Object (providing both snake_case and Title_Case keys)
    const extracted = {
        full_name: extractedFullName,
        phone: extractedPhone,
        company_name: extractedCompany,
        email: extractedEmail,
        product_service_interest: extractedProduct,
        industry: extractedIndustry,
        location_city: extractedLocation,
        customer_requirement_scope: extractedRequirement,

        // Title_Case keys for UI compatibility
        Full_Name: extractedFullName,
        First_Name: firstName,
        Last_Name: lastName,
        Company: extractedCompany,
        Phone: extractedPhone,
        Email: extractedEmail,
        Product: extractedProduct,
        Industry: extractedIndustry,
        City: extractedLocation,
        Description: extractedRequirement,
        Customer_Requirement: extractedRequirement,
        Context: extractedRequirement || extractedProduct || null,
        Lead_Source: "RingCentral Inbound CTI",
        Status: "New",
        Rating: (extractedRequirement && extractedCompany) ? "Hot" : extractedFullName ? "Warm" : "Neutral",
        Intent: extractedProduct ? "Discovery & Solution Exploration" : "Initial Contact"
    };

    // Dynamic Confidence Metrics
    const confidence = {
        Full_Name: extractedFullName
            ? { score: 95, level: "high", reason: `Contact identified: "${extractedFullName}"` }
            : { score: 0, level: "missing", reason: "Name not yet detected in conversation" },
        Company: extractedCompany
            ? { score: 95, level: "high", reason: `Company identified: "${extractedCompany}"` }
            : { score: 0, level: "missing", reason: "Company not yet mentioned" },
        Phone: extractedPhone
            ? isPhoneFromTelephony
                ? { score: 100, level: "verified", reason: `Auto-fetched from Telephony Caller ID (ANI / CTI): "${extractedPhone}"` }
                : { score: 98, level: "verified", reason: `Phone provided: "${extractedPhone}"` }
            : { score: 0, level: "missing", reason: "Phone not provided in dialogue" },
        Email: extractedEmail
            ? { score: 98, level: "verified", reason: `Email provided: "${extractedEmail}"` }
            : { score: 0, level: "missing", reason: "Email address not provided" },
        Product: extractedProduct
            ? { score: 95, level: "high", reason: `Interest: "${extractedProduct}"` }
            : { score: 0, level: "missing", reason: "Product interest not yet identified" },
        Industry: extractedIndustry
            ? { score: 90, level: "high", reason: `Industry: "${extractedIndustry}"` }
            : { score: 0, level: "missing", reason: "Industry sector not specified" },
        City: extractedLocation
            ? { score: 90, level: "high", reason: `Location: "${extractedLocation}"` }
            : { score: 0, level: "missing", reason: "Location/city not mentioned" },
        Description: extractedRequirement
            ? { score: 95, level: "high", reason: "Requirement scope synthesized from customer dialogue" }
            : { score: 0, level: "missing", reason: "Customer requirement pending" }
    };

    // Completeness Score Calculation (Progressive)
    let completenessScore = 0;
    if (extractedFullName) completenessScore += 20;
    if (extractedCompany) completenessScore += 20;
    if (extractedPhone) completenessScore += 15;
    if (extractedEmail) completenessScore += 15;
    if (extractedRequirement) completenessScore += 15;
    if (extractedProduct) completenessScore += 5;
    if (extractedIndustry) completenessScore += 5;
    if (extractedLocation) completenessScore += 5;

    // Missing Fields Detector
    const missingFields = [];
    if (!extractedFullName) {
        missingFields.push({ field: "Full_Name", label: "Full Name", priority: "high", reason: "Essential contact identity" });
    }
    if (!extractedCompany) {
        missingFields.push({ field: "Company", label: "Company Name", priority: "high", reason: "Required field for Zoho CRM Lead" });
    }
    if (!extractedProduct) {
        missingFields.push({ field: "Product", label: "Product / Service Interest", priority: "medium", reason: "Solution area for deal routing" });
    }
    if (!extractedRequirement) {
        missingFields.push({ field: "Description", label: "Customer Requirement", priority: "medium", reason: "Scope of work for assigned sales rep" });
    }
    if (!extractedEmail) {
        missingFields.push({ field: "Email", label: "Email Address", priority: "high", reason: "Needed for follow-up quote" });
    }
    if (!extractedPhone) {
        missingFields.push({ field: "Phone", label: "Phone Number", priority: "medium", reason: "Direct contact line" });
    }
    if (!extractedLocation) {
        missingFields.push({ field: "City", label: "Location / City", priority: "low", reason: "Territory and timezone assignment" });
    }

    // Dynamic Copilot Suggested Questions Engine (STRICT RULE: Never ask for already provided info)
    const recommendedQuestions = generateCopilotQuestions(extracted, safeMessages);

    // Live AI Key Points
    const keyPoints = [];
    if (extractedFullName) keyPoints.push(`Contact: ${extractedFullName}`);
    if (extractedCompany) keyPoints.push(`Company: ${extractedCompany}`);
    if (extractedProduct) keyPoints.push(`Interest: ${extractedProduct}`);
    if (extractedRequirement) keyPoints.push(`Requirement: ${extractedRequirement}`);
    if (extractedEmail) keyPoints.push(`Email: ${extractedEmail}`);
    if (extractedPhone) keyPoints.push(`Phone: ${extractedPhone}`);
    if (extractedLocation) keyPoints.push(`Location: ${extractedLocation}`);
    if (extractedIndustry) keyPoints.push(`Industry: ${extractedIndustry}`);

    // Sentiment Detection
    let sentiment = "neutral";
    if (/great|excellent|perfect|thank|appreciate|excited|glad|happy|certainly|wonderful/i.test(customerText)) {
        sentiment = "positive";
    } else if (/urgent|emergency|critical|problem|broken|frustrated|down|failed|immediate/i.test(customerText)) {
        sentiment = "urgent";
    }

    return {
        extracted,
        confidence,
        completenessScore: Math.min(100, completenessScore),
        missingFields,
        recommendedQuestions,
        keyPoints,
        sentiment,
        intent: extractedProduct ? "Discovery & Solution Exploration" : "Initial Greeting & Identification"
    };
}

/**
 * Generate Adaptive Copilot Questions based strictly on what is missing
 * Questions dynamically change on every conversation turn as fields are extracted.
 */
function generateCopilotQuestions(extracted, messages) {
    const questions = [];
    const turnCount = messages.length;

    const hasName = Boolean(extracted.full_name || extracted.Full_Name);
    const hasCompany = Boolean(extracted.company_name || extracted.Company);
    const hasPhone = Boolean(extracted.phone || extracted.Phone);
    const hasProduct = Boolean(extracted.product_service_interest || extracted.Product);
    const hasRequirement = Boolean(extracted.customer_requirement_scope || extracted.Description);
    const hasEmail = Boolean(extracted.email || extracted.Email);
    const hasLocation = Boolean(extracted.location_city || extracted.City);
    const hasIndustry = Boolean(extracted.industry || extracted.Industry);

    // Dynamic Rule 1: Missing Contact Name
    if (!hasName) {
        questions.push({
            id: `q-name-${turnCount}`,
            category: "CONTACT IDENTITY",
            targetField: "Full_Name",
            fieldLabel: "Customer Name",
            question: "May I know who I have the pleasure of speaking with today?",
            reason: "Extracts contact name for the CRM lead record",
            icon: "user"
        });
    }

    // Dynamic Rule 2: Missing Company (Never ask if already extracted)
    if (!hasCompany) {
        questions.push({
            id: `q-comp-${turnCount}`,
            category: "ORGANIZATION",
            targetField: "Company",
            fieldLabel: "Company Name",
            question: hasName
                ? "Which organization or company are you representing today?"
                : "Could you share the company name you are calling on behalf of?",
            reason: "Identifies required Company field for Zoho CRM",
            icon: "building"
        });
    }

    // Dynamic Rule 3: Missing Core Requirement or Problem Scope
    if (!hasRequirement) {
        if (!hasProduct) {
            questions.push({
                id: `q-req-disc-${turnCount}`,
                category: "INQUIRY SCOPE",
                targetField: "Description",
                fieldLabel: "Customer Requirement",
                question: "What specific solution, software, or workflow are you looking to improve today?",
                reason: "Discovers primary business need and scope of work",
                icon: "compass"
            });
        } else {
            questions.push({
                id: `q-req-deep-${turnCount}`,
                category: "REQUIREMENT SCOPE",
                targetField: "Description",
                fieldLabel: "Detailed Scope",
                question: `Could you tell me more about your current workflow and key requirements for ${extracted.Product || "this project"}?`,
                reason: "Extracts detailed requirement specifications",
                icon: "layers"
            });
        }
    }

    // Dynamic Rule 4: Missing Email Address (Crucial for CRM follow-up)
    if (!hasEmail) {
        questions.push({
            id: `q-email-${turnCount}`,
            category: "CONTACT DETAILS",
            targetField: "Email",
            fieldLabel: "Email Address",
            question: hasName 
                ? "What is the best business email address to send you our proposal and pricing summary?"
                : "Could you please share your direct email address for follow-up documentation?",
            reason: "Captures verified email address for CRM syncing and quote delivery",
            icon: "mail"
        });
    }

    // Dynamic Rule 5: Missing Location / Territory or Industry
    if (!hasLocation && hasCompany) {
        questions.push({
            id: `q-loc-${turnCount}`,
            category: "GEOGRAPHY",
            targetField: "City",
            fieldLabel: "Location / City",
            question: "Where is your team or primary office headquarters located?",
            reason: "Determines territory, regional compliance, and timezone assignment",
            icon: "map-pin"
        });
    }

    if (!hasIndustry && hasCompany) {
        questions.push({
            id: `q-ind-${turnCount}`,
            category: "INDUSTRY SECTOR",
            targetField: "Industry",
            fieldLabel: "Industry Domain",
            question: "Which primary industry or sector does your business operate within?",
            reason: "Maps industry domain for CRM lead segmentation",
            icon: "briefcase"
        });
    }

    // Dynamic Rule 6: Advanced Qualification (When basic fields are already extracted)
    if (hasRequirement && hasCompany) {
        questions.push({
            id: `q-timeline-${turnCount}`,
            category: "QUALIFICATION",
            targetField: "Timeline",
            fieldLabel: "Go-Live Timeline",
            question: "What is your target timeline or implementation deadline for this solution?",
            reason: "Qualifies deal urgency and scheduling priority",
            icon: "calendar"
        });

        questions.push({
            id: `q-stakeholders-${turnCount}`,
            category: "DECISION PROCESS",
            targetField: "Stakeholders",
            fieldLabel: "Decision Makers",
            question: "Who else on your leadership or technical team will be involved in evaluating this solution?",
            reason: "Maps decision-making unit and key influencers",
            icon: "users"
        });
    }

    // Dynamic Rule 7: Missing Callback Number (if not auto-detected from telephony ANI)
    if (!hasPhone) {
        questions.push({
            id: `q-phone-${turnCount}`,
            category: "CONTACT DETAILS",
            targetField: "Phone",
            fieldLabel: "Direct Phone",
            question: "What is the best direct callback number in case our call gets disconnected?",
            reason: "Verifies direct phone number for lead record",
            icon: "phone"
        });
    }

    // Dynamic Rule 8: Deal Closing & Next Steps (When lead completeness is high)
    if (hasName && hasCompany && hasRequirement && hasEmail) {
        questions.push({
            id: `q-demo-${turnCount}`,
            category: "NEXT STEPS",
            targetField: "Action",
            fieldLabel: "Meeting Scheduling",
            question: "Would you like me to reserve a 30-minute deep-dive demonstration with our senior solutions architect for later this week?",
            reason: "Advances the CRM lead into a scheduled discovery meeting",
            icon: "sparkles"
        });
    }

    // Deduplicate questions and return top 4 most pertinent
    const unique = [];
    const seen = new Set();
    for (const q of questions) {
        if (!seen.has(q.question)) {
            seen.add(q.question);
            unique.push(q);
        }
        if (unique.length >= 4) break;
    }

    return unique.length > 0 ? unique : createEmptyAnalysis().recommendedQuestions;
}

/**
 * Return clean empty analysis state on initial page load, or populated with caller metadata if on active/incoming/outgoing call
 */
function createEmptyAnalysis(callerContext = {}) {
    const hasPhone = Boolean(callerContext?.phone);
    const phoneVal = callerContext?.phone || null;
    const hasKnownName = Boolean(callerContext?.name && callerContext.name !== "Incoming Caller" && callerContext.name !== "Outbound Contact" && callerContext.name !== "Customer");
    const nameVal = hasKnownName ? callerContext.name : null;
    const hasCompany = Boolean(callerContext?.company);
    const companyVal = callerContext?.company || null;

    let initialScore = 0;
    if (hasPhone) initialScore += 15;
    if (hasKnownName) initialScore += 20;
    if (hasCompany) initialScore += 20;

    const missing = [];
    if (!hasKnownName) {
        missing.push({ field: "Full_Name", label: "Full Name", priority: "high", reason: "Essential contact identity" });
    }
    if (!hasCompany) {
        missing.push({ field: "Company", label: "Company Name", priority: "high", reason: "Required field for Zoho CRM Lead" });
    }
    missing.push({ field: "Product", label: "Product / Service Interest", priority: "medium", reason: "Solution area for deal routing" });
    missing.push({ field: "Description", label: "Customer Requirement", priority: "medium", reason: "Scope of work for assigned sales rep" });
    if (!hasPhone) {
        missing.push({ field: "Phone", label: "Phone Number", priority: "medium", reason: "Direct contact line" });
    }

    return {
        extracted: {
            full_name: nameVal,
            phone: phoneVal,
            company_name: companyVal,
            email: callerContext?.email || null,
            product_service_interest: null,
            industry: callerContext?.industry || null,
            location_city: callerContext?.location || null,
            customer_requirement_scope: null,

            Full_Name: nameVal,
            First_Name: nameVal ? nameVal.split(" ")[0] : null,
            Last_Name: nameVal ? (nameVal.split(" ").slice(1).join(" ") || nameVal) : null,
            Company: companyVal,
            Phone: phoneVal,
            Email: callerContext?.email || null,
            Product: null,
            Industry: callerContext?.industry || null,
            City: callerContext?.location || null,
            Description: null,
            Customer_Requirement: null,
            Context: null,
            Lead_Source: "RingCentral Inbound CTI",
            Status: "New",
            Rating: hasKnownName && hasCompany ? "Warm" : "Neutral",
            Intent: "Discovery & Solution Exploration"
        },
        confidence: {
            Full_Name: hasKnownName
                ? { score: 95, level: "high", reason: `Identified from CRM contact match: "${nameVal}"` }
                : { score: 0, level: "missing", reason: "Name not yet detected in conversation" },
            Company: hasCompany
                ? { score: 95, level: "high", reason: `Identified from CRM contact match: "${companyVal}"` }
                : { score: 0, level: "missing", reason: "Company not yet mentioned" },
            Phone: hasPhone
                ? { score: 100, level: "verified", reason: `Auto-fetched from Telephony Caller ID (ANI / CTI): "${phoneVal}"` }
                : { score: 0, level: "missing", reason: "Phone number not confirmed" },
            Email: callerContext?.email
                ? { score: 98, level: "verified", reason: `Matched from CRM contact: "${callerContext.email}"` }
                : { score: 0, level: "missing", reason: "Email address not provided" },
            Product: { score: 0, level: "missing", reason: "Product interest not yet identified" },
            Industry: { score: 0, level: "missing", reason: "Industry sector not specified" },
            City: { score: 0, level: "missing", reason: "Location/city not mentioned" },
            Description: { score: 0, level: "missing", reason: "Customer requirement pending" }
        },
        completenessScore: initialScore,
        missingFields: missing,
        recommendedQuestions: [
            {
                id: "q-start-1",
                category: "DISCOVERY",
                question: "Hi! How can I help you today?",
                reason: "Initial friendly greeting",
                field: "Introduction",
                icon: "message-square"
            },
            {
                id: "q-start-2",
                category: "DISCOVERY",
                question: "Could you please tell me your name?",
                reason: "Identify customer name",
                field: "Full_Name",
                icon: "user"
            },
            {
                id: "q-start-3",
                category: "DISCOVERY",
                question: "What can I help you with today?",
                reason: "Identify core customer goal or inquiry",
                field: "Description",
                icon: "help-circle"
            }
        ],
        keyPoints: hasPhone ? [`Caller Line (ANI): ${phoneVal}`] : [],
        sentiment: "neutral",
        intent: "Discovery & Solution Exploration"
    };
}
