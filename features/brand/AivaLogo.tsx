'use client';

import Image from 'next/image';

interface AivaLogoProps {
    /** Kích thước (px) của logo icon */
    size?: number;
    className?: string;
    /** Hiển thị logo đầy đủ (icon + text) hay chỉ icon */
    variant?: 'icon' | 'full';
}

/**
 * AivaLogo — Component thương hiệu AIVA
 * Sử dụng ảnh PNG chất lượng cao thay vì SVG thủ công.
 */
export default function AivaLogo({
    size = 40,
    className = "",
    variant = 'icon',
}: AivaLogoProps) {
    if (variant === 'full') {
        return (
            <Image
                src="/brand/logo-full.png"
                alt="AIVA – AI System for HIV/AIDS Support"
                width={size * 3.5}
                height={size}
                className={`object-contain ${className}`}
                priority
            />
        );
    }

    return (
        <Image
            src="/brand/logo-icon.png"
            alt="AIVA"
            width={size}
            height={size}
            className={`object-contain ${className}`}
            priority
        />
    );
}
