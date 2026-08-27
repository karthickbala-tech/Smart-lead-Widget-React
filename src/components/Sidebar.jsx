import { useState } from "react";
import {
    LayoutGrid,
    Phone,
    History,
    FileText,
    Sliders,
    Database,
    Zap,
    Sparkles,
    CheckCircle,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Sidebar({
    activeTab,
    setActiveTab,
    callStatus,
    leadCompletenessScore = 0,
    isCollapsed = false,
    onToggleSidebar
}) {
    const [hoveredItem, setHoveredItem] = useState(null);

    const navSections = [
        {
            category: "TELEPHONY",
            items: [
                {
                    id: "workspace",
                    label: "Live Workspace",
                    icon: LayoutGrid,
                    badge: callStatus === "active" ? "LIVE" : null,
                    badgeColor: "bg-emerald-500 text-white shadow-emerald-500/30",
                    hint: "Softphone & Copilot"
                },
                {
                    id: "dialpad",
                    label: "Dial Pad",
                    icon: Phone,
                    hint: "Direct CTI Dialing"
                }
            ]
        },
        {
            category: "INTELLIGENCE",
            items: [
                {
                    id: "history",
                    label: "Call History",
                    icon: History,
                    hint: "Recordings & Transcripts"
                },
                {
                    id: "notes",
                    label: "Call Notes",
                    icon: FileText,
                    hint: "AI Action Items"
                }
            ]
        },
        {
            category: "CRM & AUDIO",
            items: [
                {
                    id: "crm",
                    label: "CRM Sync",
                    icon: Database,
                    badge: leadCompletenessScore > 0 ? `${leadCompletenessScore}%` : null,
                    badgeColor: "bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-purple-500/20",
                    hint: "Lead Schema & Sync"
                },
                {
                    id: "telephony",
                    label: "Audio & Routing",
                    icon: Sliders,
                    hint: "SIP & Devices"
                }
            ]
        }
    ];

    return (
        <motion.aside
            initial={false}
            animate={{
                width: isCollapsed ? 60 : 210
            }}
            transition={{
                type: "spring",
                stiffness: 420,
                damping: 36
            }}
            className="h-full bg-[#0e0922]/95 backdrop-blur-2xl border border-purple-500/20 dark:border-purple-800/40 rounded-2xl flex flex-col justify-between p-2.5 shrink-0 z-30 select-none relative shadow-[0_8px_32px_rgba(10,5,25,0.45)] text-slate-100"
        >
            {/* Top Navigation Identity & Toggle */}
            <div className="space-y-3">
                {/* Header Row */}
                <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between px-1"} pt-1 pb-1`}>
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div
                            onClick={onToggleSidebar}
                            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                            className="relative group p-0.5 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-500 to-pink-500 shadow-md shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                            <div className="w-7 h-7 rounded-[10px] bg-[#120a28] flex items-center justify-center text-white backdrop-blur-md">
                                <Sparkles size={15} className="text-pink-400 group-hover:rotate-12 transition-transform duration-300" />
                            </div>
                        </div>

                        <AnimatePresence initial={false}>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -8 }}
                                    transition={{ duration: 0.15 }}
                                    className="overflow-hidden whitespace-nowrap min-w-0"
                                >
                                    <h2 className="text-xs font-extrabold text-white tracking-tight">
                                        Telephony Bot
                                    </h2>
                                    <p className="text-[9px] text-purple-300/70 font-medium truncate">
                                        Voice Intelligence
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {!isCollapsed && (
                        <button
                            onClick={onToggleSidebar}
                            title="Collapse Sidebar"
                            className="p-1 rounded-lg text-purple-300/60 hover:text-white hover:bg-purple-950/60 cursor-pointer transition-colors"
                        >
                            <ChevronLeft size={15} />
                        </button>
                    )}
                </div>

                {/* Navigation Sections */}
                <div className="space-y-3 pt-0.5">
                    {navSections.map((section) => (
                        <div key={section.category} className="space-y-0.5">
                            <AnimatePresence initial={false}>
                                {!isCollapsed && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.12 }}
                                        className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-purple-400/80 overflow-hidden"
                                    >
                                        {section.category}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-0.5">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;

                                    return (
                                        <div
                                            key={item.id}
                                            className="relative"
                                            onMouseEnter={() => setHoveredItem(item.id)}
                                            onMouseLeave={() => setHoveredItem(null)}
                                        >
                                            <button
                                                id={`nav-${item.id}`}
                                                onClick={() => setActiveTab(item.id)}
                                                className={`w-full flex items-center ${
                                                    isCollapsed ? "justify-center px-0 py-2" : "gap-2.5 px-2.5 py-1.5"
                                                } rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer relative group ${
                                                    isActive
                                                        ? "text-white shadow-md shadow-purple-900/50"
                                                        : "text-purple-200/80 hover:bg-purple-950/40 hover:text-white"
                                                }`}
                                            >
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeSidebarItem"
                                                        className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-xl"
                                                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                                    />
                                                )}

                                                <Icon
                                                    size={16}
                                                    className={`relative z-10 shrink-0 transition-transform group-hover:scale-110 duration-200 ${
                                                        isActive
                                                            ? "text-white"
                                                            : "text-purple-300/80 group-hover:text-purple-200"
                                                    }`}
                                                />

                                                <AnimatePresence initial={false}>
                                                    {!isCollapsed && (
                                                        <motion.span
                                                            initial={{ opacity: 0, x: -4 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: -4 }}
                                                            transition={{ duration: 0.12 }}
                                                            className="relative z-10 truncate whitespace-nowrap text-[11px] font-semibold"
                                                        >
                                                            {item.label}
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>

                                                {/* Badge on Expanded */}
                                                {!isCollapsed && item.badge && (
                                                    <span
                                                        className={`relative z-10 ml-auto text-[8px] font-extrabold px-1.5 py-0.2 rounded-full shadow-2xs ${item.badgeColor}`}
                                                    >
                                                        {item.badge}
                                                    </span>
                                                )}

                                                {/* Dot indicator on Collapsed */}
                                                {isCollapsed && (isActive || item.badge) && (
                                                    <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                                                        isActive ? "bg-white ring-1 ring-purple-600" : "bg-emerald-500"
                                                    }`} />
                                                )}
                                            </button>

                                            {/* Collapsed Tooltip */}
                                            {isCollapsed && hoveredItem === item.id && (
                                                <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#150e2e]/95 backdrop-blur-xl text-white text-xs font-semibold rounded-xl shadow-xl border border-purple-800/80 z-50 whitespace-nowrap pointer-events-none flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span>{item.label}</span>
                                                        {item.badge && (
                                                            <span className={`text-[8px] px-1.5 py-0.2 rounded-full ${item.badgeColor}`}>
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[9px] text-purple-300/70 font-normal">
                                                        {item.hint}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Status Card & Toggle */}
            <div className="pt-1.5 space-y-1.5">
                <AnimatePresence initial={false}>
                    {!isCollapsed ? (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.15 }}
                            className="p-2.5 rounded-xl bg-purple-950/40 backdrop-blur-xl border border-purple-800/40 space-y-2 shadow-2xs"
                        >
                            {/* Header row: Zap icon + Lead Engine + PRO */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-violet-600 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xs">
                                        <Zap size={11} className="fill-white text-white" />
                                    </div>
                                    <span className="text-white font-extrabold text-[11px] tracking-tight">
                                        Lead Engine
                                    </span>
                                </div>
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                    PRO
                                </span>
                            </div>

                            {/* Subtitle */}
                            <p className="text-[9px] text-purple-300/70 leading-tight">
                                Speech diarization & automated lead intelligence active.
                            </p>

                            {/* Completeness bar */}
                            <div className="space-y-1 pt-0.5">
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-purple-300/80 font-semibold">
                                        Completeness
                                    </span>
                                    <span className="text-pink-400 font-mono font-extrabold text-[10px]">
                                        {leadCompletenessScore}%
                                    </span>
                                </div>

                                <div className="w-full bg-purple-950/80 h-1.5 rounded-full overflow-hidden p-0.2">
                                    <div
                                        className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 h-full transition-all duration-500 rounded-full"
                                        style={{ width: `${Math.max(leadCompletenessScore, 4)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Status row: Shield / CheckCircle + Sync + Ready */}
                            <div className="flex items-center justify-between text-[9px] pt-1 border-t border-purple-900/40">
                                <span className="flex items-center gap-1 text-emerald-400 font-semibold truncate">
                                    <CheckCircle size={10} className="text-emerald-400 shrink-0" />
                                    CRM Sync
                                </span>
                                <span className="px-1.5 py-0.2 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold text-[8px]">
                                    Ready
                                </span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-center cursor-pointer hover:bg-purple-950/70 transition-colors"
                            onClick={onToggleSidebar}
                            title={`Click to Expand. Lead Engine Completeness: ${leadCompletenessScore}%`}
                        >
                            <div className="relative w-6 h-6 flex items-center justify-center">
                                <svg className="w-6 h-6 transform -rotate-90">
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="9"
                                        className="text-purple-950/80 stroke-current"
                                        strokeWidth="2"
                                        fill="transparent"
                                    />
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="9"
                                        className="text-pink-400 stroke-current"
                                        strokeWidth="2"
                                        strokeDasharray={56.5}
                                        strokeDashoffset={56.5 - (56.5 * Math.max(leadCompletenessScore, 2)) / 100}
                                        strokeLinecap="round"
                                        fill="transparent"
                                    />
                                </svg>
                                <span className="absolute text-[7px] font-extrabold font-mono text-pink-300">
                                    {leadCompletenessScore}%
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Expansion arrow button when collapsed */}
                {isCollapsed && (
                    <button
                        onClick={onToggleSidebar}
                        title="Expand Sidebar"
                        className="w-full flex items-center justify-center py-1 rounded-lg text-purple-400 hover:text-white hover:bg-purple-950/60 cursor-pointer transition-colors"
                    >
                        <ChevronRight size={14} />
                    </button>
                )}
            </div>
        </motion.aside>
    );
}

export default Sidebar;

