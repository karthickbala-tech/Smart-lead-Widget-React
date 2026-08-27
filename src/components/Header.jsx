import {
    PhoneCall,
    PhoneIncoming,
    Sun,
    Moon,
    ChevronDown,
    LayoutGrid,
    Phone,
    Target,
    Bot
} from "lucide-react";
import { motion } from "framer-motion";

function Header({
    callStatus,
    activeScenario,
    onSelectScenario,
    scenarios = [],
    onSimulateInbound,
    onSimulateOutbound,
    darkMode,
    setDarkMode,
    zohoUser,
    activeTab = "workspace",
    workspaceViewMode = "all",
    setWorkspaceViewMode = () => {},
    leadCompletenessScore = 0,
    transcriptCount = 0
}) {
    const navItems = [
        { id: "all", label: "3-Col Split", icon: LayoutGrid, count: null },
        { id: "telephony", label: "Softphone", icon: Phone, count: transcriptCount > 0 ? transcriptCount : null },
        { id: "lead", label: "Lead CRM", icon: Target, badge: `${leadCompletenessScore}%` },
        { id: "copilot", label: "Copilot", icon: Bot, count: null }
    ];

    return (
        <header className="h-12 px-3 bg-transparent border-b border-purple-200/40 dark:border-purple-900/30 flex items-center justify-between transition-colors duration-300 z-20 shrink-0 gap-2 select-none">
            {/* Left / Middle Section: Workspace View Mode Switcher */}
            <div className="flex items-center gap-2 min-w-0">
                {activeTab === "workspace" && (
                    <div className="flex items-center gap-0.5 bg-slate-200/50 dark:bg-purple-950/40 p-0.5 rounded-xl border border-purple-200/60 dark:border-purple-800/40 shadow-inner relative">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = workspaceViewMode === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setWorkspaceViewMode(item.id)}
                                    className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all duration-200 cursor-pointer ${
                                        isActive
                                            ? "text-white shadow-xs"
                                            : "text-slate-600 dark:text-purple-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-purple-900/30"
                                    }`}
                                    title={item.label}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeWorkspaceTab"
                                            className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 rounded-lg shadow-sm"
                                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-1.5">
                                        <Icon size={13} className={isActive ? "text-white" : ""} />
                                        <span className={item.id === "all" ? "hidden sm:inline" : ""}>{item.label}</span>
                                        {item.count !== null && (
                                            <span className={`px-1 py-0.2 rounded-full text-[8px] font-bold transition-colors ${
                                                isActive ? "bg-white/25 text-white" : "bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                                            }`}>
                                                {item.count}
                                            </span>
                                        )}
                                        {item.badge && (
                                            <span className={`px-1 py-0.2 rounded-full text-[8px] font-mono font-bold transition-colors ${
                                                isActive ? "bg-white/25 text-white" : "bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                                            }`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Right Section: Scenario Selector, Action Triggers & User Profile */}
            <div className="flex items-center gap-1.5 shrink-0">
                {/* Scenario Selector */}
                <div className="hidden lg:flex items-center bg-white/70 dark:bg-purple-950/30 pl-2 pr-1 py-0.5 rounded-lg border border-purple-200/50 dark:border-purple-800/40 shadow-2xs text-xs backdrop-blur-md transition-all hover:border-purple-300 dark:hover:border-purple-700">
                    <span className="text-[8px] font-extrabold text-slate-400 dark:text-purple-400 uppercase tracking-wider mr-1">
                        Scenario:
                    </span>
                    <div className="relative">
                        <select
                            value={activeScenario?.id || ""}
                            onChange={(e) => {
                                const found = scenarios.find(s => s.id === e.target.value);
                                if (found) onSelectScenario(found);
                            }}
                            disabled={callStatus === "active" || callStatus === "ringing"}
                            className="bg-white dark:bg-[#181135] text-slate-800 dark:text-slate-100 font-bold py-0.5 pl-1.5 pr-5 rounded-md border border-purple-200/60 dark:border-purple-700/50 outline-none focus:ring-1 focus:ring-purple-500 text-[11px] cursor-pointer disabled:opacity-60 appearance-none shadow-2xs max-w-[150px] truncate"
                        >
                            {scenarios.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.title}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={10} className="absolute right-1 top-1.5 text-slate-400 dark:text-purple-400 pointer-events-none" />
                    </div>
                </div>

                {/* Simulation Action Buttons */}
                {callStatus === "idle" || callStatus === "ended" ? (
                    <div className="flex items-center gap-1">
                        <button
                            id="btn-simulate-inbound"
                            onClick={onSimulateInbound}
                            className="btn-spring flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-105 text-white text-[11px] font-bold shadow-xs active:scale-95 cursor-pointer"
                            title="Simulate Inbound Customer Call"
                        >
                            <PhoneIncoming size={11} className="animate-pulse" />
                            <span className="hidden sm:inline">Inbound</span>
                        </button>

                        <button
                            id="btn-simulate-outbound"
                            onClick={onSimulateOutbound}
                            className="btn-spring flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-pink-500 hover:brightness-105 text-white text-[11px] font-bold shadow-xs active:scale-95 cursor-pointer"
                            title="Simulate Outbound Dial"
                        >
                            <PhoneCall size={11} />
                            <span className="hidden sm:inline">Dial Out</span>
                        </button>
                    </div>
                ) : null}

                {/* Zoho CRM User Profile */}
                <div className="hidden md:flex items-center gap-1.5 pl-1.5 border-l border-slate-200/80 dark:border-purple-900/40">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-purple-500 to-pink-500 text-white font-extrabold text-[9px] flex items-center justify-center shadow-2xs ring-1 ring-purple-400/30">
                        {zohoUser?.full_name ? zohoUser.full_name.charAt(0) : "K"}
                    </div>
                    <p className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 truncate max-w-[80px]">
                        {zohoUser?.full_name || "Agent"}
                    </p>
                </div>

                {/* Theme Toggle Button */}
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    className="btn-spring p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-purple-200 dark:hover:text-white bg-white/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 transition-all cursor-pointer shadow-2xs active:scale-95 hover:border-purple-400 dark:hover:border-purple-600"
                >
                    {darkMode ? (
                        <Sun size={13} className="text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
                    ) : (
                        <Moon size={13} className="transition-transform duration-300 rotate-0 hover:-rotate-12" />
                    )}
                </button>
            </div>
        </header>
    );
}

export default Header;



