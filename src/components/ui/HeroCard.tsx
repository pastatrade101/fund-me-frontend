import { Box, Chip, Stack, Typography } from "@mui/material";
import { alpha, useTheme, type SxProps, type Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

import { GlassCard } from "./GlassCard";

interface HeroCardProps {
    eyebrow: string;
    title: string;
    description?: string;
    icon?: ReactNode;
    badge?: string;
    tone?: "light" | "dark" | "accent";
    children?: ReactNode;
    sx?: SxProps<Theme>;
}

export function HeroCard({
    eyebrow,
    title,
    description,
    icon,
    badge,
    tone = "light",
    children,
    sx
}: HeroCardProps) {
    const theme = useTheme();
    const isLight = theme.palette.mode === "light";
    const darkTone = tone === "dark";

    return (
        <GlassCard
            tint={darkTone ? "dark" : tone === "accent" ? "accent" : "strong"}
            sx={[
                {
                    p: { xs: 2, md: 2.4 },
                    borderRadius: theme.fundMe.radius.lg,
                    color: darkTone ? "#FFFFFF" : "text.primary",
                    boxShadow: darkTone ? theme.fundMe.shadows.lift : theme.fundMe.shadows.glass
                },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : [])
            ]}
        >
            <Stack spacing={1.4} sx={{ position: "relative", zIndex: 1 }}>
                <Stack direction="row" justifyContent="space-between" spacing={1.25} alignItems="flex-start">
                    <Stack direction="row" spacing={1.1} alignItems="center">
                        {icon ? (
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    display: "grid",
                                    placeItems: "center",
                                    bgcolor: darkTone ? alpha("#FFFFFF", 0.1) : alpha(theme.palette.primary.main, 0.08)
                                }}
                            >
                                {icon}
                            </Box>
                        ) : null}
                        <Box>
                            <Typography variant="overline" sx={{ color: darkTone ? alpha("#FFFFFF", 0.68) : "text.secondary" }}>
                                {eyebrow}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                {title}
                            </Typography>
                        </Box>
                    </Stack>
                    {badge ? (
                        <Chip
                            label={badge}
                            size="small"
                            variant="outlined"
                            sx={{
                                color: darkTone ? "#FFFFFF" : "text.primary",
                                bgcolor: darkTone
                                    ? alpha("#FFFFFF", 0.08)
                                    : (isLight ? alpha(theme.palette.primary.main, 0.06) : alpha("#FFFFFF", 0.05)),
                                borderColor: darkTone
                                    ? alpha("#FFFFFF", 0.12)
                                    : alpha(theme.palette.primary.main, 0.1)
                            }}
                        />
                    ) : null}
                </Stack>
                {description ? (
                    <Typography variant="body2" sx={{ color: darkTone ? alpha("#FFFFFF", 0.74) : "text.secondary" }}>
                        {description}
                    </Typography>
                ) : null}
                {children}
            </Stack>
        </GlassCard>
    );
}
