import { CssBaseline, GlobalStyles, ThemeProvider, alpha, createTheme } from "@mui/material";
import type { PropsWithChildren } from "react";

import { brandColors, darkThemeColors } from "../theme/colors";
import { useUI } from "./UIProvider";

export function AppThemeProvider({ children }: PropsWithChildren) {
    const { theme } = useUI();
    const isLight = theme === "light";
    const darkWarmPrimary = "#FBBF24";
    const darkWarmPrimaryDark = "#F59E0B";
    const darkWarmPrimaryLight = "#FDE68A";
    const appRadius = 3;

    const pageGradient = isLight
        ? `
            radial-gradient(circle at top left, ${alpha(brandColors.accent[300], 0.16)} 0%, transparent 28%),
            radial-gradient(circle at 84% 18%, ${alpha(brandColors.primary[300], 0.14)} 0%, transparent 22%),
            linear-gradient(180deg, #F7FBFF 0%, #F8FAFC 48%, #F1F6FF 100%)
        `
        : `
            radial-gradient(circle at top left, ${alpha(darkWarmPrimaryLight, 0.14)} 0%, transparent 30%),
            radial-gradient(circle at 84% 18%, ${alpha(darkWarmPrimary, 0.16)} 0%, transparent 24%),
            linear-gradient(180deg, #07101F 0%, #081122 48%, #0B1730 100%)
        `;

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
            divider: isLight ? alpha(brandColors.primary[500], 0.12) : darkThemeColors.border
        },
        shape: {
            borderRadius: appRadius
        },
        typography: {
            fontFamily: "\"Inter\", \"Segoe UI\", sans-serif",
            h1: {
                fontFamily: "\"Plus Jakarta Sans\", \"Inter\", sans-serif",
                fontWeight: 800,
                letterSpacing: -2.2,
                lineHeight: 0.98
            },
            h2: {
                fontFamily: "\"Plus Jakarta Sans\", \"Inter\", sans-serif",
                fontWeight: 800,
                letterSpacing: -1.6,
                lineHeight: 1
            },
            h3: {
                fontFamily: "\"Plus Jakarta Sans\", \"Inter\", sans-serif",
                fontWeight: 800,
                letterSpacing: -1.2,
                lineHeight: 1.04
            },
            h4: {
                fontFamily: "\"Plus Jakarta Sans\", \"Inter\", sans-serif",
                fontWeight: 800,
                letterSpacing: -0.8,
                lineHeight: 1.08
            },
            h5: {
                fontFamily: "\"Plus Jakarta Sans\", \"Inter\", sans-serif",
                fontWeight: 800
            },
            h6: {
                fontFamily: "\"Plus Jakarta Sans\", \"Inter\", sans-serif",
                fontWeight: 700
            },
            body1: {
                lineHeight: 1.75
            },
            body2: {
                lineHeight: 1.65
            },
            button: {
                textTransform: "none",
                fontWeight: 700,
                letterSpacing: -0.1
            }
        },
            fundMe: {
                gradients: {
                    page: pageGradient,
                    hero: isLight
                        ? `linear-gradient(135deg, ${alpha("#FFFFFF", 0.94)} 0%, ${alpha(brandColors.primary[100], 0.82)} 100%)`
                        : `linear-gradient(135deg, ${alpha("#0E1730", 0.98)} 0%, ${alpha("#101C3A", 0.98)} 100%)`,
                    accent: isLight
                        ? `linear-gradient(135deg, ${brandColors.primary[900]} 0%, ${brandColors.primary[700]} 56%, ${brandColors.accent[500]} 100%)`
                        : `linear-gradient(135deg, #121018 0%, #3C2A07 58%, ${darkWarmPrimary} 100%)`,
                    button: isLight
                        ? `linear-gradient(135deg, ${brandColors.primary[900]} 0%, ${brandColors.primary[700]} 52%, ${brandColors.accent[500]} 100%)`
                        : `linear-gradient(135deg, #2A1B05 0%, #7C5509 52%, ${darkWarmPrimary} 100%)`,
                    buttonHover: isLight
                        ? `linear-gradient(135deg, ${brandColors.primary[700]} 0%, ${brandColors.primary[500]} 56%, ${brandColors.accent[300]} 100%)`
                        : `linear-gradient(135deg, #4A3207 0%, #A66F0B 56%, ${darkWarmPrimaryLight} 100%)`,
                    spotlight: isLight
                        ? `radial-gradient(circle at top right, ${alpha(brandColors.accent[300], 0.26)} 0%, transparent 28%)`
                        : `radial-gradient(circle at top right, ${alpha(darkWarmPrimaryLight, 0.22)} 0%, transparent 30%)`
                },
                surfaces: {
                    glass: isLight ? alpha("#FFFFFF", 0.72) : alpha("#0E1730", 0.76),
                    glassStrong: isLight ? alpha("#FFFFFF", 0.86) : alpha("#0B1225", 0.88),
                    glassAccent: isLight ? alpha(brandColors.primary[100], 0.62) : alpha(darkWarmPrimary, 0.12)
                },
            blur: {
                sm: "10px",
                md: "18px",
                lg: "28px"
            },
            radius: {
                xs: "2px",
                sm: "3px",
                md: "4px",
                lg: "6px",
                xl: "8px"
            },
            shadows: {
                soft: isLight ? "0 18px 44px rgba(15, 23, 42, 0.05)" : "0 18px 44px rgba(0, 0, 0, 0.22)",
                glass: isLight ? "0 24px 64px rgba(15, 23, 42, 0.08)" : "0 24px 64px rgba(0, 0, 0, 0.32)",
                lift: isLight ? "0 30px 72px rgba(10, 5, 115, 0.16)" : "0 30px 72px rgba(0, 0, 0, 0.34)"
            }
        },
        components: {
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: "none",
                        borderRadius: appRadius + 1,
                        border: `1px solid ${isLight ? alpha(brandColors.primary[500], 0.08) : darkThemeColors.border}`
                    }
                }
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: appRadius + 2,
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
                        minHeight: 42,
                        borderRadius: appRadius + 1,
                        paddingInline: 16
                    },
                    outlined: {
                        borderColor: isLight ? alpha(brandColors.primary[500], 0.16) : alpha("#FFFFFF", 0.14)
                    }
                }
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: appRadius + 1,
                        backgroundColor: isLight ? alpha("#FFFFFF", 0.94) : alpha("#FFFFFF", 0.04)
                    }
                }
            },
            MuiFilledInput: {
                styleOverrides: {
                    root: {
                        borderRadius: appRadius + 1
                    }
                }
            },
            MuiInputBase: {
                styleOverrides: {
                    root: {
                        borderRadius: appRadius + 1
                    }
                }
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: appRadius,
                        fontWeight: 600
                    }
                }
            },
            MuiAlert: {
                styleOverrides: {
                    root: {
                        borderRadius: appRadius + 1
                    }
                }
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: appRadius + 3,
                        backdropFilter: "blur(14px)"
                    }
                }
            },
            MuiMenu: {
                styleOverrides: {
                    paper: {
                        borderRadius: appRadius + 1,
                        backdropFilter: "blur(14px)"
                    }
                }
            },
            MuiPopover: {
                styleOverrides: {
                    paper: {
                        borderRadius: appRadius + 1,
                        backdropFilter: "blur(14px)"
                    }
                }
            },
            MuiLinearProgress: {
                styleOverrides: {
                    root: {
                        borderRadius: 999
                    },
                    bar: {
                        borderRadius: 999
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
                        "--workplace-gradient": muiTheme.fundMe.gradients.accent
                    },
                    body: {
                        backgroundColor: muiTheme.palette.background.default,
                        backgroundImage: muiTheme.fundMe.gradients.page
                    },
                    "::selection": {
                        backgroundColor: alpha(muiTheme.palette.primary.main, muiTheme.palette.mode === "dark" ? 0.28 : 0.18)
                    }
                }}
            />
            {children}
        </ThemeProvider>
    );
}
