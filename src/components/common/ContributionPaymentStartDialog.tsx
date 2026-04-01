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
import useMediaQuery from "@mui/material/useMediaQuery";
import { alpha, useTheme } from "@mui/material/styles";

import { GlassCard } from "../ui/GlassCard";
import { GradientButton } from "../ui/GradientButton";
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
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const blockedByMinimumAmount = !minimumAmountMet;
    const feesTotal = platformFee + gatewayFee;
    const submitLabel = submitting
        ? "Sending request..."
        : blockedByMinimumAmount
            ? "Minimum contribution required"
            : "Send payment request";

    return (
        <Dialog
            open={open}
            onClose={() => !submitting && !loading && onClose()}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    mx: { xs: 1.5, sm: 2 },
                    my: { xs: 1.5, sm: 3 },
                    width: { xs: "calc(100% - 24px)", sm: "100%" },
                    borderRadius: { xs: 3, sm: 4 },
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    background: `linear-gradient(180deg, ${alpha("#FFFFFF", 0.96)} 0%, ${alpha("#F6F8FF", 0.98)} 100%)`,
                    boxShadow: theme.fundMe.shadows.glass,
                    overflow: "hidden"
                }
            }}
        >
            <DialogTitle sx={{ pb: isMobile ? 1 : 1.25, px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 } }}>
                <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <Box
                            sx={{
                                width: isMobile ? 40 : 46,
                                height: isMobile ? 40 : 46,
                                borderRadius: "4px",
                                display: "grid",
                                placeItems: "center",
                                background: theme.fundMe.gradients.button,
                                color: "#FFFFFF",
                                boxShadow: theme.fundMe.shadows.soft,
                                flexShrink: 0,
                                mt: isMobile ? 0.5 : 0
                            }}
                        >
                            <PaymentsRoundedIcon />
                        </Box>
                        <Stack spacing={isMobile ? 0.6 : 0.25} sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant={isMobile ? "h6" : "h5"}
                                sx={{
                                    fontWeight: 800,
                                    lineHeight: isMobile ? 1.1 : 1.15,
                                    mt: isMobile ? -0.1 : 0
                                }}
                            >
                                Pay Contribution
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ lineHeight: isMobile ? 1.35 : 1.5 }}
                            >
                                {isMobile
                                    ? "Send the approval request to your phone."
                                    : "Review the full mobile money charge before you approve the request on your phone."}
                            </Typography>
                        </Stack>
                    </Stack>
                    {!isMobile ? (
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
                    ) : null}
                </Stack>
            </DialogTitle>
            <DialogContent
                dividers={!isMobile}
                sx={{
                    px: { xs: 2, sm: 3 },
                    pt: { xs: 0.5, sm: 2 },
                    pb: { xs: 1.5, sm: 2 }
                }}
            >
                {loading ? (
                    <Stack spacing={2} sx={{ pt: 0.5 }}>
                        <Alert severity="info">
                            Preparing your contribution payment. We are checking if there is already an active Snippe mobile money request for this event.
                        </Alert>
                        <LinearProgress />
                    </Stack>
                ) : (
                    <Stack spacing={isMobile ? 1.5 : 2} sx={{ pt: isMobile ? 0 : 0.5 }}>
                        <Stack spacing={0.65} sx={{ mt: isMobile ? 1.25 : 0 }}>
                            {isMobile ? (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontWeight: 700, letterSpacing: "0.04em" }}
                                >
                                    Mobile number
                                </Typography>
                            ) : null}
                            <TextField
                                label={isMobile ? undefined : "Mobile number"}
                                value={phone}
                                onChange={(event) => onPhoneChange(event.target.value)}
                                helperText={isMobile ? undefined : "Use the mobile money number that should receive the approval prompt."}
                                fullWidth
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                            />
                        </Stack>
                        {!isMobile ? (
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
                        ) : null}
                        <GlassCard
                            variant="outlined"
                            tint={isMobile ? "accent" : "default"}
                            sx={{
                                p: isMobile ? 2 : 2.1,
                                borderRadius: isMobile ? theme.fundMe.radius.lg : "4px"
                            }}
                        >
                            {isMobile ? (
                                <Stack spacing={1.5} sx={{ position: "relative", zIndex: 1 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                                        <Typography
                                            variant="overline"
                                            color="text.secondary"
                                            sx={{ letterSpacing: "0.12em", fontWeight: 700 }}
                                        >
                                            Payment total
                                        </Typography>
                                        <Box
                                            sx={{
                                                px: 1,
                                                py: 0.45,
                                                borderRadius: "999px",
                                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                                color: "primary.main"
                                            }}
                                        >
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <VerifiedUserRoundedIcon sx={{ fontSize: 14 }} />
                                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                                    Secure
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </Stack>

                                    <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1, letterSpacing: "-0.03em" }}>
                                        {formatCurrency(totalToPay)}
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                            gap: 1
                                        }}
                                    >
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                px: 1.25,
                                                py: 1,
                                                borderRadius: theme.fundMe.radius.md,
                                                bgcolor: alpha("#FFFFFF", 0.7),
                                                borderColor: alpha(theme.palette.primary.main, 0.12)
                                            }}
                                        >
                                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                                Event fund
                                            </Typography>
                                            <Typography sx={{ fontWeight: 800, mt: 0.35 }}>
                                                {formatCurrency(contributionAmount)}
                                            </Typography>
                                        </Paper>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                px: 1.25,
                                                py: 1,
                                                borderRadius: theme.fundMe.radius.md,
                                                bgcolor: alpha("#FFFFFF", 0.7),
                                                borderColor: alpha(theme.palette.primary.main, 0.12)
                                            }}
                                        >
                                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                                Fees
                                            </Typography>
                                            <Typography sx={{ fontWeight: 800, mt: 0.35 }}>
                                                {formatCurrency(feesTotal)}
                                            </Typography>
                                        </Paper>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary">
                                        Approve this payment on your phone to complete the contribution.
                                    </Typography>
                                </Stack>
                            ) : (
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
                                </Stack>
                            )}
                        </GlassCard>
                        {blockedByMinimumAmount && minimumAmountMessage ? (
                            <Alert severity="warning" sx={{ py: 0.25 }}>
                                {minimumAmountMessage}
                            </Alert>
                        ) : null}
                    </Stack>
                )}
            </DialogContent>
            <DialogActions
                sx={{
                    px: { xs: 2, sm: 3 },
                    py: { xs: 2, sm: 2 },
                    justifyContent: isMobile ? "stretch" : "space-between",
                    alignItems: isMobile ? "stretch" : "center",
                    gap: 1.25,
                    flexDirection: { xs: "column-reverse", sm: "row" }
                }}
            >
                {!isMobile ? (
                    blockedByMinimumAmount && minimumAmountMessage ? (
                        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                            Mobile money payment is unavailable for this amount.
                        </Typography>
                    ) : (
                        <Box sx={{ flex: 1 }} />
                    )
                ) : null}
                <Button onClick={onClose} disabled={submitting || loading} fullWidth={isMobile}>
                    Cancel
                </Button>
                <GradientButton
                    disabled={submitting || loading || !phone.trim() || !minimumAmountMet}
                    onClick={onSubmit}
                    fullWidth={isMobile}
                    sx={{
                        minHeight: isMobile ? 50 : 44,
                        fontWeight: 800
                    }}
                >
                    {submitLabel}
                </GradientButton>
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
