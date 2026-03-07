// Discord-style decorations: animated rings, gradient borders, particle effects
// And custom SVG hats positioned on top of the avatar

export interface Decoration {
    id: string;
    name: string;
    category: "ring" | "glow" | "animated";
    // For rings/glows: CSS applied as box-shadow on a ROUND element
    // For animated: uses a special render mode with pseudo-elements
    borderGradient?: string; // conic-gradient for rotating borders
    boxShadow?: string; // static box-shadow
    animationClass?: string; // CSS class name for animation
}

export interface Hat {
    id: string;
    name: string;
    svg: string; // Inline SVG string
    offsetY: number; // % offset from top (negative = above)
    scale: number; // scale factor
}

export const DECORATIONS: Decoration[] = [
    // === ANIMATED BORDER RINGS (Discord-style conic-gradient rotation) ===
    {
        id: "discord-nitro", name: "Nitro Boost", category: "ring",
        borderGradient: "conic-gradient(from var(--angle), #5865f2, #eb459e, #fee75c, #57f287, #5865f2)",
        animationClass: "deco-spin",
    },
    {
        id: "fire-spin", name: "Anel de Fogo", category: "ring",
        borderGradient: "conic-gradient(from var(--angle), #ef4444, #f97316, #fbbf24, #ef4444)",
        animationClass: "deco-spin",
    },
    {
        id: "ice-spin", name: "Anel de Gelo", category: "ring",
        borderGradient: "conic-gradient(from var(--angle), #06b6d4, #3b82f6, #a5f3fc, #06b6d4)",
        animationClass: "deco-spin",
    },
    {
        id: "emerald-spin", name: "Esmeralda", category: "ring",
        borderGradient: "conic-gradient(from var(--angle), #059669, #10b981, #6ee7b7, #059669)",
        animationClass: "deco-spin",
    },
    {
        id: "galaxy-spin", name: "Galáxia", category: "ring",
        borderGradient: "conic-gradient(from var(--angle), #7c3aed, #ec4899, #06b6d4, #7c3aed)",
        animationClass: "deco-spin",
    },
    {
        id: "sunset-spin", name: "Pôr do Sol", category: "ring",
        borderGradient: "conic-gradient(from var(--angle), #f97316, #ec4899, #a855f7, #f97316)",
        animationClass: "deco-spin",
    },
    {
        id: "gold-spin", name: "Ouro Premium", category: "ring",
        borderGradient: "conic-gradient(from var(--angle), #fbbf24, #f59e0b, #d97706, #fbbf24)",
        animationClass: "deco-spin",
    },
    {
        id: "rainbow-spin", name: "Arco-íris", category: "ring",
        borderGradient: "conic-gradient(from var(--angle), #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ef4444)",
        animationClass: "deco-spin",
    },
    {
        id: "blood-moon", name: "Lua de Sangue", category: "ring",
        borderGradient: "conic-gradient(from var(--angle), #7f1d1d, #dc2626, #f87171, #7f1d1d)",
        animationClass: "deco-spin-slow",
    },
    {
        id: "aurora", name: "Aurora Boreal", category: "ring",
        borderGradient: "conic-gradient(from var(--angle), #06b6d4, #10b981, #8b5cf6, #ec4899, #06b6d4)",
        animationClass: "deco-spin-slow",
    },

    // === STATIC GLOW EFFECTS ===
    {
        id: "emerald-glow", name: "Brilho Esmeralda", category: "glow",
        boxShadow: "0 0 15px 4px rgba(16,185,129,0.5), 0 0 30px 8px rgba(16,185,129,0.2)",
    },
    {
        id: "fire-glow", name: "Brilho de Fogo", category: "glow",
        boxShadow: "0 0 15px 4px rgba(239,68,68,0.5), 0 0 30px 8px rgba(249,115,22,0.2)",
    },
    {
        id: "ice-glow", name: "Brilho Gelo", category: "glow",
        boxShadow: "0 0 15px 4px rgba(56,189,248,0.5), 0 0 30px 8px rgba(56,189,248,0.2)",
    },
    {
        id: "cosmic-glow", name: "Cósmico", category: "glow",
        boxShadow: "0 0 15px 4px rgba(139,92,246,0.5), 0 0 30px 8px rgba(139,92,246,0.2)",
    },
    {
        id: "gold-glow", name: "Dourado", category: "glow",
        boxShadow: "0 0 15px 4px rgba(251,191,36,0.5), 0 0 30px 8px rgba(245,158,11,0.2)",
    },
    {
        id: "pink-glow", name: "Rosa", category: "glow",
        boxShadow: "0 0 15px 4px rgba(236,72,153,0.5), 0 0 30px 8px rgba(244,114,182,0.2)",
    },
    {
        id: "diamond-glow", name: "Diamante", category: "glow",
        boxShadow: "0 0 12px 3px rgba(255,255,255,0.5), 0 0 25px 6px rgba(255,255,255,0.15)",
    },
    {
        id: "shadow-glow", name: "Sombrio", category: "glow",
        boxShadow: "0 0 20px 6px rgba(0,0,0,0.7), 0 0 40px 12px rgba(0,0,0,0.3)",
    },
    {
        id: "mint-glow", name: "Menta", category: "glow",
        boxShadow: "0 0 15px 4px rgba(52,211,153,0.5), 0 0 30px 8px rgba(110,231,183,0.2)",
    },
    {
        id: "amber-glow", name: "Âmbar", category: "glow",
        boxShadow: "0 0 15px 4px rgba(245,158,11,0.5), 0 0 30px 8px rgba(217,119,6,0.2)",
    },

    // === PULSE/ANIMATED EFFECTS ===
    { id: "pulse-emerald", name: "Pulso Esmeralda", category: "animated", animationClass: "deco-pulse-emerald" },
    { id: "pulse-fire", name: "Pulso de Fogo", category: "animated", animationClass: "deco-pulse-fire" },
    { id: "pulse-ice", name: "Pulso Gelo", category: "animated", animationClass: "deco-pulse-ice" },
    { id: "pulse-cosmic", name: "Pulso Cósmico", category: "animated", animationClass: "deco-pulse-cosmic" },
    { id: "pulse-gold", name: "Pulso Dourado", category: "animated", animationClass: "deco-pulse-gold" },
    { id: "heartbeat-red", name: "Batimento", category: "animated", animationClass: "deco-heartbeat" },
    { id: "breathe-blue", name: "Respiração", category: "animated", animationClass: "deco-breathe" },
    { id: "flicker-lightning", name: "Raio", category: "animated", animationClass: "deco-lightning" },
    { id: "ripple-wave", name: "Ondas", category: "animated", animationClass: "deco-ripple" },
    { id: "glitch-effect", name: "Glitch", category: "animated", animationClass: "deco-glitch" },
];

// SVG hats — custom drawn, positioned above the avatar
export const HATS: Hat[] = [
    {
        id: "crown", name: "Coroa", offsetY: -28, scale: 1,
        svg: `<svg viewBox="0 0 80 50" fill="none"><path d="M8 42L16 15L28 30L40 8L52 30L64 15L72 42" stroke="#fbbf24" stroke-width="3" fill="#fbbf24" fill-opacity="0.3"/><path d="M8 42H72" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/><circle cx="16" cy="14" r="4" fill="#fbbf24"/><circle cx="40" cy="6" r="5" fill="#fbbf24"/><circle cx="64" cy="14" r="4" fill="#fbbf24"/></svg>`,
    },
    {
        id: "santa-hat", name: "Papai Noel", offsetY: -30, scale: 1.1,
        svg: `<svg viewBox="0 0 80 60" fill="none"><path d="M15 50C15 50 20 20 50 12C60 9 75 15 70 25C65 35 50 30 55 40L15 50Z" fill="#dc2626"/><path d="M15 48C15 48 10 52 12 55C15 60 70 58 72 52C74 48 70 45 55 45L15 48Z" fill="white"/><circle cx="70" cy="18" r="7" fill="white"/><path d="M15 48L55 42" stroke="#b91c1c" stroke-width="1" opacity="0.3"/></svg>`,
    },
    {
        id: "party-hat", name: "Festa", offsetY: -35, scale: 0.9,
        svg: `<svg viewBox="0 0 70 70" fill="none"><path d="M35 5L55 60H15L35 5Z" fill="url(#party)"/><circle cx="35" cy="3" r="4" fill="#fbbf24"/><path d="M20 35L50 28" stroke="#fff" stroke-width="2" opacity="0.4"/><path d="M18 45L52 38" stroke="#fff" stroke-width="2" opacity="0.3"/><defs><linearGradient id="party" x1="15" y1="60" x2="55" y2="5"><stop stop-color="#ec4899"/><stop offset="0.5" stop-color="#8b5cf6"/><stop offset="1" stop-color="#3b82f6"/></linearGradient></defs></svg>`,
    },
    {
        id: "top-hat", name: "Cartola", offsetY: -32, scale: 1,
        svg: `<svg viewBox="0 0 80 60" fill="none"><rect x="22" y="20" width="36" height="35" rx="2" fill="#1e1e1e"/><rect x="12" y="50" width="56" height="6" rx="3" fill="#1e1e1e"/><rect x="22" y="42" width="36" height="5" rx="1" fill="#854d0e"/><rect x="35" y="43" width="10" height="3" rx="1" fill="#fbbf24"/></svg>`,
    },
    {
        id: "halo", name: "Auréola", offsetY: -22, scale: 1,
        svg: `<svg viewBox="0 0 80 30" fill="none"><ellipse cx="40" cy="15" rx="28" ry="10" stroke="#fbbf24" stroke-width="4" fill="none" opacity="0.8"/><ellipse cx="40" cy="15" rx="28" ry="10" stroke="#fef08a" stroke-width="1.5" fill="none" opacity="0.4"/></svg>`,
    },
    {
        id: "devil-horns", name: "Diabinho", offsetY: -25, scale: 1,
        svg: `<svg viewBox="0 0 80 40" fill="none"><path d="M12 35C12 35 8 10 18 5C22 3 25 12 25 20" stroke="#dc2626" stroke-width="4" fill="#dc2626" fill-opacity="0.6" stroke-linecap="round"/><path d="M68 35C68 35 72 10 62 5C58 3 55 12 55 20" stroke="#dc2626" stroke-width="4" fill="#dc2626" fill-opacity="0.6" stroke-linecap="round"/></svg>`,
    },
    {
        id: "wizard-hat", name: "Mago", offsetY: -38, scale: 1.1,
        svg: `<svg viewBox="0 0 80 70" fill="none"><path d="M40 2L60 58H20L40 2Z" fill="#312e81"/><path d="M10 56C10 56 25 52 40 55C55 58 70 54 70 54" stroke="#312e81" stroke-width="8" stroke-linecap="round"/><circle cx="35" cy="30" r="2" fill="#fbbf24" opacity="0.7"/><circle cx="42" cy="20" r="1.5" fill="#fbbf24" opacity="0.5"/><circle cx="38" cy="42" r="2.5" fill="#fbbf24" opacity="0.6"/></svg>`,
    },
    {
        id: "chef-hat", name: "Chef", offsetY: -30, scale: 1,
        svg: `<svg viewBox="0 0 80 55" fill="none"><rect x="22" y="30" width="36" height="20" fill="white" rx="2"/><circle cx="28" cy="28" r="12" fill="white"/><circle cx="40" cy="22" r="14" fill="white"/><circle cx="52" cy="28" r="12" fill="white"/><rect x="22" y="45" width="36" height="3" fill="#e5e7eb" rx="1"/></svg>`,
    },
    {
        id: "pirate-hat", name: "Pirata", offsetY: -28, scale: 1.1,
        svg: `<svg viewBox="0 0 80 50" fill="none"><path d="M10 42C10 42 20 10 40 8C60 10 70 42 70 42" fill="#1e1e1e"/><path d="M5 42H75" stroke="#1e1e1e" stroke-width="6" stroke-linecap="round"/><circle cx="40" cy="28" r="8" stroke="white" stroke-width="2" fill="none"/><path d="M35 25L45 31M45 25L35 31" stroke="white" stroke-width="1.5"/></svg>`,
    },
    {
        id: "flower-crown", name: "Flores", offsetY: -18, scale: 1.1,
        svg: `<svg viewBox="0 0 80 30" fill="none"><path d="M10 20C10 20 25 12 40 15C55 12 70 20 70 20" stroke="#16a34a" stroke-width="3" fill="none"/><circle cx="15" cy="16" r="5" fill="#f472b6"/><circle cx="28" cy="12" r="4" fill="#fb923c"/><circle cx="40" cy="10" r="5" fill="#ef4444"/><circle cx="52" cy="12" r="4" fill="#a78bfa"/><circle cx="65" cy="16" r="5" fill="#38bdf8"/><circle cx="15" cy="16" r="2" fill="#fbbf24"/><circle cx="28" cy="12" r="1.5" fill="#fbbf24"/><circle cx="40" cy="10" r="2" fill="#fbbf24"/><circle cx="52" cy="12" r="1.5" fill="#fbbf24"/><circle cx="65" cy="16" r="2" fill="#fbbf24"/></svg>`,
    },
    {
        id: "headphones", name: "Fones", offsetY: -15, scale: 1.1,
        svg: `<svg viewBox="0 0 80 45" fill="none"><path d="M15 35C15 18 25 8 40 8C55 8 65 18 65 35" stroke="#374151" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="8" y="30" width="12" height="16" rx="4" fill="#374151"/><rect x="60" y="30" width="12" height="16" rx="4" fill="#374151"/><rect x="10" y="32" width="8" height="12" rx="3" fill="#6b7280"/><rect x="62" y="32" width="8" height="12" rx="3" fill="#6b7280"/></svg>`,
    },
    {
        id: "cowboy-hat", name: "Cowboy", offsetY: -25, scale: 1.1,
        svg: `<svg viewBox="0 0 90 50" fill="none"><path d="M5 40C5 40 15 35 25 38C30 15 60 15 65 38C75 35 85 40 85 40" fill="#92400e"/><path d="M5 40H85" stroke="#78350f" stroke-width="4" stroke-linecap="round"/><rect x="25" y="15" width="40" height="25" rx="12" fill="#a16207"/><rect x="32" y="30" width="26" height="4" rx="2" fill="#854d0e"/></svg>`,
    },
    {
        id: "beanie", name: "Touca", offsetY: -22, scale: 1,
        svg: `<svg viewBox="0 0 80 45" fill="none"><path d="M18 38C18 20 25 10 40 10C55 10 62 20 62 38" fill="#1d4ed8"/><path d="M15 38H65" stroke="#1e40af" stroke-width="6" stroke-linecap="round"/><path d="M15 38H65" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 4"/><circle cx="40" cy="6" r="5" fill="#1d4ed8"/></svg>`,
    },
    {
        id: "graduation-cap", name: "Formatura", offsetY: -28, scale: 1.1,
        svg: `<svg viewBox="0 0 80 45" fill="none"><polygon points="40,5 75,22 40,35 5,22" fill="#1e1e1e"/><rect x="30" y="22" width="20" height="15" fill="#1e1e1e" rx="1"/><line x1="40" y1="35" x2="40" y2="22" stroke="#374151" stroke-width="1"/><circle cx="65" cy="22" r="2" fill="#fbbf24"/><line x1="65" y1="24" x2="65" y2="38" stroke="#fbbf24" stroke-width="1.5"/><circle cx="65" cy="40" r="3" fill="#fbbf24"/></svg>`,
    },
    {
        id: "cat-ears", name: "Orelhas de Gato", offsetY: -22, scale: 1,
        svg: `<svg viewBox="0 0 80 35" fill="none"><path d="M10 32L18 5C19 2 23 2 24 5L28 25" fill="#374151"/><path d="M52 25L56 5C57 2 61 2 62 5L70 32" fill="#374151"/><path d="M14 28L20 10L25 24" fill="#f472b6" opacity="0.5"/><path d="M55 24L60 10L66 28" fill="#f472b6" opacity="0.5"/></svg>`,
    },
];

export function getDecorationById(id: string): Decoration | undefined {
    return DECORATIONS.find(d => d.id === id);
}

export function getHatById(id: string): Hat | undefined {
    return HATS.find(h => h.id === id);
}
