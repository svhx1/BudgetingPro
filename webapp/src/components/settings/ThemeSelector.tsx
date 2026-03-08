"use client";

import { useGlobal } from "@/contexts/GlobalContext";
import { BUILT_IN_THEMES } from "@/lib/themes";
import { motion } from "framer-motion";

export default function ThemeSelector() {
    const { currentThemeId, setThemeById } = useGlobal();

    const allOptions = [
        ...BUILT_IN_THEMES.map(t => ({ id: t.id, name: t.name, emoji: t.emoji, bg: t.colors.baseBg, accent: t.colors.accent, glass: t.colors.glassBorder })),
        { id: "custom", name: "Customizado", emoji: "🎨", bg: "#050505", accent: "#8b5cf6", glass: "rgba(139,92,246,0.2)" },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allOptions.map(opt => {
                const isActive = currentThemeId === opt.id;
                return (
                    <motion.button
                        key={opt.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setThemeById(opt.id)}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${isActive
                            ? "border-(--color-text-main)/30 shadow-lg"
                            : "border-(--color-text-main)/5 hover:border-(--color-text-main)/15"
                            }`}
                        style={{
                            backgroundColor: opt.bg,
                            ...(isActive ? { boxShadow: `0 0 20px ${opt.accent}30` } : {}),
                        }}
                    >
                        {isActive && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: opt.accent }} />
                        )}
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="text-xs font-medium" style={{ color: isActive ? "#fff" : "#94a3b8" }}>
                            {opt.name}
                        </span>
                        {/* Preview bar */}
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: opt.glass }}>
                            <div className="h-full rounded-full" style={{ width: "60%", backgroundColor: opt.accent }} />
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}
