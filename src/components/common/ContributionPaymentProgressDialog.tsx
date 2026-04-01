import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
    Alert,
    Box,
    Button,
    Divider,
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
import { formatCurrency, formatDate, formatDateTime } from "../../pages/page-format";

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

function getProviderSessionSummary(order: ContributionPaymentOrderStatus) {
    const startedAt = new Date(order.initiated_at);
    const fallbackWindowMinutes = 5;

    if (Number.isNaN(startedAt.getTime())) {
        return {
            durationMinutes: fallbackWindowMinutes,
            closesAt: null as Date | null,
            stateLabel: "Session timing unavailable",
            helperText: "Snippe normally keeps the approval session open for about 5 minutes."
        };
    }

    const resolvedClosesAt = order.expires_at ? new Date(order.expires_at) : new Date(startedAt.getTime() + fallbackWindowMinutes * 60 * 1000);
    const closesAt = Number.isNaN(resolvedClosesAt.getTime())
        ? new Date(startedAt.getTime() + fallbackWindowMinutes * 60 * 1000)
        : resolvedClosesAt;
    const durationMinutes = Math.max(1, Math.round((closesAt.getTime() - startedAt.getTime()) / 60000));
    const remainingMs = closesAt.getTime() - Date.now();

    if (order.status === "expired" || remainingMs <= 0) {
        return {
            durationMinutes,
            closesAt,
            stateLabel: "Provider session closed",
            helperText: `Snippe kept the handset approval prompt open for ${durationMinutes} minutes before the request expired.`
        };
    }

    if (order.status === "pending") {
        const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000));
        return {
            durationMinutes,
            closesAt,
            stateLabel: `${remainingMinutes} min left in session`,
            helperText: `This payment can remain in progress until the ${durationMinutes}-minute Snippe provider session closes or you approve it on your phone.`
        };
    }

    return {
        durationMinutes,
        closesAt,
        stateLabel: "Provider session resolved",
        helperText: `Snippe opened a ${durationMinutes}-minute approval window for this request.`
    };
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
    const displayedContributionAmount = Number(order.contribution_amount || contributionAmount || 0);
    const displayedPlatformFee = Number(order.platform_fee || 0);
    const displayedGatewayFee = Number(order.gateway_fee || 0);
    const displayedTotalToPay = Number(order.total_to_pay || order.gross_amount || order.amount || displayedContributionAmount);
    const providerSession = getProviderSessionSummary(order);
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

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderRadius: 1,
                            bgcolor: alpha(isWarmDark ? brandColors.warning : brandColors.primary[500], 0.05),
                            borderColor: alpha(isWarmDark ? brandColors.warning : brandColors.primary[500], 0.18)
                        }}
                    >
                        <Stack spacing={1.5}>
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1.25}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", sm: "center" }}
                            >
                                <Stack direction="row" spacing={1.25} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: 1,
                                            display: "grid",
                                            placeItems: "center",
                                            bgcolor: alpha(isWarmDark ? brandColors.warning : brandColors.primary[500], 0.12),
                                            color: isWarmDark ? "#FCD34D" : brandColors.primary[900]
                                        }}
                                    >
                                        <HourglassTopRoundedIcon fontSize="small" />
                                    </Box>
                                    <Stack spacing={0.2}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                            Snippe provider session
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {providerSession.helperText}
                                        </Typography>
                                    </Stack>
                                </Stack>
                                <Box
                                    sx={{
                                        px: 1.25,
                                        py: 0.65,
                                        borderRadius: 1,
                                        border: `1px solid ${alpha(isWarmDark ? brandColors.warning : brandColors.primary[500], 0.2)}`,
                                        bgcolor: alpha(isWarmDark ? brandColors.warning : brandColors.primary[500], 0.08)
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                        {providerSession.durationMinutes} minute window
                                    </Typography>
                                </Box>
                            </Stack>

                            <Divider />

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                                    gap: 1.5
                                }}
                            >
                                <Stack spacing={0.35}>
                                    <Typography variant="overline" color="text.secondary">Session started</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{formatDateTime(order.initiated_at)}</Typography>
                                </Stack>
                                <Stack spacing={0.35}>
                                    <Typography variant="overline" color="text.secondary">Session closes</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{formatDateTime(providerSession.closesAt?.toISOString() || order.expires_at || null)}</Typography>
                                </Stack>
                                <Stack spacing={0.35}>
                                    <Typography variant="overline" color="text.secondary">Session status</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{providerSession.stateLabel}</Typography>
                                </Stack>
                            </Box>
                        </Stack>
                    </Paper>

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
                                    <Typography variant="overline" color="text.secondary">Contribution amount</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{formatCurrency(displayedContributionAmount)}</Typography>
                                </Stack>
                                <Stack spacing={0.35}>
                                    <Typography variant="overline" color="text.secondary">Platform fee</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{formatCurrency(displayedPlatformFee)}</Typography>
                                </Stack>
                                <Stack spacing={0.35}>
                                    <Typography variant="overline" color="text.secondary">Mobile money fee</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{formatCurrency(displayedGatewayFee)}</Typography>
                                </Stack>
                                <Stack spacing={0.35}>
                                    <Typography variant="overline" color="text.secondary">Total charged</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{formatCurrency(displayedTotalToPay)}</Typography>
                                </Stack>
                                <Stack spacing={0.35}>
                                    <Typography variant="overline" color="text.secondary">Event receives</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{formatCurrency(displayedContributionAmount)}</Typography>
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
                                    <Typography sx={{ fontWeight: 700 }}>{formatDateTime(order.initiated_at)}</Typography>
                                </Stack>
                                <Stack spacing={0.35}>
                                    <Typography variant="overline" color="text.secondary">Provider window closes</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{formatDateTime(order.expires_at || null)}</Typography>
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
