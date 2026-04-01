import { Paper, type PaperProps } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { forwardRef } from "react";

import { cn } from "../../lib/cn";

interface GlassCardProps extends PaperProps {
    tint?: "default" | "strong" | "accent" | "dark";
    hoverLift?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
    {
        tint = "default",
        hoverLift = false,
        className,
        sx,
        children,
        ...props
    },
    ref
) {
    const theme = useTheme();
    const isLight = theme.palette.mode === "light";

    const background = tint === "accent"
        ? theme.fundMe.surfaces.glassAccent
        : tint === "strong"
            ? theme.fundMe.surfaces.glassStrong
            : tint === "dark"
                ? `linear-gradient(180deg, ${alpha("#0D1833", 0.88)} 0%, ${alpha("#102042", 0.82)} 100%)`
                : theme.fundMe.surfaces.glass;

    const borderColor = tint === "accent"
        ? alpha(theme.palette.primary.main, isLight ? 0.12 : 0.18)
        : tint === "dark"
            ? alpha("#FFFFFF", 0.08)
            : (isLight ? alpha(theme.palette.primary.main, 0.08) : alpha("#FFFFFF", 0.08));

    return (
        <Paper
            ref={ref}
            className={cn(
                "glass-panel relative overflow-hidden transition-all duration-300 ease-out",
                hoverLift && "hover:-translate-y-0.5 hover:shadow-2xl",
                className
            )}
            sx={[
                {
                    borderRadius: theme.fundMe.radius.lg,
                    background: background,
                    borderColor,
                    boxShadow: theme.fundMe.shadows.glass,
                    backdropFilter: `blur(${theme.fundMe.blur.md})`,
                    "&::before": {
                        content: "\"\"",
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        background: tint === "dark"
                            ? `
                                radial-gradient(circle at top right, ${alpha("#FFFFFF", 0.08)} 0%, transparent 30%),
                                radial-gradient(circle at bottom left, ${alpha(theme.palette.secondary.main, 0.16)} 0%, transparent 32%)
                            `
                            : theme.fundMe.gradients.spotlight,
                        opacity: tint === "dark" ? 0.88 : 1
                    }
                },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : [])
            ]}
            {...props}
        >
            {children}
        </Paper>
    );
});
