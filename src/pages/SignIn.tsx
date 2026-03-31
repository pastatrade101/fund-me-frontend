import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LockOutlineRoundedIcon from "@mui/icons-material/LockOutlineRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import WorkspacesRoundedIcon from "@mui/icons-material/WorkspacesRounded";
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
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth, toAuthErrorMessage } from "../auth/AuthContext";
import { api } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import { brandColors } from "../theme/colors";

const fieldSx = {
    "& .MuiOutlinedInput-root": {
        minHeight: 56,
        borderRadius: "16px",
        backgroundColor: alpha("#FFFFFF", 0.96),
        transition: "border-color 160ms ease, box-shadow 160ms ease",
        "& fieldset": {
            borderColor: alpha(brandColors.primary[900], 0.12)
        },
        "&:hover fieldset": {
            borderColor: alpha(brandColors.primary[500], 0.32)
        },
        "&.Mui-focused fieldset": {
            borderColor: brandColors.primary[500]
        },
        "&.Mui-focused": {
            boxShadow: `0 0 0 4px ${alpha(brandColors.accent[100], 0.72)}`
        }
    },
    "& .MuiOutlinedInput-input": {
        backgroundColor: "transparent"
    },
    "& .MuiOutlinedInput-input:-webkit-autofill": {
        WebkitTextFillColor: brandColors.neutral.textPrimary,
        WebkitBoxShadow: `0 0 0 100px ${alpha("#FFFFFF", 0.96)} inset`,
        boxShadow: `0 0 0 100px ${alpha("#FFFFFF", 0.96)} inset`,
        caretColor: brandColors.neutral.textPrimary,
        borderRadius: "inherit",
        transition: "background-color 9999s ease-out 0s"
    },
    "& .MuiOutlinedInput-input:-webkit-autofill:hover": {
        WebkitTextFillColor: brandColors.neutral.textPrimary,
        WebkitBoxShadow: `0 0 0 100px ${alpha("#FFFFFF", 0.96)} inset`,
        boxShadow: `0 0 0 100px ${alpha("#FFFFFF", 0.96)} inset`
    },
    "& .MuiOutlinedInput-input:-webkit-autofill:focus": {
        WebkitTextFillColor: brandColors.neutral.textPrimary,
        WebkitBoxShadow: `0 0 0 100px ${alpha("#FFFFFF", 0.96)} inset`,
        boxShadow: `0 0 0 100px ${alpha("#FFFFFF", 0.96)} inset`
    },
    "& .MuiInputAdornment-positionStart": {
        color: alpha(brandColors.primary[900], 0.46),
        marginRight: 1
    },
    "& .MuiInputAdornment-positionEnd": {
        color: alpha(brandColors.primary[900], 0.54)
    },
    "& .MuiIconButton-root": {
        color: "inherit"
    }
};

export function SignInPage() {
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
                    borderRadius: { xs: 4, md: 5 },
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
                                <Typography variant="overline" sx={{ letterSpacing: 3, opacity: 0.82 }}>
                                    Fund-Me Workplace Contributions
                                </Typography>
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
                                            height: 32
                                        }}
                                    />
                                ))}
                            </Stack>
                        </Stack>

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2.5,
                                borderRadius: 3.5,
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
                                        borderRadius: 2.5,
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
                            <Typography variant="overline" color="primary" sx={{ letterSpacing: 2.4 }}>
                                Workspace access
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.8 }}>
                                Sign in to Fund-Me
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                                Enter your account credentials to continue into the workplace contribution system.
                            </Typography>
                        </Stack>

                        {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
                        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

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
                                                <MailOutlineRoundedIcon
                                                    sx={{ color: alpha(brandColors.primary[900], 0.44) }}
                                                />
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
                                        borderRadius: "12px",
                                        boxShadow: "0 14px 28px rgba(47, 91, 255, 0.2)"
                                    }}
                                >
                                    {submitting ? "Signing in..." : "Sign in"}
                                </Button>
                            </Stack>
                        </Box>

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                background: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.12 : 0.04)
                            }}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                <Box
                                    sx={{
                                        width: 38,
                                        height: 38,
                                        display: "grid",
                                        placeItems: "center",
                                        borderRadius: 2,
                                        bgcolor: alpha(brandColors.primary[500], 0.12),
                                        color: brandColors.primary[900],
                                        flexShrink: 0
                                    }}
                                >
                                    <WorkspacesRoundedIcon fontSize="small" />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        Clean access model
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                                        Members use self-service access and recovery. Fund Managers and Admin users
                                        operate from their assigned workspaces after sign-in.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
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
