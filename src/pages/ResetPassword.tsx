import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import {
    Alert,
    Box,
    Button,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { toAuthErrorMessage } from "../auth/AuthContext";
import { api } from "../lib/api";
import { endpoints } from "../lib/endpoints";

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tokenHash = searchParams.get("token_hash") || "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const passwordMismatch = useMemo(() => {
        if (!confirmPassword) {
            return false;
        }

        return password !== confirmPassword;
    }, [confirmPassword, password]);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                px: 2,
                py: 4,
                background: "var(--workplace-gradient)"
            }}
        >
            <Paper sx={{ width: "100%", maxWidth: 520, p: { xs: 3, md: 4 } }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="overline" color="primary" sx={{ letterSpacing: 2.5 }}>
                            Member recovery
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            Set a new password
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Use a fresh password to restore access to your Fund-Me member workspace.
                        </Typography>
                    </Box>

                    {!tokenHash ? (
                        <Alert severity="error">
                            This recovery link is incomplete or invalid. Request a new password reset email from the
                            sign-in page.
                        </Alert>
                    ) : null}

                    {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

                    <TextField
                        label="New password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password"
                        fullWidth
                        helperText="Use at least 8 characters."
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

                    <TextField
                        label="Confirm new password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        autoComplete="new-password"
                        fullWidth
                        error={passwordMismatch}
                        helperText={passwordMismatch ? "Passwords do not match." : "Re-enter the password exactly."}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        edge="end"
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        onClick={() => setShowConfirmPassword((current) => !current)}
                                    >
                                        {showConfirmPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={1.5} justifyContent="space-between">
                        <Button onClick={() => navigate("/signin")}>Back to sign in</Button>
                        <Button
                            variant="contained"
                            startIcon={<LockResetRoundedIcon />}
                            disabled={!tokenHash || !password || !confirmPassword || passwordMismatch || submitting}
                            onClick={async () => {
                                try {
                                    setSubmitting(true);
                                    setErrorMessage("");
                                    await api.post(endpoints.auth.resetPassword, {
                                        token_hash: tokenHash,
                                        password
                                    });
                                    navigate("/signin?reset=success", { replace: true });
                                } catch (error) {
                                    setErrorMessage(toAuthErrorMessage(error, "Unable to reset your password."));
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            {submitting ? "Updating..." : "Update password"}
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
}
