import { Button, type ButtonProps } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import { cn } from "../../lib/cn";

type GradientButtonProps = ButtonProps & {
    glow?: boolean;
    [key: string]: unknown;
};

export function GradientButton({ glow = true, className, sx, children, ...props }: GradientButtonProps) {
    const theme = useTheme();

    return (
        <Button
            variant="contained"
            className={cn("relative overflow-hidden", className)}
            sx={[
                {
                    borderRadius: theme.fundMe.radius.md,
                    background: theme.fundMe.gradients.button,
                    color: "#FFFFFF",
                    boxShadow: glow ? theme.fundMe.shadows.lift : theme.fundMe.shadows.soft,
                    border: 0,
                    "&:hover": {
                        background: theme.fundMe.gradients.buttonHover,
                        boxShadow: glow ? theme.fundMe.shadows.lift : theme.fundMe.shadows.soft
                    },
                    "&::before": {
                        content: "\"\"",
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(135deg, ${alpha("#FFFFFF", 0.22)} 0%, transparent 42%)`,
                        pointerEvents: "none"
                    }
                },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : [])
            ]}
            {...props}
        >
            {children}
        </Button>
    );
}
