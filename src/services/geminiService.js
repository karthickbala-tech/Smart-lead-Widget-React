/**
 * Client service to communicate with server-side Gemini API endpoints
 */

export async function transcribeAudio({ audioBase64, mimeType = "audio/webm", callerName = "Customer", agentName = "Agent (You)" }) {
    try {
        const response = await fetch("/api/ai/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audioBase64, mimeType, callerName, agentName })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Failed to transcribe audio");
        }
        return await response.json();
    } catch (error) {
        console.error("[Gemini Service] Transcribe error:", error);
        throw error;
    }
}

export async function extractLeadFromTranscript({ conversation, transcript = [] }) {
    try {
        const response = await fetch("/api/ai/extract-lead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversation, transcript })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Failed to extract lead");
        }
        return await response.json();
    } catch (error) {
        console.error("[Gemini Service] Extract lead error:", error);
        throw error;
    }
}

export async function analyzeLeadWithGemini(transcript = [], caller = {}, conversation = "") {
    try {
        const response = await fetch("/api/ai/analyze-lead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript, caller, conversation })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Failed to analyze lead");
        }
        return await response.json();
    } catch (error) {
        console.error("[Gemini Service] Analyze lead error:", error);
        throw error;
    }
}

export async function sendCopilotChatMessage({ message, history = [], context = {} }) {
    try {
        const response = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, history, context })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Failed to chat with AI Copilot");
        }
        return await response.json();
    } catch (error) {
        console.error("[Gemini Service] Copilot chat error:", error);
        throw error;
    }
}

export async function searchCompanyGrounding({ companyName, contactName, industry, location }) {
    try {
        const response = await fetch("/api/ai/search-grounding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ companyName, contactName, industry, location })
        });
        if (!response.ok) {
            const target = companyName || contactName || "Target Organization";
            return {
                overview: `### 🏢 Company Profile: ${target}\n\nOrganization actively operating within ${industry || "Enterprise Solutions"}.`,
                sources: [
                    { title: `${target} Search`, url: `https://www.google.com/search?q=${encodeURIComponent(target)}` }
                ],
                company: target,
            };
        }
        return await response.json();
    } catch {
        const target = companyName || contactName || "Target Organization";
        return {
            overview: `### 🏢 Company Profile: ${target}\n\nOrganization actively operating within ${industry || "Enterprise Solutions"}.`,
            sources: [
                { title: `${target} Search`, url: `https://www.google.com/search?q=${encodeURIComponent(target)}` }
            ],
            company: target,
        };
    }
}

export async function speakText(text, voice = "Kore") {
    try {
        const response = await fetch("/api/ai/speak", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, voice })
        });
        if (!response.ok) {
            return { audioBase64: null, mimeType: "audio/wav", text };
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.warn("[Gemini Service] Speak text notice (using client speech fallback):", error?.message);
        return { audioBase64: null, mimeType: "audio/wav", text };
    }
}

/**
 * Connect to Gemini Live Voice Copilot WebSocket
 */
export function connectLiveVoiceCopilot({ onAudioChunk, onInterrupted, onError, onOpen, onClose }) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/live`;
    let socket = null;

    try {
        socket = new WebSocket(wsUrl);
    } catch (err) {
        console.warn("[Live Voice WS] Could not instantiate WebSocket:", err);
        if (onError) onError(err);
        return {
            sendAudio: () => {},
            sendText: () => {},
            close: () => {}
        };
    }

    socket.onopen = () => {
        console.log("[Live Voice WS] Connected to Voice Copilot socket");
        if (onOpen) onOpen();
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.audio && onAudioChunk) {
                onAudioChunk(data.audio);
            }
            if (data.interrupted && onInterrupted) {
                onInterrupted();
            }
            if (data.error && onError) {
                onError(data.error);
            }
        } catch (e) {
            console.warn("[Live Voice WS] Message parse notice:", e);
        }
    };

    socket.onerror = (err) => {
        console.warn("[Live Voice WS] Socket error notice:", err);
        if (onError) onError(err);
    };

    socket.onclose = (event) => {
        console.log("[Live Voice WS] Socket closed", {
            code: event?.code,
            reason: event?.reason || "Normal closure",
            wasClean: event?.wasClean
        });
        if (onClose) onClose(event);
    };

    return {
        sendAudio: (base64Pcm) => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ audio: base64Pcm }));
            }
        },
        sendText: (text) => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ text }));
            }
        },
        close: () => {
            try {
                if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
                    socket.close(1000, "Client session terminated");
                }
            } catch (err) {
                console.warn("[Live Voice WS] Close notice:", err);
            }
        }
    };
}
