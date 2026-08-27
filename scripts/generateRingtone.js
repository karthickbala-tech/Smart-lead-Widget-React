// Script to generate a high-fidelity digital PBX telephone ringtone WAV file
import fs from 'fs';
import path from 'path';
import { Buffer } from 'node:buffer';

function generateRingtoneWAV() {
    const sampleRate = 44100;
    const duration = 6.0; // 6 second loop cycle
    const numSamples = Math.floor(sampleRate * duration);
    const numChannels = 2; // Stereo
    const bytesPerSample = 2; // 16-bit PCM
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;

    const buffer = Buffer.alloc(44 + dataSize);

    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);

    // 'fmt ' chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // subchunk1size (16 for PCM)
    buffer.writeUInt16LE(1, 20); // audioFormat (1 for PCM)
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(16, 34); // bitsPerSample

    // 'data' chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    let offset = 44;

    // Pattern: 
    // Burst 1: 0.0s to 0.75s (electronic phone ring chime)
    // Short gap: 0.75s to 1.05s
    // Burst 2: 1.05s to 1.80s (electronic phone ring chime)
    // Long gap: 1.80s to 6.00s (silence between rings)

    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        let sample = 0;

        const isBurst1 = t >= 0.05 && t < 0.85;
        const isBurst2 = t >= 1.15 && t < 1.95;

        if (isBurst1 || isBurst2) {
            const burstStart = isBurst1 ? 0.05 : 1.15;
            const bt = t - burstStart;
            const burstLen = 0.80;

            // Attack & Decay envelope
            let env = 1.0;
            if (bt < 0.04) {
                env = bt / 0.04;
            } else if (bt > burstLen - 0.05) {
                env = (burstLen - bt) / 0.05;
            }

            // Electronic digital phone warble:
            // Dual chime frequencies with 16Hz warble modulation (classic digital IP/PBX phone tone)
            const warble = Math.sin(2 * Math.PI * 16 * bt) * 0.25;
            const f1 = 753.0 + warble * 40.0;
            const f2 = 857.0 + warble * 40.0;
            const fSub = 440.0;

            // Synthesis with rich harmonics for authentic crystal clear digital telephone ring
            const tone1 = Math.sin(2 * Math.PI * f1 * bt);
            const tone2 = Math.sin(2 * Math.PI * f2 * bt);
            const tone3 = Math.sin(2 * Math.PI * (f1 * 2) * bt) * 0.15;
            const toneSub = Math.sin(2 * Math.PI * fSub * bt) * 0.2;

            // Rapid 25Hz trill characteristic of European/Digital PBX
            const trill = (Math.sin(2 * Math.PI * 25 * bt) > 0 ? 1.0 : 0.85);

            sample = (tone1 * 0.45 + tone2 * 0.45 + tone3 + toneSub) * env * trill * 0.7;
        }

        // Clip and write 16-bit PCM (Left & Right)
        const intSample = Math.max(-32767, Math.min(32767, Math.floor(sample * 32767)));
        buffer.writeInt16LE(intSample, offset);
        buffer.writeInt16LE(intSample, offset + 2);
        offset += 4;
    }

    const outPath = path.resolve('public/ringtone.wav');
    fs.writeFileSync(outPath, buffer);
    console.log(`Generated ringtone at ${outPath} (${buffer.length} bytes)`);
}

generateRingtoneWAV();
