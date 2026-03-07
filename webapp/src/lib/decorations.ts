export interface Decoration {
    id: string;
    name: string;
    category: "ring" | "glow" | "animated";
    css: string; // CSS to apply around the avatar
}

export interface Hat {
    id: string;
    name: string;
    emoji: string; // Using emoji for hats — zero dependencies, works everywhere
    offsetX: number; // % from left
    offsetY: number; // % from top (negative = above)
    size: number; // font-size in em
    rotation: number; // degrees
}

export const DECORATIONS: Decoration[] = [
    // === RINGS & BORDERS (10) ===
    { id: "emerald-glow", name: "Esmeralda", category: "ring", css: "0 0 12px 3px rgba(16,185,129,0.6), 0 0 20px 6px rgba(16,185,129,0.2)" },
    { id: "fire-ring", name: "Fogo", category: "ring", css: "0 0 12px 3px rgba(239,68,68,0.6), 0 0 20px 6px rgba(249,115,22,0.3)" },
    { id: "ice-ring", name: "Gelo", category: "ring", css: "0 0 12px 3px rgba(56,189,248,0.6), 0 0 20px 6px rgba(56,189,248,0.2)" },
    { id: "gold-ring", name: "Ouro", category: "ring", css: "0 0 12px 3px rgba(251,191,36,0.6), 0 0 20px 6px rgba(251,191,36,0.2)" },
    { id: "rainbow-ring", name: "Arco-íris", category: "ring", css: "0 0 8px 2px rgba(239,68,68,0.4), 0 0 12px 4px rgba(251,191,36,0.3), 0 0 16px 6px rgba(16,185,129,0.2), 0 0 20px 8px rgba(59,130,246,0.15)" },
    { id: "neon-pulse", name: "Neon", category: "ring", css: "0 0 15px 4px rgba(16,185,129,0.8), 0 0 30px 8px rgba(16,185,129,0.3)" },
    { id: "electric-blue", name: "Elétrico", category: "ring", css: "0 0 15px 4px rgba(59,130,246,0.7), 0 0 25px 8px rgba(99,102,241,0.3)" },
    { id: "sunset-ring", name: "Pôr do Sol", category: "ring", css: "0 0 12px 3px rgba(249,115,22,0.5), 0 0 20px 6px rgba(236,72,153,0.3)" },
    { id: "diamond-ring", name: "Diamante", category: "ring", css: "0 0 10px 2px rgba(255,255,255,0.6), 0 0 20px 5px rgba(255,255,255,0.15)" },
    { id: "shadow-ring", name: "Sombra", category: "ring", css: "0 0 20px 5px rgba(0,0,0,0.8), 0 0 40px 10px rgba(0,0,0,0.4)" },

    // === GLOWS & AURAS (10) ===
    { id: "soft-glow", name: "Brilho Suave", category: "glow", css: "0 0 25px 8px rgba(255,255,255,0.2)" },
    { id: "emerald-aura", name: "Aura Esmeralda", category: "glow", css: "0 0 30px 10px rgba(16,185,129,0.3), 0 0 60px 20px rgba(16,185,129,0.1)" },
    { id: "fire-aura", name: "Aura de Fogo", category: "glow", css: "0 0 30px 10px rgba(239,68,68,0.3), 0 0 60px 20px rgba(249,115,22,0.1)" },
    { id: "cosmic-aura", name: "Aura Cósmica", category: "glow", css: "0 0 30px 10px rgba(139,92,246,0.3), 0 0 60px 20px rgba(59,130,246,0.1)" },
    { id: "golden-aura", name: "Aura Dourada", category: "glow", css: "0 0 30px 10px rgba(251,191,36,0.3), 0 0 60px 20px rgba(245,158,11,0.1)" },
    { id: "frost-aura", name: "Aura Gelo", category: "glow", css: "0 0 30px 10px rgba(56,189,248,0.3), 0 0 60px 20px rgba(14,165,233,0.1)" },
    { id: "shadow-aura", name: "Aura Sombria", category: "glow", css: "0 0 30px 10px rgba(0,0,0,0.5), 0 0 60px 20px rgba(30,30,30,0.3)" },
    { id: "pink-aura", name: "Aura Rosa", category: "glow", css: "0 0 30px 10px rgba(236,72,153,0.3), 0 0 60px 20px rgba(244,114,182,0.1)" },
    { id: "mint-aura", name: "Aura Menta", category: "glow", css: "0 0 30px 10px rgba(52,211,153,0.3), 0 0 60px 20px rgba(110,231,183,0.1)" },
    { id: "amber-aura", name: "Aura Âmbar", category: "glow", css: "0 0 30px 10px rgba(245,158,11,0.3), 0 0 60px 20px rgba(217,119,6,0.1)" },

    // === ANIMATED EFFECTS (10) ===
    { id: "sparkle", name: "Brilhos", category: "animated", css: "animation:sparkle 2s ease-in-out infinite" },
    { id: "particles", name: "Partículas", category: "animated", css: "animation:pulse-glow 3s ease-in-out infinite" },
    { id: "orbit", name: "Órbita", category: "animated", css: "animation:orbit-ring 4s linear infinite" },
    { id: "ripple", name: "Ondas", category: "animated", css: "animation:ripple 2s ease-out infinite" },
    { id: "heartbeat", name: "Batimento", category: "animated", css: "animation:heartbeat 1.5s ease-in-out infinite" },
    { id: "lightning", name: "Raio", category: "animated", css: "animation:lightning-flash 3s ease-in-out infinite" },
    { id: "bubbles", name: "Bolhas", category: "animated", css: "animation:bubble-float 3s ease-in-out infinite" },
    { id: "flames", name: "Chamas", category: "animated", css: "animation:flame-flicker 0.8s ease-in-out infinite alternate" },
    { id: "snowfall", name: "Neve", category: "animated", css: "animation:snow-drift 4s ease-in-out infinite" },
    { id: "confetti", name: "Confete", category: "animated", css: "animation:confetti-pop 2s ease-in-out infinite" },
];

export const HATS: Hat[] = [
    { id: "crown", name: "Coroa", emoji: "👑", offsetX: 50, offsetY: -20, size: 1.3, rotation: 0 },
    { id: "santa-hat", name: "Natal", emoji: "🎅", offsetX: 55, offsetY: -15, size: 1.2, rotation: 10 },
    { id: "party-hat", name: "Festa", emoji: "🥳", offsetX: 50, offsetY: -18, size: 1.2, rotation: -5 },
    { id: "top-hat", name: "Cartola", emoji: "🎩", offsetX: 50, offsetY: -22, size: 1.3, rotation: -5 },
    { id: "halo", name: "Auréola", emoji: "😇", offsetX: 50, offsetY: -15, size: 1.1, rotation: 0 },
    { id: "devil-horns", name: "Diabinho", emoji: "😈", offsetX: 50, offsetY: -12, size: 1.1, rotation: 0 },
    { id: "wizard-hat", name: "Mago", emoji: "🧙", offsetX: 50, offsetY: -15, size: 1.2, rotation: 0 },
    { id: "chef-hat", name: "Chef", emoji: "👨‍🍳", offsetX: 50, offsetY: -12, size: 1.1, rotation: 0 },
    { id: "pirate-hat", name: "Pirata", emoji: "🏴‍☠️", offsetX: 55, offsetY: -18, size: 1.1, rotation: 10 },
    { id: "flower-crown", name: "Flores", emoji: "🌸", offsetX: 50, offsetY: -18, size: 1.0, rotation: 0 },
    { id: "headphones", name: "Fones", emoji: "🎧", offsetX: 50, offsetY: -10, size: 1.2, rotation: 0 },
    { id: "cowboy-hat", name: "Cowboy", emoji: "🤠", offsetX: 50, offsetY: -15, size: 1.3, rotation: 0 },
    { id: "beanie", name: "Touca", emoji: "🧶", offsetX: 50, offsetY: -18, size: 1.0, rotation: 0 },
    { id: "graduation-cap", name: "Formatura", emoji: "🎓", offsetX: 50, offsetY: -20, size: 1.2, rotation: -5 },
    { id: "cat-ears", name: "Gato", emoji: "🐱", offsetX: 50, offsetY: -15, size: 1.1, rotation: 0 },
];

export function getDecorationById(id: string): Decoration | undefined {
    return DECORATIONS.find(d => d.id === id);
}

export function getHatById(id: string): Hat | undefined {
    return HATS.find(h => h.id === id);
}
