import { Box, CardContent, Stack, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";

import { MotionCard } from "../../ui/motion";
import { brandColors } from "../../theme/colors";

interface StatCardProps {
    label: string;
    value: string;
    helper: string;
    icon: SvgIconComponent;
    tone?: "primary" | "success" | "warning";
}

export function StatCard({ label, value, helper, icon: Icon, tone = "primary" }: StatCardProps) {
    const theme = useTheme();
    const toneColor = tone === "success"
        ? brandColors.success
        : tone === "warning"
            ? (theme.palette.mode === "dark" ? "#FBBF24" : brandColors.warning)
            : (theme.palette.mode === "dark" ? "#FCD34D" : brandColors.primary[900]);

    return (
        <MotionCard variant="outlined" sx={{ height: "100%" }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="overline" color="text.secondary">
                        {label}
                    </Typography>
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2,
                            display: "grid",
                            placeItems: "center",
                            color: toneColor,
                            bgcolor: alpha(toneColor, theme.palette.mode === "dark" ? 0.2 : 0.12)
                        }}
                    >
                        <Icon fontSize="small" />
                    </Box>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {helper}
                </Typography>
            </CardContent>
        </MotionCard>
    );
}
