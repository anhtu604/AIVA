'use client';

import { Activity } from 'lucide-react';

interface AivaLogoProps {
    /** Kích thước của logo icon (đường kính vòng tròn icon) */
    size?: number;
    className?: string;
    /** Hiển thị logo đầy đủ (icon + text) hay chỉ icon */
    variant?: 'icon' | 'full';
}

/**
 * AivaLogo — Component thương hiệu AIVA
 * Sử dụng Lucide React Icon kết hợp text CSS để loại bỏ lỗi hình ảnh
 */
export default function AivaLogo({
    size = 40,
    className = "",
    variant = 'icon',
}: AivaLogoProps) {

    // Tính toán kích thước icon và font size dựa trên prop size truyền vào
    const iconBaseSize = size * 0.55;
    const textSize = size * 0.7;

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Vùng Icon Logo */}
            <div 
                className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 shadow-lg shadow-rose-500/30 flex-shrink-0 border border-white/10"
                style={{ width: size, height: size }}
            >
                <Activity size={iconBaseSize} className="text-white" strokeWidth={2.5} />
            </div>

            {/* Vùng Text (Chỉ hiện khi variant = 'full') */}
            {variant === 'full' && (
                <div className="flex flex-col justify-center">
                    <span 
                        className="font-extrabold tracking-tight text-white leading-none"
                        style={{ fontSize: textSize }}
                    >
                        AIVA
                    </span>
                    <span 
                        className="font-bold text-rose-400 uppercase tracking-widest leading-none mt-1"
                        style={{ fontSize: textSize * 0.35 }}
                    >
                        Care Platform
                    </span>
                </div>
            )}
        </div>
    );
}
