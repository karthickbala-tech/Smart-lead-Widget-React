import { useState } from "react";
import {
    Sparkles,
    CheckCircle2,
    Save,
    Edit3,
    AlertCircle,
    AlertTriangle,
    User,
    Building2,
    Phone,
    Mail,
    Package,
    MapPin,
    Briefcase,
    FileText,
    ShieldCheck,
    RefreshCw,
    ExternalLink,
    Search,
    Globe,
    BookOpen,
    ChevronDown,
    ChevronUp,
    Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import zohoCRM from "../services/zohoCRM";
import { searchCompanyGrounding } from "../services/geminiService";
import { hasValidLeadData, getLeadValidationErrors } from "../utils/helpers";

function LeadIntelligencePanel({
    extractedLead = {},
    confidence = {},
    completenessScore = 0,
    onSaveToCRM,
    isSaving,
    savedLeadResult,
    saveError,
    onClearError,
    onResetLead,
    onUpdateField,
    isAiAnalyzing = false
}) {
    const [isReviewing, setIsReviewing] = useState(false);
    const [isSearchingGrounding, setIsSearchingGrounding] = useState(false);
    const [groundingData, setGroundingData] = useState(null);
    const [groundingError, setGroundingError] = useState(null);
    const [isGroundingExpanded, setIsGroundingExpanded] = useState(false);
    const [localWarning, setLocalWarning] = useState(null);

    const hasLead = hasValidLeadData(extractedLead);
    const validationErrors = getLeadValidationErrors(extractedLead);
    const hasEmailError = Boolean(validationErrors.Email);
    const hasPhoneError = Boolean(validationErrors.Phone);
    const isFormValid = hasLead && !hasEmailError && !hasPhoneError;

    // Helper for confidence badge styling
    const getConfidenceBadge = (fieldKey) => {
        const conf = confidence[fieldKey];
        if (!conf || conf.level === "missing" || conf.score === 0) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-medium bg-slate-100 dark:bg-purple-950/40 text-slate-400 dark:text-purple-300/40 border border-slate-200/60 dark:border-purple-900/40">
                    Pending
                </span>
            );
        }

        if (conf.level === "verified") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                    <ShieldCheck size={10} />
                    Verified
                </span>
            );
        }
        if (conf.level === "high") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-purple-100/80 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 shadow-2xs animate-pulse">
                    <Sparkles size={10} />
                    High ({conf.score}%)
                </span>
            );
        }
        if (conf.level === "medium") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-2xs">
                    Med ({conf.score}%)
                </span>
            );
        }
        if (conf.level === "low") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-purple-950/30 text-slate-500 dark:text-purple-300/60 border border-slate-200 dark:border-purple-900/40">
                    Low ({conf.score}%)
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-medium bg-slate-100/60 dark:bg-purple-950/20 text-slate-400">
                Pending
            </span>
        );
    };

    const handleSave = () => {
        if (isSaving) {
            return;
        }
        if (savedLeadResult) {
            setLocalWarning("This lead has already been saved to Zoho CRM.");
            return;
        }
        if (!hasLead) {
            setLocalWarning("No lead data available. Please create or extract lead data before saving to Zoho CRM.");
            return;
        }
        if (!isFormValid) {
            const errList = [validationErrors.Email, validationErrors.Phone].filter(Boolean).join(". ");
            setLocalWarning(`Please correct form validation errors before saving: ${errList}`);
            return;
        }
        setLocalWarning(null);
        onSaveToCRM(extractedLead);
    };

    const handleDiscardLead = () => {
        setLocalWarning(null);
        setGroundingData(null);
        setGroundingError(null);
        setIsReviewing(false);
        if (onResetLead) onResetLead();
    };

    const handleFieldChange = (field, val) => {
        if (localWarning) setLocalWarning(null);
        onUpdateField(field, val);
    };

    const handleSearchGrounding = async () => {
        const targetCompany = companyVal || fullNameVal;
        if (!targetCompany) return;
        setIsSearchingGrounding(true);
        setGroundingError(null);
        try {
            const data = await searchCompanyGrounding({
                companyName: targetCompany,
                contactName: fullNameVal,
                industry: industryVal,
                location: cityVal
            });
            setGroundingData(data);
            setIsGroundingExpanded(true);
        } catch (err) {
            console.error("[Lead Intelligence] Grounding error:", err);
            setGroundingError(err?.message || "Failed to search company info.");
        } finally {
            setIsSearchingGrounding(false);
        }
    };

    const handleOpenInZoho = () => {
        if (savedLeadResult?.id) {
            zohoCRM.openRecord("Leads", savedLeadResult.id);
        }
    };

    const fullNameVal = extractedLead.Full_Name || extractedLead.full_name || extractedLead.Last_Name || "";
    const companyVal = extractedLead.Company || extractedLead.company_name || "";
    const phoneVal = extractedLead.Phone || extractedLead.phone || "";
    const emailVal = extractedLead.Email || extractedLead.email || "";
    const productVal = extractedLead.Product || extractedLead.product_service_interest || "";
    const industryVal = extractedLead.Industry || extractedLead.industry || "";
    const cityVal = extractedLead.City || extractedLead.location_city || "";
    const reqVal = extractedLead.Description || extractedLead.Customer_Requirement || extractedLead.customer_requirement_scope || "";

    return (
        <div className="glass-panel rounded-2xl flex flex-col h-full overflow-hidden transition-all duration-300 relative">
            {/* Panel Title & Completeness Gauge */}
            <div className="p-2.5 border-b border-purple-200/40 dark:border-purple-900/40 bg-white/40 dark:bg-purple-950/20 space-y-1.5 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-purple-400">
                            Zoho CRM Live Sync
                        </span>
                        <h2 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                            <Sparkles size={13} className={`text-pink-500 ${isAiAnalyzing ? "animate-spin" : ""}`} />
                            <span>AI Lead Intelligence</span>
                            {isAiAnalyzing && (
                                <span className="text-[8px] font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 px-1.5 py-0.2 rounded-full border border-pink-200 dark:border-pink-800 animate-pulse">
                                    Extracting...
                                </span>
                            )}
                        </h2>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Review & Edit Toggle */}
                        <button
                            onClick={() => setIsReviewing(!isReviewing)}
                            className={`btn-spring flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all active:scale-95 cursor-pointer shadow-2xs ${
                                isReviewing
                                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-purple-500/25"
                                    : "bg-white/70 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800 text-slate-700 dark:text-purple-200 hover:bg-white hover:border-purple-300"
                            }`}
                            title="Manual Field Overrides"
                        >
                            <Edit3 size={11} />
                            <span>{isReviewing ? "Done" : "Edit"}</span>
                        </button>
                    </div>
                </div>

                {/* Completeness Progress Bar & Visual Readiness */}
                <div className="p-2 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/40 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[10px] font-extrabold">
                        <span className="text-slate-700 dark:text-purple-200 flex items-center gap-1">
                            <span>Field Completeness</span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full border transition-colors ${
                                completenessScore >= 80
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700 shadow-2xs"
                                    : completenessScore >= 40
                                    ? "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/80 dark:text-purple-200 dark:border-purple-700 shadow-2xs"
                                    : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700 shadow-2xs"
                            }`}>
                                {completenessScore >= 80 ? "Ready to Sync" : completenessScore >= 40 ? "In Progress" : "Initiating"}
                            </span>
                        </span>
                        <span className={`font-mono font-black text-xs transition-colors ${
                            completenessScore >= 80 ? "text-emerald-600 dark:text-emerald-400" :
                            completenessScore >= 40 ? "text-purple-600 dark:text-purple-400" : "text-amber-600 dark:text-amber-400"
                        }`}>
                            {completenessScore}%
                        </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-200 dark:bg-purple-950/80 rounded-full overflow-hidden p-0.5 border border-purple-200/60 dark:border-purple-800/50 shadow-inner">
                        <motion.div
                            className={`h-full rounded-full shadow-sm ${
                                completenessScore >= 80
                                    ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500"
                                    : completenessScore >= 40
                                    ? "bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500"
                                    : completenessScore > 0
                                    ? "bg-gradient-to-r from-amber-500 to-orange-400"
                                    : "bg-transparent"
                            }`}
                            initial={{ width: "0%" }}
                            animate={{ width: `${Math.max(completenessScore, 4)}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>
                </div>
            </div>

            {/* Extracted Fields List / Editor */}
            <div className="flex-1 p-2 overflow-y-auto space-y-1.5 min-h-0 bg-slate-50/20 dark:bg-transparent">
                {/* Name */}
                <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-purple-950/25 border border-purple-200/50 dark:border-purple-900/40 space-y-1 transition-all shadow-2xs hover:border-purple-300 dark:hover:border-purple-700">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-extrabold text-slate-600 dark:text-purple-300 flex items-center gap-1.5">
                            <User size={12} className="text-purple-600 dark:text-purple-400" />
                            Full Name <span className="text-pink-500">*</span>
                        </label>
                        {getConfidenceBadge("Full_Name")}
                    </div>
                    {isReviewing ? (
                        <input
                            type="text"
                            value={fullNameVal}
                            onChange={(e) => {
                                handleFieldChange("Full_Name", e.target.value);
                                handleFieldChange("full_name", e.target.value);
                                handleFieldChange("Last_Name", e.target.value);
                            }}
                            placeholder="Enter contact name"
                            className="w-full bg-white dark:bg-[#1a1435] text-slate-900 dark:text-slate-100 px-3 py-1.5 rounded-xl text-xs border border-purple-200 dark:border-purple-800 outline-none focus:ring-2 focus:ring-purple-400 shadow-inner"
                        />
                    ) : (
                        <p className="text-xs font-bold text-slate-900 dark:text-purple-100">
                            {fullNameVal || (
                                <span className="text-slate-400 dark:text-purple-300/40 italic font-normal">Empty</span>
                            )}
                        </p>
                    )}
                </div>

                {/* Company */}
                <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-purple-950/25 border border-purple-200/50 dark:border-purple-900/40 space-y-1 transition-all shadow-2xs hover:border-purple-300 dark:hover:border-purple-700">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-extrabold text-slate-600 dark:text-purple-300 flex items-center gap-1.5">
                            <Building2 size={12} className="text-purple-600 dark:text-purple-400" />
                            Company Name <span className="text-pink-500">*</span>
                        </label>
                        {getConfidenceBadge("Company")}
                    </div>
                    {isReviewing ? (
                        <input
                            type="text"
                            value={companyVal}
                            onChange={(e) => {
                                handleFieldChange("Company", e.target.value);
                                handleFieldChange("company_name", e.target.value);
                            }}
                            placeholder="Enter company name"
                            className="w-full bg-white dark:bg-[#1a1435] text-slate-900 dark:text-slate-100 px-3 py-1.5 rounded-xl text-xs border border-purple-200 dark:border-purple-800 outline-none focus:ring-2 focus:ring-purple-400 shadow-inner"
                        />
                    ) : (
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-purple-100 truncate">
                                {companyVal || (
                                    <span className="text-slate-400 dark:text-purple-300/40 italic font-normal">Empty</span>
                                )}
                            </p>
                            {(companyVal || fullNameVal) && (
                                <button
                                    onClick={handleSearchGrounding}
                                    disabled={isSearchingGrounding}
                                    className="btn-spring px-2 py-1 rounded-lg text-[10px] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                                    title="Verify and enrich with real-time Google Search"
                                >
                                    {isSearchingGrounding ? (
                                        <RefreshCw size={10} className="animate-spin" />
                                    ) : (
                                        <Search size={10} />
                                    )}
                                    <span>{isSearchingGrounding ? "Searching..." : "Google Grounding"}</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* 🧠 GOOGLE SEARCH GROUNDING CARD */}
                {groundingData && (
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 border border-blue-200/60 dark:border-blue-800/40 space-y-2 shadow-xs transition-all">
                        <div
                            onClick={() => setIsGroundingExpanded(!isGroundingExpanded)}
                            className="flex items-center justify-between cursor-pointer"
                        >
                            <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                                <Globe size={13} className="text-blue-600 dark:text-blue-400" />
                                <span className="text-[11px] font-extrabold uppercase tracking-wide">
                                    Google Search Grounded Intelligence
                                </span>
                            </div>
                            <button className="text-blue-600 dark:text-blue-400">
                                {isGroundingExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                        </div>

                        {isGroundingExpanded && (
                            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-200 pt-1 border-t border-blue-200/30 dark:border-blue-800/30">
                                <div className="p-2 rounded-xl bg-white/80 dark:bg-[#181530]/80 border border-blue-100 dark:border-blue-900/40 text-[11px] leading-relaxed max-h-40 overflow-y-auto whitespace-pre-line shadow-inner">
                                    {groundingData.overview}
                                </div>

                                {groundingData.sources && groundingData.sources.length > 0 && (
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                            <BookOpen size={10} />
                                            Verified Web Citations:
                                        </span>
                                        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                                            {groundingData.sources.map((src, idx) => (
                                                <a
                                                    key={src.url || `grounding-src-${idx}`}
                                                    href={src.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-100/70 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 hover:underline border border-blue-200 dark:border-blue-800/60 truncate max-w-[200px]"
                                                >
                                                    <ExternalLink size={9} />
                                                    <span className="truncate">{src.title || src.url}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {groundingError && (
                    <div className="p-2 rounded-xl bg-red-500/10 border border-red-200 dark:border-red-900/40 text-[10px] text-red-600 dark:text-red-300 flex items-center gap-1.5">
                        <AlertCircle size={12} />
                        <span>{groundingError}</span>
                    </div>
                )}

                {/* Contact Coordinates (Phone & Email Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Phone */}
                    <div className={`p-2.5 rounded-2xl transition-all space-y-1 shadow-2xs ${
                        hasPhoneError
                            ? "bg-rose-50/50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800/80 hover:border-rose-400 dark:hover:border-rose-700"
                            : "bg-white/70 dark:bg-purple-950/25 border border-purple-200/50 dark:border-purple-900/40 hover:border-purple-300 dark:hover:border-purple-700"
                    }`}>
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-extrabold text-slate-600 dark:text-purple-300 flex items-center gap-1">
                                <Phone size={11} className={hasPhoneError ? "text-rose-500 dark:text-rose-400" : "text-purple-600 dark:text-purple-400"} />
                                Phone
                            </label>
                            {hasPhoneError ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-rose-100/90 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shadow-2xs">
                                    <AlertCircle size={9} />
                                    Invalid Length
                                </span>
                            ) : (
                                getConfidenceBadge("Phone")
                            )}
                        </div>
                        {isReviewing ? (
                            <input
                                type="text"
                                value={phoneVal}
                                onChange={(e) => {
                                    handleFieldChange("Phone", e.target.value);
                                    handleFieldChange("phone", e.target.value);
                                }}
                                placeholder="Phone number (min 7 digits)"
                                className={`w-full bg-white dark:bg-[#1a1435] text-slate-900 dark:text-slate-100 px-2.5 py-1 rounded-xl text-xs outline-none focus:ring-2 shadow-inner ${
                                    hasPhoneError
                                        ? "border border-rose-400 dark:border-rose-700 focus:ring-rose-400"
                                        : "border border-purple-200 dark:border-purple-800 focus:ring-purple-400"
                                }`}
                            />
                        ) : (
                            <p className={`text-xs font-mono font-bold truncate ${
                                hasPhoneError ? "text-rose-700 dark:text-rose-300" : "text-slate-900 dark:text-purple-200"
                            }`}>
                                {phoneVal || <span className="text-slate-400 dark:text-purple-300/40 italic font-normal">Empty</span>}
                            </p>
                        )}
                        {hasPhoneError && (
                            <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 pt-0.5 leading-tight animate-in fade-in">
                                <AlertCircle size={10} className="shrink-0 text-rose-500" />
                                <span>{validationErrors.Phone}</span>
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className={`p-2.5 rounded-2xl transition-all space-y-1 shadow-2xs ${
                        hasEmailError
                            ? "bg-rose-50/50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800/80 hover:border-rose-400 dark:hover:border-rose-700"
                            : "bg-white/70 dark:bg-purple-950/25 border border-purple-200/50 dark:border-purple-900/40 hover:border-purple-300 dark:hover:border-purple-700"
                    }`}>
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-extrabold text-slate-600 dark:text-purple-300 flex items-center gap-1">
                                <Mail size={11} className={hasEmailError ? "text-rose-500 dark:text-rose-400" : "text-purple-600 dark:text-purple-400"} />
                                Email
                            </label>
                            {hasEmailError ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-rose-100/90 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shadow-2xs">
                                    <AlertCircle size={9} />
                                    Invalid Format
                                </span>
                            ) : (
                                getConfidenceBadge("Email")
                            )}
                        </div>
                        {isReviewing ? (
                            <input
                                type="email"
                                value={emailVal}
                                onChange={(e) => {
                                    handleFieldChange("Email", e.target.value);
                                    handleFieldChange("email", e.target.value);
                                }}
                                placeholder="Email address (name@company.com)"
                                className={`w-full bg-white dark:bg-[#1a1435] text-slate-900 dark:text-slate-100 px-2.5 py-1 rounded-xl text-xs outline-none focus:ring-2 shadow-inner ${
                                    hasEmailError
                                        ? "border border-rose-400 dark:border-rose-700 focus:ring-rose-400"
                                        : "border border-purple-200 dark:border-purple-800 focus:ring-purple-400"
                                }`}
                            />
                        ) : (
                            <p className={`text-xs font-bold truncate ${
                                hasEmailError ? "text-rose-700 dark:text-rose-300" : "text-slate-900 dark:text-purple-200"
                            }`}>
                                {emailVal || <span className="text-slate-400 dark:text-purple-300/40 italic font-normal">Empty</span>}
                            </p>
                        )}
                        {hasEmailError && (
                            <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 pt-0.5 leading-tight animate-in fade-in">
                                <AlertCircle size={10} className="shrink-0 text-rose-500" />
                                <span>{validationErrors.Email}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Product / Requirement */}
                <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-purple-950/25 border border-purple-200/50 dark:border-purple-900/40 space-y-1 shadow-2xs hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-extrabold text-slate-600 dark:text-purple-300 flex items-center gap-1.5">
                            <Package size={12} className="text-purple-600 dark:text-purple-400" />
                            Product / Service Interest
                        </label>
                        {getConfidenceBadge("Product")}
                    </div>
                    {isReviewing ? (
                        <input
                            type="text"
                            value={productVal}
                            onChange={(e) => {
                                handleFieldChange("Product", e.target.value);
                                handleFieldChange("product_service_interest", e.target.value);
                            }}
                            placeholder="Product interest"
                            className="w-full bg-white dark:bg-[#1a1435] text-slate-900 dark:text-slate-100 px-3 py-1.5 rounded-xl text-xs border border-purple-200 dark:border-purple-800 outline-none focus:ring-2 focus:ring-purple-400 shadow-inner"
                        />
                    ) : (
                        <p className="text-xs font-semibold text-slate-900 dark:text-purple-200">
                            {productVal || <span className="text-slate-400 dark:text-purple-300/40 italic font-normal">Pending</span>}
                        </p>
                    )}
                </div>

                {/* Industry & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-purple-950/25 border border-purple-200/50 dark:border-purple-900/40 space-y-1 shadow-2xs hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-extrabold text-slate-400 dark:text-purple-400 uppercase flex items-center gap-1">
                                <Briefcase size={11} />
                                Industry
                            </label>
                            {getConfidenceBadge("Industry")}
                        </div>
                        {isReviewing ? (
                            <input
                                type="text"
                                value={industryVal}
                                onChange={(e) => {
                                    handleFieldChange("Industry", e.target.value);
                                    handleFieldChange("industry", e.target.value);
                                }}
                                placeholder="Industry"
                                className="w-full bg-white dark:bg-[#1a1435] text-slate-900 dark:text-slate-100 px-2.5 py-1 rounded-xl text-xs border border-purple-200 dark:border-purple-800 outline-none focus:ring-2 focus:ring-purple-400 shadow-inner"
                            />
                        ) : (
                            <p className="text-xs font-semibold text-slate-900 dark:text-purple-200 truncate">
                                {industryVal || <span className="text-slate-400 dark:text-purple-300/40 italic font-normal">Empty</span>}
                            </p>
                        )}
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-purple-950/25 border border-purple-200/50 dark:border-purple-900/40 space-y-1 shadow-2xs hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-extrabold text-slate-400 dark:text-purple-400 uppercase flex items-center gap-1">
                                <MapPin size={11} />
                                Location / City
                            </label>
                            {getConfidenceBadge("City")}
                        </div>
                        {isReviewing ? (
                            <input
                                type="text"
                                value={cityVal}
                                onChange={(e) => {
                                    handleFieldChange("City", e.target.value);
                                    handleFieldChange("location_city", e.target.value);
                                }}
                                placeholder="Location or City"
                                className="w-full bg-white dark:bg-[#1a1435] text-slate-900 dark:text-slate-100 px-2.5 py-1 rounded-xl text-xs border border-purple-200 dark:border-purple-800 outline-none focus:ring-2 focus:ring-purple-400 shadow-inner"
                            />
                        ) : (
                            <p className="text-xs font-semibold text-slate-900 dark:text-purple-200 truncate">
                                {cityVal || <span className="text-slate-400 dark:text-purple-300/40 italic font-normal">Empty</span>}
                            </p>
                        )}
                    </div>
                </div>

                {/* Conversation Requirement Description */}
                <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-purple-950/25 border border-purple-200/50 dark:border-purple-900/40 space-y-1 shadow-2xs hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-extrabold text-slate-600 dark:text-purple-300 flex items-center gap-1.5">
                            <FileText size={12} className="text-purple-600 dark:text-purple-400" />
                            Customer Requirement / Scope
                        </label>
                        {getConfidenceBadge("Description")}
                    </div>
                    {isReviewing ? (
                        <textarea
                            value={reqVal}
                            onChange={(e) => {
                                handleFieldChange("Description", e.target.value);
                                handleFieldChange("Customer_Requirement", e.target.value);
                                handleFieldChange("customer_requirement_scope", e.target.value);
                            }}
                            rows={2}
                            placeholder="Requirement notes..."
                            className="w-full bg-white dark:bg-[#1a1435] text-slate-900 dark:text-slate-100 p-2 rounded-xl text-xs border border-purple-200 dark:border-purple-800 outline-none focus:ring-2 focus:ring-purple-400 shadow-inner"
                        />
                    ) : (
                        <p className="text-xs text-slate-700 dark:text-purple-200 leading-relaxed font-normal">
                            {reqVal || (
                                <span className="text-slate-400 dark:text-purple-300/40 italic font-normal">
                                    Pending conversation requirement detection...
                                </span>
                            )}
                        </p>
                    )}
                </div>
            </div>

            {/* Local Warning Notification Banner (e.g. No Lead Data Available) */}
            {localWarning && (
                <div className="mx-3 mb-2 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-2 shadow-xs animate-in fade-in backdrop-blur-xs">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                        <span className="font-semibold text-[11px]">{localWarning}</span>
                    </div>
                    <button
                        onClick={() => setLocalWarning(null)}
                        className="text-[10px] underline font-bold hover:text-amber-950 dark:hover:text-white cursor-pointer"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Error Notification Banner */}
            {saveError && (
                <div className="mx-3 mb-2 p-2.5 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-700 dark:text-pink-300 text-xs flex items-center justify-between gap-2 shadow-xs animate-in fade-in backdrop-blur-xs">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={14} className="shrink-0 text-pink-500" />
                        <span className="font-semibold text-[11px]">{saveError}</span>
                    </div>
                    <button
                        onClick={onClearError}
                        className="text-[10px] underline font-bold hover:text-pink-900 cursor-pointer"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Success Notification Banner */}
            {savedLeadResult && (
                <div className="mx-3 mb-2 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between gap-2 shadow-xs animate-in fade-in backdrop-blur-xs">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
                        <div>
                            <p className="font-extrabold text-[11px]">Lead already saved to Zoho CRM</p>
                            <p className="text-[10px] opacity-80">Lead ID: {savedLeadResult.id || "RECORD-CREATED"}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleOpenInZoho}
                        className="btn-spring flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[10px] font-extrabold hover:bg-emerald-700 cursor-pointer shadow-xs"
                    >
                        <span>Open</span>
                        <ExternalLink size={10} />
                    </button>
                </div>
            )}

            {/* Action Buttons: Save to Zoho CRM & Reset */}
            <div className="p-3 border-t border-purple-200/40 dark:border-purple-900/40 bg-white/40 dark:bg-purple-950/20 flex items-center gap-2 backdrop-blur-md">
                <button
                    id="btn-save-zoho-lead"
                    onClick={handleSave}
                    disabled={isSaving || Boolean(savedLeadResult) || !isFormValid}
                    title={
                        isSaving
                            ? "Saving lead to Zoho CRM..."
                            : savedLeadResult
                            ? "This lead has already been saved to Zoho CRM"
                            : !hasLead
                            ? "No lead data available to save"
                            : !isFormValid
                            ? `Please fix form validation errors (${[validationErrors.Email, validationErrors.Phone].filter(Boolean).join(", ")}) before saving`
                            : "Save Lead to Zoho CRM"
                    }
                    className={`btn-spring flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-white font-extrabold text-xs shadow-md transition-all active:scale-95 ${
                        savedLeadResult
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 cursor-not-allowed opacity-90 shadow-emerald-500/20"
                            : !isFormValid || !hasLead
                            ? "bg-gradient-to-r from-slate-400 to-purple-400 dark:from-purple-950/80 dark:to-purple-900/80 opacity-60 cursor-not-allowed shadow-none border border-slate-300 dark:border-purple-800 text-slate-100 dark:text-purple-200"
                            : "bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 hover:opacity-95 shadow-purple-500/25 cursor-pointer"
                    }`}
                >
                    {isSaving ? (
                        <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : savedLeadResult ? (
                        <>
                            <CheckCircle2 size={13} className="text-emerald-200" />
                            <span>Lead Saved to Zoho CRM</span>
                        </>
                    ) : !isFormValid && hasLead ? (
                        <>
                            <AlertCircle size={13} className="text-amber-200" />
                            <span>Fix Errors to Save</span>
                        </>
                    ) : (
                        <>
                            <Save size={13} />
                            <span>Save Lead to Zoho CRM</span>
                        </>
                    )}
                </button>

                <button
                    id="btn-lead-discard-data"
                    onClick={handleDiscardLead}
                    title="Delete and Discard Conversation & Extracted Lead Data"
                    className="btn-spring p-2.5 rounded-2xl bg-white/70 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800 text-slate-500 dark:text-purple-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
}

export default LeadIntelligencePanel;

