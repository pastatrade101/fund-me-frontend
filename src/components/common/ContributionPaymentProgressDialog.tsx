import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    LinearProgress,
    Paper,
    Stack,
    Typography
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import type { ContributionPaymentOrderStatus } from "../../types/api";
import { brandColors } from "../../theme/colors";
import { formatCurrency, formatDate } from "../../pages/page-format";

interface ContributionPaymentProgressDialogProps {
    open: boolean;
    order: ContributionPaymentOrderStatus | null;
    eventTitle: string;
    contributionAmount: number;
    onClose: () => void;
    onCheckStatus: () => void;
    checkingStatus?: boolean;
}

function getStepState(order: ContributionPaymentOrderStatus | null, step: 1 | 2 | 3) {
    if (!order) {
        return "upcoming";
    }

    if (step === 1) {
        return "done";
    }

    if (step === 2) {
        if (order.status === "pending") {
            return "active";
        }

        if (order.status === "failed" || order.status === "expired") {
            return "failed";
        }

        return "done";
    }

    if (order.status === "posted" || order.status === "paid") {
        return "done";
    }

    if (order.status === "failed" || order.status === "expired") {
        return "failed";
    }

    return "upcoming";
}

function getProgressValue(order: ContributionPaymentOrderStatus | null) {
    if (!order) {
        return 0;
    }

    if (order.status === "posted" || order.status === "paid") {
        return 100;
    }

    if (order.status === "failed" || order.status === "expired") {
        return 66;
    }

    return 66;
}

function StepPill({
    title,
    subtitle,
    state
}: {
    title: string;
    subtitle: string;
    state: "done" | "active" | "failed" | "upcoming";
}) {
    const theme = useTheme();
    const isWarmDark = theme.palette.mode === "dark";
    const stateStyles = state === "done"
        ? {
            bgcolor: alpha(brandColors.success, 0.14),
            color: brandColors.success,
            borderColor: alpha(brandColors.success, 0.26)
        }
        : state === "active"
            ? {
                bgcolor: alpha(isWarmDark ? brandColors.warning : brandColors.primary[500], 0.12),
                color: isWarmDark ? "#FCD34D" : brandColors.primary[900],
                borderColor: alpha(isWarmDark ? brandColors.warning : brandColors.primary[500], 0.24)
            }
            : state === "failed"
                ? {
                    bgcolor: alpha(brandColors.danger, 0.12),
                    color: brandColors.danger,
                    borderColor: alpha(brandColors.danger, 0.24)
                }
                : {
                    bgcolor: alpha(brandColors.neutral.border, 0.35),
                    color: brandColors.neutral.textSecondary,
                    borderColor: alpha(brandColors.neutral.border, 0.75)
                };

    const Icon = state === "done"
        ? CheckCircleRoundedIcon
        : state === "failed"
            ? WarningAmberRoundedIcon
            : state === "active"
                ? HourglassTopRoundedIcon
                : PaymentsRoundedIcon;

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 1.5,
                borderRadius: 2,
                borderColor: stateStyles.borderColor,
                bgcolor: stateStyles.bgcolor,
                minHeight: 92
            }}
        >
            <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                        sx={{
                            width: 30,
                            height: 30,
                            borderRadius: 1.5,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: alpha(stateStyles.color, 0.14),
                            color: stateStyles.color
                        }}
                    >
                        <Icon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: stateStyles.color }}>
                        {title}
                    </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    {subtitle}
                </Typography>
            </Stack>
        </Paper>
    );
}

export function ContributionPaymentProgressDialog({
    open,
    order,
    eventTitle,
    contributionAmount,
    onClose,
    onCheckStatus,
    checkingStatus = false
}: ContributionPaymentProgressDialogProps) {
    const theme = useTheme();
    if (!order) {
        return null;
    }

    const isWarmDark = theme.palette.mode === "dark";

    const isPending = order.status === "pending";
    const isCompleted = order.status === "posted" || order.status === "paid";
    const isFailed = order.status === "failed" || order.status === "expired";
    const headline = isCompleted
        ? "Contribution completed"
        : isFailed
            ? "Contribution payment did not complete"
            : "Current payment progress";
    const helperText = isCompleted
        ? "Your contribution has been posted to the ledger."
        : isFailed
            ? (order.error_message || "The mobile money request ended before the contribution could be posted.")
            : "Approve the request on your phone. If you already responded, use Check status to refresh the workspace.";

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ pb: 1 }}>
                <Stack spacing={0.5}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {headline}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {helperText}
                    </Typography>
                </Stack>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5}>
                    <Alert
                        severity={isCompleted ? "success" : isFailed ? "warning" : "info"}
                        icon={isCompleted ? <CheckCircleRoundedIcon fontSize="inherit" /> : isFailed ? <WarningAmberRoundedIcon fontSize="inherit" /> : <HourglassTopRoundedIcon fontSize="inherit" />}
                    >
                        {isCompleted
                            ? "The payment gateway confirmed the contribution."
                            : isFailed
                                ? "The payment is no longer waiting for approval. Review the current order details below."
                                : "Waiting for approval on your phone. You can close this dialog and check again later from My Contributions."}
                    </Alert>

                    <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="subtitle2">Payment steps</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Order status: {order.status}
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={getProgressValue(order)}
                            color={isFailed ? "warning" : isCompleted ? "success" : "primary"}
                            sx={{ height: 10, borderRadius: 999, mb: 1.5 }}
                        />
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                                gap: 1.5
                            }}
                        >
                            <StepPill
                                title="1. Request sent"
                                subtitle="Fund-Me created the Snippe mobile money request."
                                state={getStepState(order, 1)}
                            />
                            <StepPill
                                title="2. Approve on phone"
                                subtitle="Member approves or rejects the handset prompt."
                                state={getStepState(order, 2)}
                            />
                            <StepPill
                                title="3. Contribution posts"
                                subtitle="Fund-Me updates the contribution ledger after confirmation."
                                state={getStepState(order, 3)}
                            />
                        </Box>
                    </Box>

                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Box
                                    sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 2,
                                        display: "grid",
                                        placeItems: "center",
                                        bgcolor: alpha(isWarmDark ? brandColors.warning : brandColors.primary[500], 0.12),
                                        color: isWarmDark ? "#FCD34D" : brandColors.primary[900]
                                    }}
                                >
                                    <PhoneIphoneRoundedIcon fontSize="small" />
                                </Box>
                                <Stack spacing={0.2}>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                        Contribution payment details
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Review the active mobile money request tied to this event.
                                    </Typography>
                                </Stack>
                            </Stack>

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                                    gap: 1.5
                                }}
                            >
                                <Stack spacing={0.35}>
                                    <Typography variant="overline" color="text.secondary">Event</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{eventTitle}</Typography>
                                </Stack>
                                <Stack spacing={0.35}>
                                    <Typography variant="overline" color="text.secondary">Amount</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{formatCurrency(contributionAmount)}</Typography>
                                </Stack>
                                <Stack spacing={0.35}>
                                    <Typography variant="overline" color="text.secondary">Mobile number</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{order.phone}</Typography>
                                </Stack>
                                <Stack spacing={0.35}>
                                    <Typography variant="overline" color="text.secondary">Gateway reference</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{order.gateway_reference || "Pending assignment"}</Typography>
                                </Stack>
                                <Stack spacing={0.35}>
                                    <Typography variant="overline" color="text.secondary">Order started</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{formatDate(order.initiated_at)}</Typography>
                                </Stack>
                                <Stack spacing={0.35}>
                                    <Typography variant="overline" color="text.secondary">Provider window closes</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{formatDate(order.expires_at || null)}</Typography>
                                </Stack>
                            </Box>
                        </Stack>
                    </Paper>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose}>
                    {isPending ? "Close and track later" : "Close"}
                </Button>
                {isPending ? (
                    <Button variant="contained" onClick={onCheckStatus} disabled={checkingStatus}>
                        {checkingStatus ? "Checking..." : "Check status"}
                    </Button>
                ) : null}
            </DialogActions>
        </Dialog>
    );
}
