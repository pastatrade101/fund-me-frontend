import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import {
    Alert,
    Box,
    Button,
    Chip,
    Grid,
    LinearProgress,
    Paper,
    Stack,
    Typography
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { DataPageSkeleton } from "../components/common/DataPageSkeleton";
import { ContributionPaymentProgressDialog } from "../components/common/ContributionPaymentProgressDialog";
import { ContributionPaymentStartDialog } from "../components/common/ContributionPaymentStartDialog";
import { PageHero } from "../components/common/PageHero";
import { StatCard } from "../components/common/StatCard";
import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import type { ContributionEventDetail, ContributionLedgerRow, ContributionPaymentOrderStatus } from "../types/api";
import { getEventTypeLabel } from "../utils/policy-config";
import { formatCurrency, formatDate } from "./page-format";
function getOrderStateTone(order: ContributionPaymentOrderStatus | null) {
    if (!order) {
        return "primary";
    }

    if (order.status === "posted" || order.status === "paid") {
        return "success";
    }

    return "warning";
}

export function MemberContributionWorkspacePage() {
    const { eventId = "" } = useParams();
    const { user } = useAuth();
    const [detail, setDetail] = useState<ContributionEventDetail | null>(null);
    const [row, setRow] = useState<ContributionLedgerRow | null>(null);
    const [activeOrder, setActiveOrder] = useState<ContributionPaymentOrderStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [payDialogOpen, setPayDialogOpen] = useState(false);
    const [progressDialogOpen, setProgressDialogOpen] = useState(false);
    const [dismissedProgressOrderId, setDismissedProgressOrderId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [paymentPhone, setPaymentPhone] = useState(user?.member?.phone || "");

    const loadWorkspace = async (showLoader = false) => {
        if (showLoader) {
            setLoading(true);
        }
        try {
            const [detailResponse, contributionResponse, latestOrderResponse] = await Promise.all([
                api.get(endpoints.eventDetail(eventId)),
                api.get(endpoints.contributions, { params: { event_id: eventId, page_size: 20 } }),
                api.get(endpoints.contributionPaymentLatest, { params: { event_id: eventId } })
            ]);

            setDetail(detailResponse.data.data || null);
            setRow((contributionResponse.data.data.items || [])[0] || null);
            setActiveOrder(latestOrderResponse.data.data || null);
        } finally {
            if (showLoader) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!eventId) {
            return;
        }

        loadWorkspace(true).catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load contribution workspace.")));
    }, [eventId]);

    useEffect(() => {
        if (!user?.member?.phone) {
            return;
        }

        setPaymentPhone((current) => current || user.member?.phone || "");
    }, [user?.member?.phone]);

    useEffect(() => {
        if (!activeOrder || activeOrder.status !== "pending") {
            return;
        }

        if (activeOrder.order_id !== dismissedProgressOrderId) {
            setProgressDialogOpen(true);
        }

        const timeoutId = window.setTimeout(async () => {
            try {
                setCheckingStatus(true);
                const response = await api.get(endpoints.contributionPaymentOrderStatus(activeOrder.order_id));
                const nextOrder = response.data.data as ContributionPaymentOrderStatus;
                setActiveOrder(nextOrder);

                if (nextOrder.status === "posted" || nextOrder.status === "paid") {
                    setSuccessMessage("Contribution completed successfully.");
                    await loadWorkspace();
                } else if (nextOrder.status === "failed" || nextOrder.status === "expired") {
                    setErrorMessage(nextOrder.error_message || "The mobile money payment did not complete.");
                    await loadWorkspace();
                }
            } catch (error) {
                setErrorMessage(getApiErrorMessage(error, "Unable to refresh the payment status."));
            } finally {
                setCheckingStatus(false);
            }
        }, 4000);

        return () => window.clearTimeout(timeoutId);
    }, [activeOrder, dismissedProgressOrderId]);

    useEffect(() => {
        if (!activeOrder || activeOrder.status !== "pending") {
            setDismissedProgressOrderId("");
        }
    }, [activeOrder]);

    const outstandingAmount = useMemo(() => {
        if (!row) {
            return 0;
        }

        return Math.max(Number(row.expected_amount || 0) - Number(row.amount_paid || 0), 0);
    }, [row]);

    const collectionProgress = detail?.summary?.expected_total
        ? Math.min((Number(detail.summary.collected_total || 0) / Number(detail.summary.expected_total || 1)) * 100, 100)
        : 0;

    const hasPendingOrder = activeOrder?.status === "pending";
    const canPay = Boolean(
        row &&
        detail &&
        ["pending", "partial"].includes(row.status) &&
        ["active", "collection"].includes(detail.event.status) &&
        outstandingAmount > 0 &&
        !hasPendingOrder
    );

    const handleSubmitPayment = async () => {
        try {
            setSubmitting(true);
            setErrorMessage("");
            setSuccessMessage("");

            const response = await api.post(endpoints.contributionPay, {
                event_id: eventId,
                amount: outstandingAmount,
                payment_method: "mobile_money",
                phone: paymentPhone
            });

            setActiveOrder(response.data.data);
            setPayDialogOpen(false);
            setProgressDialogOpen(true);
            setDismissedProgressOrderId("");
            setSuccessMessage("Mobile money prompt sent. Approve the request on your phone to complete the contribution.");
            await loadWorkspace();
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Unable to start mobile money payment."));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCheckStatus = async () => {
        if (!activeOrder) {
            return;
        }

        try {
            setCheckingStatus(true);
            const response = await api.get(endpoints.contributionPaymentOrderStatus(activeOrder.order_id));
            const nextOrder = response.data.data as ContributionPaymentOrderStatus;
            setActiveOrder(nextOrder);
            await loadWorkspace();
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Unable to check payment status."));
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleCloseProgressDialog = () => {
        if (activeOrder?.status === "pending") {
            setDismissedProgressOrderId(activeOrder.order_id);
        }

        setProgressDialogOpen(false);
    };

    const primaryActionLabel = row?.status === "paid" || row?.status === "waived"
        ? "Contribution completed"
        : hasPendingOrder
            ? "Open payment progress"
            : activeOrder?.status === "failed" || activeOrder?.status === "expired"
                ? "Try again"
                : "Pay contribution";
    const showInitialSkeleton = loading && !detail && !row;

    if (showInitialSkeleton) {
        return <DataPageSkeleton statCards={4} tableColumns={4} tableRows={4} detailPanels={2} />;
    }

    return (
        <Stack spacing={3}>
            <PageHero
                eyebrow="Contribution workspace"
                title={detail?.event.title || "Contribution workspace"}
                description="Review your own contribution obligation, start the mobile money payment, and monitor posting from one workspace."
                tone="surface"
                actions={
                    <Button component={RouterLink} to="/events" variant="outlined" startIcon={<ArrowBackRoundedIcon />}>
                        Back to events
                    </Button>
                }
            />

            {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}
            {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

            {detail && row ? (
                <>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                            <StatCard icon={PaymentsRoundedIcon} label="Contribution amount" value={formatCurrency(row.expected_amount)} helper={`Deadline ${formatDate(detail.event.deadline)}`} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                            <StatCard icon={ReceiptLongRoundedIcon} label="Outstanding" value={formatCurrency(outstandingAmount)} helper={`Status: ${row.status}`} tone={outstandingAmount > 0 ? "warning" : "success"} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                            <StatCard icon={CheckCircleRoundedIcon} label="Amount paid" value={formatCurrency(row.amount_paid)} helper={`Paid at: ${formatDate(row.paid_at || null)}`} tone="success" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                            <StatCard icon={PhoneIphoneRoundedIcon} label="Payment gateway" value={hasPendingOrder ? "Awaiting phone approval" : "Snippe mobile money"} helper={activeOrder?.gateway_reference ? `Ref ${activeOrder.gateway_reference}` : "Approve the handset push to complete payment."} tone={getOrderStateTone(activeOrder)} />
                        </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, lg: 8 }}>
                            <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                                <Stack spacing={2}>
                                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between">
                                        <Stack spacing={0.5}>
                                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                                {detail.event.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {getEventTypeLabel(detail.event.event_type)} support event for {detail.event.beneficiary_name}
                                            </Typography>
                                        </Stack>
                                        <Chip
                                            color={row.status === "paid" ? "success" : row.status === "partial" ? "warning" : "default"}
                                            label={row.status === "paid" ? "Contribution completed" : row.status === "partial" ? "Contribution in progress" : "Contribution pending"}
                                        />
                                    </Stack>

                                    <Typography variant="body1" color="text.secondary">
                                        {detail.event.description || "This support event is active and your contribution obligation has been generated from the applied policy."}
                                    </Typography>

                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                            <Typography variant="subtitle2">Contribution progress</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatCurrency(detail.summary.collected_total)} collected of {formatCurrency(detail.summary.expected_total)}
                                            </Typography>
                                        </Stack>
                                        <LinearProgress variant="determinate" value={collectionProgress} sx={{ height: 10, borderRadius: 999 }} />
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Members paid: {detail.summary.paid_members} / {detail.summary.paid_members + detail.summary.pending_members}
                                        </Typography>
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="overline" color="text.secondary">Deadline</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 700 }}>{formatDate(detail.event.deadline)}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="overline" color="text.secondary">Your contribution</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 700 }}>{formatCurrency(row.expected_amount)}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="overline" color="text.secondary">Amount paid</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 700 }}>{formatCurrency(row.amount_paid)}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="overline" color="text.secondary">Outstanding</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 700 }}>{formatCurrency(outstandingAmount)}</Typography>
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </Paper>
                        </Grid>

                        <Grid size={{ xs: 12, lg: 4 }}>
                            <Paper sx={{ p: 2.5, borderRadius: 3, height: "100%" }}>
                                <Stack spacing={2}>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                        Your contribution status
                                    </Typography>

                                    {row.status === "paid" ? (
                                        <Alert severity="success">Contribution completed. Your payment has been posted to the contribution ledger.</Alert>
                                    ) : null}

                                    {activeOrder?.status === "pending" ? (
                                        <Alert severity="info" icon={<HourglassTopRoundedIcon fontSize="inherit" />}>
                                            Waiting for approval on your phone. If you already approved or rejected the request, use Check status.
                                        </Alert>
                                    ) : null}

                                    {activeOrder?.status === "failed" || activeOrder?.status === "expired" ? (
                                        <Alert severity="warning">
                                            {activeOrder.error_message || "The last mobile money attempt did not complete. You can start a new payment request."}
                                        </Alert>
                                    ) : null}

                                    <Typography variant="body2" color="text.secondary">
                                        Event: {detail.event.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Amount: {formatCurrency(row.expected_amount)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Status: {row.status}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Paid at: {formatDate(row.paid_at || null)}
                                    </Typography>
                                    {activeOrder ? (
                                        <>
                                            <Typography variant="body2" color="text.secondary">
                                                Mobile money order: {activeOrder.status}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Phone: {activeOrder.phone}
                                            </Typography>
                                        </>
                                    ) : null}

                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                                        <Button
                                            variant="contained"
                                            disabled={row?.status === "paid" || row?.status === "waived"}
                                            onClick={() => {
                                                if (hasPendingOrder) {
                                                    setProgressDialogOpen(true);
                                                    return;
                                                }

                                                setPayDialogOpen(true);
                                            }}
                                        >
                                            {primaryActionLabel}
                                        </Button>
                                        {activeOrder ? (
                                            <Button
                                                variant="outlined"
                                                disabled={checkingStatus}
                                                onClick={handleCheckStatus}
                                            >
                                                {checkingStatus ? "Checking..." : "Check status"}
                                            </Button>
                                        ) : null}
                                    </Stack>

                                    {!canPay && !hasPendingOrder && row.status !== "paid" && row.status !== "waived" ? (
                                        <Typography variant="body2" color="text.secondary">
                                            This contribution cannot be paid right now because the event is no longer collecting or there is no outstanding balance.
                                        </Typography>
                                    ) : null}
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            ) : (
                <Paper sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
                    Loading contribution workspace...
                </Paper>
            )}

            <ContributionPaymentStartDialog
                open={payDialogOpen}
                amount={outstandingAmount}
                phone={paymentPhone}
                onPhoneChange={setPaymentPhone}
                onClose={() => setPayDialogOpen(false)}
                onSubmit={handleSubmitPayment}
                submitting={submitting}
            />

            <ContributionPaymentProgressDialog
                open={progressDialogOpen && Boolean(activeOrder)}
                order={activeOrder}
                eventTitle={detail?.event.title || ""}
                contributionAmount={row?.expected_amount || 0}
                onClose={handleCloseProgressDialog}
                onCheckStatus={handleCheckStatus}
                checkingStatus={checkingStatus}
            />
        </Stack>
    );
}
