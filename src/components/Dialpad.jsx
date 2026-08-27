import {
    Delete,
    Phone
} from "lucide-react";

function Dialpad({
    number,
    onDigit,
    onDelete,
    onCall
}) {
    const buttons = [
        "1", "2", "3",
        "4", "5", "6",
        "7", "8", "9",
        "*", "0", "#"
    ];
    return (
        <div className="glass-panel rounded-3xl p-4 space-y-3 w-full max-w-[280px] mx-auto shadow-lg">
            <div className="p-3 bg-white/70 dark:bg-purple-950/40 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 text-center font-mono font-extrabold text-base text-slate-900 dark:text-purple-100 min-h-[46px] flex items-center justify-center shadow-inner tracking-wider">
                {number || (
                    <span className="text-slate-400 dark:text-purple-300/40 font-normal text-xs font-sans">
                        Enter number...
                    </span>
                )}
            </div>
            <div className="grid grid-cols-3 gap-2">
                {buttons.map(
                    digit => (
                        <button
                            key={digit}
                            onClick={() =>
                                onDigit(
                                    digit
                                )
                            }
                            className="btn-spring h-11 rounded-2xl bg-white/80 dark:bg-purple-950/30 hover:bg-white dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-800/40 text-slate-800 dark:text-purple-100 font-bold text-sm transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-2xs group"
                        >
                            <span className="group-hover:text-purple-600 dark:group-hover:text-pink-400 transition-colors">
                                {digit}
                            </span>
                        </button>
                    )
                )}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                    className="btn-spring py-2.5 rounded-2xl bg-white/80 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800 text-slate-600 dark:text-purple-300 hover:text-pink-500 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs"
                    onClick={onDelete}
                    title="Backspace"
                >
                    <Delete size={16} />
                </button>
                <button
                    className="btn-spring py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    onClick={onCall}
                    title="Call"
                >
                    <Phone size={15} />
                    <span>Call</span>
                </button>
            </div>
        </div>
    );
}
export default Dialpad;
