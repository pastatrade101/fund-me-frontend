import { CssBaseline, GlobalStyles, ThemeProvider, alpha, createTheme } from "@mui/material";
import type { PropsWithChildren } from "react";

import { useUI } from "./UIProvider";
import { brandColors, darkThemeColors, workplaceGradient } from "../theme/colors";

export function AppThemeProvider({ children }: PropsWithChildren) {
    const { theme } = useUI();
    const isLight = theme === "light";
    const darkWarmPrimary = "#FBBF24";
    const darkWarmPrimaryDark = "#F59E0B";
    const darkWarmPrimaryLight = "#FDE68A";
    const appRadius = 4;

    const muiTheme = createTheme({
        palette: {
            mode: theme,
            primary: {
                main: isLight ? brandColors.primary[900] : darkWarmPrimary,
                dark: isLight ? brandColors.primary[700] : darkWarmPrimaryDark,
                light: isLight ? brandColors.primary[300] : darkWarmPrimaryLight,
                contrastText: isLight ? "#FFFFFF" : "#0F172A"
            },
            secondary: {
                main: isLight ? brandColors.accent[500] : darkWarmPrimary,
                dark: isLight ? brandColors.accent[700] : darkWarmPrimaryDark,
                light: isLight ? brandColors.accent[300] : darkWarmPrimaryLight,
                contrastText: isLight ? "#FFFFFF" : "#0F172A"
            },
            success: { main: brandColors.success },
            warning: { main: brandColors.warning },
            error: { main: brandColors.danger },
            info: { main: brandColors.info },
            background: {
                default: isLight ? brandColors.neutral.background : darkThemeColors.background,
                paper: isLight ? brandColors.neutral.card : darkThemeColors.paper
            },
            text: {
                primary: isLight ? brandColors.neutral.textPrimary : darkThemeColors.textPrimary,
                secondary: isLight ? brandColors.neutral.textSecondary : darkThemeColors.textSecondary
            },
            divider: isLight ? brandColors.neutral.border : darkThemeColors.border
        },
        shape: {
            borderRadius: appRadius
        },
        typography: {
            fontFamily: "\"Inter\", \"Segoe UI\", sans-serif",
            h4: { fontWeight: 800, letterSpacing: -0.4 },
            h5: { fontWeight: 800 },
            h6: { fontWeight: 700 },
            button: { textTransform: "none", fontWeight: 700 }
        },
        components: {
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: "none",
                        borderRadius: appRadius,
                        border: `1px solid ${isLight ? brandColors.neutral.border : darkThemeColors.border}`
                    }
                }
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: appRadius,
                        boxShadow: isLight
                            ? "0 14px 32px rgba(15, 23, 42, 0.06)"
                            : "0 14px 32px rgba(0, 0, 0, 0.25)"
                    }
                }
            },
            MuiButton: {
                defaultProps: {
                    disableElevation: true
                },
                styleOverrides: {
                    root: {
                        minHeight: 40,
                        borderRadius: appRadius,
                        paddingInline: 16
                    }
                }
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: appRadius,
                        backgroundColor: isLight ? "#FFFFFF" : alpha("#FFFFFF", 0.04)
                    }
                }
            },
            MuiFilledInput: {
                styleOverrides: {
                    root: {
                        borderRadius: appRadius
                    }
                }
            },
            MuiInputBase: {
                styleOverrides: {
                    root: {
                        borderRadius: appRadius
                    }
                }
            },
            MuiChip: {
                styleOverrides: {
                    root: { borderRadius: appRadius - 1 }
                }
            },
            MuiAlert: {
                styleOverrides: {
                    root: {
                        borderRadius: appRadius
                    }
                }
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: appRadius + 2
                    }
                }
            },
            MuiMenu: {
                styleOverrides: {
                    paper: {
                        borderRadius: appRadius
                    }
                }
            },
            MuiPopover: {
                styleOverrides: {
                    paper: {
                        borderRadius: appRadius
                    }
                }
            }
        }
    });

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <GlobalStyles
                styles={{
                    ":root": {
                        "--workplace-gradient": workplaceGradient
                    },
                    body: {
                        backgroundColor: muiTheme.palette.background.default
                    }
                }}
            />
            {children}
        </ThemeProvider>
    );
}
