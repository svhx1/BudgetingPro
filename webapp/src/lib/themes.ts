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
        id: "light",
        name: "Claro (Sóbrio)",
        emoji: "☀️",
        colors: {
            baseBg: "#E8ECEF",
            glass: "rgba(255, 255, 255, 0.5)",
            glassHover: "rgba(255, 255, 255, 0.7)",
            glassBorder: "rgba(255, 255, 255, 0.3)",
            accent: "#10B981",
            accentLight: "#34D399",
            accentGlow: "rgba(16,185,129,0.15)",
            danger: "#EF4444",
            dangerLight: "#F87171",
            textMain: "#1F2937",
            textMuted: "#6B7280",
            gradients: [
                { position: "10% 20%", color: "rgba(16,185,129,0.04)", opacity: 1 },
                { position: "90% 80%", color: "rgba(59,130,246,0.03)", opacity: 1 },
            ],
        },
    },
    {
        id: "ocean",
        name: "Escuro (Ocean)",
        emoji: "🌊",
        colors: {
            baseBg: "#121417",
            glass: "rgba(255, 255, 255, 0.03)",
            glassHover: "rgba(255, 255, 255, 0.06)",
            glassBorder: "rgba(255, 255, 255, 0.1)",
            accent: "#3B82F6",
            accentLight: "#60A5FA",
            accentGlow: "rgba(59,130,246,0.2)",
            danger: "#EF4444",
            dangerLight: "#F87171",
            textMain: "#F3F4F6",
            textMuted: "#9CA3AF",
            gradients: [
                { position: "5% 15%", color: "rgba(59,130,246,0.05)", opacity: 1 },
                { position: "80% 70%", color: "rgba(14,165,233,0.03)", opacity: 1 },
                { position: "50% 90%", color: "rgba(16,185,129,0.02)", opacity: 1 },
            ],
        },
    }
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
