import { useState, useRef, useEffect } from "react";
import {
    Phone,
    PhoneOff,
    Mic,
    MicOff,
    Pause,
    Play,
    UserPlus,
    Circle,
    Square,
    MessageSquare,
    User,
    Bot,
    Send,
    Radio,
    FastForward,
    Grid,
    Copy,
    Check,
    Upload,
    Sparkles,
    Headphones,
    RefreshCw,
    Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDuration, getInitials } from "../utils/helpers";
import { EtherealVoiceOrb } from "./EtherealOrb";
import { transcribeAudio, connectLiveVoiceCopilot } from "../services/geminiService";
import { playAudioOrSpeak } from "../utils/audioPlayer";

function LiveTelephonyPanel({
    callStatus,
    duration,
    caller,
    transcript = [],
    isMuted,
    onToggleMute,
    isOnHold,
    onToggleHold,
    isRecording,
    onToggleRecording,
    onEndCall,
    onOpenTransfer,
    onOpenDialpad,
    onSimulateInbound,
    isAutoPlaying,
    onToggleAutoPlay,
    onStepNextMessage,
    onAddAgentMessage,
    isLiveMicActive,
    onToggleLiveMic,
    onAddTranscribedTurns,
    onRequestUploadAudio,
    onDiscardConversation,
    isAiAnalyzing = false,
    hasMoreSteps
}) {
    const [agentInputText, setAgentInputText] = useState("");
    const [copiedPhone, setCopiedPhone] = useState(false);
    const [copiedTurnId, setCopiedTurnId] = useState(null);
    const [isTranscribingFile, setIsTranscribingFile] = useState(false);
    const [transcribeNotice, setTranscribeNotice] = useState(null);
    const [isVoiceCopilotActive, setIsVoiceCopilotActive] = useState(false);
    const [isVoiceCopilotSpeaking, setIsVoiceCopilotSpeaking] = useState(false);
    const [voiceCopilotStatus, setVoiceCopilotStatus] = useState("Standby");

    const fileInputRef = useRef(null);
    const transcriptContainerRef = useRef(null);
    const voiceSessionRef = useRef(null);
    const mediaRecorderRef = useRef(null);

    // Auto-scroll transcript container internally as new speech turns arrive
    useEffect(() => {
        if (transcriptContainerRef.current) {
            transcriptContainerRef.current.scrollTo({
                top: transcriptContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [transcript]);

    // Handle Gemini Live Voice Copilot connection
    useEffect(() => {
        if (!isVoiceCopilotActive) {
            if (voiceSessionRef.current) {
                voiceSessionRef.current.close();
                voiceSessionRef.current = null;
            }
            if (mediaRecorderRef.current) {
                try {
                    mediaRecorderRef.current.stop();
                    mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
                } catch (err) {
                    console.warn("[Live Voice] Stop stream warning:", err);
                }
                mediaRecorderRef.current = null;
            }
            return;
        }

        const session = connectLiveVoiceCopilot({
            onOpen: () => {
                setVoiceCopilotStatus("Gemini Live Voice Copilot Active");
            },
            onAudioChunk: (base64Audio) => {
                setIsVoiceCopilotSpeaking(true);
                playAudioOrSpeak({
                    base64Audio,
                    mimeType: "audio/wav",
                    text: "",
                    onStart: () => setIsVoiceCopilotSpeaking(true),
                    onEnd: () => setIsVoiceCopilotSpeaking(false),
                    onError: () => setIsVoiceCopilotSpeaking(false)
                });
            },
            onInterrupted: () => {
                setIsVoiceCopilotSpeaking(false);
            },
            onError: (err) => {
                console.warn("[Voice Copilot] WS notice:", err);
                setVoiceCopilotStatus("Gemini Live API Ready");
            },
            onClose: () => {
                setVoiceCopilotStatus("Voice Copilot Disconnected");
            }
        });
        voiceSessionRef.current = session;

        // Start Audio capture for agent if supported
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                const recorder = new MediaRecorder(stream);
                recorder.ondataavailable = async (event) => {
                    if (event.data.size > 0 && voiceSessionRef.current) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64 = (reader.result || "").toString().split(",")[1];
                            if (base64) {
                                voiceSessionRef.current.sendAudio(base64);
                            }
                        };
                        reader.readAsDataURL(event.data);
                    }
                };
                recorder.start(1000);
                mediaRecorderRef.current = recorder;
            }).catch((err) => {
                console.warn("[Live Voice] Mic access notice:", err);
            });
        }

        return () => {
            if (voiceSessionRef.current) {
                voiceSessionRef.current.close();
            }
            if (mediaRecorderRef.current) {
                try {
                    mediaRecorderRef.current.stop();
                    mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
                } catch (err) {
                    console.warn("[Live Voice] Stream cleanup notice:", err);
                }
            }
        };
    }, [isVoiceCopilotActive]);

    const handleSendAgentText = (e) => {
        e?.preventDefault();
        if (!agentInputText.trim()) return;
        onAddAgentMessage(agentInputText.trim());
        setAgentInputText("");
    };

    const handleCopyPhone = () => {
        if (caller?.phone && navigator.clipboard) {
            navigator.clipboard.writeText(caller.phone);
            setCopiedPhone(true);
            setTimeout(() => setCopiedPhone(false), 2000);
        }
    };

    const handleCopyTurnText = (text, id) => {
        if (navigator.clipboard && text) {
            navigator.clipboard.writeText(text);
            setCopiedTurnId(id);
            setTimeout(() => setCopiedTurnId(null), 1800);
        }
    };

    // 🎙️ Transcribe Audio File using Gemini API
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // If parent has provided a guard handler, delegate directly
        if (onRequestUploadAudio) {
            onRequestUploadAudio(file);
            e.target.value = "";
            return;
        }

        setIsTranscribingFile(true);
        setTranscribeNotice("Gemini 3.7 Audio Engine: Transcribing call audio...");

        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64Audio = (reader.result || "").toString().split(",")[1];
                if (!base64Audio) {
                    setIsTranscribingFile(false);
                    return;
                }

                try {
                    const result = await transcribeAudio({
                        audioBase64: base64Audio,
                        mimeType: file.type || "audio/webm",
                        callerName: caller?.name || "Customer",
                        agentName: "Agent (You)"
                    });

                    if (result.transcript && Array.isArray(result.transcript)) {
                        if (onAddTranscribedTurns) {
                            onAddTranscribedTurns(result.transcript);
                        } else {
                            result.transcript.forEach((turn, idx) => {
                                setTimeout(() => {
                                    if (onAddAgentMessage && turn.sender === "agent") {
                                        onAddAgentMessage(turn.text);
                                    }
                                }, idx * 400);
                            });
                        }
                        setTranscribeNotice(`✓ Transcribed ${result.transcript.length} turns with Gemini Audio!`);
                        setTimeout(() => setTranscribeNotice(null), 4000);
                    }
                } catch (err) {
                    console.error("[Telephony] Transcription error:", err);
                    setTranscribeNotice(`Error: ${err.message || "Failed to transcribe"}`);
                    setTimeout(() => setTranscribeNotice(null), 4000);
                } finally {
                    setIsTranscribingFile(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            setIsTranscribingFile(false);
            console.error("[Telephony] File read error:", err);
        }
    };

    const hasActiveCallerInfo = Boolean(
        caller && (caller.name || caller.phone) && (callStatus === "active" || callStatus === "ringing" || callStatus === "ended")
    );

    return (
        <div className="glass-panel rounded-2xl sm:rounded-3xl flex flex-col h-full overflow-hidden transition-all duration-300 relative min-h-0">
            {/* Header: Call Status & Telephony Bar */}
            <div className="p-2.5 sm:p-3 border-b border-purple-200/40 dark:border-purple-900/40 bg-white/40 dark:bg-purple-950/20 shrink-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-purple-400">
                            Telephony
                        </span>

                        {/* Status Badge */}
                        <div className="flex items-center gap-1">
                            {callStatus === "active" ? (
                                isOnHold ? (
                                    <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
                                        <Pause size={10} className="animate-pulse" />
                                        ON HOLD
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        ACTIVE
                                    </span>
                                )
                            ) : callStatus === "ringing" ? (
                                <span className="flex items-center gap-1 text-purple-700 dark:text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse shadow-xs">
                                    <Phone size={10} className="animate-bounce" />
                                    RINGING
                                </span>
                            ) : (
                                <span className="text-slate-500 dark:text-purple-300/70 bg-white/60 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-900/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    STANDBY
                                </span>
                            )}
                        </div>

                        {/* Recording status indicator */}
                        {callStatus === "active" && isRecording && (
                            <span className="flex items-center gap-1 text-[9px] font-extrabold text-pink-600 dark:text-pink-400 bg-pink-500/10 border border-pink-500/30 px-1.5 py-0.2 rounded-full animate-pulse">
                                <Circle size={6} className="fill-pink-500 text-pink-500" />
                                REC
                            </span>
                        )}
                    </div>

                    {/* Call Duration Counter & Voice Copilot Mode Toggle */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setIsVoiceCopilotActive(!isVoiceCopilotActive)}
                            className={`btn-spring flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold border transition-all cursor-pointer shadow-xs ${
                                isVoiceCopilotActive
                                    ? isVoiceCopilotSpeaking
                                        ? "bg-gradient-to-r from-pink-600 to-violet-600 text-white border-pink-400 animate-pulse"
                                        : "bg-gradient-to-r from-violet-600 to-pink-500 text-white border-purple-400"
                                    : "bg-white/80 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800 hover:border-purple-400"
                            }`}
                            title={`Gemini Live Voice: ${voiceCopilotStatus}`}
                        >
                            <Headphones size={10} />
                            <span>{isVoiceCopilotActive ? (isVoiceCopilotSpeaking ? "Speaking..." : "Voice On") : "Voice AI"}</span>
                        </button>

                        <div className="font-mono text-[11px] font-extrabold text-slate-900 dark:text-purple-100 bg-white/80 dark:bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-200/60 dark:border-purple-800/50 shadow-inner">
                            {formatDuration(duration)}
                        </div>
                    </div>
                </div>

                {/* Active Caller Card & Audio Wave Bar */}
                {hasActiveCallerInfo ? (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/50 shadow-2xs backdrop-blur-md">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                                {getInitials(caller.name || "Customer")}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5 truncate">
                                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                        {caller.name || "Incoming Caller"}
                                    </h3>
                                    {caller.company && (
                                        <span className="text-[10px] text-slate-500 dark:text-purple-300/70 truncate hidden sm:inline">
                                            • {caller.company}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-purple-300/70">
                                    <button
                                        onClick={handleCopyPhone}
                                        title="Copy phone number"
                                        className="font-mono text-slate-700 dark:text-slate-200 font-semibold hover:text-purple-600 flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                        <span>{caller.phone || "Unknown"}</span>
                                        {copiedPhone ? <Check size={9} className="text-emerald-500" /> : <Copy size={9} className="opacity-50" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Equalizer Spectrum Bars */}
                        {callStatus === "active" && !isOnHold && (
                            <div className="flex items-center gap-0.5 h-3 px-1.5 shrink-0">
                                <div className="w-0.5 bg-violet-500 rounded-full animate-wave-1" />
                                <div className="w-0.5 bg-purple-500 rounded-full animate-wave-2" />
                                <div className="w-0.5 bg-pink-500 rounded-full animate-wave-3" />
                                <div className="w-0.5 bg-violet-600 rounded-full animate-wave-4" />
                                <div className="w-0.5 bg-purple-400 rounded-full animate-wave-5" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/50 shadow-2xs backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 font-extrabold text-[10px] flex items-center justify-center border border-purple-200/60 shrink-0">
                                <Radio size={14} />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                                    Softphone Standby
                                </h3>
                                <p className="text-[10px] text-slate-500 dark:text-purple-300/70 mt-0.5">
                                    Ready for CTI audio & AI extraction
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Telephony Action Controls */}
                {callStatus === "active" && (
                    <div className="grid grid-cols-6 gap-1.5 mt-2">
                        {/* Mute */}
                        <button
                            id="btn-telephony-mute"
                            onClick={onToggleMute}
                            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                            className={`btn-spring flex flex-col items-center justify-center py-1.5 rounded-xl text-[9px] font-bold border transition-all cursor-pointer ${
                                isMuted
                                    ? "bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border-pink-300 dark:border-pink-800 shadow-xs"
                                    : "bg-white/70 dark:bg-purple-950/50 text-slate-700 dark:text-purple-200 border-purple-200/60 dark:border-purple-800/50 hover:bg-white hover:border-purple-300"
                            }`}
                        >
                            {isMuted ? <MicOff size={12} /> : <Mic size={12} />}
                            <span className="mt-0.5">{isMuted ? "Unmute" : "Mute"}</span>
                        </button>

                        {/* Hold */}
                        <button
                            id="btn-telephony-hold"
                            onClick={onToggleHold}
                            title={isOnHold ? "Resume Call" : "Put Call on Hold"}
                            className={`btn-spring flex flex-col items-center justify-center py-1.5 rounded-xl text-[9px] font-bold border transition-all cursor-pointer ${
                                isOnHold
                                    ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 shadow-xs"
                                    : "bg-white/70 dark:bg-purple-950/50 text-slate-700 dark:text-purple-200 border-purple-200/60 dark:border-purple-800/50 hover:bg-white hover:border-purple-300"
                            }`}
                        >
                            {isOnHold ? <Play size={12} /> : <Pause size={12} />}
                            <span className="mt-0.5">{isOnHold ? "Resume" : "Hold"}</span>
                        </button>

                        {/* Recording */}
                        <button
                            id="btn-telephony-rec"
                            onClick={onToggleRecording}
                            title={isRecording ? "Stop Audio Recording" : "Start Audio Recording"}
                            className={`btn-spring flex flex-col items-center justify-center py-1.5 rounded-xl text-[9px] font-bold border transition-all cursor-pointer ${
                                isRecording
                                    ? "bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border-pink-300 dark:border-pink-800 shadow-xs"
                                    : "bg-white/70 dark:bg-purple-950/50 text-slate-700 dark:text-purple-200 border-purple-200/60 dark:border-purple-800/50 hover:bg-white hover:border-purple-300"
                            }`}
                        >
                            {isRecording ? <Square size={12} className="text-pink-500 fill-pink-500" /> : <Circle size={12} />}
                            <span className="mt-0.5">{isRecording ? "Stop Rec" : "Rec"}</span>
                        </button>

                        {/* Transfer */}
                        <button
                            id="btn-telephony-transfer"
                            onClick={onOpenTransfer}
                            title="Transfer Call"
                            className="btn-spring flex flex-col items-center justify-center py-1.5 rounded-xl text-[9px] font-bold bg-white/70 dark:bg-purple-950/50 text-slate-700 dark:text-purple-200 border border-purple-200/60 dark:border-purple-800/50 hover:bg-white hover:border-purple-300 transition-all cursor-pointer shadow-2xs"
                        >
                            <UserPlus size={12} />
                            <span className="mt-0.5">Transfer</span>
                        </button>

                        {/* Keypad */}
                        <button
                            id="btn-telephony-keypad"
                            onClick={onOpenDialpad}
                            title="DTMF Keypad"
                            className="btn-spring flex flex-col items-center justify-center py-1.5 rounded-xl text-[9px] font-bold bg-white/70 dark:bg-purple-950/50 text-slate-700 dark:text-purple-200 border border-purple-200/60 dark:border-purple-800/50 hover:bg-white hover:border-purple-300 transition-all cursor-pointer shadow-2xs"
                        >
                            <Grid size={12} />
                            <span className="mt-0.5">Keypad</span>
                        </button>

                        {/* End Call */}
                        <button
                            id="btn-telephony-end"
                            onClick={onEndCall}
                            title="End Call"
                            className="btn-spring flex flex-col items-center justify-center py-1.5 rounded-xl text-[9px] font-extrabold bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                            <PhoneOff size={12} />
                            <span className="mt-0.5">End</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Live Dual-Channel Transcript Header Controls */}
            <div className="px-3 py-1.5 bg-slate-50/80 dark:bg-purple-950/30 border-b border-slate-200/80 dark:border-purple-900/30 flex items-center justify-between text-xs backdrop-blur-md shrink-0">
                <div className="flex items-center gap-1.5">
                    <MessageSquare size={12} className="text-purple-600 dark:text-purple-400" />
                    <span className="font-extrabold text-slate-900 dark:text-purple-200 text-xs">
                        Speech Feed
                    </span>
                    {isAiAnalyzing && (
                        <span className="inline-flex items-center gap-1 text-[8px] font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50 px-1.5 py-0.2 rounded-full border border-pink-200/80 animate-pulse">
                            <Sparkles size={8} className="animate-spin" />
                            AI Extracting
                        </span>
                    )}
                </div>

                {/* Scenario playback & Gemini Transcription Upload controls */}
                <div className="flex items-center gap-1">
                    {/* Hidden Audio File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                    />

                    {/* 🎙️ Upload Call Audio for Gemini Transcription */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isTranscribingFile}
                        title="Transcribe recorded audio file with Gemini 3.7"
                        className="btn-spring flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-white dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/70 hover:bg-purple-50 hover:border-purple-300 cursor-pointer shadow-2xs"
                    >
                        {isTranscribingFile ? (
                            <RefreshCw size={10} className="animate-spin text-pink-500" />
                        ) : (
                            <Upload size={10} />
                        )}
                        <span>{isTranscribingFile ? "Transcribing..." : "Upload Audio"}</span>
                    </button>

                    {/* Live Mic Speech Recognition toggle */}
                    <button
                        onClick={onToggleLiveMic}
                        title={isLiveMicActive ? "Disable Live Microphone Transcription" : "Enable Live Microphone Transcription"}
                        className={`btn-spring flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-extrabold border transition-all cursor-pointer ${
                            isLiveMicActive
                                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-500 shadow-xs animate-pulse"
                                : "bg-white dark:bg-purple-950/50 text-slate-700 dark:text-purple-300 border-slate-200 dark:border-purple-800/60 hover:border-purple-300"
                        }`}
                    >
                        <Mic size={10} />
                        <span>{isLiveMicActive ? "Mic ON" : "Mic"}</span>
                    </button>

                    {/* Discard / Clear Conversation & Lead Extraction */}
                    {Boolean((transcript && transcript.length > 0) || caller?.name) && onDiscardConversation && (
                        <button
                            id="btn-telephony-discard-conversation"
                            onClick={onDiscardConversation}
                            title="Delete & Discard Conversation and Lead Extraction"
                            className="btn-spring flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 hover:border-rose-300 cursor-pointer shadow-2xs transition-all active:scale-95"
                        >
                            <Trash2 size={10} />
                            <span>Discard</span>
                        </button>
                    )}

                    {/* Auto-play scenario toggle */}
                    {callStatus === "active" && (
                        <>
                            <button
                                onClick={onToggleAutoPlay}
                                title={isAutoPlaying ? "Pause Auto-Stream" : "Auto-Stream Next Turns"}
                                className={`btn-spring flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-extrabold border transition-all cursor-pointer ${
                                    isAutoPlaying
                                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white border-purple-600 shadow-xs"
                                        : "bg-white dark:bg-purple-950/50 text-slate-700 dark:text-purple-300 border-slate-200 dark:border-purple-800/60 hover:border-purple-300"
                                }`}
                            >
                                {isAutoPlaying ? <Pause size={10} /> : <Play size={10} />}
                                <span>{isAutoPlaying ? "Stream" : "Auto"}</span>
                            </button>

                            {hasMoreSteps && !isAutoPlaying && (
                                <button
                                    onClick={onStepNextMessage}
                                    title="Advance to next customer/agent turn"
                                    className="btn-spring flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-white dark:bg-purple-950/50 text-slate-700 dark:text-purple-200 border border-slate-200 dark:border-purple-800/60 hover:bg-slate-50 cursor-pointer shadow-2xs"
                                >
                                    <FastForward size={10} />
                                    <span>Next</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Notification Banner for Audio Transcription */}
            {transcribeNotice && (
                <div className="px-2.5 py-1 bg-gradient-to-r from-violet-600 to-pink-500 text-white text-[10px] font-bold flex items-center gap-1.5 shrink-0 shadow-sm animate-in fade-in">
                    <Sparkles size={11} className="animate-spin shrink-0" />
                    <span className="truncate">{transcribeNotice}</span>
                </div>
            )}

            {/* Transcript Messages Feed */}
            <div
                ref={transcriptContainerRef}
                className="flex-1 p-2.5 sm:p-3 overflow-y-auto space-y-2.5 min-h-0 bg-slate-50/40 dark:bg-transparent"
            >
                {transcript.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-2 text-slate-400 dark:text-purple-300/50 space-y-1.5">
                        <div className="relative py-0.5 flex items-center justify-center">
                            <EtherealVoiceOrb
                                size="sm"
                                active={callStatus === "active" || isVoiceCopilotActive}
                            />
                        </div>

                        <div className="space-y-0.5 max-w-xs">
                            <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                                {callStatus === "active"
                                    ? "Listening to live speech..."
                                    : callStatus === "ringing"
                                    ? "Incoming Call Ringing..."
                                    : "Softphone Idle"}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-purple-300/70 font-medium">
                                {callStatus === "active"
                                    ? "Audio transcribes automatically as speech is detected."
                                    : "Simulate an inbound call or dial out to begin."}
                            </p>
                        </div>

                        {/* Quick Standby Actions */}
                        {callStatus !== "active" && callStatus !== "ringing" && (
                            <div className="pt-0.5 flex items-center justify-center gap-1.5">
                                {onSimulateInbound && (
                                    <button
                                        onClick={onSimulateInbound}
                                        className="btn-spring px-2.5 py-1 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 text-white font-extrabold text-[10px] shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                                    >
                                        <Phone size={10} />
                                        <span>Simulate Inbound</span>
                                    </button>
                                )}
                                {onOpenDialpad && (
                                    <button
                                        onClick={onOpenDialpad}
                                        className="btn-spring px-2.5 py-1 rounded-xl bg-white dark:bg-purple-950/60 text-slate-800 dark:text-purple-200 border border-slate-200 dark:border-purple-800/60 font-extrabold text-[10px] flex items-center justify-center gap-1 cursor-pointer shadow-2xs hover:border-purple-300"
                                    >
                                        <Grid size={10} />
                                        <span>Dialpad</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    transcript.map((msg, idx) => {
                        const isCustomer = msg.sender === "customer";
                        const turnId = msg.id || `turn-${idx}`;
                        return (
                            <motion.div
                                key={turnId}
                                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                className={`flex gap-2 text-xs leading-relaxed group ${
                                    isCustomer ? "items-start" : "items-start flex-row-reverse"
                                }`}
                            >
                                {/* Avatar */}
                                <div
                                    className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-[9px] font-bold shadow-xs transition-transform group-hover:scale-105 ${
                                        isCustomer
                                            ? "bg-slate-100 dark:bg-purple-900/60 text-slate-700 dark:text-purple-200 border border-slate-200 dark:border-purple-700"
                                            : "bg-gradient-to-tr from-violet-600 to-pink-500 text-white"
                                    }`}
                                >
                                    {isCustomer ? <User size={11} /> : <Bot size={11} />}
                                </div>

                                {/* Message Bubble */}
                                <div
                                    className={`max-w-[88%] rounded-xl p-2 sm:p-2.5 shadow-2xs border transition-all relative ${
                                        isCustomer
                                            ? "bg-white dark:bg-[#1a1435] text-slate-800 dark:text-purple-100 border-slate-200/90 dark:border-purple-800/50 rounded-tl-xs group-hover:border-purple-300 dark:group-hover:border-purple-700"
                                            : "bg-purple-50 dark:bg-[#231a48] text-slate-900 dark:text-white border-purple-200/90 dark:border-purple-700/80 rounded-tr-xs group-hover:border-purple-300 dark:group-hover:border-purple-600"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2 mb-0.5 text-[9px]">
                                        <span className="font-extrabold text-slate-900 dark:text-purple-200">
                                            {msg.speaker || (isCustomer ? "Customer" : "Agent (You)")}
                                        </span>
                                        <div className="flex items-center gap-1 text-slate-400 dark:text-purple-300/60">
                                            {msg.sentiment === "positive" && (
                                                <span className="text-[8px] px-1 py-0.2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                                                    Positive
                                                </span>
                                            )}
                                            {msg.sentiment === "urgent" && (
                                                <span className="text-[8px] px-1 py-0.2 rounded-full bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 font-bold">
                                                    Urgent
                                                </span>
                                            )}
                                            <span className="font-mono text-[8px]">{msg.time || "00:00"}</span>
                                            
                                            {/* Quick Copy Button */}
                                            <button
                                                onClick={() => handleCopyTurnText(msg.text, turnId)}
                                                title="Copy transcript line"
                                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-purple-600 dark:hover:text-purple-300 transition-opacity cursor-pointer ml-0.5"
                                            >
                                                {copiedTurnId === turnId ? (
                                                    <Check size={9} className="text-emerald-500" />
                                                ) : (
                                                    <Copy size={9} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[11px] sm:text-xs text-slate-800 dark:text-purple-100 select-text leading-relaxed">
                                        {msg.text}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Agent Live Chat / Speech Input Bar */}
            {callStatus === "active" && (
                <form
                    onSubmit={handleSendAgentText}
                    className="p-2 border-t border-slate-200/80 dark:border-purple-900/40 bg-slate-50/80 dark:bg-purple-950/20 flex items-center gap-1.5 backdrop-blur-md shrink-0"
                >
                    <input
                        type="text"
                        value={agentInputText}
                        onChange={(e) => setAgentInputText(e.target.value)}
                        placeholder="Type response as agent..."
                        className="flex-1 bg-white dark:bg-[#1a1435] text-slate-900 dark:text-purple-100 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-purple-800/50 outline-none focus:ring-2 focus:ring-purple-400 transition-all placeholder:text-slate-400 shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={!agentInputText.trim()}
                        className="btn-spring p-1.5 rounded-lg bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 hover:opacity-95 disabled:opacity-40 text-white shadow-sm transition-all active:scale-95 cursor-pointer"
                        title="Send to Live Transcript"
                    >
                        <Send size={12} />
                    </button>
                </form>
            )}
        </div>
    );
}

export default LiveTelephonyPanel;

