import { Box, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { ReactNode } from "react";

import { brandColors, darkThemeColors } from "../../theme/colors";

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
    const isDarkSurface = isSurface && theme.palette.mode === "dark";

    return (
        <Box
            sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 2.5,
                border: `1px solid ${
                    isDarkSurface
                        ? alpha(brandColors.warning, 0.24)
                        : alpha(brandColors.primary[300], isSurface ? 0.18 : 0.3)
                }`,
                background: isSurface
                    ? (
                        isDarkSurface
                            ? `linear-gradient(180deg, ${alpha(darkThemeColors.paper, 0.98)} 0%, ${alpha("#111827", 0.98)} 100%)`
                            : `linear-gradient(180deg, ${alpha(brandColors.primary[100], 0.34)} 0%, #FFFFFF 68%)`
                    )
                    : "var(--workplace-gradient)",
                color: isSurface ? (isDarkSurface ? darkThemeColors.textPrimary : brandColors.neutral.textPrimary) : "#FFFFFF",
                boxShadow: isSurface
                    ? (
                        isDarkSurface
                            ? "0 12px 30px rgba(0, 0, 0, 0.22)"
                            : "0 12px 30px rgba(15, 23, 42, 0.04)"
                    )
                    : "none"
            }}
        >
            <Stack direction={{ xs: "column", lg: "row" }} spacing={2} justifyContent="space-between">
                <Stack spacing={1}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: isSurface
                                ? (isDarkSurface ? "#FDE68A" : brandColors.primary[700])
                                : alpha("#FFFFFF", 0.8),
                            letterSpacing: 2.5
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
                            maxWidth: 820,
                            color: isSurface
                                ? (isDarkSurface ? darkThemeColors.textSecondary : brandColors.neutral.textSecondary)
                                : alpha("#FFFFFF", 0.88)
                        }}
                    >
                        {description}
                    </Typography>
                </Stack>
                {actions ? (
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="flex-start"
                        sx={
                            isDarkSurface
                                ? {
                                    "& .MuiButton-contained": {
                                        bgcolor: brandColors.warning,
                                        color: "#0F172A",
                                        "&:hover": {
                                            bgcolor: "#FBBF24"
                                        }
                                    },
                                    "& .MuiButton-outlined": {
                                        color: "#FDE68A",
                                        borderColor: alpha(brandColors.warning, 0.4),
                                        "&:hover": {
                                            borderColor: alpha(brandColors.warning, 0.56),
                                            backgroundColor: alpha(brandColors.warning, 0.12)
                                        }
                                    }
                                }
                                : undefined
                        }
                    >
                        {actions}
                    </Stack>
                ) : null}
            </Stack>
        </Box>
    );
}
