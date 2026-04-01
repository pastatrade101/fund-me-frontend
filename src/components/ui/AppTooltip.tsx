import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, IconButton, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

interface AppTooltipProps {
    content: ReactNode;
    children?: ReactNode;
}

export function AppTooltip({ content, children }: AppTooltipProps) {
    const theme = useTheme();
    const isLight = theme.palette.mode === "light";

    return (
        <Tooltip.Provider delayDuration={150}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    {children ?? (
                        <IconButton size="small" sx={{ p: 0.25, color: "text.secondary" }}>
                            <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    )}
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content
                        sideOffset={10}
                        className={cn("glass-panel z-50 max-w-64 rounded-md px-3 py-2 shadow-2xl")}
                        style={{
                            background: isLight ? alpha("#FFFFFF", 0.94) : alpha("#081122", 0.94),
                            border: `1px solid ${isLight ? alpha(theme.palette.primary.main, 0.1) : alpha("#FFFFFF", 0.08)}`,
                            backdropFilter: `blur(${theme.fundMe.blur.md})`
                        }}
                    >
                        {typeof content === "string" ? (
                            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                                {content}
                            </Typography>
                        ) : (
                            <Box>{content}</Box>
                        )}
                        <Tooltip.Arrow
                            width={10}
                            height={6}
                            style={{
                                fill: isLight ? alpha("#FFFFFF", 0.94) : alpha("#081122", 0.94)
                            }}
                        />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
}
