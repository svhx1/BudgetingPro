"use client";

import { useGlobal } from "@/contexts/GlobalContext";
import { getDecorationById, getHatById } from "@/lib/decorations";

interface AvatarProps {
    size?: number;
    className?: string;
}

export default function AvatarWithDecoration({ size = 40, className = "" }: AvatarProps) {
    const { profileData, decorationId, hatId } = useGlobal();

    const decoration = decorationId ? getDecorationById(decorationId) : null;
    const hat = hatId ? getHatById(hatId) : null;

    const borderWidth = Math.max(2, size * 0.06);
    const outerSize = size + borderWidth * 2 + 4;

    const hasRotatingBorder = decoration?.borderGradient;
    const hasStaticGlow = decoration?.boxShadow;
    const hasAnimation = decoration?.animationClass && !hasRotatingBorder;

    const hatSize = hat ? size * hat.scale * 0.9 : 0;

    return (
        <div className={`relative shrink-0 ${className}`} style={{ width: outerSize, height: outerSize }}>
            {/* Rotating conic-gradient border (Discord-style) */}
            {hasRotatingBorder && (
                <div
                    className={`absolute inset-0 rounded-full ${decoration.animationClass || ""}`}
                    style={{
                        background: decoration.borderGradient,
                        mask: "radial-gradient(circle, transparent calc(50% - 4px), black calc(50% - 3px))",
                        WebkitMask: "radial-gradient(circle, transparent calc(50% - 4px), black calc(50% - 3px))",
                    }}
                />
            )}

            {/* Avatar container */}
            <div
                className={`absolute rounded-full overflow-hidden ${hasAnimation || ""}`}
                style={{
                    top: borderWidth + 2,
                    left: borderWidth + 2,
                    width: size,
                    height: size,
                    ...(hasStaticGlow ? { boxShadow: decoration.boxShadow } : {}),
                }}
            >
                {profileData.avatarUrl ? (
                    <img
                        src={profileData.avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div
                        className="w-full h-full bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center text-white font-bold"
                        style={{ fontSize: size * 0.4 }}
                    >
                        {(profileData.name || "U")[0].toUpperCase()}
                    </div>
                )}
            </div>

            {/* Animated pulse overlay (for pulse effects) */}
            {hasAnimation && (
                <div
                    className={`absolute rounded-full ${decoration.animationClass}`}
                    style={{
                        top: borderWidth + 2,
                        left: borderWidth + 2,
                        width: size,
                        height: size,
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* Hat SVG overlay */}
            {hat && (
                <div
                    className="absolute pointer-events-none select-none"
                    style={{
                        width: hatSize,
                        height: hatSize,
                        left: "50%",
                        top: `${hat.offsetY}%`,
                        transform: "translateX(-50%)",
                        zIndex: 20,
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                    }}
                    dangerouslySetInnerHTML={{ __html: hat.svg }}
                />
            )}
        </div>
    );
}
