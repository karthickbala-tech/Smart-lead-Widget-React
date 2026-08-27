import { useState } from "react";
import { StickyNote, Save, CheckCircle2, User, Sparkles } from "lucide-react";

function NotesView({ activeCaller, keyPoints = [], onSaveNoteToCRM }) {
    const [noteContent, setNoteContent] = useState(
        "• Customer called regarding product integration.\n• Discussed licensing options and timeline.\n• Follow-up scheduled for next business day."
    );
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
        if (onSaveNoteToCRM) onSaveNoteToCRM(noteContent);
    };

    const handleInsertKeyPoints = () => {
        if (keyPoints.length > 0) {
            const formatted = keyPoints.map(p => `• ${p}`).join("\n");
            setNoteContent(prev => prev + "\n" + formatted);
        }
    };

    return (
        <div className="glass-panel rounded-3xl p-6 h-full flex flex-col shadow-sm dark:shadow-xl dark:shadow-black/40 space-y-4 overflow-hidden transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-200/40 dark:border-purple-900/30">
                <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-white shadow-sm">
                            <StickyNote size={14} />
                        </div>
                        Agent Notes & CRM Call Summary
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-purple-300/70 mt-0.5">
                        Scratchpad synced directly with Zoho CRM Notes Module
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleInsertKeyPoints}
                        className="btn-spring flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/80 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800 text-xs font-bold hover:bg-purple-50 dark:hover:bg-purple-900/40 cursor-pointer transition-all shadow-2xs"
                    >
                        <Sparkles size={13} className="text-pink-500" />
                        <span>Insert AI Bullet Points</span>
                    </button>

                    <button
                        onClick={handleSave}
                        className="btn-spring flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 hover:opacity-95 text-white text-xs font-extrabold shadow-md shadow-purple-500/25 transition-all active:scale-95 cursor-pointer"
                    >
                        {isSaved ? <CheckCircle2 size={13} /> : <Save size={13} />}
                        <span>{isSaved ? "Saved to Zoho CRM" : "Save Notes"}</span>
                    </button>
                </div>
            </div>

            {/* Caller details contextual pill */}
            {activeCaller && (
                <div className="p-3 rounded-2xl bg-white/70 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-900/40 flex items-center justify-between text-xs shadow-2xs">
                    <div className="flex items-center gap-2">
                        <User size={14} className="text-purple-600 dark:text-purple-400" />
                        <span className="font-extrabold text-slate-900 dark:text-purple-100">
                            Target Lead: {activeCaller.name || "Customer"}
                        </span>
                        <span className="text-purple-600 dark:text-purple-400 font-mono">({activeCaller.phone})</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-purple-300/70 font-semibold">
                        {activeCaller.company || "Prospective Client"}
                    </span>
                </div>
            )}

            {/* Textarea */}
            <div className="flex-1 flex flex-col">
                <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write agent remarks or add notes..."
                    className="w-full flex-1 p-4 rounded-2xl bg-white/70 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 text-slate-900 dark:text-purple-100 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-purple-500 font-mono resize-none shadow-inner"
                />
            </div>
        </div>
    );
}

export default NotesView;

