function StatusBar({
    callStatus,
    duration
}) {
    return (
        <div className="glass-panel px-4 py-2 rounded-2xl flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                    callStatus === "active"
                        ? "bg-emerald-500 animate-ping"
                        : callStatus === "ringing"
                        ? "bg-pink-500 animate-bounce"
                        : "bg-purple-400"
                }`} />
                <span className="text-[10px] uppercase font-extrabold text-slate-400 dark:text-purple-400 tracking-wider">
                    STATUS:
                </span>
                <strong className="text-slate-900 dark:text-purple-100 font-bold">
                    {callStatus === "active"
                        ? "Call in progress"
                        : callStatus === "ringing"
                            ? "Incoming call"
                            : "Softphone Idle & Ready"}
                </strong>
            </div>
            {callStatus === "active" && (
                <div className="font-mono text-purple-600 dark:text-pink-400 font-extrabold bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
                    {String(
                        Math.floor(
                            duration / 60
                        )
                    ).padStart(2, "0")}
                    :
                    {String(
                        duration % 60
                    ).padStart(2, "0")}
                </div>
            )}
        </div>
    );
}
export default StatusBar;