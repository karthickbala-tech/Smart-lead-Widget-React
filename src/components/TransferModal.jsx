import { useState } from "react";
import {
    ArrowRightLeft,
    X,
    Search,
    PhoneForwarded
} from "lucide-react";
import { motion } from "framer-motion";

const TRANSFER_TARGETS = [
    { id: "dept-1", name: "Technical Support Tier 2", type: "Department", ext: "Ext 804", available: true },
    { id: "dept-2", name: "Enterprise Sales Desk", type: "Department", ext: "Ext 801", available: true },
    { id: "agent-1", name: "Sarah Jenkins (Solutions Architect)", type: "Agent", ext: "Ext 412", available: true },
    { id: "agent-2", name: "David Miller (Billing Specialist)", type: "Agent", ext: "Ext 205", available: false },
    { id: "dept-3", name: "Customer Success / Onboarding", type: "Department", ext: "Ext 809", available: true }
];

function TransferModal({
    isOpen,
    onClose,
    onConfirmTransfer
}) {
    const [selectedTarget, setSelectedTarget] = useState(TRANSFER_TARGETS[0]);
    const [transferType, setTransferType] = useState("warm"); // 'warm' (consultative) | 'cold' (blind)
    const [search, setSearch] = useState("");

    if (!isOpen) return null;

    const filtered = TRANSFER_TARGETS.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.ext.toLowerCase().includes(search.toLowerCase())
    );

    const handleExecute = () => {
        if (!selectedTarget) return;
        onConfirmTransfer(selectedTarget, transferType);
        if (onClose) onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md glass-panel rounded-3xl p-6 shadow-2xl space-y-4 transition-all duration-300"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-white shadow-sm">
                                <ArrowRightLeft size={14} />
                            </div>
                            Transfer Live Call
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-purple-300/70 mt-0.5">
                            Transfer caller to colleague or department
                        </p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="btn-spring p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-purple-200 hover:bg-slate-100 dark:hover:bg-purple-900/40 cursor-pointer transition-colors"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Transfer Type Selection */}
                <div className="grid grid-cols-2 gap-2.5">
                    <button
                        type="button"
                        onClick={() => setTransferType("warm")}
                        className={`btn-spring p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            transferType === "warm"
                                ? "bg-purple-100 dark:bg-purple-950/80 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-100 shadow-2xs"
                                : "bg-slate-50 dark:bg-purple-950/20 border-slate-200 dark:border-purple-900/40 text-slate-700 dark:text-purple-300/70 hover:bg-slate-100"
                        }`}
                    >
                        <span className="block text-xs font-extrabold">Warm Consultative</span>
                        <span className="block text-[10px] text-slate-500 dark:text-purple-300/60 mt-0.5 font-medium">
                            Speak to colleague before handing over
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTransferType("cold")}
                        className={`btn-spring p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            transferType === "cold"
                                ? "bg-purple-100 dark:bg-purple-950/80 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-100 shadow-2xs"
                                : "bg-slate-50 dark:bg-purple-950/20 border-slate-200 dark:border-purple-900/40 text-slate-700 dark:text-purple-300/70 hover:bg-slate-100"
                        }`}
                    >
                        <span className="block text-xs font-extrabold">Cold Blind Transfer</span>
                        <span className="block text-[10px] text-slate-500 dark:text-purple-300/60 mt-0.5 font-medium">
                            Immediate transfer without consult
                        </span>
                    </button>
                </div>

                {/* Target Search */}
                <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-3 text-slate-400 dark:text-purple-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search extension or name..."
                        className="w-full bg-white/70 dark:bg-purple-950/30 pl-9 pr-3.5 py-2.5 rounded-2xl text-xs border border-purple-200/60 dark:border-purple-800/50 outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-purple-100 placeholder:text-slate-400 dark:placeholder:text-purple-400/40 shadow-inner"
                    />
                </div>

                {/* Target Directory List */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {filtered.map((t) => (
                        <div
                            key={t.id}
                            onClick={() => t.available && setSelectedTarget(t)}
                            className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                                selectedTarget?.id === t.id
                                    ? "bg-purple-100 dark:bg-purple-950/70 border-purple-300 dark:border-purple-700 shadow-2xs"
                                    : "bg-white/60 dark:bg-purple-950/20 border-purple-200/40 dark:border-purple-900/40 hover:bg-white dark:hover:bg-purple-900/40"
                            } ${!t.available ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 dark:text-white">{t.name}</span>
                                    <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300 bg-white dark:bg-purple-900/60 px-2 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800 font-bold shadow-2xs">
                                        {t.ext}
                                    </span>
                                </div>
                                <span className="text-[10px] text-slate-500 dark:text-purple-300/60 mt-0.5 block">{t.type}</span>
                            </div>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                t.available
                                    ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs"
                                    : "bg-slate-100 dark:bg-purple-950/50 text-slate-400 border border-slate-200 dark:border-transparent"
                            }`}>
                                {t.available ? "Available" : "Busy"}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Transfer Action Button */}
                <div className="pt-2">
                    <button
                        onClick={handleExecute}
                        disabled={!selectedTarget || !selectedTarget.available}
                        className="btn-spring w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 hover:opacity-95 disabled:opacity-40 text-white font-extrabold text-xs shadow-md shadow-purple-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                        <PhoneForwarded size={16} />
                        <span>
                            Complete {transferType === "warm" ? "Warm" : "Blind"} Transfer to {selectedTarget?.name}
                        </span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default TransferModal;

