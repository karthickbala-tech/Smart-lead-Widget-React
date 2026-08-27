import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertTriangle,
    Save,
    Trash2,
    X,
    User,
    Building,
    Phone,
    Briefcase,
    Sparkles,
    RefreshCw,
    AlertCircle,
    ArrowRight
} from "lucide-react";

function UnsavedLeadGuardModal({
    isOpen,
    onClose,
    extractedLead = {},
    caller = {},
    completenessScore = 0,
    pendingAction = null,
    onSaveAndContinue,
    onDiscardAndContinue,
    isSaving = false,
    saveError = null
}) {
    const [localError, setLocalError] = useState(null);

    if (!isOpen) return null;

    const leadName = extractedLead.Full_Name || extractedLead.name || caller.name || "In-Progress Lead";
    const leadCompany = extractedLead.Company || extractedLead.company || caller.company || "Unknown Company";
    const leadPhone = extractedLead.Phone || extractedLead.phone || caller.phone || "No Phone Detected";
    const leadProduct = extractedLead.Product || extractedLead.product || extractedLead.Description || "Unspecified Interest";

    const getActionDescription = () => {
        if (!pendingAction) return "Next action pending";
        switch (pendingAction.type) {
            case "upload_audio":
                return `Upload & Transcribe Audio File (${pendingAction.payload?.file?.name || "Audio Recording"})`;
            case "outbound":
                return `Start Outbound Call to ${pendingAction.payload?.targetNumber || pendingAction.payload?.targetContact?.phone || "Contact"}`;
            case "inbound":
                return "Start Inbound Call Simulation";
            case "select_scenario":
                return `Switch Scenario to "${pendingAction.payload?.scenario?.title || "New Scenario"}"`;
            case "open_dialpad":
                return "Open Softphone Dialpad for Outbound Dialing";
            default:
                return "Proceed to new telephony session";
        }
    };

    const handleSave = async () => {
        setLocalError(null);
        try {
            await onSaveAndContinue();
        } catch (err) {
            setLocalError(err?.message || "Failed to save lead to Zoho CRM.");
        }
    };

    const handleDiscard = () => {
        setLocalError(null);
        onDiscardAndContinue();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", damping: 26, stiffness: 320 }}
                    className="glass-panel w-full max-w-md bg-white/95 dark:bg-[#150f2e]/95 border border-purple-200/80 dark:border-purple-800/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-purple-100 dark:border-purple-900/40 flex items-start justify-between bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
                                <AlertTriangle size={20} className="animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <span>Unsaved Lead in Progress</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold border border-amber-200/80">
                                        Action Required
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-purple-300/80 mt-0.5">
                                    New activity will reset the current call workspace.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            disabled={isSaving}
                            className="p-1.5 rounded-xl hover:bg-purple-100/60 dark:hover:bg-purple-900/40 text-slate-400 dark:text-purple-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Body Content */}
                    <div className="p-4 sm:p-5 space-y-4">
                        {/* Primary Question Prompt */}
                        <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-900/40 text-xs leading-relaxed">
                            <p className="font-extrabold text-amber-950 dark:text-amber-200 text-xs">
                                “Do you want to save the current lead or delete the extracted lead data?”
                            </p>
                            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-800/90 dark:text-amber-300/80">
                                <ArrowRight size={12} className="shrink-0 text-amber-600 dark:text-amber-400" />
                                <span>Next action: <strong className="font-bold text-slate-900 dark:text-white">{getActionDescription()}</strong></span>
                            </div>
                        </div>

                        {/* Current Lead Data Snapshot Card */}
                        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-purple-950/30 border border-slate-200/80 dark:border-purple-900/40 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold text-slate-400 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1">
                                    <Sparkles size={11} className="text-pink-500" />
                                    Extracted Lead Preview
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200/70">
                                    {completenessScore}% Completeness
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white/70 dark:bg-purple-900/20 border border-slate-100 dark:border-purple-800/30">
                                    <User size={13} className="text-purple-500 shrink-0" />
                                    <div className="truncate">
                                        <div className="text-[9px] text-slate-400 dark:text-purple-400 font-semibold">Contact</div>
                                        <div className="font-bold text-slate-800 dark:text-purple-100 truncate">{leadName}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white/70 dark:bg-purple-900/20 border border-slate-100 dark:border-purple-800/30">
                                    <Building size={13} className="text-purple-500 shrink-0" />
                                    <div className="truncate">
                                        <div className="text-[9px] text-slate-400 dark:text-purple-400 font-semibold">Company</div>
                                        <div className="font-bold text-slate-800 dark:text-purple-100 truncate">{leadCompany}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white/70 dark:bg-purple-900/20 border border-slate-100 dark:border-purple-800/30">
                                    <Phone size={13} className="text-emerald-500 shrink-0" />
                                    <div className="truncate">
                                        <div className="text-[9px] text-slate-400 dark:text-purple-400 font-semibold">Phone</div>
                                        <div className="font-bold text-slate-800 dark:text-purple-100 truncate">{leadPhone}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white/70 dark:bg-purple-900/20 border border-slate-100 dark:border-purple-800/30">
                                    <Briefcase size={13} className="text-pink-500 shrink-0" />
                                    <div className="truncate">
                                        <div className="text-[9px] text-slate-400 dark:text-purple-400 font-semibold">Requirement</div>
                                        <div className="font-bold text-slate-800 dark:text-purple-100 truncate">{leadProduct}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error Alert if Save Failed */}
                        {(saveError || localError) && (
                            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                                <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-500" />
                                <div className="flex-1">
                                    <p className="font-bold">Save Failed</p>
                                    <p className="text-[11px] opacity-90">{saveError || localError}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions Footer */}
                    <div className="p-4 sm:p-5 border-t border-purple-100 dark:border-purple-900/40 bg-slate-50/50 dark:bg-purple-950/30 flex flex-col sm:flex-row gap-2">
                        {/* 1. Save to Zoho CRM (Primary) */}
                        <button
                            id="btn-guard-save-lead"
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="btn-spring flex-1 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:brightness-105 disabled:opacity-50 text-white text-xs font-extrabold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                        >
                            {isSaving ? (
                                <>
                                    <RefreshCw size={14} className="animate-spin" />
                                    <span>Saving to Zoho CRM...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={14} />
                                    <span>Save & Continue</span>
                                </>
                            )}
                        </button>

                        {/* 2. Delete / Discard Lead Data (Destructive) */}
                        <button
                            id="btn-guard-discard-lead"
                            type="button"
                            onClick={handleDiscard}
                            disabled={isSaving}
                            className="btn-spring px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs"
                        >
                            <Trash2 size={14} />
                            <span>Delete & Discard</span>
                        </button>

                        {/* 3. Cancel Action */}
                        <button
                            id="btn-guard-cancel"
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="btn-spring px-3 py-2.5 rounded-2xl bg-white dark:bg-purple-950/60 hover:bg-slate-100 dark:hover:bg-purple-900/40 border border-slate-200 dark:border-purple-800/60 text-slate-700 dark:text-purple-300 text-xs font-bold flex items-center justify-center cursor-pointer transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default UnsavedLeadGuardModal;
