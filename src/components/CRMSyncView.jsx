import { useState, useEffect } from "react";
import { Database, CheckCircle2, RefreshCw, ShieldCheck, AlertCircle, ExternalLink, Code2, Sparkles, UserCheck, Building } from "lucide-react";
import zohoCRM from "../services/zohoCRM";

function CRMSyncView({ zohoUser }) {
    const [isTesting, setIsTesting] = useState(false);
    const [diagData, setDiagData] = useState(null);
    const [testLeadStatus, setTestLeadStatus] = useState(null);
    const [isInsertingTestLead, setIsInsertingTestLead] = useState(false);

    useEffect(() => {
        let isMounted = true;
        zohoCRM.testConnection().then((result) => {
            if (isMounted) {
                setDiagData(result);
            }
        }).catch(err => {
            console.warn("[CRMSyncView] Initial diagnostics warning:", err);
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const runDiagnostics = async () => {
        setIsTesting(true);
        try {
            const result = await zohoCRM.testConnection();
            setDiagData(result);
        } catch (e) {
            console.warn("[CRMSyncView] Diagnostics error:", e);
        } finally {
            setIsTesting(false);
        }
    };

    const handleCreateTestLead = async () => {
        setIsInsertingTestLead(true);
        setTestLeadStatus(null);
        try {
            const res = await zohoCRM.createLead({
                First_Name: "Zoho Test",
                Last_Name: "Lead " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                Company: "SmartLead AI Org",
                Phone: "+1 (555) 019-2831",
                Email: "verify.lead@smartlead.ai",
                Description: "Automated test lead dispatched from Zoho CRM Embedded App SDK verification suite.",
                Annual_Revenue: 150000,
                Lead_Source: "RingCentral CTI",
                Lead_Status: "New",
                Rating: "Warm"
            });
            setTestLeadStatus({
                success: true,
                isMock: res?.isMock,
                id: res?.id || res?.details?.id || "ZC-" + Date.now(),
                message: res?.message || (res?.isMock ? "Lead validated in Standalone Development Mode (Mock)." : "Lead record successfully created in Zoho CRM!")
            });
        } catch (err) {
            setTestLeadStatus({
                success: false,
                message: err?.message || "Verification failed. Check Zoho CRM widget manifest and user role permissions."
            });
        } finally {
            setIsInsertingTestLead(false);
        }
    };

    const FIELD_MAPPINGS = [
        { crmField: "Last_Name", label: "Last Name (Required)", aiSource: "NLP Name Entity Extractor", req: true },
        { crmField: "Company", label: "Company / Organization", aiSource: "Entity Extraction (Company)", req: true },
        { crmField: "Phone", label: "Phone (Direct / Mobile)", aiSource: "Caller ID (ANI) / Regex", req: false },
        { crmField: "Email", label: "Email Address", aiSource: "RFC 5322 Email Extractor", req: false },
        { crmField: "Description", label: "Requirement & Summary", aiSource: "AI Multi-Turn Synthesis", req: false },
        { crmField: "Designation", label: "Job Title", aiSource: "Role / Title Classifier", req: false },
        { crmField: "City", label: "Location / Territory", aiSource: "Geo Entity Recognition", req: false },
        { crmField: "Annual_Revenue", label: "Budget / Revenue", aiSource: "Currency Numeric Parser", req: false },
        { crmField: "Lead_Source", label: "Lead Source", aiSource: "Default ('RingCentral CTI')", req: false },
        { crmField: "Lead_Status", label: "Lead Status", aiSource: "Pipeline Classifier ('New')", req: false }
    ];

    const isLiveEmbedded = Boolean(diagData?.isEmbedded ?? zohoCRM.isEmbedded());
    const isApiAvailable = Boolean(diagData?.apiAvailable);

    return (
        <div className="glass-panel rounded-3xl p-6 h-full flex flex-col shadow-sm dark:shadow-xl dark:shadow-black/40 space-y-6 overflow-y-auto transition-all duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-200/40 dark:border-purple-900/30">
                <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-white shadow-sm">
                            <Database size={14} />
                        </div>
                        Zoho CRM Embedded App SDK & Field Mappings
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-purple-300/70 mt-0.5">
                        Real-time bi-directional synchronization between SmartLead AI Copilot and Zoho CRM API
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={runDiagnostics}
                        disabled={isTesting}
                        className="btn-spring flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white dark:bg-purple-950/60 hover:bg-slate-50 dark:hover:bg-purple-900/40 text-slate-700 dark:text-purple-200 border border-purple-200/60 dark:border-purple-800 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                    >
                        <RefreshCw size={13} className={isTesting ? "animate-spin" : ""} />
                        <span>{isTesting ? "Testing..." : "Test Connection"}</span>
                    </button>

                    <button
                        onClick={handleCreateTestLead}
                        disabled={isInsertingTestLead}
                        className="btn-spring flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 hover:opacity-95 disabled:opacity-50 text-white text-xs font-extrabold shadow-md shadow-purple-500/25 transition-all cursor-pointer"
                    >
                        <Sparkles size={13} className={isInsertingTestLead ? "animate-spin" : ""} />
                        <span>{isInsertingTestLead ? "Inserting..." : "Insert Test Lead"}</span>
                    </button>
                </div>
            </div>

            {/* Test Result Alert Banner if triggered */}
            {testLeadStatus && (
                <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                    testLeadStatus.success
                        ? testLeadStatus.isMock
                            ? "bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200"
                            : "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                        : "bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800 text-pink-900 dark:text-pink-200"
                }`}>
                    <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                            {testLeadStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            {testLeadStatus.success
                                ? testLeadStatus.isMock
                                    ? "Standalone Test Lead Validated (Mock Mode)"
                                    : "Test Lead Inserted Successfully in Zoho CRM"
                                : "Zoho CRM API Error Notice"}
                        </span>
                        {testLeadStatus.id && (
                            <span className="font-mono text-[10px] bg-white dark:bg-purple-950 px-2 py-0.5 rounded-md border">
                                ID: {testLeadStatus.id}
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                        {testLeadStatus.message}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Zoho SDK Connection Card */}
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 space-y-3 shadow-2xs hover-lift">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/80 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold shadow-2xs border border-purple-200 dark:border-purple-700">
                                <ShieldCheck size={16} />
                            </div>
                            <div>
                                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                                    Zoho SDK Engine
                                </h4>
                                <span className="text-[10px] text-slate-500 dark:text-purple-300/60 font-mono">
                                    v1.2 ZohoEmbeddedAppSDK
                                </span>
                            </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1 ${
                            isLiveEmbedded
                                ? isApiAvailable
                                    ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                    : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                : "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                        }`}>
                            <CheckCircle2 size={11} />
                            {isLiveEmbedded ? (isApiAvailable ? "Live Web Tab" : "API Restricted") : "Standalone Mode"}
                        </span>
                    </div>

                    <div className="pt-2 border-t border-purple-200/50 dark:border-purple-900/30 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-600 dark:text-purple-300">
                            <span>Environment:</span>
                            <span className="font-bold text-slate-900 dark:text-purple-100">
                                {isLiveEmbedded ? "Zoho CRM Iframe" : "Standalone Dev (Localhost)"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 dark:text-purple-300">
                            <span>CRM API Status:</span>
                            <span className={`font-bold ${isLiveEmbedded ? (isApiAvailable ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400") : "text-purple-600 dark:text-purple-400"}`}>
                                {isLiveEmbedded ? (isApiAvailable ? "Available (insertRecord OK)" : "Permissions Required") : "Mock Simulation"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Authenticated User */}
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 space-y-3 shadow-2xs hover-lift">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/80 text-violet-600 dark:text-violet-300 flex items-center justify-center font-bold shadow-2xs border border-violet-200 dark:border-violet-700">
                            <UserCheck size={16} />
                        </div>
                        <div>
                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                                {isLiveEmbedded ? "Authenticated CRM User" : "Developer Profile (Local)"}
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-purple-300/60">
                                {isLiveEmbedded ? "Live Zoho CRM Session" : "Local Development Mode"}
                            </p>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-purple-200/50 dark:border-purple-900/30 space-y-1 text-xs">
                        <div className="font-bold text-slate-900 dark:text-purple-100">
                            {diagData?.user?.full_name || zohoUser?.full_name || (isLiveEmbedded ? "Loading user..." : "Development User (Local Mode)")}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-purple-300/70 font-mono truncate">
                            {diagData?.user?.email || zohoUser?.email || (isLiveEmbedded ? "—" : "local.developer@smartlead.local")}
                        </div>
                        <div className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold pt-0.5">
                            Role: {diagData?.user?.role?.name || (isLiveEmbedded ? "Standard Agent" : "Local Developer")}
                        </div>
                    </div>
                </div>

                {/* Organization Details */}
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 space-y-3 shadow-2xs hover-lift">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-900/80 text-pink-600 dark:text-pink-300 flex items-center justify-center font-bold shadow-2xs border border-pink-200 dark:border-pink-700">
                            <Building size={16} />
                        </div>
                        <div>
                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                                Zoho CRM Org Context
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-purple-300/60">
                                Target Data Entity Module
                            </p>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-purple-200/50 dark:border-purple-900/30 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-600 dark:text-purple-300">
                            <span>Primary Entity:</span>
                            <span className="font-bold text-slate-900 dark:text-purple-100 font-mono">
                                Leads & Calls
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 dark:text-purple-300">
                            <span>Organization:</span>
                            <span className="font-bold text-purple-700 dark:text-pink-400 truncate max-w-[150px]">
                                {diagData?.org?.company_name || (isLiveEmbedded ? "Zoho CRM Org" : "Standalone Environment")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Field Mappings Table */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-800 dark:text-purple-200 uppercase tracking-wide">
                        AI to Zoho CRM Lead Schema Mappings
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-purple-300/70 font-medium">
                        Sanitized before ZOHO.CRM.API.insertRecord
                    </span>
                </div>

                <div className="border border-purple-200/60 dark:border-purple-900/40 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-white/80 dark:bg-purple-950/60 text-slate-700 dark:text-purple-300 font-extrabold border-b border-purple-200/60 dark:border-purple-900/40">
                            <tr>
                                <th className="p-3.5">Zoho CRM Field API Name</th>
                                <th className="p-3.5">Requirement</th>
                                <th className="p-3.5">AI Intelligence Source</th>
                                <th className="p-3.5">Sanitization Rule</th>
                                <th className="p-3.5">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-100 dark:divide-purple-900/30 bg-white/40 dark:bg-transparent">
                            {FIELD_MAPPINGS.map((m) => (
                                <tr key={m.crmField} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition-colors">
                                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-purple-100">
                                        {m.crmField}
                                        <span className="block font-sans font-normal text-[11px] text-slate-500 dark:text-purple-300/60">
                                            {m.label}
                                        </span>
                                    </td>
                                    <td className="p-3.5">
                                        {m.req ? (
                                             <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                                                Mandatory
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-slate-400">Optional</span>
                                        )}
                                    </td>
                                    <td className="p-3.5 text-slate-700 dark:text-purple-200 font-medium">
                                        {m.aiSource}
                                    </td>
                                    <td className="p-3.5 text-[11px] text-slate-500 dark:text-purple-300/70 font-mono">
                                        {m.crmField === "Annual_Revenue" ? "Cleaned Number" : m.crmField === "Email" ? "Strict RFC Check" : "Trimmed String"}
                                    </td>
                                    <td className="p-3.5">
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 size={12} /> Active
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Zoho CRM Deployment & Running Guide */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-purple-900/10 border border-purple-200/80 dark:border-purple-800/60 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white flex items-center justify-center font-bold shadow-xs">
                            <Sparkles size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                How to Run SmartLead Directly Inside Zoho CRM
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-purple-300/70">
                                Zero-configuration native embedding using official Zoho CRM SDK
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    {/* Method 1: Web Tab */}
                    <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-700 dark:text-purple-300">
                            <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-[10px]">1</span>
                            <span>Zoho CRM Web Tab (Fastest)</span>
                        </div>
                        <ol className="text-[11px] text-slate-600 dark:text-purple-200/80 space-y-1 list-decimal list-inside leading-relaxed">
                            <li>In Zoho CRM, click <strong>Settings (Gear) &gt; Modules and Fields &gt; Web Tabs</strong>.</li>
                            <li>Click <strong>Create Web Tab</strong> and name it <code className="bg-purple-100 dark:bg-purple-900/50 px-1 rounded font-mono">SmartLead AI</code>.</li>
                            <li>Set Link URL to this app&apos;s URL (e.g. your deployed URL).</li>
                            <li>Assign profiles &amp; save. Opens seamlessly inside your CRM!</li>
                        </ol>
                    </div>

                    {/* Method 2: Widget / Extension */}
                    <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-pink-700 dark:text-pink-300">
                            <span className="w-5 h-5 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center text-[10px]">2</span>
                            <span>Zoho Developer Widget</span>
                        </div>
                        <ol className="text-[11px] text-slate-600 dark:text-purple-200/80 space-y-1 list-decimal list-inside leading-relaxed">
                            <li>Go to <strong>Settings &gt; Developer Hub &gt; Widgets</strong>.</li>
                            <li>Click <strong>Create New Widget</strong>.</li>
                            <li>Select Hosting: <strong>External (URL)</strong> or package with <code className="bg-purple-100 dark:bg-purple-900/50 px-1 rounded font-mono">zet pack</code>.</li>
                            <li>Add to Lead details page or CTI Telephony drawer.</li>
                        </ol>
                    </div>

                    {/* Method 3: PhoneBridge Telephony */}
                    <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-[10px]">3</span>
                            <span>PhoneBridge CTI Softphone</span>
                        </div>
                        <ol className="text-[11px] text-slate-600 dark:text-purple-200/80 space-y-1 list-decimal list-inside leading-relaxed">
                            <li>Listens for <code className="bg-purple-100 dark:bg-purple-900/50 px-1 rounded font-mono">DialerActive</code> and <code className="bg-purple-100 dark:bg-purple-900/50 px-1 rounded font-mono">PageLoad</code> events.</li>
                            <li>Auto-populates caller ANI and customer context.</li>
                            <li>Creates Call logs &amp; Tasks directly in Zoho CRM Activities.</li>
                        </ol>
                    </div>
                </div>
            </div>

            {/* Zoho CRM Widget Developer Configuration Guide */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/10 border border-purple-200/80 dark:border-purple-900/40 text-xs space-y-3">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span className="flex items-center gap-1.5">
                        <Code2 size={15} className="text-purple-600 dark:text-purple-400" />
                        Zoho CRM Widget Manifest &amp; Permissions Configuration
                    </span>
                    <a
                        href="https://github.com/zoho/embeddedApp-js-sdk"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-purple-700 dark:text-pink-400 hover:underline font-semibold text-[11px]"
                    >
                        <span>SDK Reference Docs</span>
                        <ExternalLink size={12} />
                    </a>
                </div>

                <p className="text-slate-600 dark:text-purple-200/80 text-[11px] leading-relaxed">
                    When embedding this widget in Zoho CRM (e.g., via Zoho Extension Toolkit <code className="bg-white/80 dark:bg-purple-900/50 px-1 py-0.5 rounded font-mono">zet pack</code>, Developer Console, Web Tab, or Telephony CTI bar), the configured <code className="bg-white/80 dark:bg-purple-900/50 px-1 py-0.5 rounded font-mono">plugin-manifest.json</code> grants full access to the <strong className="text-slate-800 dark:text-purple-100">Leads</strong> and <strong className="text-slate-800 dark:text-purple-100">Calls</strong> modules.
                </p>

                <div className="p-3 bg-white/90 dark:bg-black/40 rounded-xl font-mono text-[11px] text-slate-800 dark:text-purple-200 border border-purple-200/60 dark:border-purple-900/50 space-y-1">
                    <div className="text-slate-400 dark:text-slate-500 font-sans text-[10px] uppercase font-bold">Configured Manifest Scopes in project:</div>
                    <div className="text-emerald-700 dark:text-emerald-400 font-bold">✓ ZOHO.embeddedApp.on(&quot;PageLoad&quot;) Handshake Registered</div>
                    <div className="text-emerald-700 dark:text-emerald-400 font-bold">✓ ZOHO.CRM.API.insertRecord with Entity: &quot;Leads&quot;, APIData: &#123;...&#125;</div>
                    <div className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Mandatory Fields (Last_Name, Company) auto-populated &amp; sanitized</div>
                </div>
            </div>
        </div>
    );
}

export default CRMSyncView;

