/**
 * Smart Parser for Telephony Text Transcripts
 * Parses conversations formatted with timestamps, speaker names, or standard dialogue formats.
 */

export function parseRawTranscript(rawText, defaultCallerName = "Customer") {
    if (!rawText || typeof rawText !== "string") return [];

    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    const turns = [];
    let currentSpeaker = null;
    let currentTime = "00:00";
    let currentSentiment = "neutral";
    let currentTextLines = [];

    const isTimestamp = (str) => /^(\d{1,2}:\d{2}(?::\d{2})?|\d{1,2}\s*(?:min|sec|s|m))$/i.test(str.trim());
    const isSentiment = (str) => /^(Positive|Negative|Neutral|Urgent)$/i.test(str.trim());

    // Check if line is formatted as "Speaker: Message" or "[00:02] Speaker: Message"
    const isSingleLineDialogue = (line) => {
        const match = line.match(/^(?:\[?(\d{1,2}:\d{2})\]?\s*)?([A-Za-z0-9\s().'-]+?):\s*(.+)$/);
        return match;
    };

    const isSpeakerHeading = (line) => {
        // Handle "conversation Dr. Sarah Jenkins" or "Conversation: Dr. Sarah Jenkins"
        let clean = line.replace(/^(?:conversation|caller|agent|speaker|contact)\s*[:-]?\s*/i, "").trim();
        if (!clean) clean = line;

        // Allow speaker names with titles (Dr., Mr., Ms., Mrs., Prof.) and parenthetical labels like Agent (You)
        if (clean.length <= 40 && !clean.includes(",") && !clean.includes(";") && !clean.includes("?")) {
            // Must match typical speaker patterns: "Dr. Sarah Jenkins", "Agent (You)", "Arjun Kumar", "Customer"
            if (/^(?:(?:Dr\.|Mr\.|Ms\.|Mrs\.|Prof\.)\s+)?[A-Z][a-zA-Z0-9\s()'-]{1,35}$/.test(clean)) {
                return clean;
            }
        }
        return null;
    };

    const flushTurn = () => {
        if (currentSpeaker && currentTextLines.length > 0) {
            const combinedText = currentTextLines.join(" ").trim();
            if (combinedText) {
                const isCustomer = !/agent|you|steven|rep|support|sales/i.test(currentSpeaker) || 
                                   /customer|caller|meriam|sarah|dr\.|mr\.|ms\./i.test(currentSpeaker);
                
                turns.push({
                    id: "turn-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6),
                    sender: isCustomer ? "customer" : "agent",
                    speaker: currentSpeaker,
                    text: combinedText,
                    time: currentTime,
                    sentiment: currentSentiment
                });
            }
        }
        currentTextLines = [];
        currentSentiment = "neutral";
    };

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];

        // Format 1: "Speaker: Text" or "[00:04] Speaker: Text"
        const inlineMatch = isSingleLineDialogue(line);
        if (inlineMatch) {
            flushTurn();
            const time = inlineMatch[1] || `00:${String(turns.length * 5).padStart(2, "0")}`;
            const speaker = inlineMatch[2].trim();
            const text = inlineMatch[3].trim();
            const isCustomer = !/agent|you|steven|rep|support|sales/i.test(speaker);

            turns.push({
                id: "turn-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6),
                sender: isCustomer ? "customer" : "agent",
                speaker: speaker,
                text: text,
                time: time,
                sentiment: "neutral"
            });
            i++;
            continue;
        }

        // Format 2: Multiline format
        // Speaker / Conversation header
        // [Sentiment] (optional)
        // Timestamp
        // Text lines...
        if (isTimestamp(line)) {
            currentTime = line;
            i++;
            continue;
        }

        if (isSentiment(line)) {
            currentSentiment = line.toLowerCase();
            i++;
            continue;
        }

        // Potential Speaker name or "conversation Speaker Name"
        const detectedSpeaker = isSpeakerHeading(line);
        if (detectedSpeaker) {
            flushTurn();
            currentSpeaker = detectedSpeaker;
            i++;
            continue;
        }

        // Otherwise it's dialogue text
        if (!currentSpeaker) {
            currentSpeaker = turns.length % 2 === 0 ? defaultCallerName : "Agent";
        }
        currentTextLines.push(line);
        i++;
    }

    flushTurn();
    return turns;
}
