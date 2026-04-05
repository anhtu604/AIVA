'use client';

import React from 'react';

interface AivaLogoProps {
    size?: number | string;
    className?: string;
    showText?: boolean;
    glow?: boolean;
}

export default function AivaLogo({
    size = 40,
    className = "",
    showText = true,
    glow = true,
}: AivaLogoProps) {
    const primaryRed = "#e11d48"; // Rose 600
    const secondaryCyan = "#22d3ee"; // Cyan 400

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={glow ? "drop-shadow-[0_0_8px_rgba(225,29,72,0.5)]" : ""}
            >
                {/* ── HIV/AIDS RED RIBBON ────────────────────────────────────── */}
                <path
                    d="M50 20C40 20 32 28 32 38C32 45 35 50 40 55L25 85H38L50 63L62 85H75L60 55C65 50 68 45 68 38C68 28 60 20 50 20ZM50 30C54.4 30 58 33.6 58 38C58 42.4 54.4 46 50 46C45.6 46 42 42.4 42 38C42 33.6 45.6 30 50 30Z"
                    fill={primaryRed}
                />
            </svg>

            {showText && (
                <div className="flex flex-col">
                    <span 
                        className={`text-2xl font-black tracking-tight leading-none italic ${glow ? "text-glow-secondary" : ""}`}
                        style={{ color: secondaryCyan, fontFamily: 'var(--font-outfit)' }}
                    >
                        IVA
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-1">
                        AI System Support
                    </span>
                </div>
            )}
        </div>
    );
}
