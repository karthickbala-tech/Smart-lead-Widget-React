import { Phone, PhoneOff, UserPlus, Sparkles, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { getInitials } from "../utils/helpers";

function CallPopup({
    isOpen,
    type = "incoming", // 'incoming' | 'outgoing'
    caller,
    onAnswer,
    onDecline,
    onTransfer
}) {
    if (!isOpen || !caller) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 select-none">
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="w-72 sm:w-80 glass-panel rounded-3xl p-4 sm:p-4.5 shadow-2xl space-y-3.5 transition-all duration-300"
            >
                {/* Header Status Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                        </span>
                        <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-purple-200">
                            {type === "incoming" ? "Incoming Call" : "Calling..."}
                        </span>
                    </div>

                    {caller.crmLeadMatch ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 shadow-2xs">
                            <Sparkles size={9} className="text-pink-500" />
                            <span>Zoho Lead</span>
                        </span>
                    ) : (
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-purple-400/80">
                            RingCentral
                        </span>
                    )}
                </div>

                {/* Compact Caller Profile Card */}
                <div className="flex items-center gap-3 py-1">
                    {/* Small Rounded Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-purple-500/20">
                            {getInitials(caller.name || "Customer")}
                        </div>
                    </div>

                    {/* Caller Name & Phone Number */}
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate leading-tight">
                            {caller.name || "Unknown Caller"}
                        </h4>
                        <p className="text-xs font-mono font-semibold text-purple-700 dark:text-purple-300 truncate pt-0.5">
                            {caller.phone || "+1 (555) 000-0000"}
                        </p>
                        {caller.company && (
                            <p className="text-[10px] text-slate-400 dark:text-purple-300/60 truncate flex items-center gap-1 pt-0.5 font-medium">
                                <Building2 size={10} className="shrink-0 text-purple-500" />
                                <span>{caller.company}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Telephony Actions (Decline / Answer) */}
                <div className="flex items-center gap-2 pt-0.5">
                    <button
                        id="btn-popup-decline"
                        onClick={onDecline}
                        className="btn-spring flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        title={type === "incoming" ? "Decline incoming call" : "Cancel outbound call"}
                    >
                        <PhoneOff size={13} />
                        <span>{type === "incoming" ? "Decline" : "Cancel"}</span>
                    </button>

                    {type === "incoming" && onTransfer && (
                        <button
                            id="btn-popup-transfer"
                            onClick={onTransfer}
                            className="btn-spring p-2 rounded-xl bg-white/80 dark:bg-purple-950/60 text-slate-700 dark:text-purple-200 border border-purple-200/60 dark:border-purple-800/60 transition-all active:scale-95 cursor-pointer shadow-2xs"
                            title="Transfer call"
                        >
                            <UserPlus size={14} />
                        </button>
                    )}

                    {type === "incoming" && (
                        <button
                            id="btn-popup-answer"
                            onClick={onAnswer}
                            className="btn-spring flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                            title="Answer call"
                        >
                            <Phone size={13} className="animate-bounce" />
                            <span>Answer</span>
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default CallPopup;

