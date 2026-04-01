import { Box, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { ReactNode } from "react";

import { GlassCard } from "../ui/GlassCard";

interface PageHeroProps {
    eyebrow: string;
    title: string;
    description: string;
    actions?: ReactNode;
    tone?: "gradient" | "surface";
}

export function PageHero({ eyebrow, title, description, actions, tone = "gradient" }: PageHeroProps) {
    const theme = useTheme();
    const isSurface = tone === "surface";
    const isLight = theme.palette.mode === "light";

    return (
        <GlassCard
            tint={isSurface ? "strong" : "dark"}
            className={isSurface ? "glass-panel" : "glass-panel premium-grid"}
            sx={{
                p: { xs: 2.4, md: 3.25 },
                borderRadius: theme.fundMe.radius.xl,
                background: isSurface ? theme.fundMe.gradients.hero : theme.fundMe.gradients.accent,
                color: isSurface ? "text.primary" : "#FFFFFF",
                boxShadow: isSurface ? theme.fundMe.shadows.glass : theme.fundMe.shadows.lift
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background: isSurface
                        ? theme.fundMe.gradients.spotlight
                        : `radial-gradient(circle at top right, ${alpha("#FFFFFF", 0.14)} 0%, transparent 32%)`,
                    pointerEvents: "none"
                }}
            />
            <Stack
                direction={{ xs: "column", lg: "row" }}
                spacing={2.25}
                justifyContent="space-between"
                sx={{ position: "relative", zIndex: 1 }}
            >
                <Stack spacing={1.1}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: isSurface
                                ? (isLight ? theme.palette.primary.dark : theme.palette.warning.light)
                                : alpha("#FFFFFF", 0.78),
                            letterSpacing: 2.8,
                            fontWeight: 700
                        }}
                    >
                        {eyebrow}
                    </Typography>
                    <Typography variant="h4" sx={{ maxWidth: 760 }}>
                        {title}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            maxWidth: 840,
                            color: isSurface ? "text.secondary" : alpha("#FFFFFF", 0.84)
                        }}
                    >
                        {description}
                    </Typography>
                </Stack>

                {actions ? (
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        alignItems="flex-start"
                        sx={{
                            minWidth: { lg: 240 },
                            "& .MuiButton-outlined": {
                                borderColor: isSurface
                                    ? alpha(theme.palette.primary.main, 0.16)
                                    : alpha("#FFFFFF", 0.2),
                                color: isSurface ? "text.primary" : "#FFFFFF",
                                backgroundColor: isSurface ? alpha("#FFFFFF", 0.46) : alpha("#FFFFFF", 0.06),
                                backdropFilter: `blur(${theme.fundMe.blur.sm})`
                            }
                        }}
                    >
                        {actions}
                    </Stack>
                ) : null}
            </Stack>
        </GlassCard>
    );
}
