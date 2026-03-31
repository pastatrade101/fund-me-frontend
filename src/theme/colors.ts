export const brandColors = {
    primary: {
        900: "#0A0573",
        700: "#1A0FA3",
        500: "#2F5BFF",
        300: "#6EA8FF",
        100: "#E7F0FF"
    },
    accent: {
        700: "#0F7FB5",
        500: "#1FA8E6",
        300: "#63D0FF",
        100: "#E6F8FF"
    },
    success: "#16A34A",
    warning: "#F59E0B",
    danger: "#DC2626",
    info: "#2563EB",
    neutral: {
        background: "#F8FAFC",
        card: "#FFFFFF",
        border: "#E5E7EB",
        textPrimary: "#0F172A",
        textSecondary: "#475569"
    }
} as const;

export const darkThemeColors = {
    background: "#081122",
    paper: "#0E1730",
    border: "rgba(148, 163, 184, 0.18)",
    textPrimary: "#E2E8F0",
    textSecondary: "#CBD5E1"
} as const;

export const workplaceGradient = `linear-gradient(135deg, ${brandColors.primary[900]}, ${brandColors.accent[500]})`;
