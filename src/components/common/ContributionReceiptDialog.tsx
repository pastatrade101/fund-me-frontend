import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Paper,
    Stack,
    Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import type { ContributionLedgerRow, ContributionPaymentOrderStatus } from "../../types/api";
import { formatCurrency, formatDate, formatDateTime } from "../../pages/page-format";

interface ContributionReceiptDialogProps {
    open: boolean;
    row: ContributionLedgerRow | null;
    order: ContributionPaymentOrderStatus | null;
    loading?: boolean;
    loadError?: string;
    onClose: () => void;
}

function ReceiptLine({ label, value }: { label: string; value: string }) {
    return (
        <Stack spacing={0.25}>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {value}
            </Typography>
        </Stack>
    );
}

function formatPaymentMethod(value?: ContributionLedgerRow["payment_method"] | null) {
    if (!value) {
        return "Snippe mobile money";
    }

    return value.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function ContributionReceiptDialog({
    open,
    row,
    order,
    loading = false,
    loadError = "",
    onClose
}: ContributionReceiptDialogProps) {
    if (!row) {
        return null;
    }

    const statusTone = row.status === "paid" ? "success" : row.status === "partial" ? "warning" : "default";
    const statusLabel = row.status.replace(/_/g, " ");
    const transactionReference = order?.gateway_reference || row.payment_reference || "System generated";
    const internalReference = order?.external_id || row.id;
    const outstanding = Math.max(Number(row.expected_amount || 0) - Number(row.amount_paid || 0), 0);
    const contributionAmount = Number(order?.contribution_amount ?? row.expected_amount ?? 0);
    const platformFee = Number(order?.platform_fee ?? 0);
    const gatewayFee = Number(order?.gateway_fee ?? 0);
    const totalCharged = Number(order?.total_to_pay ?? contributionAmount + platformFee + gatewayFee);
    const netFundAmount = Number(order?.net_amount ?? row.amount_paid ?? 0);
    const isPaid = row.status === "paid";
    const isPartial = row.status === "partial";
    const isWaived = row.status === "waived";

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: (theme) => alpha(
                                isPaid ? theme.palette.success.main : isWaived ? theme.palette.info.main : theme.palette.warning.main,
                                0.12
                            ),
                            color: isPaid ? "success.main" : isWaived ? "info.main" : "warning.main"
                        }}
                    >
                        {isPaid ? <CheckCircleRoundedIcon /> : <WarningAmberRoundedIcon />}
                    </Box>
                    <Stack spacing={0.35}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            Contribution receipt
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Review the posted contribution and transaction details for this event.
                        </Typography>
                    </Stack>
                </Stack>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5}>
                    {isPaid ? (
                        <Alert severity="success" icon={<CheckCircleRoundedIcon fontSize="inherit" />}>
                            This contribution has been posted successfully to the ledger.
                        </Alert>
                    ) : isWaived ? (
                        <Alert severity="info">
                            This contribution was waived. The record remains in history, but no payment transaction was posted.
                        </Alert>
                    ) : (
                        <Alert severity="warning" icon={<WarningAmberRoundedIcon fontSize="inherit" />}>
                            This contribution is only partially settled. The receipt below shows the latest posted amount and remaining balance.
                        </Alert>
                    )}

                    {loadError ? <Alert severity="info">{loadError}</Alert> : null}

                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
                                <ReceiptLine label="Event" value={row.events?.title || "Contribution event"} />
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
                                <ReceiptLine label="Amount paid" value={formatCurrency(row.amount_paid)} />
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
                                <Stack spacing={0.35}>
                                    <Typography variant="caption" color="text.secondary">
                                        Ledger status
                                    </Typography>
                                    <Chip size="small" color={statusTone} label={statusLabel} sx={{ alignSelf: "flex-start" }} />
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <ReceiptLongRoundedIcon color="primary" fontSize="small" />
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                    Receipt details
                                </Typography>
                            </Stack>

                            {loading ? (
                                <Box sx={{ py: 4, display: "grid", placeItems: "center" }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : (
                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <ReceiptLine label="Contribution amount" value={formatCurrency(contributionAmount)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <ReceiptLine label="Platform fee" value={formatCurrency(platformFee)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <ReceiptLine label="Mobile money fee" value={formatCurrency(gatewayFee)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <ReceiptLine label="Total charged" value={formatCurrency(totalCharged)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <ReceiptLine label="Event receives" value={formatCurrency(netFundAmount)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <ReceiptLine label="Outstanding balance" value={formatCurrency(outstanding)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <ReceiptLine label="Paid date" value={formatDateTime(row.paid_at || null)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <ReceiptLine label="Event deadline" value={formatDate(row.events?.deadline || null)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <ReceiptLine label="Payment method" value={order?.gateway === "snippe" ? "Snippe mobile money" : formatPaymentMethod(row.payment_method)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <ReceiptLine label="Transaction reference" value={transactionReference} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <ReceiptLine label="Internal reference" value={internalReference} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <ReceiptLine label="Gateway status" value={order?.status ? order.status.replace(/_/g, " ") : statusLabel} />
                                    </Grid>
                                    {order?.phone ? (
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ReceiptLine label="Mobile number" value={order.phone} />
                                        </Grid>
                                    ) : null}
                                    {order?.gateway_reference && order.external_id && order.gateway_reference !== order.external_id ? (
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ReceiptLine label="Snippe order id" value={order.external_id} />
                                        </Grid>
                                    ) : null}
                                </Grid>
                            )}
                        </Stack>
                    </Paper>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
