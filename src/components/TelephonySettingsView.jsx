import { useState, useEffect } from "react";
import {
    Settings,
    Mic,
    Volume2,
    Save,
    Bell,
    Play,
    Square
} from "lucide-react";
import { playRingtone, stopRingtone } from "../services/telephonyManager";

function TelephonySettingsView() {
    const [audioInput, setAudioInput] = useState("Default Microphone (Built-in WebRTC)");
    const [audioOutput, setAudioOutput] = useState("Default Headphones (Built-in Audio)");
    const [ringtoneName, setRingtoneName] = useState("Standard Ringtone 19 (standard_ringtone19.mp3)");
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);
    const [autoAnswer, setAutoAnswer] = useState(false);
    const [noiseSuppression, setNoiseSuppression] = useState(true);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        return () => {
            stopRingtone();
        };
    }, []);

    const handleTogglePreview = () => {
        if (isPlayingPreview) {
            stopRingtone();
            setIsPlayingPreview(false);
        } else {
            setIsPlayingPreview(true);
            playRingtone({ loop: false, volume: 0.7 });
            setTimeout(() => {
                setIsPlayingPreview(false);
            }, 4000);
        }
    };

    const handleSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="glass-panel rounded-3xl p-6 h-full flex flex-col shadow-sm dark:shadow-xl dark:shadow-black/40 space-y-6 overflow-y-auto transition-all duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-purple-200/40 dark:border-purple-900/30">
                <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-white shadow-sm">
                            <Settings size={14} />
                        </div>
                        RingCentral Telephony & Audio Configuration
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-purple-300/70 mt-0.5">
                        Manage WebRTC audio streams, codecs, and CTI softphone parameters
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    className="btn-spring flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 hover:opacity-95 text-white text-xs font-extrabold shadow-md shadow-purple-500/25 transition-all active:scale-95 cursor-pointer"
                >
                    <Save size={14} />
                    <span>{isSaved ? "Saved" : "Save Settings"}</span>
                </button>
            </div>

            <div className="max-w-2xl space-y-5">
                {/* Audio Devices */}
                <div className="space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-800 dark:text-purple-200 uppercase tracking-wide">
                        Audio Device Routing
                    </h3>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-purple-300 flex items-center gap-1.5">
                                <Mic size={13} className="text-purple-600 dark:text-purple-400" />
                                Microphone (Input)
                            </label>
                            <select
                                value={audioInput}
                                onChange={(e) => setAudioInput(e.target.value)}
                                className="w-full bg-white/70 dark:bg-purple-950/40 p-3 rounded-2xl text-xs border border-purple-200/60 dark:border-purple-800/50 outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-purple-100 cursor-pointer shadow-inner"
                            >
                                <option value="Default Microphone (Built-in WebRTC)">Default Microphone (Built-in WebRTC)</option>
                                <option value="USB Headset Microphone">USB Headset Microphone (Plantronics/Jabra)</option>
                                <option value="Virtual Audio Device">Virtual Audio Device Line-In</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-purple-300 flex items-center gap-1.5">
                                <Volume2 size={13} className="text-purple-600 dark:text-purple-400" />
                                Speaker / Headset (Output)
                            </label>
                            <select
                                value={audioOutput}
                                onChange={(e) => setAudioOutput(e.target.value)}
                                className="w-full bg-white/70 dark:bg-purple-950/40 p-3 rounded-2xl text-xs border border-purple-200/60 dark:border-purple-800/50 outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-purple-100 cursor-pointer shadow-inner"
                            >
                                <option value="Default Headphones (Built-in Audio)">Default Headphones (Built-in Audio)</option>
                                <option value="External Speakers (Realtek Audio)">External Speakers (Realtek Audio)</option>
                                <option value="Communications Headset (Stereo)">Communications Headset (Stereo)</option>
                            </select>
                        </div>

                        {/* Inbound Call Ringtone */}
                        <div className="space-y-1 pt-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-purple-300 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <Bell size={13} className="text-pink-500" />
                                    Inbound Call Ringtone
                                </span>
                                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                                    Plays on incoming call
                                </span>
                            </label>
                            <div className="flex items-center gap-2">
                                <select
                                    value={ringtoneName}
                                    onChange={(e) => setRingtoneName(e.target.value)}
                                    className="flex-1 bg-white/70 dark:bg-purple-950/40 p-3 rounded-2xl text-xs border border-purple-200/60 dark:border-purple-800/50 outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-purple-100 cursor-pointer shadow-inner"
                                >
                                    <option value="Standard Ringtone 19 (standard_ringtone19.mp3)">Standard Ringtone 19 (standard_ringtone19.mp3)</option>
                                    <option value="Digital IP PBX Electronic Ring">Digital IP PBX Electronic Ring</option>
                                    <option value="Classic Dual-Tone Bell">Classic Dual-Tone Bell</option>
                                    <option value="Modern Softphone Chime">Modern Softphone Chime</option>
                                </select>

                                <button
                                    type="button"
                                    onClick={handleTogglePreview}
                                    className={`btn-spring px-3.5 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0 ${
                                        isPlayingPreview
                                            ? "bg-rose-500 text-white shadow-rose-500/25 animate-pulse"
                                            : "bg-purple-100 dark:bg-purple-900/60 hover:bg-purple-200 dark:hover:bg-purple-800/70 text-purple-800 dark:text-purple-200 border border-purple-200/80 dark:border-purple-700/60 shadow-purple-500/10"
                                    }`}
                                    title={isPlayingPreview ? "Stop Ringtone Preview" : "Play Ringtone Preview"}
                                >
                                    {isPlayingPreview ? (
                                        <>
                                            <Square size={13} className="fill-current" />
                                            <span>Stop</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play size={13} className="fill-current text-purple-600 dark:text-purple-400" />
                                            <span>Preview</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call Handling Rules */}
                <div className="space-y-3 pt-3 border-t border-purple-200/40 dark:border-purple-900/30">
                    <h3 className="text-xs font-extrabold text-slate-800 dark:text-purple-200 uppercase tracking-wide">
                        Softphone Call Rules
                    </h3>

                    <div className="space-y-2">
                        <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/70 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors shadow-2xs">
                            <div>
                                <span className="text-xs font-bold text-slate-900 dark:text-purple-100">
                                    AI Noise Cancellation & Suppression
                                </span>
                                <p className="text-[11px] text-slate-500 dark:text-purple-300/60 mt-0.5">
                                    Filter background ambient contact center chatter
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={noiseSuppression}
                                onChange={(e) => setNoiseSuppression(e.target.checked)}
                                className="accent-purple-600 h-4 w-4 rounded cursor-pointer"
                            />
                        </label>

                        <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/70 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors shadow-2xs">
                            <div>
                                <span className="text-xs font-bold text-slate-900 dark:text-purple-100">
                                    Auto-Record All Inbound & Outbound Calls
                                </span>
                                <p className="text-[11px] text-slate-500 dark:text-purple-300/60 mt-0.5">
                                    Capture dual-channel Opus audio for AI Lead Extraction
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={true}
                                readOnly
                                className="accent-purple-600 h-4 w-4 rounded cursor-pointer"
                            />
                        </label>

                        <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/70 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors shadow-2xs">
                            <div>
                                <span className="text-xs font-bold text-slate-900 dark:text-purple-100">
                                    Auto-Answer Outbound Connects
                                </span>
                                <p className="text-[11px] text-slate-500 dark:text-purple-300/60 mt-0.5">
                                    Immediately bridge agent headset when customer picks up
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={autoAnswer}
                                onChange={(e) => setAutoAnswer(e.target.checked)}
                                className="accent-purple-600 h-4 w-4 rounded cursor-pointer"
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TelephonySettingsView;

