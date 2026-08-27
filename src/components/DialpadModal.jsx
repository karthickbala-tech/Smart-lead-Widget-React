import { useState } from "react";
import {
    Phone,
    Delete,
    X,
    History,
    Search,
    Building2,
    MapPin,
    UserCheck,
    ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";
import { playDTMFTone } from "../services/telephonyManager";

const DIALPAD_KEYS = [
    { digit: "1", sub: "" },
    { digit: "2", sub: "ABC" },
    { digit: "3", sub: "DEF" },
    { digit: "4", sub: "GHI" },
    { digit: "5", sub: "JKL" },
    { digit: "6", sub: "MNO" },
    { digit: "7", sub: "PQRS" },
    { digit: "8", sub: "TUV" },
    { digit: "9", sub: "WXYZ" },
    { digit: "*", sub: "" },
    { digit: "0", sub: "+" },
    { digit: "#", sub: "" }
];

const RECENT_CONTACTS = [
    {
        name: "Karthick Bala",
        phone: "+1 (555) 382-9014",
        company: "ABC Private Limited",
        title: "VP Engineering",
        location: "San Jose, CA",
        status: "Customer"
    },
    {
        name: "Dr. Sarah Jenkins",
        phone: "+1 (415) 890-2341",
        company: "CloudPeak Health Systems",
        title: "CIO",
        location: "San Francisco, CA",
        status: "Hot Lead"
    },
    {
        name: "Marcus Vance",
        phone: "+1 (312) 678-4421",
        company: "Nexus Logistics Worldwide",
        title: "Fleet Operations VP",
        location: "Chicago, IL",
        status: "Qualified"
    },
    {
        name: "Elena Rostova",
        phone: "+1 (646) 552-8819",
        company: "Aurora Global Retail",
        title: "Director of IT",
        location: "New York, NY",
        status: "Discovery"
    }
];

function DialpadModal({
    isOpen,
    onClose,
    onCallNumber,
    isEmbedded = false
}) {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [selectedContact, setSelectedContact] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    if (!isOpen) return null;

    const filteredContacts = RECENT_CONTACTS.filter(contact => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            contact.name.toLowerCase().includes(q) ||
            contact.phone.toLowerCase().includes(q) ||
            contact.company.toLowerCase().includes(q)
        );
    });

    const handleKeyPress = (digit) => {
        playDTMFTone(digit);
        setPhoneNumber(prev => prev + digit);
    };

    const handleDelete = () => {
        setPhoneNumber(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        setPhoneNumber("");
        setSelectedContact(null);
    };

    const handleSelectContact = (contact) => {
        setSelectedContact(contact);
        setPhoneNumber(contact.phone);
    };

    const handleDial = (targetNumber = phoneNumber, contact = selectedContact) => {
        const num = String(targetNumber || "").trim();
        if (!num) return;
        if (onCallNumber) onCallNumber(num, contact);
        if (onClose) onClose();
    };

    const dialerCard = (
        <div className="w-full glass-panel rounded-3xl p-5 space-y-4 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/25">
                        <Phone size={15} />
                    </div>
                    <div>
                        <h3 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                            Outbound CTI Dialer
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-purple-300/70">
                            RingCentral Softphone
                        </p>
                    </div>
                </div>

                {onClose && !isEmbedded && (
                    <button
                        onClick={onClose}
                        className="btn-spring p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-purple-200 hover:bg-white/80 dark:hover:bg-purple-900/40 cursor-pointer transition-colors"
                        title="Close Dialer"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Phone Number Display / Input */}
            <div className="relative p-3 bg-white/70 dark:bg-purple-950/40 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 flex items-center justify-between shadow-inner">
                <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number..."
                    className="w-full bg-transparent text-center text-lg font-mono font-extrabold text-slate-900 dark:text-purple-100 outline-none placeholder:text-slate-400 dark:placeholder:text-purple-300/40 tracking-wider"
                />
                {phoneNumber && (
                    <div className="absolute right-2 flex items-center gap-1">
                        <button
                            onClick={handleDelete}
                            className="btn-spring p-1 text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 cursor-pointer transition-colors"
                            title="Backspace"
                        >
                            <Delete size={15} />
                        </button>
                        <button
                            onClick={handleClear}
                            className="btn-spring p-1 text-slate-400 hover:text-slate-700 dark:hover:text-purple-200 cursor-pointer transition-colors text-xs font-bold"
                            title="Clear Number"
                        >
                            <X size={13} />
                        </button>
                    </div>
                )}
            </div>

            {/* Selected Contact Indicator (if selected from list) */}
            {selectedContact && phoneNumber === selectedContact.phone && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[10px]">
                    <span className="font-bold text-purple-800 dark:text-purple-200 truncate flex items-center gap-1.5">
                        <UserCheck size={12} className="text-purple-600 dark:text-purple-400" />
                        {selectedContact.name} ({selectedContact.company})
                    </span>
                    <button
                        onClick={() => setSelectedContact(null)}
                        className="text-purple-400 hover:text-purple-700 dark:hover:text-purple-200 ml-1 cursor-pointer"
                    >
                        <X size={11} />
                    </button>
                </div>
            )}

            {/* DTMF Keys Grid */}
            <div className="grid grid-cols-3 gap-2">
                {DIALPAD_KEYS.map((k) => (
                    <button
                        key={k.digit}
                        onClick={() => handleKeyPress(k.digit)}
                        className="btn-spring h-12 rounded-2xl bg-white/80 dark:bg-purple-950/30 hover:bg-white dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-800/40 text-slate-800 dark:text-purple-100 transition-all active:scale-95 flex flex-col items-center justify-center cursor-pointer shadow-2xs group"
                    >
                        <span className="text-base font-bold group-hover:text-purple-600 dark:group-hover:text-pink-400 transition-colors leading-none">
                            {k.digit}
                        </span>
                        {k.sub && (
                            <span className="text-[8px] font-bold text-slate-400 dark:text-purple-400/60 tracking-wider leading-none mt-0.5">
                                {k.sub}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Place Outbound Call Button */}
            <div className="pt-1">
                <button
                    onClick={() => handleDial()}
                    disabled={!phoneNumber.trim()}
                    className="btn-spring w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                    <Phone size={14} />
                    <span>Place Outbound Call</span>
                </button>
            </div>
        </div>
    );

    const contactsPanel = (
        <div className="w-full h-full glass-panel rounded-3xl p-5 flex flex-col transition-all duration-300">
            {/* Contacts Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-purple-200/40 dark:border-purple-900/40 gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 flex items-center justify-center shadow-2xs">
                        <History size={15} />
                    </div>
                    <div>
                        <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                            Zoho CRM Recent Contacts
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-purple-300/70">
                            {RECENT_CONTACTS.length} recent contacts • Click to dial
                        </p>
                    </div>
                </div>

                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-2xs">
                    Live CRM Sync
                </span>
            </div>

            {/* Quick Search Bar */}
            <div className="my-3.5 relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-purple-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, phone, or company..."
                    className="w-full pl-9 pr-3.5 py-2 bg-white/70 dark:bg-purple-950/30 rounded-2xl border border-purple-200/50 dark:border-purple-800/40 text-xs text-slate-900 dark:text-purple-100 outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-slate-400 shadow-inner"
                />
            </div>

            {/* Contact Cards List */}
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[460px] pr-1">
                {filteredContacts.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 dark:text-purple-300/50 text-xs">
                        No contacts found matching &ldquo;{searchQuery}&rdquo;
                    </div>
                ) : (
                    filteredContacts.map((contact, idx) => {
                        const isSelected = phoneNumber === contact.phone;
                        return (
                            <div
                                key={idx}
                                onClick={() => handleSelectContact(contact)}
                                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group hover-lift ${
                                    isSelected
                                        ? "bg-purple-500/15 border-purple-400 dark:border-purple-600 shadow-sm"
                                        : "bg-white/60 dark:bg-purple-950/20 hover:bg-white dark:hover:bg-purple-900/40 border-purple-200/40 dark:border-purple-900/30"
                                }`}
                            >
                                <div className="space-y-1 min-w-0 pr-2">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-purple-100 group-hover:text-purple-600 dark:group-hover:text-pink-400 transition-colors truncate">
                                            {contact.name}
                                        </h4>
                                        {contact.status && (
                                            <span className="text-[9px] font-extrabold px-2 py-0.2 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs">
                                                {contact.status}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-mono font-semibold text-purple-700 dark:text-purple-300">
                                        {contact.phone}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-purple-300/70">
                                        <span className="flex items-center gap-1 truncate">
                                            <Building2 size={10} className="text-purple-500 shrink-0" />
                                            {contact.company}
                                        </span>
                                        {contact.location && (
                                            <span className="hidden sm:flex items-center gap-1 text-slate-400 dark:text-purple-400/60 shrink-0">
                                                <MapPin size={9} />
                                                {contact.location}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDial(contact.phone, contact);
                                        }}
                                        title={`Direct call ${contact.name}`}
                                        className="btn-spring p-2.5 rounded-xl bg-white/80 dark:bg-purple-950/80 text-emerald-600 dark:text-emerald-400 border border-purple-200/60 dark:border-purple-800 hover:bg-emerald-500/10 dark:hover:bg-emerald-950/60 hover:border-emerald-400 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                                    >
                                        <Phone size={13} />
                                        <ArrowUpRight size={11} className="opacity-70" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );

    const layout = (
        <div className="w-full grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_340px] lg:grid-cols-[minmax(0,1fr)_360px] gap-4 items-start">
            {/* Left Column: Zoho CRM Recent Contacts */}
            <div className="min-w-0">
                {contactsPanel}
            </div>

            {/* Right Column: Outbound CTI Dialer */}
            <div className="min-w-0">
                {dialerCard}
            </div>
        </div>
    );

    if (isEmbedded) {
        return (
            <div className="w-full">
                {layout}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
                {layout}
            </motion.div>
        </div>
    );
}

export default DialpadModal;

