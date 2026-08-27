/**
 * Web Audio DTMF & Telephony Sound Synthesizer + Web Speech API Interface
 */

// DTMF Frequencies (Dual-Tone Multi-Frequency)
const DTMF_FREQS = {
    "1": [697, 1209],
    "2": [697, 1336],
    "3": [697, 1477],
    "4": [770, 1209],
    "5": [770, 1336],
    "6": [770, 1477],
    "7": [852, 1209],
    "8": [852, 1336],
    "9": [852, 1477],
    "*": [941, 1209],
    "0": [941, 1336],
    "#": [941, 1477]
};

let audioCtx = null;

function getAudioContext() {
    if (typeof window === "undefined") return null;
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
    }
    return audioCtx;
}

export function playDTMFTone(digit) {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const freqs = DTMF_FREQS[digit];
        if (!freqs) return;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.value = freqs[0];
        osc2.frequency.value = freqs[1];

        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.16);
        osc2.stop(ctx.currentTime + 0.16);
    } catch {
        // Audio policy or silent fail
    }
}

let activeRingtoneAudio = null;
let activeSynthRingtoneTimer = null;

export function stopRingtone() {
    try {
        if (activeRingtoneAudio) {
            activeRingtoneAudio.pause();
            activeRingtoneAudio.currentTime = 0;
            activeRingtoneAudio = null;
        }
    } catch {
        // Ignore pause errors
    }

    if (activeSynthRingtoneTimer) {
        clearInterval(activeSynthRingtoneTimer);
        activeSynthRingtoneTimer = null;
    }
}

/**
 * Play digital inbound ringtone using audio file (standard_ringtone19.mp3) with fallback to synthesized Web Audio
 */
export function playRingtone({ loop = true, volume = 0.65, ringtoneUrl = "standard_ringtone19.mp3" } = {}) {
    stopRingtone();

    if (typeof window === "undefined") {
        return () => {};
    }

    try {
        // Build relative asset path safely
        const normalizedUrl = ringtoneUrl.startsWith("/") ? ringtoneUrl.slice(1) : ringtoneUrl;
        const resolvedUrl = typeof window !== "undefined" && window.location ? `${window.location.origin}/${normalizedUrl}` : ringtoneUrl;
        const audio = new Audio(resolvedUrl);
        audio.loop = loop;
        audio.volume = Math.max(0, Math.min(1, volume));
        activeRingtoneAudio = audio;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Autoplay blocked by browser or audio file unavailable -> seamless Web Audio oscillator fallback
                playSynthesizedRingtoneLoop(loop);
            });
        }

        return () => {
            stopRingtone();
        };
    } catch {
        playSynthesizedRingtoneLoop(loop);
        return () => {
            stopRingtone();
        };
    }
}

/**
 * Play a single preview cycle of the inbound ringtone
 */
export function previewRingtone(ringtoneUrl = "/standard_ringtone19.mp3") {
    return playRingtone({ loop: false, volume: 0.7, ringtoneUrl });
}

function playSynthesizedRingtoneLoop(loop = true) {
    playSynthesizedRingtoneBurst();
    if (loop) {
        activeSynthRingtoneTimer = setInterval(() => {
            playSynthesizedRingtoneBurst();
        }, 3500);
    }
}

function playSynthesizedRingtoneBurst() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        
        const now = ctx.currentTime;

        // Burst 1 (0 to 0.75s)
        triggerDigitalChime(ctx, now, 0.75);
        // Burst 2 (1.05s to 1.80s)
        triggerDigitalChime(ctx, now + 1.05, 0.75);
    } catch {
        // Silent fail for audio policy
    }
}

function triggerDigitalChime(ctx, startTime, duration) {
    try {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(753, startTime);
        osc2.frequency.setValueAtTime(857, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.08, startTime + 0.04);
        gain.gain.setValueAtTime(0.08, startTime + duration - 0.06);
        gain.gain.linearRampToValueAtTime(0.0001, startTime + duration);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + duration);
        osc2.stop(startTime + duration);
    } catch {
        // Ignore audio errors
    }
}

/**
 * Web Speech API Live Microphone Listener
 */
export function createSpeechRecognitionListener(onResult, onError) {
    if (typeof window === "undefined") return null;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        return null;
    }

    try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
            let interimTranscript = "";
            let finalTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (onResult) {
                onResult({
                    final: finalTranscript.trim(),
                    interim: interimTranscript.trim()
                });
            }
        };

        recognition.onerror = (event) => {
            // 'no-speech' and 'aborted' are normal lifecycle events when user pauses speaking or mic stops
            if (event.error === "no-speech" || event.error === "aborted") {
                return;
            }
            console.warn("Speech recognition notice:", event.error);
            if (onError) onError(event.error);
        };

        return recognition;
    } catch (err) {
        console.warn("Could not create SpeechRecognition:", err);
        return null;
    }
}
