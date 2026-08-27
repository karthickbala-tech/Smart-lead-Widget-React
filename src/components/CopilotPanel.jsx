import { useState, useRef, useEffect } from "react";
import {
    MessageCircleQuestion,
    CheckCircle2,
    Send,
    Copy,
    Check,
    TrendingUp,
    Zap,
    Compass,
    Smile,
    Meh,
    Flame,
    ListFilter,
    FileText,
    Package,
    Bot,
    Sparkles,
    Volume2,
    RotateCcw,
    CornerDownLeft,
    Lightbulb,
    Mail,
    ShieldAlert,
    DollarSign
} from "lucide-react";
import { motion } from "framer-motion";
import { sendCopilotChatMessage, speakText } from "../services/geminiService";
import { playAudioOrSpeak } from "../utils/audioPlayer";

function CopilotPanel({
    missingFields = [],
    recommendedQuestions = [],
    keyPoints = [],
    sentiment = "neutral",
    intent = "Discovery & Solution Exploration",
    extractedLead = {},
    transcript = [],
    caller = {},
    onUseQuestion,
    onCopyQuestion
}) {
    const [activeTab, setActiveTab] = useState("guidance"); // "guidance" | "chat"
    const [copiedId, setCopiedId] = useState(null);

    // Chatbot state
    const [chatHistory, setChatHistory] = useState([
        {
            role: "model",
            content: "👋 Hello! I'm your Gemini Sales Copilot. I'm actively analyzing this call. How can I assist you with this prospect?"
        }
    ]);
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const chatContainerRef = useRef(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    };

    useEffect(() => {
        if (activeTab === "chat") {
            scrollToBottom();
        }
    }, [chatHistory, activeTab]);

    const handleCopy = (q, fallbackId) => {
        const textToCopy = typeof q === "string" ? q : (q?.question || q?.text || "");
        if (navigator.clipboard && textToCopy) {
            navigator.clipboard.writeText(textToCopy);
        }
        const id = typeof q === "string" ? fallbackId || "str" : (q?.id || fallbackId || "q-id");
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        if (onCopyQuestion && textToCopy) onCopyQuestion(textToCopy);
    };

    const handleSendChatMessage = async (presetText) => {
        const text = (presetText || chatInput).trim();
        if (!text || isChatLoading) return;

        const newHistory = [...chatHistory, { role: "user", content: text }];
        setChatHistory(newHistory);
        if (!presetText) setChatInput("");
        setIsChatLoading(true);

        try {
            const context = {
                caller,
                transcript,
                extractedLead,
                sentiment,
                intent
            };
            const response = await sendCopilotChatMessage({
                message: text,
                history: chatHistory.filter((m) => m.role === "user" || m.role === "model"),
                context
            });

            if (response.reply) {
                setChatHistory([...newHistory, { role: "model", content: response.reply }]);
            }
        } catch (error) {
            console.error("[CopilotPanel] Chat error:", error);
            setChatHistory([
                ...newHistory,
                { role: "model", content: "⚠️ Sorry, I encountered an issue generating a response. Please verify server connectivity or try again." }
            ]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleSpeakResponse = async (text) => {
        if (isPlayingAudio) return;
        setIsPlayingAudio(true);
        try {
            const data = await speakText(text);
            playAudioOrSpeak({
                base64Audio: data?.audioBase64,
                mimeType: data?.mimeType || "audio/wav",
                text: text,
                onStart: () => setIsPlayingAudio(true),
                onEnd: () => setIsPlayingAudio(false),
                onError: () => setIsPlayingAudio(false)
            });
        } catch (e) {
            console.warn("[Copilot TTS] Error playing speech:", e);
            setIsPlayingAudio(false);
        }
    };

    const handleResetChat = () => {
        setChatHistory([
            {
                role: "model",
                content: "👋 Conversation reset. I'm ready with the latest call context. Ask me anything!"
            }
        ]);
    };

    const quickPrompts = [
        { label: "Handle Objections", icon: ShieldAlert, prompt: "What are the best objection handling responses for this customer's concerns?" },
        { label: "Next Best Question", icon: Lightbulb, prompt: "What is the single most strategic qualifying question I should ask next?" },
        { label: "Draft Follow-up Email", icon: Mail, prompt: "Draft a concise, professional follow-up email summarizing our call and key value propositions." },
        { label: "Pricing Strategy", icon: DollarSign, prompt: "Based on their requirements, recommend a pricing tier and proposal angle." }
    ];

    return (
        <div className="glass-panel rounded-2xl flex flex-col h-full overflow-hidden transition-all duration-300 relative">
            {/* Header: Title, Sentiment & Intent */}
            <div className="p-2.5 border-b border-purple-200/40 dark:border-purple-900/40 bg-white/40 dark:bg-purple-950/20 space-y-1.5 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-purple-400">
                            Context Assistance
                        </span>
                        <h2 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                            <Zap size={13} className="text-amber-500 fill-amber-400" />
                            <span>AI Copilot</span>
                        </h2>
                    </div>

                    {/* Sentiment Pill */}
                    <div className="flex items-center gap-1">
                        {sentiment === "positive" ? (
                            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold shadow-2xs">
                                <Smile size={10} className="text-emerald-500" />
                                Positive
                            </span>
                        ) : sentiment === "urgent" ? (
                            <span className="flex items-center gap-1 text-pink-700 dark:text-pink-300 bg-pink-500/10 border border-pink-500/30 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold shadow-2xs">
                                <Flame size={10} className="text-pink-500 animate-pulse" />
                                Urgent
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-purple-700 dark:text-purple-300 bg-purple-500/10 border border-purple-500/30 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold shadow-2xs">
                                <Meh size={10} className="text-purple-500" />
                                Neutral
                            </span>
                        )}
                    </div>
                </div>

                {/* Tab Switcher: Guidance vs AI Chatbot */}
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-purple-100/60 dark:bg-purple-950/60 rounded-xl border border-purple-200/60 dark:border-purple-900/40 relative">
                    <button
                        onClick={() => setActiveTab("guidance")}
                        className={`relative z-10 flex items-center justify-center gap-1 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                            activeTab === "guidance"
                                ? "text-purple-900 dark:text-white"
                                : "text-slate-500 dark:text-purple-400 hover:text-slate-900 dark:hover:text-purple-200"
                        }`}
                    >
                        {activeTab === "guidance" && (
                            <motion.div
                                layoutId="copilot-tab-pill"
                                className="absolute inset-0 bg-white dark:bg-[#201a40] rounded-lg shadow-xs -z-10"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        <MessageCircleQuestion size={11} />
                        <span>Guidance</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("chat")}
                        className={`relative z-10 flex items-center justify-center gap-1 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                            activeTab === "chat"
                                ? "text-white"
                                : "text-slate-500 dark:text-purple-400 hover:text-slate-900 dark:hover:text-purple-200"
                        }`}
                    >
                        {activeTab === "chat" && (
                            <motion.div
                                layoutId="copilot-tab-pill"
                                className="absolute inset-0 bg-gradient-to-r from-violet-600 to-pink-500 rounded-lg shadow-xs -z-10"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        <Bot size={11} />
                        <span>Ask Gemini</span>
                    </button>
                </div>

                {/* Intent Tag */}
                <div className="p-1.5 rounded-xl bg-white/70 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/50 shadow-2xs flex items-center justify-between text-xs backdrop-blur-md">
                    <span className="text-slate-500 dark:text-purple-300/80 font-bold flex items-center gap-1 text-[10px]">
                        <Compass size={11} className="text-purple-600 dark:text-purple-400" />
                        Identified Intent:
                    </span>
                    <span className="font-extrabold text-slate-800 dark:text-purple-100 text-[11px] truncate max-w-[180px]">
                        {intent}
                    </span>
                </div>
            </div>

            {/* TAB 1: COPILOT GUIDANCE */}
            {activeTab === "guidance" && (
                <div className="flex-1 p-2.5 sm:p-3 overflow-y-auto space-y-2.5 bg-slate-50/20 dark:bg-transparent">
                    {/* Agent Call Scripting & Real-Time Prompt Banner */}
                    <div className="p-2 rounded-xl bg-purple-100/50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 flex items-start gap-2 shadow-2xs">
                        <Lightbulb size={13} className="text-amber-500 shrink-0 mt-0.5" />
                        <div className="text-[10px] text-slate-600 dark:text-purple-300/90 leading-tight">
                            <span className="font-extrabold text-slate-800 dark:text-purple-200">Agent Guidance Only: </span>
                            Suggestions for you to ask the caller verbally. They update dynamically as lead fields are extracted.
                        </div>
                    </div>

                    {/* AI COPILOT ASSISTANT QUESTIONS */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-extrabold text-slate-800 dark:text-purple-200 flex items-center gap-1.5 uppercase tracking-wide">
                                <MessageCircleQuestion size={13} className="text-pink-500" />
                                <span>Suggested Questions</span>
                            </h3>
                            <span className="text-[9px] text-purple-700 dark:text-purple-300 font-extrabold bg-purple-500/10 dark:bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-200/80 dark:border-purple-800/60">
                                {recommendedQuestions.length} Active Suggestions
                            </span>
                        </div>

                        <div className="space-y-2">
                            {recommendedQuestions.length === 0 ? (
                                <div className="p-3 text-center text-xs text-slate-400 dark:text-purple-300/50 bg-white/50 dark:bg-purple-950/20 rounded-2xl border border-dashed border-purple-200 dark:border-purple-800">
                                    💬 Suggested questions will appear here dynamically as speech is transcribed.
                                </div>
                            ) : (
                                recommendedQuestions.map((q, index) => {
                                    const questionText = typeof q === "string" ? q : (q?.question || q?.text || "");
                                    const questionId = typeof q === "string" ? `rq-str-${index}` : (q?.id || `rq-item-${index}`);
                                    const category = typeof q === "string" ? "SUGGESTED" : (q?.category || "SUGGESTED");
                                    const targetField = typeof q === "object" ? (q?.fieldLabel || q?.targetField) : null;
                                    const reason = typeof q === "string" ? null : q?.reason;

                                    return (
                                        <motion.div
                                            key={questionId}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.25, delay: index * 0.05 }}
                                            className="p-2.5 rounded-2xl bg-white/80 dark:bg-[#1a1435]/90 border border-purple-200/80 dark:border-purple-800/60 space-y-1.5 shadow-2xs hover:border-purple-400 dark:hover:border-purple-600 transition-all backdrop-blur-xs group"
                                        >
                                            <div className="flex items-center justify-between gap-1 flex-wrap">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[9px] font-extrabold text-purple-700 dark:text-purple-300 uppercase tracking-wider bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                                                        {category}
                                                    </span>
                                                    {targetField && (
                                                        <span className="text-[9px] font-bold text-pink-600 dark:text-pink-300 bg-pink-500/10 px-1.5 py-0.5 rounded-md border border-pink-500/20">
                                                            Target: {targetField}
                                                        </span>
                                                    )}
                                                </div>
                                                {reason && (
                                                    <span className="text-[9px] text-slate-500 dark:text-purple-300/70 truncate max-w-[140px]" title={reason}>
                                                        💡 {reason}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs font-medium text-slate-900 dark:text-purple-100 leading-relaxed italic bg-purple-50/50 dark:bg-purple-950/30 p-2 rounded-xl border border-purple-100 dark:border-purple-900/30">
                                                "{questionText}"
                                            </p>

                                            <div className="flex items-center gap-1.5 pt-0.5">
                                                <button
                                                    onClick={() => onUseQuestion && onUseQuestion(questionText)}
                                                    className="btn-spring flex-1 flex items-center justify-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 hover:opacity-95 text-white text-[10px] font-extrabold shadow-xs transition-all active:scale-95 cursor-pointer"
                                                    title="Mark this question as spoken by the agent in the call"
                                                >
                                                    <Send size={10} />
                                                    <span>Ask Caller</span>
                                                </button>
                                                <button
                                                    onClick={() => handleCopy(q, questionId)}
                                                    className="btn-spring p-1 px-2 rounded-xl bg-white/80 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800 text-slate-600 dark:text-purple-300 hover:bg-white dark:hover:bg-purple-900/40 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1 text-[10px] font-bold"
                                                    title="Copy Question"
                                                >
                                                    {copiedId === questionId ? (
                                                        <>
                                                            <Check size={11} className="text-emerald-500" />
                                                            <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy size={11} />
                                                            <span>Copy</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* CONTEXT ASSISTANCE */}
                    <div className="p-3 rounded-2xl bg-white/70 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-900/40 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-extrabold text-slate-800 dark:text-purple-200 flex items-center gap-1.5 uppercase tracking-wide">
                                <FileText size={12} className="text-purple-600 dark:text-purple-400" />
                                Conversation Context
                            </h3>
                        </div>

                        {extractedLead?.Context ? (
                            <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 shadow-inner">
                                <p className="text-xs text-slate-800 dark:text-purple-100 font-medium leading-relaxed">
                                    {extractedLead.Context}
                                </p>
                            </div>
                        ) : (
                            <p className="text-[11px] text-slate-400 dark:text-purple-300/50 italic font-normal">
                                Listening for caller inquiry context...
                            </p>
                        )}

                        {extractedLead?.Product && (
                            <div className="pt-1 flex items-center gap-1.5 text-xs">
                                <Package size={11} className="text-purple-600 dark:text-purple-400 shrink-0" />
                                <span className="text-[10px] font-bold text-slate-500 dark:text-purple-300/70">Interest:</span>
                                <span className="text-[11px] font-bold text-slate-900 dark:text-purple-100 truncate">{extractedLead.Product}</span>
                            </div>
                        )}
                    </div>

                    {/* LIVE CALL TAKEAWAYS */}
                    <div className="p-3 rounded-2xl bg-white/70 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-900/40 space-y-1.5 shadow-2xs">
                        <h3 className="text-[11px] font-extrabold text-slate-800 dark:text-purple-200 flex items-center gap-1.5 uppercase tracking-wide">
                            <TrendingUp size={12} className="text-purple-600 dark:text-purple-400" />
                            Live Call Takeaways
                        </h3>
                        {keyPoints.length === 0 ? (
                            <p className="text-xs text-slate-400 dark:text-purple-300/50 italic font-normal">
                                AI is aggregating key bullet points as conversation progresses...
                            </p>
                        ) : (
                            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-purple-200">
                                {keyPoints.map((pt, idx) => (
                                    <li key={`keypoint-${idx}`} className="flex items-start gap-2 leading-relaxed">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 shrink-0 mt-1.5 shadow-2xs" />
                                        <span>{typeof pt === "string" ? pt : JSON.stringify(pt)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* MISSING INFORMATION CHECKLIST */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-extrabold text-slate-700 dark:text-purple-200 flex items-center gap-1.5 uppercase tracking-wide">
                                <ListFilter size={12} className="text-purple-600 dark:text-purple-400" />
                                Missing Information Checklist
                            </h3>
                            <span className="text-[9px] text-slate-400 dark:text-purple-400 font-extrabold">
                                {missingFields.length} pending
                            </span>
                        </div>

                        {missingFields.length === 0 ? (
                            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-2xs">
                                <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="font-bold text-[11px]">All required lead parameters extracted!</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-1.5">
                                {missingFields.map((item, index) => (
                                    <div
                                        key={item.field || item.id || `missing-${index}`}
                                        className="p-2 rounded-xl bg-white/70 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-900/40 flex items-center justify-between text-xs transition-all shadow-2xs hover:bg-white dark:hover:bg-purple-950/40"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-2xs" />
                                            <div>
                                                <span className="font-bold text-slate-900 dark:text-purple-100 text-[11px]">
                                                    {item.label}
                                                </span>
                                                <p className="text-[9px] text-slate-400 dark:text-purple-300/70 leading-none mt-0.5">
                                                    {item.reason}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ${
                                            item.priority === "high"
                                                ? "bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 shadow-2xs"
                                                : "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs"
                                        }`}>
                                            {item.priority}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: 🤖 GEMINI CHATBOT (SMART SALES COPILOT) */}
            {activeTab === "chat" && (
                <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30 dark:bg-[#120e26]/50">
                    {/* Quick Sales Prompt Pills */}
                    <div className="p-2 border-b border-purple-200/40 dark:border-purple-900/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {quickPrompts.map((qp, idx) => {
                            const Icon = qp.icon;
                            return (
                                <button
                                    key={`qp-${qp.label || idx}`}
                                    onClick={() => handleSendChatMessage(qp.prompt)}
                                    disabled={isChatLoading}
                                    className="btn-spring shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/80 dark:bg-purple-950/70 border border-purple-200/80 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/40 transition-all cursor-pointer active:scale-95 shadow-2xs"
                                >
                                    <Icon size={11} className="text-pink-500" />
                                    <span>{qp.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Chat Messages */}
                    <div ref={chatContainerRef} className="flex-1 p-3 overflow-y-auto space-y-3">
                        {chatHistory.map((msg, index) => (
                            <motion.div
                                key={`chat-msg-${index}-${msg.role}`}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                            >
                                <div
                                    className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[90%] shadow-2xs ${
                                        msg.role === "user"
                                            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-xs"
                                            : "bg-white dark:bg-[#1d173d] text-slate-900 dark:text-purple-100 border border-purple-200/70 dark:border-purple-800/60 rounded-bl-xs"
                                    }`}
                                >
                                    <p className="whitespace-pre-line">{msg.content}</p>

                                    {/* Action Bar for AI replies */}
                                    {msg.role === "model" && (
                                        <div className="mt-2 pt-1.5 border-t border-purple-200/30 dark:border-purple-800/30 flex items-center gap-1.5">
                                            <button
                                                onClick={() => onUseQuestion && onUseQuestion(msg.content)}
                                                className="btn-spring px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-gradient-to-r from-violet-600 to-pink-500 text-white flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                                                title="Inject into active call transcript"
                                            >
                                                <Send size={9} />
                                                <span>Use in Call</span>
                                            </button>
                                            <button
                                                onClick={() => handleCopy(msg.content)}
                                                className="btn-spring p-1 rounded-lg text-[9px] font-bold bg-purple-100/70 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 cursor-pointer"
                                                title="Copy to clipboard"
                                            >
                                                <Copy size={10} />
                                            </button>
                                            <button
                                                onClick={() => handleSpeakResponse(msg.content)}
                                                className="btn-spring p-1 rounded-lg text-[9px] font-bold bg-purple-100/70 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 cursor-pointer"
                                                title="Read aloud using Gemini TTS"
                                            >
                                                <Volume2 size={10} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {isChatLoading && (
                            <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-300 bg-white/70 dark:bg-purple-950/40 p-2.5 rounded-2xl border border-purple-200/60 dark:border-purple-800/40 w-fit">
                                <Sparkles size={14} className="animate-spin text-pink-500" />
                                <span>Gemini Copilot is reasoning...</span>
                            </div>
                        )}
                    </div>

                    {/* Chat Input Bar */}
                    <div className="p-2.5 border-t border-purple-200/40 dark:border-purple-900/40 bg-white/70 dark:bg-[#181335]/90">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendChatMessage();
                            }}
                            className="flex items-center gap-1.5"
                        >
                            <button
                                type="button"
                                onClick={handleResetChat}
                                className="btn-spring p-2 rounded-xl text-slate-400 dark:text-purple-400 hover:text-slate-600 dark:hover:text-purple-200 bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800 cursor-pointer shadow-2xs"
                                title="Reset conversation"
                            >
                                <RotateCcw size={13} />
                            </button>

                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ask Gemini Copilot about this call..."
                                className="flex-1 bg-white dark:bg-[#120e26] text-slate-900 dark:text-purple-100 placeholder:text-slate-400 dark:placeholder:text-purple-300/40 px-3 py-2 rounded-xl text-xs border border-purple-200 dark:border-purple-800 outline-none focus:ring-2 focus:ring-purple-400 shadow-inner"
                            />

                            <button
                                type="submit"
                                disabled={!chatInput.trim() || isChatLoading}
                                className="btn-spring px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-white text-xs font-extrabold flex items-center gap-1 shadow-md shadow-purple-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <CornerDownLeft size={13} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CopilotPanel;

