import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LockOutlineRoundedIcon from "@mui/icons-material/LockOutlineRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import {
    Alert,
    alpha,
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth, toAuthErrorMessage } from "../auth/AuthContext";
import { api } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import { brandColors } from "../theme/colors";

const loginShellRadius = "10px";
const loginInnerRadius = "8px";
const loginChipRadius = "6px";
const loginFieldRadius = "8px";
const loginButtonRadius = "8px";

export function SignInPage() {
    const theme = useTheme();
    const isLight = theme.palette.mode === "light";
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { signIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState(
        searchParams.get("reset") === "success"
            ? "Password updated successfully. Sign in with your new password."
            : ""
    );
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotSubmitting, setForgotSubmitting] = useState(false);

    const helperChips = useMemo(
        () => [
            "Member access",
            "Contribution tracking",
            "Reporting"
        ],
        []
    );

    const fieldSurface = isLight ? alpha("#FFFFFF", 0.96) : alpha("#FFFFFF", 0.06);
    const fieldBorder = isLight ? alpha(brandColors.primary[900], 0.12) : alpha(theme.palette.primary.light, 0.2);
    const fieldHoverBorder = isLight ? alpha(brandColors.primary[500], 0.32) : alpha(theme.palette.primary.light, 0.34);
    const fieldFocusBorder = isLight ? brandColors.primary[500] : theme.palette.primary.light;
    const fieldFocusRing = isLight
        ? alpha(brandColors.accent[100], 0.72)
        : alpha(theme.palette.primary.main, 0.18);
    const fieldLabelColor = isLight ? alpha(brandColors.primary[900], 0.68) : alpha("#FFFFFF", 0.7);
    const fieldAdornmentColor = isLight ? alpha(brandColors.primary[900], 0.46) : alpha(theme.palette.primary.light, 0.82);
    const fieldAutofillText = isLight ? brandColors.neutral.textPrimary : theme.palette.text.primary;

    const fieldSx = {
        "& .MuiInputLabel-root": {
            color: fieldLabelColor
        },
        "& .MuiInputLabel-root.Mui-focused": {
            color: fieldFocusBorder
        },
        "& .MuiInputLabel-root.MuiInputLabel-shrink": {
            px: 0.6,
            borderRadius: "999px",
            bgcolor: theme.palette.background.paper
        },
        "& .MuiOutlinedInput-root": {
            minHeight: 56,
            borderRadius: loginFieldRadius,
            backgroundColor: fieldSurface,
            backdropFilter: "blur(10px)",
            transition: "border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
            "& fieldset": {
                borderColor: fieldBorder
            },
            "&:hover fieldset": {
                borderColor: fieldHoverBorder
            },
            "&.Mui-focused fieldset": {
                borderColor: fieldFocusBorder
            },
            "&.Mui-focused": {
                boxShadow: `0 0 0 4px ${fieldFocusRing}`
            }
        },
        "& .MuiOutlinedInput-input": {
            backgroundColor: "transparent",
            color: theme.palette.text.primary
        },
        "& .MuiOutlinedInput-input:-webkit-autofill": {
            WebkitTextFillColor: fieldAutofillText,
            WebkitBoxShadow: `0 0 0 100px ${fieldSurface} inset`,
            boxShadow: `0 0 0 100px ${fieldSurface} inset`,
            caretColor: fieldAutofillText,
            borderRadius: "inherit",
            transition: "background-color 9999s ease-out 0s"
        },
        "& .MuiOutlinedInput-input:-webkit-autofill:hover": {
            WebkitTextFillColor: fieldAutofillText,
            WebkitBoxShadow: `0 0 0 100px ${fieldSurface} inset`,
            boxShadow: `0 0 0 100px ${fieldSurface} inset`
        },
        "& .MuiOutlinedInput-input:-webkit-autofill:focus": {
            WebkitTextFillColor: fieldAutofillText,
            WebkitBoxShadow: `0 0 0 100px ${fieldSurface} inset`,
            boxShadow: `0 0 0 100px ${fieldSurface} inset`
        },
        "& .MuiInputAdornment-positionStart": {
            color: fieldAdornmentColor,
            marginRight: 1
        },
        "& .MuiInputAdornment-positionEnd": {
            color: fieldAdornmentColor
        },
        "& .MuiIconButton-root": {
            color: "inherit"
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                px: { xs: 2, md: 3 },
                py: { xs: 3, md: 4 },
                display: "grid",
                placeItems: "center",
                background: `
                    radial-gradient(circle at top left, ${alpha(brandColors.accent[300], 0.18)} 0%, transparent 32%),
                    linear-gradient(180deg, ${alpha(brandColors.primary[100], 0.52)} 0%, #F8FAFC 46%)
                `
            }}
        >
            <Paper
                sx={{
                    width: "100%",
                    maxWidth: 1020,
                    overflow: "hidden",
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "0.96fr 1.04fr" },
                    minHeight: { xs: "auto", md: 680 },
                    borderRadius: loginShellRadius,
                    boxShadow: "0 24px 72px rgba(15, 23, 42, 0.12)"
                }}
            >
                <Box
                    sx={{
                        display: { xs: "none", md: "block" },
                        background: "var(--workplace-gradient)",
                        color: "common.white",
                        p: { xs: 3, md: 4.25 },
                        position: "relative",
                        overflow: "hidden"
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            background: `
                                radial-gradient(circle at top right, ${alpha("#FFFFFF", 0.16)} 0%, transparent 30%),
                                radial-gradient(circle at bottom left, ${alpha(brandColors.accent[100], 0.18)} 0%, transparent 34%)
                            `,
                            pointerEvents: "none"
                        }}
                    />

                    <Stack
                        spacing={4}
                        justifyContent="space-between"
                        sx={{ position: "relative", zIndex: 1, height: "100%" }}
                    >
                        <Stack spacing={3}>
                            <Stack spacing={1.25}>
                                <Stack direction="row" spacing={1.25} alignItems="center">
                                    <Box
                                        component="img"
                                        src="/changa2.svg"
                                        alt="Changa logo"
                                        sx={{
                                            width: 42,
                                            height: 42,
                                            objectFit: "contain",
                                            filter: "drop-shadow(0 10px 24px rgba(15, 23, 42, 0.18))"
                                        }}
                                    />
                                    <Typography variant="overline" sx={{ letterSpacing: 3, opacity: 0.82 }}>
                                        Fund-Me Workplace Contributions
                                    </Typography>
                                </Stack>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: { xs: "2rem", md: "2.7rem" },
                                        lineHeight: 1.06,
                                        maxWidth: 430
                                    }}
                                >
                                    Secure access for contribution operations.
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        maxWidth: 430,
                                        color: alpha("#FFFFFF", 0.84),
                                        fontSize: { xs: "1rem", md: "1.05rem" },
                                        lineHeight: 1.7
                                    }}
                                >
                                    Sign in to manage members, contribution events, reports, and payment tracking from
                                    one workspace.
                                </Typography>
                            </Stack>

                            <Stack direction="row" flexWrap="wrap" gap={1}>
                                {helperChips.map((chip) => (
                                    <Chip
                                        key={chip}
                                        label={chip}
                                        variant="outlined"
                                        sx={{
                                            color: "common.white",
                                            borderColor: alpha("#FFFFFF", 0.18),
                                            backgroundColor: alpha("#FFFFFF", 0.1),
                                            height: 32,
                                            borderRadius: loginChipRadius
                                        }}
                                    />
                                ))}
                            </Stack>
                        </Stack>

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2.5,
                                borderRadius: loginInnerRadius,
                                borderColor: alpha("#FFFFFF", 0.16),
                                bgcolor: alpha("#FFFFFF", 0.1),
                                color: "common.white",
                                maxWidth: 430
                            }}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: loginInnerRadius,
                                        display: "grid",
                                        placeItems: "center",
                                        bgcolor: alpha("#FFFFFF", 0.14),
                                        flexShrink: 0
                                    }}
                                >
                                    <ShieldRoundedIcon fontSize="small" />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                                        Member recovery and role-based access
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: alpha("#FFFFFF", 0.76), lineHeight: 1.7 }}>
                                        Members can reset passwords here. Fund Managers and Admin users continue into
                                        their assigned workspace after sign-in.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Stack>
                </Box>

                <Box
                    sx={{
                        p: { xs: 3, md: 4.25 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: (theme) => theme.palette.background.paper
                    }}
                >
                    <Stack spacing={2.75} sx={{ width: "100%", maxWidth: 400 }}>
                        <Stack spacing={1.25}>
                            <Stack direction="row" spacing={1.25} alignItems="center">
                                <Box
                                    component="img"
                                    src="/changa2.svg"
                                    alt="Changa logo"
                                    sx={{
                                        width: 38,
                                        height: 38,
                                        objectFit: "contain"
                                    }}
                                />
                                <Typography variant="overline" color="primary" sx={{ letterSpacing: 2.4 }}>
                                    Workspace access
                                </Typography>
                            </Stack>
                            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.8 }}>
                                Sign in to Fund-Me
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                                Enter your account credentials to continue into the workplace contribution system.
                            </Typography>
                        </Stack>

                        {successMessage ? (
                            <Alert severity="success" sx={{ borderRadius: loginInnerRadius }}>
                                {successMessage}
                            </Alert>
                        ) : null}
                        {errorMessage ? (
                            <Alert severity="error" sx={{ borderRadius: loginInnerRadius }}>
                                {errorMessage}
                            </Alert>
                        ) : null}

                        <Box
                            component="form"
                            onSubmit={async (event) => {
                                event.preventDefault();

                                try {
                                    setSubmitting(true);
                                    setErrorMessage("");
                                    setSuccessMessage("");
                                    await signIn(email.trim(), password, rememberMe);
                                    navigate("/dashboard");
                                } catch (error) {
                                    setErrorMessage(toAuthErrorMessage(error));
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            <Stack spacing={2}>
                                <TextField
                                    label="Email address"
                                    type="email"
                                    variant="outlined"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    autoComplete="email"
                                    fullWidth
                                    sx={fieldSx}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <MailOutlineRoundedIcon />
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <TextField
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    variant="outlined"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    autoComplete="current-password"
                                    fullWidth
                                    sx={fieldSx}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlineRoundedIcon />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    edge="end"
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                    onClick={() => setShowPassword((current) => !current)}
                                                >
                                                    {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    alignItems={{ xs: "flex-start", sm: "center" }}
                                    justifyContent="space-between"
                                    spacing={1}
                                >
                                    <FormControlLabel
                                        sx={{
                                            m: 0,
                                            ".MuiFormControlLabel-label": {
                                                color: "text.secondary"
                                            }
                                        }}
                                        control={
                                            <Checkbox
                                                checked={rememberMe}
                                                onChange={(event) => setRememberMe(event.target.checked)}
                                            />
                                        }
                                        label="Remember me on this device"
                                    />

                                    <Button
                                        variant="text"
                                        sx={{ px: 0.5, minWidth: "auto", fontWeight: 700 }}
                                        onClick={() => {
                                            setForgotEmail(email.trim());
                                            setForgotPasswordOpen(true);
                                        }}
                                    >
                                        Forgot password
                                    </Button>
                                </Stack>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={<LoginRoundedIcon />}
                                    disabled={submitting || !email.trim() || !password}
                                    sx={{
                                        minHeight: 52,
                                        borderRadius: loginButtonRadius,
                                        boxShadow: "0 14px 28px rgba(47, 91, 255, 0.2)"
                                    }}
                                >
                                    {submitting ? "Signing in..." : "Sign in"}
                                </Button>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ textAlign: "center", lineHeight: 1.75, px: 1 }}
                                >
                                    By continuing, you agree to the{" "}
                                    <Box
                                        component={RouterLink}
                                        to="/terms-and-conditions"
                                        sx={{
                                            display: "inline",
                                            color: "primary.main",
                                            textDecoration: "none",
                                            fontWeight: 700
                                        }}
                                    >
                                        Terms & Conditions
                                    </Box>
                                    {" "}and acknowledge the{" "}
                                    <Box
                                        component={RouterLink}
                                        to="/privacy-policy"
                                        sx={{
                                            display: "inline",
                                            color: "primary.main",
                                            textDecoration: "none",
                                            fontWeight: 700
                                        }}
                                    >
                                        Privacy Policy
                                    </Box>
                                    .
                                </Typography>
                            </Stack>
                        </Box>

                    </Stack>
                </Box>
            </Paper>

            <Dialog
                open={forgotPasswordOpen}
                onClose={() => {
                    if (!forgotSubmitting) {
                        setForgotPasswordOpen(false);
                    }
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Member password recovery</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Alert severity="info">
                            If a matching member account exists, Fund-Me will send a password reset link to that email
                            address.
                        </Alert>
                        <TextField
                            label="Member email address"
                            type="email"
                            autoFocus
                            fullWidth
                            value={forgotEmail}
                            onChange={(event) => setForgotEmail(event.target.value)}
                        />
                        <Typography variant="body2" color="text.secondary">
                            This recovery path is intended for member accounts. Staff users should contact the system
                            administrator if they cannot sign in.
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button disabled={forgotSubmitting} onClick={() => setForgotPasswordOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={forgotSubmitting || !forgotEmail.trim()}
                        onClick={async () => {
                            try {
                                setForgotSubmitting(true);
                                setErrorMessage("");
                                await api.post(endpoints.auth.forgotPassword, { email: forgotEmail.trim() });
                                setSuccessMessage(
                                    "If a matching member account exists, a recovery email has been sent."
                                );
                                setForgotPasswordOpen(false);
                            } catch (error) {
                                setErrorMessage(toAuthErrorMessage(error, "Unable to request password recovery."));
                            } finally {
                                setForgotSubmitting(false);
                            }
                        }}
                    >
                        {forgotSubmitting ? "Sending..." : "Send reset link"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
