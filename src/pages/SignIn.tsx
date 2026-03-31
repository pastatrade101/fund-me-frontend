import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
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

const passwordFieldSx = {
    "& .MuiOutlinedInput-root": {
        minHeight: 56
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
            "Member obligations",
            "Contribution ledger",
            "Operational reporting"
        ],
        []
    );

    return (
        <Box
            sx={{
                minHeight: "100vh",
                px: { xs: 2, md: 3 },
                py: { xs: 3, md: 4 },
                background: `
                    radial-gradient(circle at top left, ${alpha(brandColors.accent[300], 0.18)} 0%, transparent 35%),
                    linear-gradient(180deg, ${alpha(brandColors.primary[100], 0.5)} 0%, #F8FAFC 44%)
                `
            }}
        >
            <Paper
                sx={{
                    width: "100%",
                    maxWidth: 1140,
                    mx: "auto",
                    overflow: "hidden",
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
                    minHeight: { xs: "auto", md: "calc(100vh - 64px)" }
                }}
            >
                <Box
                    sx={{
                        background: "var(--workplace-gradient)",
                        color: "common.white",
                        p: { xs: 3, md: 5 },
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: 4,
                        position: "relative",
                        overflow: "hidden"
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            background: `
                                radial-gradient(circle at top right, ${alpha("#FFFFFF", 0.18)} 0%, transparent 30%),
                                radial-gradient(circle at bottom left, ${alpha(brandColors.accent[100], 0.22)} 0%, transparent 32%)
                            `,
                            pointerEvents: "none"
                        }}
                    />
                    <Stack spacing={3} sx={{ position: "relative", zIndex: 1 }}>
                        <Stack spacing={1.5}>
                            <Typography variant="overline" sx={{ letterSpacing: 3, opacity: 0.86 }}>
                                Fund-Me Workplace Contributions
                            </Typography>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 800,
                                    fontSize: { xs: "2.35rem", md: "3.4rem" },
                                    lineHeight: 1.05,
                                    maxWidth: 520
                                }}
                            >
                                Secure sign-in for member servicing and contribution operations.
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    maxWidth: 520,
                                    color: alpha("#FFFFFF", 0.86),
                                    fontWeight: 500,
                                    lineHeight: 1.55
                                }}
                            >
                                Access the Fund-Me workspace with clearer session control, protected member recovery,
                                and direct entry into contributions, reports, and payment tracking.
                            </Typography>
                        </Stack>

                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {helperChips.map((chip) => (
                                <Chip
                                    key={chip}
                                    label={chip}
                                    sx={{
                                        color: "common.white",
                                        borderColor: alpha("#FFFFFF", 0.22),
                                        backgroundColor: alpha("#FFFFFF", 0.12)
                                    }}
                                    variant="outlined"
                                />
                            ))}
                        </Stack>
                    </Stack>

                    <Stack
                        spacing={2}
                        sx={{
                            position: "relative",
                            zIndex: 1,
                            p: 2.5,
                            borderRadius: 3,
                            border: `1px solid ${alpha("#FFFFFF", 0.18)}`,
                            bgcolor: alpha("#FFFFFF", 0.12),
                            maxWidth: 520
                        }}
                    >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 2,
                                    display: "grid",
                                    placeItems: "center",
                                    bgcolor: alpha("#FFFFFF", 0.14)
                                }}
                            >
                                <ShieldRoundedIcon />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Enterprise-ready access
                                </Typography>
                                <Typography variant="body2" sx={{ color: alpha("#FFFFFF", 0.76) }}>
                                    Members can recover passwords here. Staff access remains controlled centrally.
                                </Typography>
                            </Box>
                        </Stack>
                        <Stack spacing={1}>
                            <Typography variant="body2" sx={{ color: alpha("#FFFFFF", 0.86) }}>
                                Use your registered email address to sign in. If you are a member and have lost access,
                                choose <strong>Forgot password</strong> to receive a secure recovery link.
                            </Typography>
                        </Stack>
                    </Stack>
                </Box>

                <Box
                    sx={{
                        p: { xs: 3, md: 5 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: (theme) => theme.palette.background.paper
                    }}
                >
                    <Stack spacing={3} sx={{ width: "100%", maxWidth: 420 }}>
                        <Stack spacing={1.25}>
                            <Typography variant="overline" color="primary" sx={{ letterSpacing: 2.4 }}>
                                Workspace access
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800 }}>
                                Sign in to Fund-Me
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
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
                            <Stack spacing={2.25}>
                                <TextField
                                    label="Email address"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    autoComplete="email"
                                    fullWidth
                                    sx={passwordFieldSx}
                                />
                                <TextField
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    autoComplete="current-password"
                                    fullWidth
                                    sx={passwordFieldSx}
                                    InputProps={{
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
                                        startIcon={<MailOutlineRoundedIcon />}
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
                                >
                                    {submitting ? "Signing in..." : "Sign in"}
                                </Button>
                            </Stack>
                        </Box>

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 2.5,
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
                                    <Typography variant="body2" color="text.secondary">
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
