"use client";

import { useGlobal } from "@/contexts/GlobalContext";
import { DECORATIONS, HATS, Decoration } from "@/lib/decorations";
import { motion } from "framer-motion";
import AvatarWithDecoration from "@/components/profile/AvatarWithDecoration";

export default function DecorationPicker() {
    const { decorationId, setDecorationId, hatId, setHatId } = useGlobal();

    const categories: { key: Decoration["category"]; label: string; desc: string }[] = [
        { key: "ring", label: "Bordas Animadas", desc: "Estilo Discord Nitro" },
        { key: "glow", label: "Brilhos", desc: "Efeitos estáticos" },
        { key: "animated", label: "Efeitos Pulsantes", desc: "Animações dinâmicas" },
    ];

    return (
        <div className="space-y-6">
            {/* Live Preview */}
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-(--color-text-main)/5 border border-(--color-text-main)/10">
                <AvatarWithDecoration size={80} />
                <p className="text-sm text-(--color-text-muted)">Preview ao vivo</p>
                {(decorationId || hatId) && (
                    <button
                        onClick={() => { setDecorationId(null); setHatId(null); }}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                        Remover tudo
                    </button>
                )}
            </div>

            {/* Decorations */}
            {categories.map(cat => (
                <div key={cat.key}>
                    <div className="mb-3">
                        <h4 className="text-xs font-semibold text-(--color-text-main) uppercase tracking-wider">{cat.label}</h4>
                        <p className="text-[10px] text-(--color-text-muted)">{cat.desc}</p>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
                        {DECORATIONS.filter(d => d.category === cat.key).map(dec => {
                            const isActive = decorationId === dec.id;
                            return (
                                <motion.button
                                    key={dec.id}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setDecorationId(isActive ? null : dec.id)}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all ${isActive
                                        ? "border-(--color-text-main)/30 bg-(--color-text-main)/10"
                                        : "border-(--color-text-main)/5 hover:border-(--color-text-main)/15 hover:bg-(--color-text-main)/5"
                                        }`}
                                    title={dec.name}
                                >
                                    {/* Mini preview */}
                                    <div className="relative w-8 h-8">
                                        {dec.borderGradient ? (
                                            <div
                                                className={`w-8 h-8 rounded-full ${dec.animationClass || ""}`}
                                                style={{
                                                    background: dec.borderGradient,
                                                    mask: "radial-gradient(circle, transparent 40%, black 44%)",
                                                    WebkitMask: "radial-gradient(circle, transparent 40%, black 44%)",
                                                }}
                                            />
                                        ) : dec.boxShadow ? (
                                            <div
                                                className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500 mx-auto mt-1"
                                                style={{ boxShadow: dec.boxShadow }}
                                            />
                                        ) : (
                                            <div
                                                className={`w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500 mx-auto mt-1 ${dec.animationClass || ""}`}
                                            />
                                        )}
                                    </div>
                                    <span className="text-[8px] text-(--color-text-muted) truncate w-full leading-tight">{dec.name}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Hats */}
            <div>
                <div className="mb-3">
                    <h4 className="text-xs font-semibold text-(--color-text-main) uppercase tracking-wider">Chapéus & Acessórios</h4>
                    <p className="text-[10px] text-(--color-text-muted)">Posicionados sobre a foto</p>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
                    {HATS.map(hat => {
                        const isActive = hatId === hat.id;
                        return (
                            <motion.button
                                key={hat.id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setHatId(isActive ? null : hat.id)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${isActive
                                    ? "border-(--color-text-main)/30 bg-(--color-text-main)/10"
                                    : "border-(--color-text-main)/5 hover:border-(--color-text-main)/15 hover:bg-(--color-text-main)/5"
                                    }`}
                                title={hat.name}
                            >
                                <div
                                    className="w-8 h-8"
                                    dangerouslySetInnerHTML={{ __html: hat.svg }}
                                />
                                <span className="text-[8px] text-(--color-text-muted) truncate w-full text-center leading-tight">{hat.name}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
