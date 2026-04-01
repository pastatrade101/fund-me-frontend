import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TrendingFlatRoundedIcon from "@mui/icons-material/TrendingFlatRounded";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";

import { GlassCard } from "./GlassCard";
import { AppTooltip } from "./AppTooltip";

export interface DashboardStatCardProps {
    label: string;
    value: string;
    helper: string;
    icon: SvgIconComponent;
    tone?: "primary" | "success" | "warning";
    trendLabel?: string;
    trendDirection?: "up" | "down" | "neutral";
    trendTone?: "positive" | "negative" | "neutral";
}

export function DashboardStatCard({
    label,
    value,
    helper,
    icon: Icon,
    tone = "primary",
    trendLabel,
    trendDirection = "neutral",
    trendTone = "neutral"
}: DashboardStatCardProps) {
    const theme = useTheme();
    const toneColor = tone === "success"
        ? theme.palette.success.main
        : tone === "warning"
            ? theme.palette.warning.main
            : theme.palette.primary.main;
    const TrendIcon = trendDirection === "up"
        ? ArrowUpwardRoundedIcon
        : trendDirection === "down"
            ? ArrowDownwardRoundedIcon
            : TrendingFlatRoundedIcon;
    const trendColor = trendTone === "positive"
        ? theme.palette.success.main
        : trendTone === "negative"
            ? theme.palette.error.main
            : theme.palette.text.secondary;

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ height: "100%" }}
        >
            <GlassCard tint="strong" hoverLift sx={{ height: "100%", p: 2.2, borderRadius: theme.fundMe.radius.lg }}>
                <Stack spacing={1.55} sx={{ height: "100%", position: "relative", zIndex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.25}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="overline" color="text.secondary">
                                {label}
                            </Typography>
                            <AppTooltip content={helper}>
                                <IconButton
                                    size="small"
                                    sx={{
                                        p: 0.2,
                                        color: "text.secondary",
                                    }}
                                >
                                    <InfoOutlinedIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                            </AppTooltip>
                        </Stack>
                        <Box
                            sx={{
                                width: 46,
                                height: 46,
                                borderRadius: 2.5,
                                display: "grid",
                                placeItems: "center",
                                color: toneColor,
                                background: `linear-gradient(135deg, ${alpha(toneColor, 0.18)} 0%, ${alpha(theme.palette.common.white, theme.palette.mode === "light" ? 0.66 : 0.06)} 100%)`,
                                border: `1px solid ${alpha(toneColor, 0.18)}`
                            }}
                        >
                            <Icon fontSize="small" />
                        </Box>
                    </Stack>

                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: -0.8
                        }}
                    >
                        {value}
                    </Typography>

                    {trendLabel ? (
                        <Stack direction="row" spacing={0.7} alignItems="center">
                            <TrendIcon sx={{ fontSize: 16, color: trendColor }} />
                            <Typography variant="body2" sx={{ color: trendColor, fontWeight: 700 }}>
                                {trendLabel}
                            </Typography>
                        </Stack>
                    ) : null}

                    <Typography variant="body2" color="text.secondary">
                        {helper}
                    </Typography>
                </Stack>
            </GlassCard>
        </motion.div>
    );
}
