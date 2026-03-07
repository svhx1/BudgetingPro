"use client";

import { useGlobal } from "@/contexts/GlobalContext";
import { getDecorationById, getHatById } from "@/lib/decorations";

interface AvatarProps {
    size?: number; // px
    className?: string;
}

export default function AvatarWithDecoration({ size = 40, className = "" }: AvatarProps) {
    const { profileData, decorationId, hatId } = useGlobal();

    const decoration = decorationId ? getDecorationById(decorationId) : null;
    const hat = hatId ? getHatById(hatId) : null;

    const isAnimated = decoration?.category === "animated";

    const avatarStyle: React.CSSProperties = {
        width: size,
        height: size,
        ...(decoration && !isAnimated ? { boxShadow: decoration.css } : {}),
    };

    const wrapperStyle: React.CSSProperties = {
        width: size,
        height: size,
        position: "relative",
        ...(isAnimated && decoration ? (() => {
            // Parse animation from css string
            const parts = decoration.css.split(";").find(p => p.includes("animation"));
            if (parts) {
                const val = parts.split(":")[1]?.trim();
                return { animation: val } as React.CSSProperties;
            }
            return {};
        })() : {}),
    };

    const hatFontSize = hat ? size * hat.size * 0.4 : 0;

    return (
        <div style={wrapperStyle} className={`shrink-0 ${className}`}>
            {profileData.avatarUrl ? (
                <img
                    src={profileData.avatarUrl}
                    alt="Avatar"
                    className="rounded-full object-cover"
                    style={{ ...avatarStyle, display: "block" }}
                />
            ) : (
                <div
                    className="rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center text-white font-bold"
                    style={{ ...avatarStyle, fontSize: size * 0.4 }}
                >
                    {(profileData.name || "U")[0].toUpperCase()}
                </div>
            )}

            {/* Hat overlay */}
            {hat && (
                <span
                    className="absolute pointer-events-none select-none"
                    style={{
                        fontSize: hatFontSize,
                        left: `${hat.offsetX}%`,
                        top: `${hat.offsetY}%`,
                        transform: `translate(-50%, -50%) rotate(${hat.rotation}deg)`,
                        lineHeight: 1,
                        zIndex: 10,
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                    }}
                >
                    {hat.emoji}
                </span>
            )}
        </div>
    );
}
