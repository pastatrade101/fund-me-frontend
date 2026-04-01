import { Card, type CardProps } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";

import { cn } from "../../lib/cn";

const MotionBox = motion.div;

export function MotionCard({ className, sx, children, ...props }: CardProps) {
    const theme = useTheme();
    const isLight = theme.palette.mode === "light";

    return (
        <MotionBox
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            style={{ height: "100%" }}
        >
            <Card
                className={cn("glass-panel relative overflow-hidden", className)}
                sx={[
                    {
                        height: "100%",
                        borderRadius: theme.fundMe.radius.lg,
                        background: theme.fundMe.surfaces.glassStrong,
                        borderColor: isLight ? alpha(theme.palette.primary.main, 0.08) : alpha("#FFFFFF", 0.08),
                        boxShadow: theme.fundMe.shadows.glass,
                        backdropFilter: `blur(${theme.fundMe.blur.md})`,
                        "&::before": {
                            content: "\"\"",
                            position: "absolute",
                            inset: 0,
                            background: theme.fundMe.gradients.spotlight,
                            pointerEvents: "none"
                        }
                    },
                    ...(Array.isArray(sx) ? sx : sx ? [sx] : [])
                ]}
                {...props}
            >
                {children}
            </Card>
        </MotionBox>
    );
}
