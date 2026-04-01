import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { hasRole } from "../auth/roles";
import { DataPageSkeleton } from "../components/common/DataPageSkeleton";
import { ContributionPaymentProgressDialog } from "../components/common/ContributionPaymentProgressDialog";
import { ContributionReceiptDialog } from "../components/common/ContributionReceiptDialog";
import { ContributionPaymentStartDialog } from "../components/common/ContributionPaymentStartDialog";
import { PageHero } from "../components/common/PageHero";
import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import { calculateContributionPaymentPreview } from "../lib/platformFee";
import type { ContributionEventSummary, ContributionLedgerRow, ContributionPaymentOrderStatus, PlatformFeeSettings } from "../types/api";
import { getEventTypeLabel } from "../utils/policy-config";
import { formatCurrency, formatDate } from "./page-format";

type SelectedContributionContext = {
    event: ContributionEventSummary;
    row: ContributionLedgerRow;
};

export function EventsPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();
    const isFundManager = hasRole(user, "fund_manager");
    const [events, setEvents] = useState<ContributionEventSummary[]>([]);
    const [memberRows, setMemberRows] = useState<ContributionLedgerRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [selectedContribution, setSelectedContribution] = useState<SelectedContributionContext | null>(null);
    const [activeOrder, setActiveOrder] = useState<ContributionPaymentOrderStatus | null>(null);
    const [platformFeeSettings, setPlatformFeeSettings] = useState<PlatformFeeSettings | null>(null);
    const [paymentPhone, setPaymentPhone] = useState(user?.member?.phone || "");
    const [payDialogOpen, setPayDialogOpen] = useState(false);
    const [preparingPayment, setPreparingPayment] = useState(false);
    const [openingContributionEventId, setOpeningContributionEventId] = useState("");
    const [progressDialogOpen, setProgressDialogOpen] = useState(false);
    const [dismissedProgressOrderId, setDismissedProgressOrderId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
    const [selectedReceiptRow, setSelectedReceiptRow] = useState<ContributionLedgerRow | null>(null);
    const [receiptOrder, setReceiptOrder] = useState<ContributionPaymentOrderStatus | null>(null);
    const [receiptLoading, setReceiptLoading] = useState(false);
    const [receiptError, setReceiptError] = useState("");
    const [deleteDialogEvent, setDeleteDialogEvent] = useState<ContributionEventSummary | null>(null);
    const [deletingEventId, setDeletingEventId] = useState("");

    const loadMemberEvents = async (showLoader = false) => {
        if (showLoader) {
            if (!events.length && !memberRows.length) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }
        }

        try {
            const [eventsResponse, contributionsResponse, platformFeeResponse] = await Promise.all([
                api.get(endpoints.events),
                api.get(endpoints.contributions, { params: { page_size: 100 } }),
                api.get(endpoints.adminPlatformFee)
            ]);

            setEvents(eventsResponse.data.data.items || []);
            setMemberRows(contributionsResponse.data.data.items || []);
            setPlatformFeeSettings(platformFeeResponse.data.data || null);
        } finally {
            if (showLoader) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    };

    const loadManagerEvents = async (showLoader = false) => {
        if (showLoader) {
            if (!events.length) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }
        }

        try {
            const eventsResponse = await api.get(endpoints.events);
            setEvents(eventsResponse.data.data.items || []);
        } finally {
            if (showLoader) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    };

    useEffect(() => {
        if (isFundManager) {
            loadManagerEvents(true)
                .catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load contribution events.")));
            return;
        }

        loadMemberEvents(true)
            .catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load contribution events.")));
    }, [isFundManager]);

    useEffect(() => {
        if (!user?.member?.phone) {
            return;
        }

        setPaymentPhone((current) => current || user.member?.phone || "");
    }, [user?.member?.phone]);

    const memberRowsByEventId = useMemo(
        () => new Map(memberRows.map((row) => [row.event_id, row])),
        [memberRows]
    );

    const selectedOutstandingAmount = selectedContribution
        ? Math.max(Number(selectedContribution.row.expected_amount || 0) - Number(selectedContribution.row.amount_paid || 0), 0)
        : 0;
    const paymentPreview = calculateContributionPaymentPreview(selectedOutstandingAmount, platformFeeSettings);

    const handleOpenContribution = async (event: ContributionEventSummary, row: ContributionLedgerRow) => {
        setSelectedContribution({ event, row });
        setActiveOrder(null);
        setErrorMessage("");
        setSuccessMessage("");
        setOpeningContributionEventId(event.event_id);
        setPreparingPayment(true);
        setPayDialogOpen(true);

        try {
            const response = await api.get(endpoints.contributionPaymentLatest, { params: { event_id: event.event_id } });
            const latestOrder = response.data.data as ContributionPaymentOrderStatus | null;
            setActiveOrder(latestOrder);

            if (latestOrder?.status === "pending") {
                setPayDialogOpen(false);
                setDismissedProgressOrderId("");
                setProgressDialogOpen(true);
                return;
            }
        } catch (error) {
            setPayDialogOpen(false);
            setErrorMessage(getApiErrorMessage(error, "Unable to open the payment flow."));
        } finally {
            setPreparingPayment(false);
            setOpeningContributionEventId("");
        }
    };

    const handleOpenReceipt = async (row: ContributionLedgerRow) => {
        setSelectedReceiptRow(row);
        setReceiptOrder(null);
        setReceiptError("");
        setReceiptDialogOpen(true);

        try {
            setReceiptLoading(true);
            const response = await api.get(endpoints.contributionPaymentLatest, { params: { event_id: row.event_id } });
            setReceiptOrder(response.data.data || null);
        } catch (error) {
            setReceiptError(getApiErrorMessage(error, "Transaction metadata is not available for this contribution yet."));
        } finally {
            setReceiptLoading(false);
        }
    };

    useEffect(() => {
        if (isFundManager) {
            return;
        }

        const payEventId = searchParams.get("pay");
        if (!payEventId) {
            return;
        }

        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("pay");
        setSearchParams(nextParams, { replace: true });

        const event = events.find((entry) => entry.event_id === payEventId);
        const row = memberRowsByEventId.get(payEventId);

        if (!event || !row || !["pending", "partial"].includes(row.status)) {
            return;
        }

        void handleOpenContribution(event, row);
    }, [events, isFundManager, memberRowsByEventId, searchParams, setSearchParams]);

    useEffect(() => {
        if (isFundManager || !activeOrder || activeOrder.status !== "pending") {
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
                    await loadMemberEvents();
                } else if (nextOrder.status === "failed" || nextOrder.status === "expired") {
                    setErrorMessage(nextOrder.error_message || "The mobile money payment did not complete.");
                    await loadMemberEvents();
                }
            } catch (error) {
                setErrorMessage(getApiErrorMessage(error, "Unable to refresh the payment status."));
            } finally {
                setCheckingStatus(false);
            }
        }, 4000);

        return () => window.clearTimeout(timeoutId);
    }, [activeOrder, dismissedProgressOrderId, isFundManager]);

    useEffect(() => {
        if (!activeOrder || activeOrder.status !== "pending") {
            setDismissedProgressOrderId("");
        }
    }, [activeOrder]);

    const handleSubmitPayment = async () => {
        if (!selectedContribution) {
            return;
        }

        if (!paymentPreview.minimum_amount_met) {
            setErrorMessage(paymentPreview.minimum_amount_message || "This contribution is below the minimum amount allowed for mobile money processing.");
            return;
        }

        try {
            setSubmitting(true);
            setErrorMessage("");
            setSuccessMessage("");

            const response = await api.post(endpoints.contributionPay, {
                event_id: selectedContribution.event.event_id,
                amount: selectedOutstandingAmount,
                payment_method: "mobile_money",
                phone: paymentPhone
            });

            setActiveOrder(response.data.data);
            setPayDialogOpen(false);
            setProgressDialogOpen(true);
            setDismissedProgressOrderId("");
            setSuccessMessage("Mobile money prompt sent. Approve the request on your phone to complete the contribution.");
            await loadMemberEvents();
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
            await loadMemberEvents();
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

    const canDeleteEvent = (event: ContributionEventSummary) =>
        isFundManager && Boolean(event.can_delete);

    const renderMemberStatusChip = (row: ContributionLedgerRow | undefined) => (
        <Chip
            size="small"
            label={row?.status ? row.status.replace(/_/g, " ") : "pending"}
            color={row?.status === "paid" ? "success" : row?.status === "partial" ? "warning" : "default"}
            variant={row?.status === "paid" ? "filled" : "outlined"}
        />
    );

    const renderMemberActionButton = (
        event: ContributionEventSummary,
        row: ContributionLedgerRow | undefined,
        hasCompleted: boolean,
        isOpeningContribution: boolean,
        fullWidth = false
    ) => {
        if (!row) {
            return (
                <Button size={fullWidth ? "medium" : "small"} variant="outlined" disabled fullWidth={fullWidth}>
                    Contribution unavailable
                </Button>
            );
        }

        return (
            <Button
                size={fullWidth ? "medium" : "small"}
                variant={hasCompleted ? "outlined" : "contained"}
                startIcon={isOpeningContribution ? <AutorenewRoundedIcon sx={{ animation: "spin 1s linear infinite", "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } } }} /> : <PaymentsRoundedIcon />}
                disabled={isOpeningContribution}
                fullWidth={fullWidth}
                onClick={() => {
                    if (hasCompleted) {
                        void handleOpenReceipt(row);
                        return;
                    }

                    void handleOpenContribution(event, row);
                }}
            >
                {isOpeningContribution ? "Preparing..." : hasCompleted ? "View Details" : "Contribute"}
            </Button>
        );
    };

    if (loading && !events.length && (isFundManager || !memberRows.length)) {
        return <DataPageSkeleton statCards={0} tableColumns={isFundManager ? 9 : 6} tableRows={6} />;
    }

    return (
        <Stack spacing={3}>
            <PageHero
                eyebrow="Contribution event flow"
                title={isFundManager ? "Launch contribution events from approved policies and track collections from one place." : "Track the contribution events tied to your own obligations."}
                description={isFundManager ? "Select a policy, preview eligibility, launch the event, then manage collection progress from the event dashboard." : "Review support events that apply to you, start contribution payment straight from this page, and monitor how each drive is progressing."}
                tone="surface"
                actions={isFundManager ? (
                    <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/events/create")}>
                        Launch Contribution Event
                    </Button>
                ) : undefined}
            />

            {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}
            {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
            {refreshing ? <LinearProgress /> : null}

            {isFundManager ? (
                <Paper sx={{ overflow: "hidden" }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Event</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Deadline</TableCell>
                                <TableCell>Support Target</TableCell>
                                <TableCell>Projected Total</TableCell>
                                <TableCell>Collected</TableCell>
                                <TableCell>Pending</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow key={event.event_id} hover>
                                    <TableCell>
                                        <Stack spacing={0.4}>
                                            <Typography sx={{ fontWeight: 700 }}>{event.title}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {event.pending_members} pending · {event.paid_members} paid
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>{getEventTypeLabel(event.event_type)}</TableCell>
                                    <TableCell>{formatDate(event.deadline)}</TableCell>
                                    <TableCell>{event.target_amount ? formatCurrency(event.target_amount) : "Not set"}</TableCell>
                                    <TableCell>{formatCurrency(event.expected_total)}</TableCell>
                                    <TableCell>{formatCurrency(event.collected_total)}</TableCell>
                                    <TableCell>{formatCurrency(event.pending_total)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={event.status}
                                            color={event.status === "closed" ? "default" : event.status === "collection" ? "warning" : event.status === "active" ? "success" : "default"}
                                            variant={event.status === "closed" || event.status === "archived" ? "outlined" : "filled"}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            {canDeleteEvent(event) ? (
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    variant="outlined"
                                                    startIcon={<DeleteOutlineRoundedIcon />}
                                                    disabled={deletingEventId === event.event_id}
                                                    onClick={() => setDeleteDialogEvent(event)}
                                                >
                                                    Delete
                                                </Button>
                                            ) : null}
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<EditRoundedIcon />}
                                                disabled={event.status === "closed" || event.status === "archived"}
                                                onClick={() => navigate(`/events/${event.event_id}/edit`)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<LaunchRoundedIcon />}
                                                onClick={() => navigate(`/events/${event.event_id}`)}
                                            >
                                                Open
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!events.length ? (
                                <TableRow>
                                    <TableCell colSpan={9}>
                                        <Stack spacing={1} alignItems="center" sx={{ py: 5 }}>
                                            <EventRoundedIcon color="disabled" />
                                            <Typography sx={{ fontWeight: 700 }}>No contribution events available.</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Launch your first event from a policy to start generating contribution obligations.
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ) : null}
                        </TableBody>
                    </Table>
                </Paper>
            ) : (
                <>
                    {!events.length ? (
                        <Paper sx={{ p: 3 }}>
                            <Stack spacing={1} alignItems="center" sx={{ py: 2 }}>
                                <EventRoundedIcon color="disabled" />
                                <Typography sx={{ fontWeight: 700 }}>No contribution events available.</Typography>
                                <Typography variant="body2" color="text.secondary" textAlign="center">
                                    When a fund manager opens an event that applies to you, it will appear here.
                                </Typography>
                            </Stack>
                        </Paper>
                    ) : (
                        <>
                            <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
                                {events.map((event) => {
                                    const row = memberRowsByEventId.get(event.event_id);
                                    const hasCompleted = row?.status === "paid" || row?.status === "waived";
                                    const isOpeningContribution = openingContributionEventId === event.event_id;
                                    const outstandingAmount = Math.max(Number(row?.expected_amount || 0) - Number(row?.amount_paid || 0), 0);

                                    return (
                                        <Paper
                                            key={event.event_id}
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(246,248,255,0.98))"
                                            }}
                                        >
                                            <Stack spacing={1.5}>
                                                <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
                                                    <Stack spacing={0.45} sx={{ minWidth: 0, flex: 1 }}>
                                                        <Typography sx={{ fontWeight: 700 }}>{event.title}</Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {formatCurrency(event.collected_total)} collected of {formatCurrency(event.expected_total)}
                                                        </Typography>
                                                    </Stack>
                                                    {renderMemberStatusChip(row)}
                                                </Stack>

                                                <Box
                                                    sx={{
                                                        display: "grid",
                                                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                                        gap: 1.25
                                                    }}
                                                >
                                                    <Stack spacing={0.35}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                                            Type
                                                        </Typography>
                                                        <Typography variant="body2">{getEventTypeLabel(event.event_type)}</Typography>
                                                    </Stack>
                                                    <Stack spacing={0.35}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                                            Deadline
                                                        </Typography>
                                                        <Typography variant="body2">{formatDate(event.deadline)}</Typography>
                                                    </Stack>
                                                    <Stack spacing={0.35}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                                            Your contribution
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                            {formatCurrency(row?.expected_amount || 0)}
                                                        </Typography>
                                                    </Stack>
                                                    <Stack spacing={0.35}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                                            Remaining
                                                        </Typography>
                                                        <Typography variant="body2">{formatCurrency(outstandingAmount)}</Typography>
                                                    </Stack>
                                                </Box>

                                                {renderMemberActionButton(event, row, hasCompleted, isOpeningContribution, true)}
                                            </Stack>
                                        </Paper>
                                    );
                                })}
                            </Stack>

                            <Paper sx={{ overflow: "hidden", display: { xs: "none", md: "block" } }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Event</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Deadline</TableCell>
                                            <TableCell>Contribution Amount</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {events.map((event) => {
                                            const row = memberRowsByEventId.get(event.event_id);
                                            const hasCompleted = row?.status === "paid" || row?.status === "waived";
                                            const isOpeningContribution = openingContributionEventId === event.event_id;

                                            return (
                                                <TableRow key={event.event_id} hover>
                                                    <TableCell>
                                                        <Stack spacing={0.4}>
                                                            <Typography sx={{ fontWeight: 700 }}>{event.title}</Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {formatCurrency(event.collected_total)} collected of {formatCurrency(event.expected_total)}
                                                            </Typography>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>{getEventTypeLabel(event.event_type)}</TableCell>
                                                    <TableCell>{formatDate(event.deadline)}</TableCell>
                                                    <TableCell>{formatCurrency(row?.expected_amount || 0)}</TableCell>
                                                    <TableCell>{renderMemberStatusChip(row)}</TableCell>
                                                    <TableCell align="right">
                                                        {renderMemberActionButton(event, row, hasCompleted, isOpeningContribution)}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </Paper>
                        </>
                    )}

                    <ContributionPaymentStartDialog
                        open={payDialogOpen}
                        contributionAmount={paymentPreview.contribution_amount}
                        platformFee={paymentPreview.platform_fee}
                        gatewayFee={paymentPreview.gateway_fee}
                        totalToPay={paymentPreview.total_to_pay}
                        platformFeeRate={platformFeeSettings?.platform_fee_percentage ?? null}
                        gatewayFeeRate={platformFeeSettings?.gateway_fee_percentage ?? null}
                        gatewayFlatFee={platformFeeSettings?.gateway_flat_fee ?? null}
                        minimumAmountMet={paymentPreview.minimum_amount_met}
                        minimumAmountMessage={paymentPreview.minimum_amount_message}
                        phone={paymentPhone}
                        onPhoneChange={setPaymentPhone}
                        onClose={() => setPayDialogOpen(false)}
                        onSubmit={handleSubmitPayment}
                        loading={preparingPayment}
                        submitting={submitting}
                    />

                    <ContributionPaymentProgressDialog
                        open={progressDialogOpen && Boolean(activeOrder)}
                        order={activeOrder}
                        eventTitle={selectedContribution?.event.title || ""}
                        contributionAmount={selectedContribution?.row.expected_amount || 0}
                        onClose={handleCloseProgressDialog}
                        onCheckStatus={handleCheckStatus}
                        checkingStatus={checkingStatus}
                    />

                    <ContributionReceiptDialog
                        open={receiptDialogOpen}
                        row={selectedReceiptRow}
                        order={receiptOrder}
                        loading={receiptLoading}
                        loadError={receiptError}
                        onClose={() => setReceiptDialogOpen(false)}
                    />

                    <Dialog open={Boolean(deleteDialogEvent)} onClose={() => !deletingEventId && setDeleteDialogEvent(null)} fullWidth maxWidth="sm">
                        <DialogTitle>Delete contribution event</DialogTitle>
                        <DialogContent dividers>
                            <Stack spacing={1.25}>
                                <Typography variant="body2" color="text.secondary">
                                    Delete this event only if collection has not started. All pending contribution rows and unposted payment orders tied to it will also be removed.
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                                    <Stack spacing={0.55}>
                                        <Typography sx={{ fontWeight: 700 }}>
                                            {deleteDialogEvent?.title || "Contribution event"}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {deleteDialogEvent ? `${getEventTypeLabel(deleteDialogEvent.event_type)} · deadline ${formatDate(deleteDialogEvent.deadline)}` : ""}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {deleteDialogEvent ? `${formatCurrency(deleteDialogEvent.pending_total)} still open · ${deleteDialogEvent.pending_members} pending members` : ""}
                                        </Typography>
                                    </Stack>
                                </Paper>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, py: 2 }}>
                            <Button onClick={() => setDeleteDialogEvent(null)} disabled={Boolean(deletingEventId)}>
                                Cancel
                            </Button>
                            <Button
                                color="error"
                                variant="contained"
                                disabled={!deleteDialogEvent || Boolean(deletingEventId)}
                                onClick={async () => {
                                    if (!deleteDialogEvent) {
                                        return;
                                    }

                                    try {
                                        setDeletingEventId(deleteDialogEvent.event_id);
                                        setErrorMessage("");
                                        setSuccessMessage("");
                                        await api.delete(endpoints.eventDelete(deleteDialogEvent.event_id));
                                        setSuccessMessage("Contribution event deleted successfully.");
                                        setDeleteDialogEvent(null);
                                        const response = await api.get(endpoints.events);
                                        setEvents(response.data.data.items || []);
                                    } catch (error) {
                                        setErrorMessage(getApiErrorMessage(error, "Unable to delete contribution event."));
                                    } finally {
                                        setDeletingEventId("");
                                    }
                                }}
                            >
                                {deletingEventId ? "Deleting..." : "Delete event"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </Stack>
    );
}
