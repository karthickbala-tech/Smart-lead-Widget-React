import { useState } from "react";
import {
    History,
    PhoneIncoming,
    PhoneOutgoing,
    PhoneMissed,
    Play,
    Pause,
    Sparkles,
    CheckCircle2,
    Search,
    ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDuration } from "../utils/helpers";

function CallHistoryView({ callHistory = [], onSelectCallToReview }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all"); // 'all' | 'incoming' | 'outgoing' | 'missed'
    const [playingCallId, setPlayingCallId] = useState(null);

    const safeHistory = Array.isArray(callHistory) ? callHistory : [];

    const filtered = safeHistory.filter((c) => {
        if (!c) return false;
        const name = String(c.name || c.callerName || "").toLowerCase();
        const phone = String(c.phone || c.callerPhone || "");
        const company = String(c.company || c.callerCompany || "").toLowerCase();
        const term = searchTerm.toLowerCase().trim();

        const matchesSearch =
            !term ||
            name.includes(term) ||
            phone.includes(term) ||
            company.includes(term);

        const callType = c.type || (c.status === "missed" ? "missed" : "incoming");
        const matchesFilter =
            filterType === "all" ||
            callType === filterType ||
            (filterType === "incoming" && callType === "inbound") ||
            (filterType === "outgoing" && callType === "outbound");

        return matchesSearch && matchesFilter;
    });

    const togglePlay = (id) => {
        if (playingCallId === id) {
            setPlayingCallId(null);
        } else {
            setPlayingCallId(id);
        }
    };

    return (
        <div className="glass-panel rounded-3xl p-6 h-full flex flex-col shadow-sm dark:shadow-xl dark:shadow-black/40 space-y-4 overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-200/40 dark:border-purple-900/30">
                <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-white shadow-sm">
                            <History size={14} />
                        </div>
                        Call Logs, Recordings & AI Analysis
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-purple-300/70 mt-0.5">
                        Historical dual-channel audio records synced with Zoho CRM Lead IDs
                    </p>
                </div>

                {/* Filter and Search */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-2.5 text-slate-400 dark:text-purple-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search logs..."
                            className="bg-white/70 dark:bg-purple-950/30 pl-8 pr-3 py-1.5 rounded-xl text-xs border border-purple-200/60 dark:border-purple-800/50 outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-purple-100 placeholder:text-slate-400 shadow-inner"
                        />
                    </div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-white/70 dark:bg-purple-950/30 px-3 py-1.5 rounded-xl text-xs font-bold border border-purple-200/60 dark:border-purple-800/50 text-slate-800 dark:text-purple-200 outline-none cursor-pointer shadow-2xs"
                    >
                        <option value="all">All Calls</option>
                        <option value="incoming">Incoming</option>
                        <option value="outgoing">Outgoing</option>
                        <option value="missed">Missed</option>
                    </select>
                </div>
            </div>

            {/* Call List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {filtered.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-purple-300/50 space-y-2">
                        <History size={32} className="opacity-40" />
                        <p className="text-xs font-medium">No call logs found matching filter</p>
                    </div>
                ) : (
                    filtered.map((call, index) => (
                        <motion.div
                            key={call.id || `call-hist-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.04 }}
                            className="p-4 rounded-2xl bg-white/80 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 hover:border-purple-300 dark:hover:border-purple-700 transition-all space-y-3 shadow-2xs hover-lift"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-2xs ${
                                        call.type === "incoming"
                                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                            : call.type === "outgoing"
                                            ? "bg-purple-50 text-purple-600 dark:bg-purple-900/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                            : "bg-pink-50 text-pink-600 dark:bg-pink-950/70 dark:text-pink-300 border border-pink-200 dark:border-pink-800"
                                    }`}>
                                        {call.type === "incoming" && <PhoneIncoming size={16} />}
                                        {call.type === "outgoing" && <PhoneOutgoing size={16} />}
                                        {call.type === "missed" && <PhoneMissed size={16} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                                                {call.name || call.callerName || "Customer"}
                                            </h4>
                                            <span className="font-mono text-[11px] text-purple-700 dark:text-purple-300">
                                                {call.phone || call.callerPhone || ""}
                                            </span>
                                            {call.leadCreated && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                                                    <CheckCircle2 size={10} />
                                                    Zoho Lead: {call.leadId}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-purple-300/60 mt-0.5">
                                            {call.company || call.callerCompany || "Company"} • {call.time || call.timestamp || "Today"} • Duration: {formatDuration(call.duration || 0)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Audio Waveform Player Simulation */}
                                    {call.recording && (
                                        <div className="flex items-center gap-2 bg-white/60 dark:bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-200/60 dark:border-purple-800 shadow-2xs">
                                            <button
                                                onClick={() => togglePlay(call.id)}
                                                className="btn-spring w-7 h-7 rounded-lg bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-95 text-white flex items-center justify-center cursor-pointer transition-transform active:scale-90 shadow-2xs"
                                            >
                                                {playingCallId === call.id ? (
                                                    <Pause size={13} />
                                                ) : (
                                                    <Play size={13} className="ml-0.5" />
                                                )}
                                            </button>
                                            <div className="flex items-center gap-1 h-4 px-1">
                                                {[12, 24, 18, 28, 14, 22, 16, 26, 12].map((h, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-1 rounded-full ${
                                                            playingCallId === call.id
                                                                ? "bg-pink-500 animate-pulse"
                                                                : "bg-purple-300 dark:bg-purple-800"
                                                        }`}
                                                        style={{ height: `${h}px` }}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-500 dark:text-purple-400 font-bold">
                                                {playingCallId === call.id ? "Playing..." : "02:45"}
                                            </span>
                                        </div>
                                    )}

                                    {onSelectCallToReview && (
                                        <button
                                            onClick={() => onSelectCallToReview(call)}
                                            className="btn-spring p-2 rounded-xl bg-white dark:bg-purple-950/60 hover:bg-slate-50 dark:hover:bg-purple-900/40 text-slate-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800 text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                            title="Open Call Workspace"
                                        >
                                            <ExternalLink size={13} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* AI Summary Banner */}
                            {call.aiSummary && (
                                <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/20 border border-purple-200/80 dark:border-purple-800/60 text-xs space-y-1">
                                    <div className="flex items-center justify-between font-bold text-[11px] text-purple-900 dark:text-pink-300">
                                        <span className="flex items-center gap-1">
                                            <Sparkles size={12} className="text-pink-500" />
                                            AI Executive Summary & Findings
                                        </span>
                                        <span className="bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800 text-[10px] text-purple-800 dark:text-purple-200 shadow-2xs">Score: {call.completenessScore}%</span>
                                    </div>
                                    <p className="text-slate-800 dark:text-purple-200 text-[11px] leading-relaxed font-medium">
                                        {call.aiSummary}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}

export default CallHistoryView;

