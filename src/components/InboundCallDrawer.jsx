import { useState } from "react";
import {
    Phone,
    PhoneOff,
    ArrowRightLeft,
    Sparkles,
    Building2,
    MapPin,
    Copy,
    Check,
    Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getInitials } from "../utils/helpers";

/**
 * InboundCallDrawer - Persistent bottom-right slide-up drawer for incoming telephony calls
 * 
 * Features:
 * - Slides up smoothly from the bottom-right corner when an inbound call is detected
 * - Circular profile image with animated ringing ripple glow
 * - Displays rich Caller ID (Name, Phone ANI, Organization, Location, CRM Match status)
 * - Styled Accept, Transfer, and Decline action buttons adhering to the glass-panel aesthetic
 */
export function InboundCallDrawer({
    isOpen = true,
    caller,
    onAccept,
    onAnswer, // Alias for onAccept
    onDecline,
    onTransfer
}) {
    const [copiedPhone, setCopiedPhone] = useState(false);
    const [imgError, setImgError] = useState(false);

    const handleAccept = onAccept || onAnswer;

    // Caller details with resilient fallbacks
    const callerName = caller?.name || "Incoming Caller";
    const callerPhone = caller?.phone || "+1 (555) 019-2834";
    const callerCompany = caller?.company || "";
    const callerLocation = caller?.location || "";
    const callerTitle = caller?.title || "";
    const avatarUrl = caller?.avatar || caller?.avatarUrl || null;
    const isCrmMatch = Boolean(caller?.crmLeadMatch || caller?.company);

    const handleCopyPhone = (e) => {
        e.stopPropagation();
        if (navigator?.clipboard && callerPhone) {
            navigator.clipboard.writeText(callerPhone);
            setCopiedPhone(true);
            setTimeout(() => setCopiedPhone(false), 1800);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    id="inbound-call-drawer-container"
                    className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 select-none pointer-events-auto"
                >
                    <motion.div
                        id="inbound-call-drawer"
                        initial={{ opacity: 0, y: 80, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 60, scale: 0.94 }}
                        transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 26,
                            mass: 0.85
                        }}
                        className="w-[330px] sm:w-[360px] glass-panel rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 border border-purple-300/60 dark:border-purple-700/40 relative overflow-hidden"
                    >
                        {/* Ambient animated top accent highlight bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-emerald-400 animate-gradient-shift" />

                        {/* Top Header: Inbound Detection Indicator & Badges */}
                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                                </span>
                                <span className="text-[11px] font-extrabold tracking-wider uppercase bg-gradient-to-r from-purple-700 to-pink-600 dark:from-purple-300 dark:to-pink-400 bg-clip-text text-transparent">
                                    Inbound Call Detected
                                </span>
                            </div>

                            {isCrmMatch ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100/90 dark:bg-purple-950/80 text-purple-800 dark:text-purple-200 border border-purple-300/80 dark:border-purple-700/60 shadow-2xs">
                                    <Sparkles size={10} className="text-pink-500" />
                                    <span>Zoho CRM Lead</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-500 dark:text-purple-300/70 bg-slate-100/80 dark:bg-purple-900/30 border border-slate-200/60 dark:border-purple-800/40">
                                    <Volume2 size={10} className="text-purple-500" />
                                    <span>RingCentral CTI</span>
                                </span>
                            )}
                        </div>

                        {/* Circular Profile Image & Caller ID Section */}
                        <div className="flex items-center gap-3.5 bg-white/60 dark:bg-purple-950/30 rounded-2xl p-3 border border-purple-200/50 dark:border-purple-800/30">
                            {/* Circular Profile Image with Pulsing Radar Ring */}
                            <div className="relative shrink-0 flex items-center justify-center">
                                {/* Ringing radar ring */}
                                <div className="absolute inset-0 -m-1 rounded-full border-2 border-emerald-400/50 dark:border-emerald-400/40 animate-ping pointer-events-none" />
                                <div className="absolute inset-0 -m-0.5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 opacity-20 blur-xs" />

                                {avatarUrl && !imgError ? (
                                    <img
                                        src={avatarUrl}
                                        alt={callerName}
                                        referrerPolicy="no-referrer"
                                        onError={() => setImgError(true)}
                                        className="relative w-14 h-14 rounded-full object-cover border-2 border-white dark:border-purple-900 shadow-md shadow-purple-500/20"
                                    />
                                ) : (
                                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 text-white font-extrabold text-base flex items-center justify-center border-2 border-white dark:border-purple-900 shadow-md shadow-purple-500/25">
                                        {getInitials(callerName)}
                                    </div>
                                )}

                                {/* Call Type Badge Overlay */}
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
                                    <Phone size={9} className="animate-pulse" />
                                </div>
                            </div>

                            {/* Caller ID Information */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate leading-snug">
                                        {callerName}
                                    </h4>
                                    {callerTitle && (
                                        <span className="text-[10px] text-slate-400 dark:text-purple-300/60 font-medium truncate shrink-0 max-w-[100px]">
                                            {callerTitle}
                                        </span>
                                    )}
                                </div>

                                {/* Phone Number (Caller ID) with Copy Action */}
                                <div className="flex items-center gap-1.5 pt-0.5">
                                    <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300 tracking-tight">
                                        {callerPhone}
                                    </span>
                                    <button
                                        id="btn-copy-caller-id"
                                        onClick={handleCopyPhone}
                                        className="p-1 rounded-md text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-100/50 dark:hover:bg-purple-900/40 transition-colors"
                                        title="Copy Caller ID"
                                    >
                                        {copiedPhone ? (
                                            <Check size={11} className="text-emerald-500" />
                                        ) : (
                                            <Copy size={11} />
                                        )}
                                    </button>
                                </div>

                                {/* Organization / Location Metas */}
                                {(callerCompany || callerLocation) && (
                                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-purple-300/70 font-medium truncate">
                                        {callerCompany && (
                                            <span className="flex items-center gap-1 truncate">
                                                <Building2 size={11} className="text-purple-500 shrink-0" />
                                                <span className="truncate">{callerCompany}</span>
                                            </span>
                                        )}
                                        {callerCompany && callerLocation && (
                                            <span className="text-slate-300 dark:text-purple-700">•</span>
                                        )}
                                        {callerLocation && (
                                            <span className="flex items-center gap-1 truncate text-[10px] text-slate-400 dark:text-purple-300/60">
                                                <MapPin size={10} className="text-pink-500 shrink-0" />
                                                <span className="truncate">{callerLocation}</span>
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Telephony Action Buttons: Accept, Transfer, Decline */}
                        <div className="grid grid-cols-3 gap-2 pt-1">
                            {/* Decline Button */}
                            <button
                                id="btn-inbound-decline"
                                onClick={onDecline}
                                className="btn-spring py-2.5 px-2 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                                title="Decline incoming call"
                            >
                                <PhoneOff size={13} />
                                <span>Decline</span>
                            </button>

                            {/* Transfer Button */}
                            <button
                                id="btn-inbound-transfer"
                                onClick={onTransfer}
                                className="btn-spring py-2.5 px-2 rounded-2xl bg-white/90 dark:bg-purple-950/70 hover:bg-purple-100/90 dark:hover:bg-purple-900/60 text-slate-800 dark:text-purple-200 border border-purple-200/80 dark:border-purple-800/60 font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                                title="Transfer call to another agent or department"
                            >
                                <ArrowRightLeft size={13} className="text-purple-600 dark:text-purple-400" />
                                <span>Transfer</span>
                            </button>

                            {/* Accept Button */}
                            <button
                                id="btn-inbound-accept"
                                onClick={handleAccept}
                                className="btn-spring py-2.5 px-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                                title="Accept and answer call"
                            >
                                <Phone size={13} className="animate-bounce" />
                                <span>Accept</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default InboundCallDrawer;
