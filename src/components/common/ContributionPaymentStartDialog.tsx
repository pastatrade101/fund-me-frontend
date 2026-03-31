import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    LinearProgress,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import { formatCurrency } from "../../pages/page-format";

interface ContributionPaymentStartDialogProps {
    open: boolean;
    contributionAmount: number;
    platformFee: number;
    gatewayFee: number;
    totalToPay: number;
    platformFeeRate?: number | null;
    gatewayFeeRate?: number | null;
    gatewayFlatFee?: number | null;
    minimumAmountMet?: boolean;
    minimumAmountMessage?: string | null;
    phone: string;
    onPhoneChange: (value: string) => void;
    onClose: () => void;
    onSubmit: () => void;
    loading?: boolean;
    submitting?: boolean;
}

export function ContributionPaymentStartDialog({
    open,
    contributionAmount,
    platformFee,
    gatewayFee,
    totalToPay,
    platformFeeRate = null,
    gatewayFeeRate = null,
    gatewayFlatFee = null,
    minimumAmountMet = true,
    minimumAmountMessage = null,
    phone,
    onPhoneChange,
    onClose,
    onSubmit,
    loading = false,
    submitting = false
}: ContributionPaymentStartDialogProps) {
    const theme = useTheme();
    const blockedByMinimumAmount = !minimumAmountMet;
    const submitLabel = submitting
        ? "Sending request..."
        : blockedByMinimumAmount
            ? "Minimum contribution required"
            : "Send payment request";

    return (
        <Dialog open={open} onClose={() => !submitting && !loading && onClose()} fullWidth maxWidth="sm">
            <DialogTitle sx={{ pb: 1.25 }}>
                <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                        <Box
                            sx={{
                                width: 46,
                                height: 46,
                                borderRadius: "4px",
                                display: "grid",
                                placeItems: "center",
                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                color: "primary.main"
                            }}
                        >
                            <PaymentsRoundedIcon />
                        </Box>
                        <Stack spacing={0.25}>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                Pay Contribution
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Review the full mobile money charge before you approve the request on your phone.
                            </Typography>
                        </Stack>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip
                            size="small"
                            icon={<VerifiedUserRoundedIcon />}
                            label="Secure checkout"
                            color="primary"
                            variant="outlined"
                        />
                        <Chip
                            size="small"
                            icon={<PhoneIphoneRoundedIcon />}
                            label="Snippe mobile money"
                            variant="outlined"
                        />
                    </Stack>
                </Stack>
            </DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Stack spacing={2} sx={{ pt: 0.5 }}>
                        <Alert severity="info">
                            Preparing your contribution payment. We are checking if there is already an active Snippe mobile money request for this event.
                        </Alert>
                        <LinearProgress />
                    </Stack>
                ) : (
                    <Stack spacing={2} sx={{ pt: 0.5 }}>
                        <TextField
                            label="Mobile number"
                            value={phone}
                            onChange={(event) => onPhoneChange(event.target.value)}
                            helperText="Use the mobile money number that should receive the approval prompt."
                            fullWidth
                            variant="outlined"
                        />
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: "4px",
                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.background.paper, 0.96)})`,
                                borderColor: alpha(theme.palette.primary.main, 0.16)
                            }}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: "4px",
                                        display: "grid",
                                        placeItems: "center",
                                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                                        color: "primary.main",
                                        flexShrink: 0
                                    }}
                                >
                                    <PhoneIphoneRoundedIcon fontSize="small" />
                                </Box>
                                <Stack spacing={0.75}>
                                    <Typography variant="overline" color="text.secondary">
                                        Payment method
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                        Mobile Money
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Member self-service payments currently use Snippe mobile money.
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Paper>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: "4px",
                                background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.035)}, ${theme.palette.background.paper})`
                            }}
                        >
                            <Stack spacing={1.6}>
                                <Stack direction="row" spacing={1.25} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "4px",
                                            display: "grid",
                                            placeItems: "center",
                                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                                            color: "primary.main"
                                        }}
                                    >
                                        <PaymentsRoundedIcon fontSize="small" />
                                    </Box>
                                    <Stack spacing={0.2}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                            Payment summary
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Clear breakdown of what you pay and what the event receives.
                                        </Typography>
                                    </Stack>
                                </Stack>

                                <Stack spacing={1}>
                                    <SummaryRow label="Contribution amount" value={formatCurrency(contributionAmount)} />
                                    <SummaryRow
                                        label={platformFeeRate !== null ? `Platform fee (${platformFeeRate}%)` : "Platform fee"}
                                        value={formatCurrency(platformFee)}
                                    />
                                    <SummaryRow
                                        label={gatewayFeeRate !== null && gatewayFlatFee !== null
                                            ? `Mobile money fee (${gatewayFeeRate}% + ${formatCurrency(gatewayFlatFee)})`
                                            : "Mobile money fee"}
                                        value={formatCurrency(gatewayFee)}
                                    />
                                </Stack>

                                <Divider />

                                <SummaryRow
                                    label="Total to pay"
                                    value={formatCurrency(totalToPay)}
                                    emphasize
                                />

                                <Paper
                                    variant="outlined"
                                    sx={{
                                        px: 1.5,
                                        py: 1.25,
                                        borderRadius: "4px",
                                        borderColor: alpha(theme.palette.success.main, 0.22),
                                        bgcolor: alpha(theme.palette.success.main, 0.08)
                                    }}
                                >
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Event receives
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                The contribution amount credited into the event fund
                                            </Typography>
                                        </Box>
                                        <Typography variant="h6" color="success.main" sx={{ fontWeight: 800 }}>
                                            {formatCurrency(contributionAmount)}
                                        </Typography>
                                    </Stack>
                                </Paper>

                                {blockedByMinimumAmount && minimumAmountMessage ? (
                                    <Typography variant="body2" sx={{ color: "warning.main", fontWeight: 700 }}>
                                        {minimumAmountMessage}
                                    </Typography>
                                ) : null}
                            </Stack>
                        </Paper>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between", gap: 1.5 }}>
                {blockedByMinimumAmount && minimumAmountMessage ? (
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                        Mobile money payment is unavailable for this amount.
                    </Typography>
                ) : (
                    <Box sx={{ flex: 1 }} />
                )}
                <Button onClick={onClose} disabled={submitting || loading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    disabled={submitting || loading || !phone.trim() || !minimumAmountMet}
                    onClick={onSubmit}
                >
                    {submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function SummaryRow({
    label,
    value,
    emphasize = false
}: {
    label: string;
    value: string;
    emphasize?: boolean;
}) {
    return (
        <Paper
            variant="outlined"
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                px: 1.5,
                py: emphasize ? 1.5 : 1.15,
                borderRadius: "4px",
                borderColor: (theme) => emphasize ? alpha(theme.palette.primary.main, 0.18) : alpha(theme.palette.divider, 0.85),
                bgcolor: (theme) => emphasize ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.025)
            }}
        >
            <Typography
                variant={emphasize ? "body1" : "body2"}
                color={emphasize ? "text.primary" : "text.secondary"}
                sx={{ fontWeight: emphasize ? 800 : 500 }}
            >
                {label}
            </Typography>
            <Typography
                variant={emphasize ? "h6" : "body1"}
                color="text.primary"
                sx={{ fontWeight: emphasize ? 800 : 700, textAlign: "right" }}
            >
                {value}
            </Typography>
        </Paper>
    );
}
