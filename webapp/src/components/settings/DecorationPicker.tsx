"use client";

import { useGlobal } from "@/contexts/GlobalContext";
import { DECORATIONS, HATS, Decoration } from "@/lib/decorations";
import { motion } from "framer-motion";
import AvatarWithDecoration from "@/components/profile/AvatarWithDecoration";

export default function DecorationPicker() {
    const { decorationId, setDecorationId, hatId, setHatId, profileData } = useGlobal();

    const categories: { key: Decoration["category"]; label: string }[] = [
        { key: "ring", label: "Anéis" },
        { key: "glow", label: "Auras" },
        { key: "animated", label: "Animados" },
    ];

    return (
        <div className="space-y-6">
            {/* Live Preview */}
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 border border-white/10">
                <AvatarWithDecoration size={80} />
                <p className="text-sm text-(--color-text-muted)">Preview</p>
                {(decorationId || hatId) && (
                    <button
                        onClick={() => { setDecorationId(null); setHatId(null); }}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                        Remover tudo
                    </button>
                )}
            </div>

            {/* Decorations by category */}
            {categories.map(cat => (
                <div key={cat.key}>
                    <h4 className="text-xs font-semibold text-(--color-text-muted) uppercase tracking-wider mb-3">{cat.label}</h4>
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                        {DECORATIONS.filter(d => d.category === cat.key).map(dec => {
                            const isActive = decorationId === dec.id;
                            return (
                                <motion.button
                                    key={dec.id}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setDecorationId(isActive ? null : dec.id)}
                                    className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all ${isActive
                                        ? "border-white/30 bg-white/10"
                                        : "border-white/5 hover:border-white/15 hover:bg-white/5"
                                        }`}
                                    title={dec.name}
                                >
                                    {/* Mini preview circle */}
                                    <div
                                        className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500"
                                        style={{
                                            boxShadow: dec.category !== "animated" ? dec.css : "0 0 8px rgba(255,255,255,0.2)",
                                            ...(dec.category === "animated" ? { animation: dec.css.split(":")[1]?.split(";")[0]?.trim() } : {}),
                                        }}
                                    />
                                    <span className="text-[9px] text-(--color-text-muted) truncate w-full">{dec.name}</span>
                                </motion.button>
                            )
                        })}
                    </div>
                </div>
            ))}

            {/* Hats */}
            <div>
                <h4 className="text-xs font-semibold text-(--color-text-muted) uppercase tracking-wider mb-3">Chapéus & Acessórios</h4>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                    {HATS.map(hat => {
                        const isActive = hatId === hat.id;
                        return (
                            <motion.button
                                key={hat.id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setHatId(isActive ? null : hat.id)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${isActive
                                    ? "border-white/30 bg-white/10"
                                    : "border-white/5 hover:border-white/15 hover:bg-white/5"
                                    }`}
                                title={hat.name}
                            >
                                <span className="text-xl">{hat.emoji}</span>
                                <span className="text-[9px] text-(--color-text-muted) truncate w-full text-center">{hat.name}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
