export interface ThemeColors {
    baseBg: string;
    glass: string;
    glassHover: string;
    glassBorder: string;
    accent: string;
    accentLight: string;
    accentGlow: string;
    danger: string;
    dangerLight: string;
    textMain: string;
    textMuted: string;
    gradients: { position: string; color: string; opacity: number }[];
}

export interface ThemeConfig {
    id: string;
    name: string;
    emoji: string;
    colors: ThemeColors;
}

export const BUILT_IN_THEMES: ThemeConfig[] = [
    {
        id: "midnight",
        name: "Midnight",
        emoji: "🌑",
        colors: {
            baseBg: "#050505",
            glass: "rgba(255,255,255,0.02)",
            glassHover: "rgba(255,255,255,0.05)",
            glassBorder: "rgba(255,255,255,0.06)",
            accent: "#059669",
            accentLight: "#10b981",
            accentGlow: "rgba(16,185,129,0.3)",
            danger: "#dc2626",
            dangerLight: "#ef4444",
            textMain: "#f8fafc",
            textMuted: "#94a3b8",
            gradients: [
                { position: "10% 20%", color: "rgba(16,185,129,0.03)", opacity: 1 },
                { position: "90% 80%", color: "rgba(239,68,68,0.02)", opacity: 1 },
            ],
        },
    },
    {
        id: "light",
        name: "Light",
        emoji: "☀️",
        colors: {
            baseBg: "#f1f5f9",
            glass: "rgba(255,255,255,0.7)",
            glassHover: "rgba(255,255,255,0.85)",
            glassBorder: "rgba(0,0,0,0.08)",
            accent: "#059669",
            accentLight: "#10b981",
            accentGlow: "rgba(16,185,129,0.2)",
            danger: "#dc2626",
            dangerLight: "#ef4444",
            textMain: "#0f172a",
            textMuted: "#64748b",
            gradients: [
                { position: "10% 20%", color: "rgba(16,185,129,0.06)", opacity: 1 },
                { position: "90% 80%", color: "rgba(59,130,246,0.04)", opacity: 1 },
            ],
        },
    },
    {
        id: "ocean",
        name: "Ocean",
        emoji: "🌊",
        colors: {
            baseBg: "#0a1628",
            glass: "rgba(59,130,246,0.05)",
            glassHover: "rgba(59,130,246,0.1)",
            glassBorder: "rgba(59,130,246,0.12)",
            accent: "#2563eb",
            accentLight: "#3b82f6",
            accentGlow: "rgba(59,130,246,0.3)",
            danger: "#dc2626",
            dangerLight: "#ef4444",
            textMain: "#e0f2fe",
            textMuted: "#7dd3fc",
            gradients: [
                { position: "5% 15%", color: "rgba(59,130,246,0.06)", opacity: 1 },
                { position: "80% 70%", color: "rgba(14,165,233,0.04)", opacity: 1 },
                { position: "50% 90%", color: "rgba(6,182,212,0.03)", opacity: 1 },
            ],
        },
    },
    {
        id: "sunset",
        name: "Sunset",
        emoji: "🌅",
        colors: {
            baseBg: "#1a0a0a",
            glass: "rgba(249,115,22,0.04)",
            glassHover: "rgba(249,115,22,0.08)",
            glassBorder: "rgba(249,115,22,0.1)",
            accent: "#ea580c",
            accentLight: "#f97316",
            accentGlow: "rgba(249,115,22,0.3)",
            danger: "#dc2626",
            dangerLight: "#ef4444",
            textMain: "#fef3c7",
            textMuted: "#fbbf24",
            gradients: [
                { position: "10% 30%", color: "rgba(249,115,22,0.05)", opacity: 1 },
                { position: "85% 60%", color: "rgba(239,68,68,0.04)", opacity: 1 },
                { position: "50% 10%", color: "rgba(251,191,36,0.03)", opacity: 1 },
            ],
        },
    },
];

export interface CustomThemePoint {
    id: string;
    x: number; // 0-100%
    y: number; // 0-100%
    color: string;
    radius: number; // blur radius in vw
}

export interface CustomTheme {
    points: CustomThemePoint[];
    baseBg: string;
    textMain: string;
    textMuted: string;
    glass: string;
    glassBorder: string;
}

export const DEFAULT_CUSTOM_THEME: CustomTheme = {
    points: [
        { id: "p1", x: 15, y: 20, color: "#10b981", radius: 40 },
        { id: "p2", x: 80, y: 75, color: "#ef4444", radius: 35 },
    ],
    baseBg: "#050505",
    textMain: "#f8fafc",
    textMuted: "#94a3b8",
    glass: "rgba(255,255,255,0.02)",
    glassBorder: "rgba(255,255,255,0.06)",
};

export function applyTheme(theme: ThemeConfig) {
    const root = document.documentElement;
    const { colors } = theme;

    root.style.setProperty("--color-base-bg", colors.baseBg);
    root.style.setProperty("--color-glass", colors.glass);
    root.style.setProperty("--color-glass-hover", colors.glassHover);
    root.style.setProperty("--color-glass-border", colors.glassBorder);
    root.style.setProperty("--color-neon-green", colors.accent);
    root.style.setProperty("--color-neon-green-light", colors.accentLight);
    root.style.setProperty("--color-neon-red", colors.danger);
    root.style.setProperty("--color-neon-red-light", colors.dangerLight);
    root.style.setProperty("--color-text-main", colors.textMain);
    root.style.setProperty("--color-text-muted", colors.textMuted);

    // Apply background
    document.body.style.backgroundColor = colors.baseBg;
    document.body.style.color = colors.textMain;

    const bgGradients = colors.gradients
        .map(g => `radial-gradient(circle at ${g.position}, ${g.color} 0%, transparent 40%)`)
        .join(", ");
    document.body.style.backgroundImage = bgGradients;
}

export function applyCustomTheme(custom: CustomTheme) {
    const root = document.documentElement;

    root.style.setProperty("--color-base-bg", custom.baseBg);
    root.style.setProperty("--color-glass", custom.glass);
    root.style.setProperty("--color-glass-hover", "rgba(255,255,255,0.05)");
    root.style.setProperty("--color-glass-border", custom.glassBorder);
    root.style.setProperty("--color-text-main", custom.textMain);
    root.style.setProperty("--color-text-muted", custom.textMuted);

    document.body.style.backgroundColor = custom.baseBg;
    document.body.style.color = custom.textMain;

    const bgGradients = custom.points
        .map(p => `radial-gradient(circle at ${p.x}% ${p.y}%, ${p.color}12 0%, transparent ${p.radius}%)`)
        .join(", ");
    document.body.style.backgroundImage = bgGradients;
}
