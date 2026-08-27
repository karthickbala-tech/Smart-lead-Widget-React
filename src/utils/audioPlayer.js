/**
 * Resilient Audio Player for Gemini Voice and Browser TTS
 * Handles PCM/WAV/MP3 decoding, AudioContext, and seamless Web Speech API fallback.
 */

export function playAudioOrSpeak({ base64Audio, mimeType = "audio/wav", text = "", onStart, onEnd, onError }) {
    if (onStart) onStart();

    let isHandled = false;

    const cleanupAndEnd = () => {
        if (!isHandled) {
            isHandled = true;
            if (onEnd) onEnd();
        }
    };

    // 1. Try Browser HTML5 Audio with detected or provided MIME type if base64 exists
    if (base64Audio && base64Audio.length > 50) {
        try {
            // Try wav first, then mp3
            const audioMime = mimeType || (base64Audio.startsWith("UklGR") ? "audio/wav" : "audio/mp3");
            const audio = new Audio(`data:${audioMime};base64,${base64Audio}`);

            audio.onended = () => {
                cleanupAndEnd();
            };

            audio.onerror = (e) => {
                console.warn("[AudioPlayer] HTML5 Audio notice, falling back to Web Speech:", e);
                fallbackToWebSpeech(text, cleanupAndEnd, onError);
            };

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    console.warn("[AudioPlayer] Autoplay/format notice, falling back to Web Speech:", err);
                    fallbackToWebSpeech(text, cleanupAndEnd, onError);
                });
            }
            return;
        } catch (err) {
            console.warn("[AudioPlayer] Error creating audio element:", err);
        }
    }

    // 2. Fallback to Web Speech API
    fallbackToWebSpeech(text, cleanupAndEnd, onError);
}

function fallbackToWebSpeech(text, onEnd, onError) {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) {
        if (onEnd) onEnd();
        return;
    }

    try {
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        
        utterance.onend = () => {
            if (onEnd) onEnd();
        };

        utterance.onerror = (err) => {
            console.warn("[AudioPlayer] Speech synthesis notice:", err);
            if (onEnd) onEnd();
            if (onError) onError(err);
        };

        window.speechSynthesis.speak(utterance);
    } catch (e) {
        console.warn("[AudioPlayer] Speech synthesis exception:", e);
        if (onEnd) onEnd();
    }
}
