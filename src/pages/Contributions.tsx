import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import {
    Alert,
    Box,
    Button,
    CardContent,
    Chip,
    Grid,
    LinearProgress,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { hasRole } from "../auth/roles";
import { ContributionReceiptDialog } from "../components/common/ContributionReceiptDialog";
import { DataPageSkeleton } from "../components/common/DataPageSkeleton";
import { PageHero } from "../components/common/PageHero";
import { StatCard } from "../components/common/StatCard";
import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import { brandColors } from "../theme/colors";
import type { ContributionEventSummary, ContributionLedgerRow, ContributionLedgerSummary, ContributionPaymentOrderStatus, PaginationMeta } from "../types/api";
import { MotionCard } from "../ui/motion";
import { formatCurrency, formatDate, formatDateTime } from "./page-format";

const defaultLedgerSummary: ContributionLedgerSummary = {
    total_rows: 0,
    collected_total: 0,
    pending_total: 0,
    settled_rows: 0,
    open_rows: 0,
    settlement_rate: 0
};

const defaultManagerFilters = {
    event_id: "",
    status: "",
    event_type: "",
    payment_method: ""
};

export function ContributionsPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const { user } = useAuth();
    const isFundManager = hasRole(user, "fund_manager");
    const [rows, setRows] = useState<ContributionLedgerRow[]>([]);
    const [eventOptions, setEventOptions] = useState<ContributionEventSummary[]>([]);
    const [summary, setSummary] = useState<ContributionLedgerSummary>(defaultLedgerSummary);
    const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, page_size: 10, total: 0 });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [filters, setFilters] = useState(defaultManagerFilters);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
    const [selectedReceiptRow, setSelectedReceiptRow] = useState<ContributionLedgerRow | null>(null);
    const [receiptOrder, setReceiptOrder] = useState<ContributionPaymentOrderStatus | null>(null);
    const [receiptLoading, setReceiptLoading] = useState(false);
    const [receiptError, setReceiptError] = useState("");

    const loadRows = async () => {
        setLoading(true);
        setErrorMessage("");

        try {
            const params = isFundManager
                ? {
                    page: page + 1,
                    page_size: pageSize,
                    ...(filters.event_id ? { event_id: filters.event_id } : {}),
                    ...(filters.status ? { status: filters.status } : {}),
                    ...(filters.event_type ? { event_type: filters.event_type } : {}),
                    ...(filters.payment_method ? { payment_method: filters.payment_method } : {})
                }
                : {
                    page: 1,
                    page_size: 100
                };

            const response = await api.get(endpoints.contributions, { params });
            const payload = response.data.data || {};

            setRows(payload.items || []);
            setSummary(payload.summary || defaultLedgerSummary);
            setPagination(payload.pagination || { page: 1, page_size: pageSize, total: payload.items?.length || 0 });
        } catch (error) {
            setRows([]);
            setSummary(defaultLedgerSummary);
            setPagination({ page: 1, page_size: pageSize, total: 0 });
            setErrorMessage(getApiErrorMessage(error, "Unable to load contributions."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadRows();
    }, [isFundManager, page, pageSize, filters.event_id, filters.event_type, filters.payment_method, filters.status]);

    useEffect(() => {
        if (!isFundManager) {
            return;
        }

        api.get(endpoints.events, { params: { page_size: 100 } })
            .then((response) => {
                setEventOptions(response.data.data.items || []);
            })
            .catch((error) => {
                setErrorMessage((current) => current || getApiErrorMessage(error, "Unable to load event filter options."));
            });
    }, [isFundManager]);

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

    const totalPending = rows.reduce((sum, row) => sum + Math.max(Number(row.expected_amount || 0) - Number(row.amount_paid || 0), 0), 0);
    const totalCollected = rows.reduce((sum, row) => sum + Number(row.amount_paid || 0), 0);
    const currentYear = new Date().getFullYear();
    const contributedRows = rows
        .filter((row) => Number(row.amount_paid || 0) > 0 || row.status === "paid" || row.status === "partial")
        .sort((left, right) => new Date(right.paid_at || right.created_at || 0).getTime() - new Date(left.paid_at || left.created_at || 0).getTime());
    const totalPaidThisYear = rows.reduce((sum, row) => {
        if (!row.paid_at) {
            return sum;
        }

        return new Date(row.paid_at).getFullYear() === currentYear ? sum + Number(row.amount_paid || 0) : sum;
    }, 0);

    const pageStart = pagination.total ? page * pageSize + 1 : 0;
    const pageEnd = pagination.total ? Math.min(page * pageSize + rows.length, pagination.total) : 0;
    const hasActiveFilters = Boolean(filters.event_id || filters.status || filters.event_type || filters.payment_method);
    const selectedEvent = eventOptions.find((event) => event.event_id === filters.event_id) || null;
    const managerSummaryChips = useMemo(() => {
        return [
            { label: selectedEvent ? selectedEvent.title : `${summary.total_rows} row(s)`, tone: "default" as const },
            { label: `${summary.open_rows} open`, tone: "warning" as const },
            { label: `${summary.settlement_rate}% settled`, tone: "success" as const }
        ];
    }, [selectedEvent, summary.open_rows, summary.settlement_rate, summary.total_rows]);

    if (loading && !rows.length) {
        return <DataPageSkeleton statCards={isFundManager ? 4 : 3} tableColumns={isFundManager ? 8 : 5} tableRows={6} />;
    }

    if (!isFundManager) {
        return (
            <Stack spacing={3}>
                <PageHero
                    eyebrow="Contribution history"
                    title="View completed contribution history and posted receipts."
                    description="Use this page for settled contribution records only. Open the Events menu whenever you need to act on a live obligation."
                />

                {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <StatCard icon={PaymentsRoundedIcon} label="Total paid this year" value={formatCurrency(totalPaidThisYear)} helper="Payments recorded against your obligations this year." tone="success" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <StatCard icon={PaymentsRoundedIcon} label="Total contributed" value={formatCurrency(totalCollected)} helper="Amount already posted from your contribution payments." tone="primary" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <StatCard icon={TaskAltRoundedIcon} label="Contributions made" value={String(contributedRows.length)} helper="Contribution rows where your payment has actually posted." tone="primary" />
                    </Grid>
                </Grid>

                <Paper sx={{ overflow: "hidden" }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Event</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Paid Date</TableCell>
                                <TableCell align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {contributedRows.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>
                                        <Stack spacing={0.35}>
                                            <Typography sx={{ fontWeight: 700 }}>{row.events?.title || "Event"}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(row.events?.deadline || null)}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>{formatCurrency(row.expected_amount)}</TableCell>
                                    <TableCell>{row.status}</TableCell>
                                    <TableCell>{formatDate(row.paid_at || null)}</TableCell>
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<LaunchRoundedIcon />}
                                            onClick={() => void handleOpenReceipt(row)}
                                        >
                                            View details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!contributedRows.length ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <Typography sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                                            No completed contribution history is visible right now.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : null}
                        </TableBody>
                    </Table>
                </Paper>

                <ContributionReceiptDialog
                    open={receiptDialogOpen}
                    row={selectedReceiptRow}
                    order={receiptOrder}
                    loading={receiptLoading}
                    loadError={receiptError}
                    onClose={() => setReceiptDialogOpen(false)}
                />
            </Stack>
        );
    }

    return (
        <Stack spacing={2.5}>
            <Paper
                variant="outlined"
                sx={{
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 3,
                    borderColor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.24 : 0.16),
                    background: theme.palette.mode === "dark"
                        ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.background.paper, 0.96)} 72%)`
                        : `linear-gradient(180deg, ${alpha(brandColors.primary[100], 0.22)} 0%, #FFFFFF 72%)`,
                    boxShadow: theme.palette.mode === "dark" ? "none" : "0 12px 30px rgba(15, 23, 42, 0.04)"
                }}
            >
                <Stack direction={{ xs: "column", lg: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", lg: "center" }}>
                    <Stack spacing={0.75}>
                        <Typography variant="overline" sx={{ letterSpacing: 2.4, color: "text.secondary" }}>
                            Contribution ledger
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            Contribution collections
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760 }}>
                            {selectedEvent
                                ? `Monitor posted, open, and exception rows for ${selectedEvent.title}.`
                                : "Monitor posted, open, and exception rows from one operational ledger."}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {managerSummaryChips.map((chip) => (
                            <Chip
                                key={chip.label}
                                size="small"
                                label={chip.label}
                                color={chip.tone === "success" ? "success" : chip.tone === "warning" ? "warning" : "default"}
                                variant={chip.tone === "default" ? "outlined" : "filled"}
                            />
                        ))}
                        <Button
                            variant="outlined"
                            startIcon={<RefreshRoundedIcon />}
                            onClick={() => void loadRows()}
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                    <LedgerMetricCard
                        icon={PaymentsRoundedIcon}
                        label="Collected total"
                        value={formatCurrency(summary.collected_total)}
                        detail={`${summary.settled_rows} settled row(s) already posted`}
                        tone="success"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                    <LedgerMetricCard
                        icon={ReceiptLongRoundedIcon}
                        label="Open balance"
                        value={formatCurrency(summary.pending_total)}
                        detail={`${summary.open_rows} row(s) still carry unpaid balance`}
                        tone="warning"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                    <LedgerMetricCard
                        icon={TaskAltRoundedIcon}
                        label="Settlement rate"
                        value={`${summary.settlement_rate}%`}
                        detail={`${summary.settled_rows} of ${summary.total_rows} rows are resolved`}
                        tone="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                    <LedgerMetricCard
                        icon={EventNoteRoundedIcon}
                        label={selectedEvent ? "Selected event rows" : "Filtered ledger rows"}
                        value={String(summary.total_rows)}
                        detail={selectedEvent
                            ? `${selectedEvent.event_type.replace("_", " ")} · deadline ${formatDate(selectedEvent.deadline)}`
                            : pagination.total
                                ? `Rows ${pageStart}-${pageEnd} in the current page window`
                                : "No rows match the current ledger filters"}
                        tone="info"
                    />
                </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3 }}>
                <Stack spacing={2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <TuneRoundedIcon color="primary" />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Ledger controls
                            </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                            {loading ? "Refreshing ledger rows..." : pagination.total ? `Showing ${pageStart}-${pageEnd} of ${pagination.total} ledger row(s)` : "No ledger rows found"}
                        </Typography>
                    </Stack>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                            <TextField
                                select
                                label="Event"
                                fullWidth
                                value={filters.event_id}
                                onChange={(event) => {
                                    setFilters((current) => ({ ...current, event_id: event.target.value }));
                                    setPage(0);
                                }}
                                helperText="Scope the ledger cards and rows to one contribution event."
                            >
                                <MenuItem value="">All events</MenuItem>
                                {eventOptions.map((event) => (
                                    <MenuItem key={event.event_id} value={event.event_id}>
                                        {event.title}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                            <TextField
                                select
                                label="Status"
                                fullWidth
                                value={filters.status}
                                onChange={(event) => {
                                    setFilters((current) => ({ ...current, status: event.target.value }));
                                    setPage(0);
                                }}
                            >
                                <MenuItem value="">All statuses</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="partial">Partial</MenuItem>
                                <MenuItem value="paid">Paid</MenuItem>
                                <MenuItem value="waived">Waived</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                            <TextField
                                select
                                label="Event type"
                                fullWidth
                                value={filters.event_type}
                                onChange={(event) => {
                                    setFilters((current) => ({ ...current, event_type: event.target.value }));
                                    setPage(0);
                                }}
                            >
                                <MenuItem value="">All event types</MenuItem>
                                <MenuItem value="funeral">Funeral</MenuItem>
                                <MenuItem value="wedding">Wedding</MenuItem>
                                <MenuItem value="medical_emergency">Medical emergency</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                            <TextField
                                select
                                label="Payment method"
                                fullWidth
                                value={filters.payment_method}
                                onChange={(event) => {
                                    setFilters((current) => ({ ...current, payment_method: event.target.value }));
                                    setPage(0);
                                }}
                            >
                                <MenuItem value="">All methods</MenuItem>
                                <MenuItem value="mobile_money">Mobile money</MenuItem>
                                <MenuItem value="cash">Cash</MenuItem>
                                <MenuItem value="bank_transfer">Bank transfer</MenuItem>
                                <MenuItem value="payroll_deduction">Payroll deduction</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>

                    <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {hasActiveFilters ? (
                                <>
                                    {selectedEvent ? <Chip size="small" label={`Event: ${selectedEvent.title}`} /> : null}
                                    {filters.status ? <Chip size="small" label={`Status: ${filters.status}`} /> : null}
                                    {filters.event_type ? <Chip size="small" label={`Type: ${filters.event_type.replace("_", " ")}`} /> : null}
                                    {filters.payment_method ? <Chip size="small" label={`Method: ${filters.payment_method.replace("_", " ")}`} /> : null}
                                </>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No filters applied. You are seeing the full contribution ledger.
                                </Typography>
                            )}
                        </Stack>
                        <Button
                            color="inherit"
                            disabled={!hasActiveFilters}
                            onClick={() => {
                                setFilters(defaultManagerFilters);
                                setPage(0);
                            }}
                        >
                            Reset filters
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 3 }}>
                {loading ? <LinearProgress /> : null}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: 72 }}>No.</TableCell>
                                <TableCell>Member</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell>Event</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell align="right">Expected</TableCell>
                                <TableCell align="right">Paid</TableCell>
                                <TableCell align="right">Outstanding</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Paid at</TableCell>
                                <TableCell align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row, index) => {
                                const outstandingAmount = Math.max(Number(row.expected_amount || 0) - Number(row.amount_paid || 0), 0);

                                return (
                                    <TableRow
                                        key={row.id}
                                        hover
                                        sx={{
                                            "&:nth-of-type(odd)": {
                                                backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.05 : 0.02)
                                            }
                                        }}
                                    >
                                        <TableCell sx={{ color: "text.secondary", fontWeight: 700 }}>
                                            {page * pageSize + index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <Stack spacing={0.25}>
                                                <Typography sx={{ fontWeight: 700 }}>{row.members?.full_name || "Member"}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {row.members?.email || "No email"}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{row.members?.department || "N/A"}</TableCell>
                                        <TableCell>
                                            <Stack spacing={0.25}>
                                                <Typography sx={{ fontWeight: 700 }}>{row.events?.title || "Event"}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Due {formatDate(row.events?.deadline || null)}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ textTransform: "capitalize" }}>
                                            {(row.events?.event_type || "N/A").replace("_", " ")}
                                        </TableCell>
                                        <TableCell align="right">{formatCurrency(row.expected_amount)}</TableCell>
                                        <TableCell align="right">{formatCurrency(row.amount_paid)}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                                            {formatCurrency(outstandingAmount)}
                                        </TableCell>
                                        <TableCell>
                                            <StatusChip status={row.status} />
                                        </TableCell>
                                        <TableCell>{formatDateTime(row.paid_at || null)}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<LaunchRoundedIcon />}
                                                onClick={() => navigate(`/events/${row.event_id}`)}
                                            >
                                                Open event
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {!rows.length ? (
                                <TableRow>
                                    <TableCell colSpan={11}>
                                        <Typography sx={{ py: 5, textAlign: "center", color: "text.secondary" }}>
                                            No contribution ledger rows match the current view.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : null}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={pagination.total}
                    page={page}
                    onPageChange={(_, nextPage) => setPage(nextPage)}
                    rowsPerPage={pageSize}
                    onRowsPerPageChange={(event) => {
                        const nextPageSize = Number(event.target.value);
                        setPageSize(nextPageSize);
                        setPage(0);
                    }}
                    rowsPerPageOptions={[10, 25, 50]}
                />
            </Paper>
        </Stack>
    );
}

function LedgerMetricCard({
    icon: Icon,
    label,
    value,
    detail,
    tone
}: {
    icon: typeof PaymentsRoundedIcon;
    label: string;
    value: string;
    detail: string;
    tone: "primary" | "success" | "warning" | "info";
}) {
    const theme = useTheme();
    const toneColor = tone === "success"
        ? brandColors.success
        : tone === "warning"
            ? brandColors.warning
            : tone === "info"
                ? brandColors.info
                : brandColors.primary[900];

    return (
        <MotionCard
            variant="outlined"
            sx={{
                height: "100%",
                position: "relative",
                overflow: "hidden",
                borderRadius: 3,
                borderColor: alpha(toneColor, theme.palette.mode === "dark" ? 0.35 : 0.2),
                background: `linear-gradient(145deg, ${alpha(toneColor, theme.palette.mode === "dark" ? 0.16 : 0.08)} 0%, ${alpha("#FFFFFF", theme.palette.mode === "dark" ? 0.03 : 1)} 72%)`
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    insetInline: 0,
                    top: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${toneColor} 0%, ${alpha(toneColor, 0.15)} 100%)`
                }}
            />
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.25, p: 2.25 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="overline" color="text.secondary">
                        {label}
                    </Typography>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2.5,
                            display: "grid",
                            placeItems: "center",
                            color: toneColor,
                            bgcolor: alpha(toneColor, theme.palette.mode === "dark" ? 0.2 : 0.12)
                        }}
                    >
                        <Icon fontSize="small" />
                    </Box>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
                    {value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {detail}
                </Typography>
            </CardContent>
        </MotionCard>
    );
}

function StatusChip({ status }: { status: ContributionLedgerRow["status"] }) {
    if (status === "paid") {
        return <Chip size="small" label="Paid" color="success" />;
    }

    if (status === "partial") {
        return <Chip size="small" label="Partial" color="warning" />;
    }

    if (status === "waived") {
        return <Chip size="small" label="Waived" color="default" />;
    }

    return <Chip size="small" label="Pending" variant="outlined" />;
}
