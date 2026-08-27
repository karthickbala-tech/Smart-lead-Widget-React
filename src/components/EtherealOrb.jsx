import { useEffect, useRef } from "react";

/**
 * EtherealVoiceOrb / Holographic Glass Wave Sphere
 * Replicates the mesmerizing 3D glass orb with glowing cyan & purple holographic
 * wave ribbons, ambient reflections, and dynamic audio-reactive physics.
 */
export function EtherealVoiceOrb({ size = "lg", active = false, className = "" }) {
    const canvasRef = useRef(null);

    // Dimension map for various sizes - compact and balanced
    const dimMap = {
        sm: { width: 70, height: 70, radius: 28 },
        compact: { width: 110, height: 110, radius: 44 },
        md: { width: 130, height: 130, radius: 52 },
        lg: { width: 160, height: 160, radius: 64 },
        xl: { width: 220, height: 220, radius: 88 }
    };

    const config = dimMap[size] || dimMap.lg;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId;
        let time = 0;

        // Retina / High-DPI screen support
        const dpr = window.devicePixelRatio || 1;
        canvas.width = config.width * dpr;
        canvas.height = config.height * dpr;
        ctx.scale(dpr, dpr);

        const cx = config.width / 2;
        const cy = config.height / 2 - 4; // slight upward bias for ground shadow
        const r = config.radius;

        // Background floating particles inside the orb
        const particles = Array.from({ length: 24 }, () => ({
            x: (Math.random() - 0.5) * r * 1.4,
            y: (Math.random() - 0.5) * r * 1.2,
            size: Math.random() * 1.5 + 0.5,
            speed: Math.random() * 0.3 + 0.1,
            alpha: Math.random() * 0.5 + 0.2
        }));

        const render = () => {
            time += active ? 0.035 : 0.016;

            ctx.clearRect(0, 0, config.width, config.height);

            // 1. Soft Floor Shadow & Violet Ground Reflection (Below the sphere)
            const shadowGrad = ctx.createRadialGradient(
                cx,
                cy + r + 14,
                2,
                cx,
                cy + r + 14,
                r * 1.1
            );
            shadowGrad.addColorStop(0, active ? "rgba(168, 85, 247, 0.45)" : "rgba(147, 51, 234, 0.25)");
            shadowGrad.addColorStop(0.5, "rgba(91, 33, 182, 0.12)");
            shadowGrad.addColorStop(1, "transparent");

            ctx.save();
            ctx.scale(1, 0.3);
            ctx.beginPath();
            ctx.arc(cx, (cy + r + 14) / 0.3, r * 1.1, 0, Math.PI * 2);
            ctx.fillStyle = shadowGrad;
            ctx.fill();
            ctx.restore();

            // 2. Ambient Outer Glow Halo
            const outerHalo = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r * 1.35);
            outerHalo.addColorStop(0, "transparent");
            outerHalo.addColorStop(0.7, active ? "rgba(168, 85, 247, 0.18)" : "rgba(139, 92, 246, 0.1)");
            outerHalo.addColorStop(1, "transparent");
            ctx.fillStyle = outerHalo;
            ctx.beginPath();
            ctx.arc(cx, cy, r * 1.35, 0, Math.PI * 2);
            ctx.fill();

            // 3. Clip strictly to the Glass Sphere interior
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.clip();

            // Inner dark space background with subtle deep purple radial gradient
            const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
            bgGrad.addColorStop(0, "#130f2c");
            bgGrad.addColorStop(0.6, "#0a081a");
            bgGrad.addColorStop(1, "#05040d");
            ctx.fillStyle = bgGrad;
            ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

            // Floating micro-star particles inside the sphere
            particles.forEach((p) => {
                p.y -= p.speed;
                if (p.y < -r * 0.8) p.y = r * 0.8;
                const distFromCenter = Math.sqrt(p.x * p.x + p.y * p.y);
                if (distFromCenter < r * 0.85) {
                    ctx.beginPath();
                    ctx.arc(cx + p.x, cy + p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(192, 132, 252, ${p.alpha * (0.8 + Math.sin(time * 2 + p.x) * 0.2)})`;
                    ctx.fill();
                }
            });

            // 4. 3D Holographic Undulating Waveform Ribbon Mesh
            // Generates multiple depth strands with dual crests and vertical filaments
            const numStrands = size === "sm" ? 8 : 18;
            const stepX = size === "sm" ? 4 : 2.5;
            const span = r * 1.82;
            const startX = cx - span / 2;
            const endX = cx + span / 2;

            const baseAmplitude = active ? r * 0.38 : r * 0.24;
            const speedMod = active ? 1.4 : 1.0;

            // Store point matrix to draw horizontal wave lines and vertical mesh lines
            const grid = [];

            for (let sIdx = 0; sIdx < numStrands; sIdx++) {
                const z = (sIdx / (numStrands - 1) - 0.5) * 2; // -1 to +1 depth
                const depthScale = 1 - Math.abs(z) * 0.22;
                const strandYOffset = z * (r * 0.18);
                const points = [];

                for (let x = startX; x <= endX; x += stepX) {
                    const normX = (x - cx) / (span / 2); // -1 to +1

                    // Spherical boundary dampening (tapers at the glass edge)
                    const sphereDamp = Math.max(0, 1 - normX * normX);

                    // Dual crest harmonic wave function
                    // Primary dual-crest wave + secondary breathing phase + depth offset
                    const wave1 = Math.sin(normX * Math.PI * 2.1 + time * speedMod + z * 1.2);
                    const wave2 = Math.cos(normX * Math.PI * 3.4 - time * 0.8 * speedMod + z * 0.8) * 0.45;
                    const wave3 = Math.sin(normX * Math.PI * 1.2 + time * 1.6 + sIdx * 0.15) * 0.25;

                    // Characteristic M-shape / dual-peak elevation (like the reference image)
                    const dualPeakEnvelope = Math.sin(Math.abs(normX) * Math.PI);
                    const combinedWave = (wave1 + wave2 + wave3) * (0.4 + 0.6 * dualPeakEnvelope);

                    const y = cy + strandYOffset - combinedWave * baseAmplitude * sphereDamp * depthScale;

                    points.push({ x, y, normX, z });
                }

                grid.push({ points, z, sIdx });
            }

            // Draw vertical connecting wireframe filaments (gives the luminous holographic grid/cage look)
            if (size !== "sm") {
                const colStep = 7;
                for (let pIdx = 0; pIdx < grid[0].points.length; pIdx += colStep) {
                    ctx.beginPath();
                    for (let sIdx = 0; sIdx < grid.length; sIdx++) {
                        const pt = grid[sIdx].points[pIdx];
                        if (pt) {
                            if (sIdx === 0) ctx.moveTo(pt.x, pt.y);
                            else ctx.lineTo(pt.x, pt.y);
                        }
                    }
                    const normX = grid[0].points[pIdx]?.normX || 0;
                    const filamentAlpha = Math.max(0, 0.12 * (1 - Math.abs(normX)));
                    ctx.strokeStyle = `rgba(168, 85, 247, ${filamentAlpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }

            // Draw horizontal ribbons
            grid.forEach(({ points, z, sIdx }) => {
                if (points.length < 2) return;

                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }

                // Ribbon gradient from Cyan/Teal on left/crests to Magenta/Violet on right/troughs
                const grad = ctx.createLinearGradient(startX, cy, endX, cy);
                const depthAlpha = 0.35 + (1 - Math.abs(z)) * 0.6;

                // Color stops matching reference image
                grad.addColorStop(0, `rgba(192, 132, 252, ${0.3 * depthAlpha})`);
                grad.addColorStop(0.2, `rgba(56, 189, 248, ${0.85 * depthAlpha})`);
                grad.addColorStop(0.5, `rgba(45, 212, 191, ${0.95 * depthAlpha})`);
                grad.addColorStop(0.75, `rgba(168, 85, 247, ${0.9 * depthAlpha})`);
                grad.addColorStop(1, `rgba(244, 114, 182, ${0.4 * depthAlpha})`);

                ctx.strokeStyle = grad;
                ctx.lineWidth = sIdx === Math.floor(numStrands / 2) ? 2.2 : 1.1;
                ctx.shadowColor = "rgba(56, 189, 248, 0.5)";
                ctx.shadowBlur = active ? 8 : 4;
                ctx.stroke();
                ctx.shadowBlur = 0; // reset
            });

            // Bright white-hot crest highlight along the top main waveform
            const mainStrand = grid[Math.floor(numStrands / 2)];
            if (mainStrand) {
                ctx.beginPath();
                ctx.moveTo(mainStrand.points[0].x, mainStrand.points[0].y);
                for (let i = 1; i < mainStrand.points.length; i++) {
                    ctx.lineTo(mainStrand.points[i].x, mainStrand.points[i].y);
                }
                const whiteCrestGrad = ctx.createLinearGradient(startX, cy, endX, cy);
                whiteCrestGrad.addColorStop(0.15, "rgba(255, 255, 255, 0.1)");
                whiteCrestGrad.addColorStop(0.35, "rgba(255, 255, 255, 0.95)");
                whiteCrestGrad.addColorStop(0.65, "rgba(255, 255, 255, 0.85)");
                whiteCrestGrad.addColorStop(0.9, "rgba(255, 255, 255, 0.1)");

                ctx.strokeStyle = whiteCrestGrad;
                ctx.lineWidth = 1.6;
                ctx.shadowColor = "#ffffff";
                ctx.shadowBlur = 6;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // 5. Glass Reflections & Specular Highlights
            // Top Crescent Specular Reflection (Characteristic glass reflection arc)
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(cx, cy - r * 0.58, r * 0.72, r * 0.28, 0, Math.PI, 0);
            const topGlassHighlight = ctx.createLinearGradient(cx, cy - r, cx, cy - r * 0.3);
            topGlassHighlight.addColorStop(0, "rgba(255, 255, 255, 0.4)");
            topGlassHighlight.addColorStop(0.4, "rgba(233, 213, 255, 0.15)");
            topGlassHighlight.addColorStop(1, "transparent");
            ctx.fillStyle = topGlassHighlight;
            ctx.fill();
            ctx.restore();

            // Inner rim lighting (Fresnel effect)
            const innerRim = ctx.createRadialGradient(cx, cy, r * 0.82, cx, cy, r);
            innerRim.addColorStop(0, "transparent");
            innerRim.addColorStop(0.85, "rgba(192, 132, 252, 0.15)");
            innerRim.addColorStop(1, "rgba(255, 255, 255, 0.5)");
            ctx.fillStyle = innerRim;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore(); // end clip

            // 6. Outer Glass Rim Perimeter Stroke & Top Edge Sparkle
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);

            const rimStrokeGrad = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
            rimStrokeGrad.addColorStop(0, "rgba(255, 255, 255, 0.85)");
            rimStrokeGrad.addColorStop(0.2, "rgba(216, 180, 254, 0.7)");
            rimStrokeGrad.addColorStop(0.6, "rgba(147, 51, 234, 0.25)");
            rimStrokeGrad.addColorStop(1, "rgba(192, 132, 252, 0.4)");

            ctx.strokeStyle = rimStrokeGrad;
            ctx.lineWidth = 1.6;
            ctx.shadowColor = "rgba(216, 180, 254, 0.6)";
            ctx.shadowBlur = active ? 10 : 6;
            ctx.stroke();
            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [config, active, size]);

    return (
        <div
            className={`relative flex items-center justify-center select-none ${className}`}
            style={{ width: config.width, height: config.height }}
        >
            <canvas
                ref={canvasRef}
                style={{ width: config.width, height: config.height }}
                className="pointer-events-none drop-shadow-xl"
            />
        </div>
    );
}

export default EtherealVoiceOrb;
