import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import LiveTelephonyPanel from "./components/LiveTelephonyPanel";
import LeadIntelligencePanel from "./components/LeadIntelligencePanel";
import CopilotPanel from "./components/CopilotPanel";
import InboundCallDrawer from "./components/InboundCallDrawer";
import CallPopup from "./components/CallPopup";
import DialpadModal from "./components/DialpadModal";
import TransferModal from "./components/TransferModal";
import CallHistoryView from "./components/CallHistoryView";
import NotesView from "./components/NotesView";
import TelephonySettingsView from "./components/TelephonySettingsView";
import CRMSyncView from "./components/CRMSyncView";

import { CALL_SCENARIOS } from "./data/callScenarios";
import { mockCalls } from "./data/mockCalls";
import { analyzeConversation } from "./services/aiIntelligence";
import { playRingtone, stopRingtone, createSpeechRecognitionListener } from "./services/telephonyManager";
import { analyzeLeadWithGemini, transcribeAudio } from "./services/geminiService";
import zohoCRM from "./services/zohoCRM";
import { hasValidLeadData, getLeadValidationErrors } from "./utils/helpers";
import UnsavedLeadGuardModal from "./components/UnsavedLeadGuardModal";

function App() {
    // Theme state
    const [darkMode, setDarkMode] = useState(false);

    // Sidebar ON/OFF expand/collapse state (auto-collapse when embedded in iframe or viewport < 1280px)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            return window.innerWidth < 1280 || window.self !== window.top;
        }
        return true;
    });

    // Sync dark mode class with root html element
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    // Keyboard shortcut for sidebar toggle (⌘B / Ctrl+B)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
                e.preventDefault();
                setIsSidebarCollapsed(prev => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Active View Tab ('workspace' | 'dialpad' | 'history' | 'notes' | 'telephony' | 'crm')
    const [activeTab, setActiveTab] = useState("workspace");

    // Focused Workspace Panel for compact iframe / Zoho Web Tab ('all' | 'telephony' | 'lead' | 'copilot')
    const [workspaceViewMode, setWorkspaceViewMode] = useState("all");

    // Auto-detect container size or default to collapsed sidebar if width is constrained
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1100) {
                setIsSidebarCollapsed(true);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Telephony State (starts ready/idle with zero pre-population)
    const [callStatus, setCallStatus] = useState("idle"); // 'idle' | 'ringing' | 'active' | 'ended'
    const [callType, setCallType] = useState("incoming"); // 'incoming' | 'outgoing'
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isOnHold, setIsOnHold] = useState(false);
    const [isRecording, setIsRecording] = useState(true);

    // Active Scenario & Caller Data (Zero pre-population on load)
    const [activeScenario, setActiveScenario] = useState(CALL_SCENARIOS[0]);
    const [caller, setCaller] = useState({ name: "", phone: "", company: "", email: "", location: "", industry: "" });
    const [transcript, setTranscript] = useState([]);
    const [scenarioStepIndex, setScenarioStepIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);

    // Gemini Server-Side AI Intelligence State
    const [geminiAnalysis, setGeminiAnalysis] = useState(null);
    const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

    // Zoho CRM State
    const [zohoUser, setZohoUser] = useState({ full_name: "Karthick Bala", email: "karthickbala112@gmail.com" });
    const [isSavingLead, setIsSavingLead] = useState(false);
    const [savedLeadResult, setSavedLeadResult] = useState(null);
    const [saveError, setSaveError] = useState(null);
    const [manualFieldOverrides, setManualFieldOverrides] = useState({});

    // Modals
    const [isCallPopupOpen, setIsCallPopupOpen] = useState(false);
    const [isDialpadOpen, setIsDialpadOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isGuardModalOpen, setIsGuardModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    // Live Mic / Web Speech API
    const [isLiveMicActive, setIsLiveMicActive] = useState(false);
    const speechRecognitionRef = useRef(null);

    // Call History
    const [callHistoryList, setCallHistoryList] = useState(mockCalls);

    // 1. Initialize Zoho CRM SDK and fetch current agent user
    useEffect(() => {
        let isMounted = true;
        const initCRM = async () => {
            await zohoCRM.initialize();
            try {
                const userResp = await zohoCRM.getCurrentUser();
                if (isMounted && userResp?.users?.[0]) {
                    setZohoUser(userResp.users[0]);
                }
            } catch (err) {
                console.warn("[App] User initialization notice:", err);
            }
        };
        initCRM();
        return () => {
            isMounted = false;
        };
    }, []);

    // 2. Call Duration Timer
    useEffect(() => {
        let interval = null;
        if (callStatus === "active" && !isOnHold) {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [callStatus, isOnHold]);

    // 3. Scenario Step Automation (Auto-Play)
    useEffect(() => {
        let timer = null;
        if (callStatus === "active" && isAutoPlaying && !isOnHold) {
            const scenario = activeScenario;
            if (scenario?.transcript && Array.isArray(scenario.transcript) && scenarioStepIndex < scenario.transcript.length) {
                timer = setTimeout(() => {
                    const nextMsg = scenario.transcript[scenarioStepIndex];
                    if (nextMsg) {
                        setTranscript(prev => [...prev, nextMsg]);
                    }
                    setScenarioStepIndex(prev => {
                        const nextIndex = prev + 1;
                        if (nextIndex >= (scenario?.transcript?.length || 0)) {
                            setIsAutoPlaying(false);
                        }
                        return nextIndex;
                    });
                }, 3000);
            }
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [callStatus, isAutoPlaying, scenarioStepIndex, activeScenario, isOnHold]);

    // 4. Ringtone sound effect on incoming ring
    useEffect(() => {
        if (callStatus === "ringing") {
            const stop = playRingtone({ loop: true, volume: 0.65 });
            return () => {
                if (stop) stop();
                stopRingtone();
            };
        } else {
            stopRingtone();
        }
    }, [callStatus]);

    // 5. Asynchronous Gemini Lead Intelligence Extraction Trigger (Debounced & Cached)
    const lastAnalyzedTextRef = useRef("");
    const callerRef = useRef(caller);

    useEffect(() => {
        callerRef.current = caller;
    }, [caller]);

    useEffect(() => {
        let isMounted = true;
        const currentText = transcript && transcript.length > 0
            ? transcript.map(t => `${t.sender}:${t.text}`).join("\n")
            : "";

        if (!currentText) {
            lastAnalyzedTextRef.current = "";
            return;
        }

        if (currentText === lastAnalyzedTextRef.current) {
            return;
        }

        const timer = setTimeout(async () => {
            if (!isMounted) return;
            setIsAiAnalyzing(true);
            lastAnalyzedTextRef.current = currentText;

            try {
                const data = await analyzeLeadWithGemini(transcript, callerRef.current);
                if (isMounted && data && (data.extracted || data.confidence)) {
                    setGeminiAnalysis(data);

                    const extName = data.extracted?.Full_Name || data.extracted?.full_name;
                    const extCompany = data.extracted?.Company || data.extracted?.company_name;
                    const extPhone = data.extracted?.Phone || data.extracted?.phone;
                    const extCity = data.extracted?.City || data.extracted?.location_city;

                    setCaller(prev => ({
                        ...prev,
                        name: extName || prev.name || "Customer",
                        company: extCompany || prev.company || "",
                        phone: extPhone || prev.phone || "",
                        location: extCity || prev.location || ""
                    }));
                }
            } catch {
                // Smooth fallback handled gracefully
            } finally {
                if (isMounted) setIsAiAnalyzing(false);
            }
        }, 800);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [transcript]);

    // 6. Real-Time AI Conversation Analysis Merging (Gemini LLM + Fast NLP Baseline + Manual Overrides + Telephony CTI)
    const aiAnalysis = useMemo(() => {
        const baseAnalysis = analyzeConversation(transcript, caller);

        let mergedExtracted = { ...baseAnalysis.extracted };
        let mergedConfidence = { ...baseAnalysis.confidence };
        let finalSentiment = baseAnalysis.sentiment;
        let finalIntent = baseAnalysis.intent;
        let finalKeyPoints = baseAnalysis.keyPoints;
        let finalRecommendedQuestions = baseAnalysis.recommendedQuestions;

        // Overlay Gemini LLM intelligence if available
        if (geminiAnalysis?.extracted) {
            const gExt = geminiAnalysis.extracted;
            const gConf = geminiAnalysis.confidence || {};

            Object.keys(gExt).forEach(k => {
                if (gExt[k] !== null && gExt[k] !== undefined && gExt[k] !== "") {
                    mergedExtracted[k] = gExt[k];
                }
            });

            if (gConf && Object.keys(gConf).length > 0) {
                mergedConfidence = { ...mergedConfidence, ...gConf };
            }

            if (geminiAnalysis.sentiment) finalSentiment = geminiAnalysis.sentiment;
            if (geminiAnalysis.intent) finalIntent = geminiAnalysis.intent;
            if (geminiAnalysis.keyPoints && geminiAnalysis.keyPoints.length > 0) finalKeyPoints = geminiAnalysis.keyPoints;
            if (geminiAnalysis.recommendedQuestions && geminiAnalysis.recommendedQuestions.length > 0) finalRecommendedQuestions = geminiAnalysis.recommendedQuestions;
        }

        // Automatic Telephony Carrier / Caller ID Auto-Fetch (Inbound ANI / Outbound Dialed Number)
        if (caller?.phone && (!mergedExtracted.Phone || mergedExtracted.Phone === "null" || String(mergedExtracted.Phone).trim() === "")) {
            mergedExtracted.Phone = caller.phone;
            mergedExtracted.phone = caller.phone;
            if (!mergedConfidence.Phone || mergedConfidence.Phone.level === "missing" || mergedConfidence.Phone.score === 0) {
                mergedConfidence.Phone = {
                    score: 100,
                    level: "verified",
                    reason: `Auto-fetched from Telephony Caller ID / CTI ANI: "${caller.phone}"`
                };
            }
        }

        // Apply manual user overrides on top
        mergedExtracted = {
            ...mergedExtracted,
            ...manualFieldOverrides
        };

        // Calculate dynamic completeness score
        const requiredKeys = ["Full_Name", "Company", "Phone", "Email", "Product", "Industry", "City", "Description"];
        let filledCount = 0;
        const missing = [];

        requiredKeys.forEach(k => {
            const val = mergedExtracted[k] || mergedExtracted[k.toLowerCase()];
            if (val && String(val).trim() !== "" && String(val).toLowerCase() !== "null") {
                filledCount++;
            } else {
                missing.push(k.replace("_", " "));
            }
        });

        const completeness = Math.round((filledCount / requiredKeys.length) * 100);

        return {
            extracted: mergedExtracted,
            confidence: mergedConfidence,
            completenessScore: completeness,
            missingFields: missing,
            sentiment: finalSentiment,
            intent: finalIntent,
            keyPoints: finalKeyPoints,
            recommendedQuestions: finalRecommendedQuestions,
            rawGemini: geminiAnalysis
        };
    }, [transcript, geminiAnalysis, manualFieldOverrides, caller]);

    // Detect whether an unsaved lead is currently in progress
    const hasUnsavedLead = useMemo(() => {
        // If already saved to Zoho CRM, the lead is not in an unsaved dirty state
        if (savedLeadResult) return false;

        const ext = aiAnalysis?.extracted || {};
        const filledFields = [
            ext.Full_Name,
            ext.Company,
            ext.Phone,
            ext.Email,
            ext.Product,
            ext.Industry,
            ext.City,
            ext.Description
        ].filter(val => val && String(val).trim() !== "" && String(val).toLowerCase() !== "null");

        // Returns true if there is either extracted lead data or active transcript turns
        return filledFields.length > 0 || (Array.isArray(transcript) && transcript.length > 0);
    }, [savedLeadResult, aiAnalysis, transcript]);

    // Core execution functions (reset previous state & proceed with new session)
    const executeSelectScenario = (scenario) => {
        zohoCRM.resetSavedLeadState();
        setActiveScenario(scenario);
        setCaller({ name: "", phone: "", company: "", email: "", location: "", industry: "" });
        setTranscript([]);
        setScenarioStepIndex(0);
        setIsAutoPlaying(false);
        setDuration(0);
        setSavedLeadResult(null);
        setSaveError(null);
        setManualFieldOverrides({});
    };

    const executeSimulateInbound = (scenarioToUse = activeScenario) => {
        zohoCRM.resetSavedLeadState();
        setActiveTab("workspace");
        setActiveScenario(scenarioToUse);
        setCaller({
            name: "Incoming Caller",
            phone: scenarioToUse.caller?.phone || "+1 (415) 890-2341",
            company: "",
            email: "",
            location: "",
            industry: "",
            crmLeadMatch: "Inbound Call"
        });
        setCallType("incoming");
        setCallStatus("ringing");
        setTranscript([]);
        setScenarioStepIndex(0);
        setIsAutoPlaying(false);
        setDuration(0);
        setSavedLeadResult(null);
        setSaveError(null);
        setManualFieldOverrides({});
        setIsCallPopupOpen(true);
    };

    const executeSimulateOutbound = (targetNumber = null, targetContact = null) => {
        zohoCRM.resetSavedLeadState();
        setActiveTab("workspace");
        let selectedScenario = activeScenario;
        if (targetContact) {
            const matched = CALL_SCENARIOS.find(s => s.caller.name.toLowerCase() === targetContact.name.toLowerCase());
            if (matched) selectedScenario = matched;
        }

        setActiveScenario(selectedScenario);
        const outboundCaller = {
            name: targetContact?.name || selectedScenario.caller?.name || "Outbound Contact",
            phone: targetNumber || targetContact?.phone || selectedScenario.caller?.phone || "+1 (555) 000-0000",
            company: targetContact?.company || selectedScenario.caller?.company || "",
            location: selectedScenario.caller?.location || "",
            email: selectedScenario.caller?.email || ""
        };
        setCaller(outboundCaller);
        setCallType("outgoing");
        setCallStatus("active");
        setTranscript([]);
        setScenarioStepIndex(0);
        setDuration(0);
        setSavedLeadResult(null);
        setSaveError(null);
        setManualFieldOverrides({});
        setIsCallPopupOpen(false);
        setIsAutoPlaying(true);
        if (selectedScenario?.transcript && selectedScenario.transcript.length > 0) {
            setTranscript([selectedScenario.transcript[0]]);
            setScenarioStepIndex(1);
        }
    };

    const executeUploadAudio = async (file) => {
        if (!file) return;
        zohoCRM.resetSavedLeadState();
        setActiveTab("workspace");
        // Clean slate for new uploaded audio session
        setTranscript([]);
        setGeminiAnalysis(null);
        setManualFieldOverrides({});
        setSavedLeadResult(null);
        setSaveError(null);
        setScenarioStepIndex(0);
        setIsAutoPlaying(false);
        setDuration(0);

        setCallStatus("active");
        setCallType("incoming");
        setCaller({
            name: "Uploaded Audio Recording",
            phone: "+1 (555) 789-2041",
            company: "",
            email: "",
            location: "",
            industry: "",
            crmLeadMatch: "Audio Recording"
        });
        setIsCallPopupOpen(false);

        setIsAiAnalyzing(true);
        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64Audio = (reader.result || "").toString().split(",")[1];
                if (!base64Audio) {
                    setIsAiAnalyzing(false);
                    return;
                }
                try {
                    const result = await transcribeAudio({
                        audioBase64: base64Audio,
                        mimeType: file.type || "audio/webm",
                        callerName: "Customer",
                        agentName: "Agent (You)"
                    });

                    if (result?.transcript && Array.isArray(result.transcript)) {
                        setTranscript(result.transcript);
                    }
                } catch (err) {
                    console.error("[App] Audio transcription error:", err);
                } finally {
                    setIsAiAnalyzing(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error("[App] File read error:", err);
            setIsAiAnalyzing(false);
        }
    };

    // Guard-protected Action Request Handlers
    const requestSelectScenario = (scenario) => {
        if (hasUnsavedLead) {
            setPendingAction({
                type: "select_scenario",
                payload: { scenario }
            });
            setIsGuardModalOpen(true);
        } else {
            executeSelectScenario(scenario);
        }
    };

    const requestSimulateInbound = (scenarioToUse = activeScenario) => {
        if (hasUnsavedLead) {
            setPendingAction({
                type: "inbound",
                payload: { scenarioToUse }
            });
            setIsGuardModalOpen(true);
        } else {
            executeSimulateInbound(scenarioToUse);
        }
    };

    const requestSimulateOutbound = (targetNumber = null, targetContact = null) => {
        if (hasUnsavedLead) {
            setPendingAction({
                type: "outbound",
                payload: { targetNumber, targetContact }
            });
            setIsGuardModalOpen(true);
        } else {
            executeSimulateOutbound(targetNumber, targetContact);
        }
    };

    const requestUploadAudio = (file) => {
        if (hasUnsavedLead) {
            setPendingAction({
                type: "upload_audio",
                payload: { file }
            });
            setIsGuardModalOpen(true);
        } else {
            executeUploadAudio(file);
        }
    };

    const requestOpenDialpad = () => {
        if (hasUnsavedLead) {
            setPendingAction({
                type: "open_dialpad"
            });
            setIsGuardModalOpen(true);
        } else {
            setIsDialpadOpen(true);
        }
    };

    const runPendingAction = (action) => {
        if (!action) return;
        switch (action.type) {
            case "upload_audio":
                executeUploadAudio(action.payload?.file);
                break;
            case "outbound":
                executeSimulateOutbound(action.payload?.targetNumber, action.payload?.targetContact);
                break;
            case "inbound":
                executeSimulateInbound(action.payload?.scenarioToUse);
                break;
            case "select_scenario":
                executeSelectScenario(action.payload?.scenario);
                break;
            case "open_dialpad":
                setIsDialpadOpen(true);
                break;
            default:
                break;
        }
    };

    const handleGuardSaveAndContinue = async () => {
        const leadDataToSave = aiAnalysis?.extracted || {};
        if (!hasValidLeadData(leadDataToSave)) {
            setSaveError("No lead data available. Please create or extract lead data before saving to Zoho CRM.");
            return;
        }
        const validationErrors = getLeadValidationErrors(leadDataToSave);
        if (Object.keys(validationErrors).length > 0) {
            const errList = Object.values(validationErrors).join(". ");
            setSaveError(`Please correct form validation errors: ${errList}`);
            return;
        }
        setIsSavingLead(true);
        setSaveError(null);
        try {
            const response = await zohoCRM.createLead(leadDataToSave);
            setSavedLeadResult(response);
            const currentPending = pendingAction;
            setIsGuardModalOpen(false);
            setPendingAction(null);
            runPendingAction(currentPending);
        } catch (error) {
            console.error("[App] Guard Save Lead Error:", error);
            const friendlyMsg = error?.message || "Failed to create lead in Zoho CRM.";
            setSaveError(friendlyMsg);
            throw error;
        } finally {
            setIsSavingLead(false);
        }
    };

    const handleGuardDiscardAndContinue = () => {
        handleResetLead();
        const currentPending = pendingAction;
        setIsGuardModalOpen(false);
        setPendingAction(null);
        runPendingAction(currentPending);
    };

    const handleCloseGuardModal = () => {
        setIsGuardModalOpen(false);
        setPendingAction(null);
    };

    const handleAnswerCall = () => {
        setIsCallPopupOpen(false);
        setCallStatus("active");
        setDuration(0);
        setIsAutoPlaying(true);
        if (activeScenario?.transcript && activeScenario.transcript.length > 0) {
            setTranscript([activeScenario.transcript[0]]);
            setScenarioStepIndex(1);
        }
    };

    const handleDeclineCall = () => {
        setIsCallPopupOpen(false);
        setCallStatus("idle");
        setCaller({ name: "", phone: "", company: "", email: "", location: "", industry: "" });
    };

    const handleEndCall = async () => {
        setCallStatus("ended");
        setIsAutoPlaying(false);

        // Optionally sync call log to Zoho CRM Calls module
        try {
            await zohoCRM.createCallLog({
                name: caller.name || "Customer",
                type: callType,
                duration: duration,
                aiSummary: aiAnalysis.extracted.Description || "Completed softphone call."
            });
        } catch (e) {
            console.warn("[App] Call log sync notice:", e);
        }

        // Add completed call to local history list
        const newHistoryRecord = {
            id: "call-" + Date.now(),
            name: caller?.name || "Customer",
            phone: caller?.phone || "+1 (555) 000-0000",
            company: caller?.company || "Organization",
            type: callType === "incoming" ? "incoming" : "outgoing",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            date: "Today",
            duration: duration,
            status: "completed",
            recording: true,
            aiSummary: aiAnalysis?.extracted?.Description || "Call concluded with AI lead analysis generated.",
            leadCreated: Boolean(savedLeadResult),
            leadId: savedLeadResult?.id || savedLeadResult?.details?.id || null,
            sentiment: aiAnalysis?.sentiment || "neutral",
            completenessScore: aiAnalysis?.completenessScore || 0
        };

        setCallHistoryList(prev => [newHistoryRecord, ...(Array.isArray(prev) ? prev : [])]);
        setTimeout(() => {
            setCallStatus("idle");
            setCaller({ name: "", phone: "", company: "", email: "", location: "", industry: "" });
        }, 1200);
    };

    const handleToggleMute = () => setIsMuted(prev => !prev);
    const handleToggleHold = () => setIsOnHold(prev => !prev);
    const handleToggleRecording = () => setIsRecording(prev => !prev);
    const handleToggleAutoPlay = () => setIsAutoPlaying(prev => !prev);

    const handleStepNextMessage = () => {
        if (activeScenario?.transcript && Array.isArray(activeScenario.transcript) && scenarioStepIndex < activeScenario.transcript.length) {
            const nextMsg = activeScenario.transcript[scenarioStepIndex];
            if (nextMsg) {
                setTranscript(prev => [...prev, nextMsg]);
            }
            setScenarioStepIndex(prev => prev + 1);
        }
    };

    const handleAddAgentMessage = (text) => {
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

        const newMsg = {
            id: "agent-msg-" + Date.now(),
            sender: "agent",
            speaker: "Agent (You)",
            text: text,
            time: timeStr,
            sentiment: "neutral"
        };
        setTranscript(prev => [...prev, newMsg]);
    };

    // Live Web Speech Recognition Toggle
    const handleToggleLiveMic = () => {
        if (isLiveMicActive) {
            if (speechRecognitionRef.current) {
                try {
                    speechRecognitionRef.current.stop();
                } catch (err) {
                    console.warn("[App] Speech recognition stop:", err);
                }
            }
            setIsLiveMicActive(false);
        } else {
            const listener = createSpeechRecognitionListener(
                (result) => {
                    if (result.final) {
                        handleAddAgentMessage(result.final);
                    }
                },
                (err) => {
                    console.warn("[App] Speech recognition notice:", err);
                }
            );

            if (listener) {
                try {
                    listener.start();
                    speechRecognitionRef.current = listener;
                    setIsLiveMicActive(true);
                } catch (e) {
                    console.warn("[App] Could not start microphone listener:", e);
                }
            } else {
                console.warn("[App] Web Speech Recognition not available in this browser.");
            }
        }
    };

    // Agent Approval Gate & Zoho CRM Lead Creation
    const handleSaveLeadToCRM = async (leadData) => {
        if (isSavingLead) {
            console.warn("[App] Save lead request already in progress. Ignoring duplicate click.");
            return;
        }
        if (savedLeadResult) {
            console.warn("[App] This lead has already been saved to Zoho CRM.");
            setSaveError("This lead has already been saved to Zoho CRM.");
            return;
        }
        if (!hasValidLeadData(leadData)) {
            setSaveError("No lead data available. Please create or extract lead data before saving to Zoho CRM.");
            setIsSavingLead(false);
            return;
        }
        const validationErrors = getLeadValidationErrors(leadData);
        if (Object.keys(validationErrors).length > 0) {
            const errList = Object.values(validationErrors).join(". ");
            setSaveError(`Please correct form validation errors before saving: ${errList}`);
            setIsSavingLead(false);
            return;
        }
        setIsSavingLead(true);
        setSaveError(null);
        try {
            const response = await zohoCRM.createLead(leadData);
            setSavedLeadResult(response);
        } catch (error) {
            console.error("[App] Save Lead Error:", error);
            const friendlyMsg = error?.message || "Failed to create lead in Zoho CRM. Please check CRM permissions and field requirements.";
            setSaveError(friendlyMsg);
            setSavedLeadResult(null);
        } finally {
            setIsSavingLead(false);
        }
    };

    const handleSaveNoteToCRM = async (noteText) => {
        try {
            const targetLeadId = savedLeadResult?.id || savedLeadResult?.details?.id || null;
            await zohoCRM.addNote("Leads", targetLeadId, `Call Note: ${caller?.name || "Customer"}`, noteText);
        } catch (e) {
            console.warn("[App] Save note notice:", e);
        }
    };

    const handleResetLead = () => {
        zohoCRM.resetSavedLeadState();
        setTranscript([]);
        setGeminiAnalysis(null);
        setSavedLeadResult(null);
        setSaveError(null);
        setManualFieldOverrides({});
        setCaller({ name: "", phone: "", company: "", email: "", location: "", industry: "" });
        setScenarioStepIndex(0);
        setIsAutoPlaying(false);
        setDuration(0);
        if (callStatus === "active" || callStatus === "ringing") {
            setCallStatus("idle");
        }
        lastAnalyzedTextRef.current = "";
    };

    const handleUpdateLeadField = (field, value) => {
        if (savedLeadResult) {
            setSavedLeadResult(null);
            zohoCRM.resetSavedLeadState();
        }
        setManualFieldOverrides(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleConfirmTransfer = (target, type) => {
        console.log(`[App] Call transferred to ${target.name} (${type === "warm" ? "Warm Consult" : "Direct Transfer"}).`);
        handleEndCall();
    };

    return (
        <div className={`h-screen w-screen flex flex-row p-2 gap-2 ${darkMode ? "dark bg-[#0a0718] text-slate-100" : "bg-[#faf8fd] text-slate-900"} font-sans transition-colors duration-300 relative overflow-hidden`}>
            {/* Ambient Multi-Layered Animated Lighting Orbs (Apple-inspired Depth) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {/* Purple Core Glow */}
                <div className="absolute -top-28 left-12 w-[34rem] h-[34rem] bg-purple-400/20 dark:bg-purple-600/15 rounded-full blur-[110px] animate-ambient-1" />
                {/* Pink / Magenta Glow */}
                <div className="absolute top-1/3 -right-20 w-[30rem] h-[30rem] bg-pink-400/18 dark:bg-pink-600/12 rounded-full blur-[120px] animate-ambient-2" />
                {/* Indigo / Blue Ambient Float */}
                <div className="absolute -bottom-24 left-1/4 w-[36rem] h-[36rem] bg-indigo-300/20 dark:bg-indigo-700/15 rounded-full blur-[130px] animate-ambient-3" />
                {/* Cyan / Lavender Accent Glow */}
                <div className="absolute top-1/2 left-2/3 w-[26rem] h-[26rem] bg-cyan-300/15 dark:bg-violet-500/10 rounded-full blur-[100px] animate-ambient-1" />
            </div>

            {/* Left Navigation Sidebar (Extended all the way up to top of screen with popup container borders) */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                callStatus={callStatus}
                leadCompletenessScore={aiAnalysis.completenessScore}
                isCollapsed={isSidebarCollapsed}
                onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
            />

            {/* Right Container (Top Navigation Header + Primary Content View Area) */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative z-10 bg-white/60 dark:bg-[#0e0922]/50 backdrop-blur-xl border border-purple-200/50 dark:border-purple-900/30 rounded-2xl shadow-xs">
                {/* Top Navigation Header */}
                <Header
                    callStatus={callStatus}
                    activeScenario={activeScenario}
                    onSelectScenario={requestSelectScenario}
                    scenarios={CALL_SCENARIOS}
                    onSimulateInbound={() => requestSimulateInbound()}
                    onSimulateOutbound={requestOpenDialpad}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    zohoUser={zohoUser}
                    activeTab={activeTab}
                    workspaceViewMode={workspaceViewMode}
                    setWorkspaceViewMode={setWorkspaceViewMode}
                    leadCompletenessScore={aiAnalysis.completenessScore}
                    transcriptCount={transcript.length}
                />

                {/* Primary Content View Area */}
                <main className="flex-1 p-2 sm:p-2.5 overflow-hidden flex flex-col min-h-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18, ease: "easeInOut" }}
                            className="flex-1 min-h-0 flex flex-col overflow-hidden"
                        >
                            {activeTab === "workspace" && (
                                <div className="flex flex-col h-full min-h-0">
                                    {/* Workspace Panel Containers */}
                                    <div className="flex-1 min-h-0 overflow-hidden">
                                        {workspaceViewMode === "all" ? (
                                            <div className="flex flex-col md:flex-row gap-2.5 h-full min-h-0 overflow-y-auto md:overflow-hidden">
                                                {/* Column 1: Intelligent Live Telephony & Transcript Panel (33%) */}
                                                <div className="w-full md:w-1/3 md:flex-1 h-[360px] md:h-full min-h-0 shrink-0 md:shrink overflow-hidden">
                                                    <LiveTelephonyPanel
                                                        callStatus={callStatus}
                                                        duration={duration}
                                                        caller={caller}
                                                        transcript={transcript}
                                                        isMuted={isMuted}
                                                        onToggleMute={handleToggleMute}
                                                        isOnHold={isOnHold}
                                                        onToggleHold={handleToggleHold}
                                                        isRecording={isRecording}
                                                        onToggleRecording={handleToggleRecording}
                                                        onEndCall={handleEndCall}
                                                        onOpenTransfer={() => setIsTransferOpen(true)}
                                                        onOpenDialpad={requestOpenDialpad}
                                                        onSimulateInbound={() => requestSimulateInbound()}
                                                        onRequestUploadAudio={requestUploadAudio}
                                                        isAutoPlaying={isAutoPlaying}
                                                        onToggleAutoPlay={handleToggleAutoPlay}
                                                        onStepNextMessage={handleStepNextMessage}
                                                        onAddAgentMessage={handleAddAgentMessage}
                                                        isLiveMicActive={isLiveMicActive}
                                                        onToggleLiveMic={handleToggleLiveMic}
                                                        onAddTranscribedTurns={(turns) => {
                                                            setCallStatus("active");
                                                            setTranscript((prev) => [...prev, ...turns]);
                                                        }}
                                                        onDiscardConversation={handleResetLead}
                                                        isAiAnalyzing={isAiAnalyzing}
                                                        hasMoreSteps={Boolean(activeScenario?.transcript && scenarioStepIndex < (activeScenario.transcript.length || 0))}
                                                    />
                                                </div>

                                                {/* Column 2: AI-Powered CRM Lead Intelligence & Agent Approval Gate (34%) */}
                                                <div className="w-full md:w-1/3 md:flex-1 h-[420px] md:h-full min-h-0 shrink-0 md:shrink overflow-hidden">
                                                    <LeadIntelligencePanel
                                                        extractedLead={aiAnalysis?.extracted || {}}
                                                        confidence={aiAnalysis?.confidence || {}}
                                                        completenessScore={aiAnalysis?.completenessScore || 0}
                                                        onSaveToCRM={handleSaveLeadToCRM}
                                                        isSaving={isSavingLead}
                                                        savedLeadResult={savedLeadResult}
                                                        saveError={saveError}
                                                        onClearError={() => setSaveError(null)}
                                                        onResetLead={handleResetLead}
                                                        onUpdateField={handleUpdateLeadField}
                                                        isAiAnalyzing={isAiAnalyzing}
                                                    />
                                                </div>

                                                {/* Column 3: AI Copilot & Conversation Intelligence (33%) */}
                                                <div className="w-full md:w-1/3 md:flex-1 h-[360px] md:h-full min-h-0 shrink-0 md:shrink overflow-hidden">
                                                    <CopilotPanel
                                                        missingFields={aiAnalysis?.missingFields || []}
                                                        recommendedQuestions={aiAnalysis?.recommendedQuestions || []}
                                                        keyPoints={aiAnalysis?.keyPoints || []}
                                                        sentiment={aiAnalysis?.sentiment || "neutral"}
                                                        intent={aiAnalysis?.intent || "Discovery & Solution"}
                                                        extractedLead={aiAnalysis?.extracted || {}}
                                                        transcript={transcript}
                                                        caller={caller}
                                                        onUseQuestion={(q) => handleAddAgentMessage(q)}
                                                    />
                                                </div>
                                            </div>
                                        ) : workspaceViewMode === "telephony" ? (
                                            <div className="h-full min-h-0">
                                                <LiveTelephonyPanel
                                                    callStatus={callStatus}
                                                    duration={duration}
                                                    caller={caller}
                                                    transcript={transcript}
                                                    isMuted={isMuted}
                                                    onToggleMute={handleToggleMute}
                                                    isOnHold={isOnHold}
                                                    onToggleHold={handleToggleHold}
                                                    isRecording={isRecording}
                                                    onToggleRecording={handleToggleRecording}
                                                    onEndCall={handleEndCall}
                                                    onOpenTransfer={() => setIsTransferOpen(true)}
                                                    onOpenDialpad={requestOpenDialpad}
                                                    onSimulateInbound={() => requestSimulateInbound()}
                                                    onRequestUploadAudio={requestUploadAudio}
                                                    isAutoPlaying={isAutoPlaying}
                                                    onToggleAutoPlay={handleToggleAutoPlay}
                                                    onStepNextMessage={handleStepNextMessage}
                                                    onAddAgentMessage={handleAddAgentMessage}
                                                    isLiveMicActive={isLiveMicActive}
                                                    onToggleLiveMic={handleToggleLiveMic}
                                                    onAddTranscribedTurns={(turns) => {
                                                        setCallStatus("active");
                                                        setTranscript((prev) => [...prev, ...turns]);
                                                    }}
                                                    onDiscardConversation={handleResetLead}
                                                    isAiAnalyzing={isAiAnalyzing}
                                                    hasMoreSteps={Boolean(activeScenario?.transcript && scenarioStepIndex < (activeScenario.transcript.length || 0))}
                                                />
                                            </div>
                                        ) : workspaceViewMode === "lead" ? (
                                            <div className="h-full min-h-0">
                                                <LeadIntelligencePanel
                                                    extractedLead={aiAnalysis?.extracted || {}}
                                                    confidence={aiAnalysis?.confidence || {}}
                                                    completenessScore={aiAnalysis?.completenessScore || 0}
                                                    onSaveToCRM={handleSaveLeadToCRM}
                                                    isSaving={isSavingLead}
                                                    savedLeadResult={savedLeadResult}
                                                    saveError={saveError}
                                                    onClearError={() => setSaveError(null)}
                                                    onResetLead={handleResetLead}
                                                    onUpdateField={handleUpdateLeadField}
                                                    isAiAnalyzing={isAiAnalyzing}
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-full min-h-0">
                                                <CopilotPanel
                                                    missingFields={aiAnalysis?.missingFields || []}
                                                    recommendedQuestions={aiAnalysis?.recommendedQuestions || []}
                                                    keyPoints={aiAnalysis?.keyPoints || []}
                                                    sentiment={aiAnalysis?.sentiment || "neutral"}
                                                    intent={aiAnalysis?.intent || "Discovery & Solution"}
                                                    extractedLead={aiAnalysis?.extracted || {}}
                                                    transcript={transcript}
                                                    caller={caller}
                                                    onUseQuestion={(q) => handleAddAgentMessage(q)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "dialpad" && (
                                <div className="w-full h-full">
                                    <DialpadModal
                                        isOpen={true}
                                        onClose={null}
                                        onCallNumber={(num, contact) => requestSimulateOutbound(num, contact)}
                                        isCallActive={callStatus === "active"}
                                        isEmbedded={true}
                                    />
                                </div>
                            )}

                            {activeTab === "history" && (
                                <CallHistoryView
                                    callHistory={callHistoryList || []}
                                    onSelectCallToReview={() => setActiveTab("workspace")}
                                />
                            )}

                            {activeTab === "notes" && (
                                <NotesView
                                    activeCaller={caller}
                                    keyPoints={aiAnalysis?.keyPoints || []}
                                    onSaveNoteToCRM={handleSaveNoteToCRM}
                                />
                            )}

                            {activeTab === "telephony" && (
                                <TelephonySettingsView />
                            )}

                            {activeTab === "crm" && (
                                <CRMSyncView zohoUser={zohoUser} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Persistent Inbound Call Drawer (slides up from bottom-right corner) */}
            <InboundCallDrawer
                isOpen={(callStatus === "ringing" && callType === "incoming") || (isCallPopupOpen && callType === "incoming")}
                caller={caller}
                onAccept={handleAnswerCall}
                onAnswer={handleAnswerCall}
                onDecline={handleDeclineCall}
                onTransfer={() => {
                    setIsCallPopupOpen(false);
                    setIsTransferOpen(true);
                }}
            />

            {/* Outgoing Call Popup Modal (if calling out) */}
            {callType === "outgoing" && (
                <CallPopup
                    isOpen={isCallPopupOpen}
                    type="outgoing"
                    caller={caller}
                    onAnswer={handleAnswerCall}
                    onDecline={handleDeclineCall}
                    onTransfer={() => {
                        setIsCallPopupOpen(false);
                        setIsTransferOpen(true);
                    }}
                />
            )}

            {/* Quick Outbound Dialpad Modal */}
            <DialpadModal
                isOpen={isDialpadOpen}
                onClose={() => setIsDialpadOpen(false)}
                onCallNumber={(num, contact) => requestSimulateOutbound(num, contact)}
                isCallActive={callStatus === "active"}
            />

            {/* Call Transfer Dialog Modal */}
            <TransferModal
                isOpen={isTransferOpen}
                onClose={() => setIsTransferOpen(false)}
                onConfirmTransfer={handleConfirmTransfer}
            />

            {/* Unsaved Lead Overlap Guard Modal */}
            <UnsavedLeadGuardModal
                isOpen={isGuardModalOpen}
                onClose={handleCloseGuardModal}
                extractedLead={aiAnalysis?.extracted || {}}
                caller={caller}
                completenessScore={aiAnalysis?.completenessScore || 0}
                pendingAction={pendingAction}
                onSaveAndContinue={handleGuardSaveAndContinue}
                onDiscardAndContinue={handleGuardDiscardAndContinue}
                isSaving={isSavingLead}
                saveError={saveError}
            />
        </div>
    );
}

export default App;
