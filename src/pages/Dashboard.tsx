import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import DonutLargeRoundedIcon from "@mui/icons-material/DonutLargeRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import PolicyRoundedIcon from "@mui/icons-material/PolicyRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import { Alert, Box, Button, Chip, Grid, LinearProgress, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { getPrimaryRole, hasRole } from "../auth/roles";
import { DataPageSkeleton } from "../components/common/DataPageSkeleton";
import { PageHero } from "../components/common/PageHero";
import { StatCard } from "../components/common/StatCard";
import { brandColors } from "../theme/colors";
import { MotionCard } from "../ui/motion";
import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import { getEventTypeLabel } from "../utils/policy-config";
import type {
    AuditLogSummary,
    ContributionEventSummary,
    ContributionLedgerRow,
    DashboardSummary,
    StaffSummary
} from "../types/api";
import { formatCurrency, formatDate } from "./page-format";

function AdminDashboardView() {
    const [staffSummary, setStaffSummary] = useState<StaffSummary | null>(null);
    const [auditSummary, setAuditSummary] = useState<AuditLogSummary | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get(endpoints.staffSummary),
            api.get(endpoints.auditLogSummary)
        ])
            .then(([staffResponse, auditResponse]) => {
                setStaffSummary(staffResponse.data.data);
                setAuditSummary(auditResponse.data.data);
            })
            .catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load governance dashboard.")))
            .finally(() => setLoading(false));
    }, []);

    if (loading && !staffSummary && !auditSummary) {
        return <DataPageSkeleton statCards={4} tableColumns={4} tableRows={4} detailPanels={2} />;
    }

    return (
        <Stack spacing={3}>
            <PageHero
                eyebrow="System governance"
                title="Oversee access, role ownership, and financial transparency without entering operations."
                description="Admin stays on governance: Fund Manager access, system-wide reporting, and audit visibility."
                tone="surface"
                actions={
                    <>
                        <Button component={RouterLink} to="/staff" variant="contained" color="secondary">
                            Manage staff
                        </Button>
                        <Button component={RouterLink} to="/audit-logs" variant="outlined">
                            View audit logs
                        </Button>
                    </>
                }
            />

            {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}
            {loading ? <LinearProgress /> : null}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                    <StatCard icon={BadgeRoundedIcon} label="Fund managers" value={String(staffSummary?.fund_managers ?? "—")} helper="Operational staff accounts provisioned in Fund-Me." />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                    <StatCard icon={VerifiedUserRoundedIcon} label="Active staff" value={String(staffSummary?.active_fund_managers ?? "—")} helper="Fund managers currently allowed into the operational workspace." tone="success" />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                    <StatCard icon={GroupRoundedIcon} label="Total members" value={String(staffSummary?.total_members ?? "—")} helper="Registered members in the contribution system." />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                    <StatCard icon={HistoryRoundedIcon} label="Audit entries (7d)" value={String(auditSummary?.last_7_days_logs ?? "—")} helper="Recent audited system actions recorded in the last seven days." tone="warning" />
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <MotionCard variant="outlined">
                        <Stack spacing={1.2} sx={{ p: 2.25 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Governance focus
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Admin no longer runs the contribution workflow directly. Use this dashboard to keep Fund Manager access, system health, and reporting oversight explicit.
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                The operational ledger, event launch flow, and collection handling now live fully with Fund Managers.
                            </Typography>
                        </Stack>
                    </MotionCard>
                </Grid>
                <Grid size={{ xs: 12, lg: 5 }}>
                    <MotionCard variant="outlined" sx={{ height: "100%" }}>
                        <Stack spacing={1.25} sx={{ p: 2.25 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Oversight checkpoints
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Latest audited action: {auditSummary?.latest_action || "Not recorded yet"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Latest action entity: {auditSummary?.latest_entity || "N/A"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Latest activity date: {formatDate(auditSummary?.latest_action_at || null)}
                            </Typography>
                            <Button component={RouterLink} to="/reports" variant="outlined">
                                Open reports
                            </Button>
                        </Stack>
                    </MotionCard>
                </Grid>
            </Grid>
        </Stack>
    );
}

function FundManagerDashboardView() {
    const theme = useTheme();
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [events, setEvents] = useState<ContributionEventSummary[]>([]);
    const [recentLedgerRows, setRecentLedgerRows] = useState<ContributionLedgerRow[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get(endpoints.dashboard),
            api.get(endpoints.events, { params: { page_size: 100 } }),
            api.get(endpoints.contributions, { params: { page_size: 12 } })
        ])
            .then(([summaryResponse, eventsResponse, contributionsResponse]) => {
                setSummary(summaryResponse.data.data);
                setEvents(eventsResponse.data.data.items || []);
                setRecentLedgerRows(contributionsResponse.data.data.items || []);
            })
            .catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load dashboard summary.")))
            .finally(() => setLoading(false));
    }, []);

    const activeEvents = useMemo(
        () => events.filter((event) => event.status === "active" || event.status === "collection"),
        [events]
    );

    const overviewEvents = useMemo(
        () => activeEvents
            .slice()
            .sort((left, right) => new Date(left.deadline).getTime() - new Date(right.deadline).getTime())
            .slice(0, 8),
        [activeEvents]
    );

    const progressEvents = useMemo(
        () => activeEvents
            .map((event) => {
                const base = Number(event.target_amount || event.expected_total || 0);
                const progress = base ? Math.min(Math.round((Number(event.collected_total || 0) / base) * 100), 100) : 0;
                return { ...event, progress, base };
            })
            .sort((left, right) => new Date(left.deadline).getTime() - new Date(right.deadline).getTime())
            .slice(0, 5),
        [activeEvents]
    );

    const recentActivity = useMemo(
        () => recentLedgerRows
            .map((row) => ({
                id: row.id,
                title: row.events?.title || "Contribution event",
                member: row.members?.full_name || "Member",
                status: row.status,
                amount: Number(row.amount_paid || row.expected_amount || 0),
                paymentMethod: row.payment_method || "ledger",
                when: row.paid_at || row.created_at,
                message: row.status === "paid"
                    ? `Payment posted via ${String(row.payment_method || "ledger").replace(/_/g, " ")}`
                    : row.status === "waived"
                        ? "Contribution waived"
                        : row.status === "partial"
                            ? "Partial settlement recorded"
                            : "Contribution still pending"
            }))
            .sort((left, right) => new Date(right.when || 0).getTime() - new Date(left.when || 0).getTime())
            .slice(0, 6),
        [recentLedgerRows]
    );

    const operationalFlow = [
        {
            title: "Define contribution policy",
            detail: "Set the per-member contribution amount, family eligibility, and collection deadline."
        },
        {
            title: "Prepare member registry",
            detail: "Keep departments and member records clean so eligibility preview stays reliable."
        },
        {
            title: "Launch the event",
            detail: "Preview eligible members, confirm the projected ledger total, and open collection."
        },
        {
            title: "Monitor and close",
            detail: "Track posted payments, follow up on open rows, waive approved exceptions, and close the event."
        }
    ];

    const showInitialSkeleton = loading && !summary && !events.length && !recentLedgerRows.length;

    if (showInitialSkeleton) {
        return <DataPageSkeleton statCards={4} tableColumns={6} tableRows={6} detailPanels={2} />;
    }

    return (
        <Stack spacing={3}>
            <PageHero
                eyebrow="Operational command center"
                title="Operational Command Center"
                description="Run policies, active contribution events, collection follow-up, and reporting from one focused Fund Manager workspace."
                tone="surface"
                actions={
                    <>
                        <Button component={RouterLink} to="/events/create" variant="contained" color="secondary">
                            Launch event
                        </Button>
                        <Button component={RouterLink} to="/members" variant="outlined">
                            Manage members
                        </Button>
                        <Button component={RouterLink} to="/contributions" variant="outlined">
                            Open ledger
                        </Button>
                    </>
                }
            />

            {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}
            {loading ? <LinearProgress /> : null}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                    <StatCard icon={CelebrationRoundedIcon} label="Active events" value={String(summary?.active_events ?? "—")} helper="Open contribution drives currently running collection." />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                    <StatCard icon={PaidRoundedIcon} label="Total collected" value={formatCurrency(summary?.total_collected ?? 0)} helper="Confirmed value already posted into the contribution ledger." tone="success" />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                    <StatCard icon={HourglassTopRoundedIcon} label="Pending contributions" value={formatCurrency(summary?.pending_contributions ?? 0)} helper="Outstanding member obligations still waiting for collection or waiver." tone="warning" />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                    <StatCard icon={GroupRoundedIcon} label="Participation rate" value={`${Math.round((summary?.participation_rate ?? 0) * 100)}%`} helper="Cross-event payment participation across current contribution activity." />
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <MotionCard variant="outlined">
                        <Stack spacing={2} sx={{ p: 2.25 }}>
                            <Stack spacing={0.5}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <DonutLargeRoundedIcon color="primary" />
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                        Collection Progress
                                    </Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    Follow the closest-to-deadline contribution events and see which drives need operational follow-up.
                                </Typography>
                            </Stack>
                            {progressEvents.length ? (
                                <Stack spacing={1.5}>
                                    {progressEvents.map((event) => (
                                        <Paper
                                            key={event.event_id}
                                            variant="outlined"
                                            sx={{
                                                p: 1.75,
                                                borderRadius: 2.5,
                                                backgroundColor: alpha(brandColors.primary[100], theme.palette.mode === "dark" ? 0.08 : 0.44),
                                                borderColor: alpha(brandColors.primary[300], theme.palette.mode === "dark" ? 0.22 : 0.22)
                                            }}
                                        >
                                            <Stack spacing={1}>
                                                <Stack direction="row" justifyContent="space-between" spacing={1.5} alignItems="flex-start">
                                                    <Stack spacing={0.4}>
                                                        <Typography variant="body1" sx={{ fontWeight: 800 }}>
                                                            {event.title}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {getEventTypeLabel(event.event_type)} · deadline {formatDate(event.deadline)}
                                                        </Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={0.75} flexWrap="wrap" justifyContent="flex-end">
                                                        <Chip size="small" label={`${event.paid_members} paid`} variant="outlined" />
                                                        <Chip size="small" label={`${event.progress}% funded`} color={event.progress >= 100 ? "success" : event.progress >= 60 ? "primary" : "warning"} />
                                                    </Stack>
                                                </Stack>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={event.progress}
                                                    sx={{
                                                        height: 10,
                                                        borderRadius: 999,
                                                        backgroundColor: alpha(brandColors.primary[300], theme.palette.mode === "dark" ? 0.14 : 0.18),
                                                        "& .MuiLinearProgress-bar": {
                                                            borderRadius: 999
                                                        }
                                                    }}
                                                />
                                                <Grid container spacing={1.2}>
                                                    <Grid size={{ xs: 12, sm: 4 }}>
                                                        <Typography variant="overline" color="text.secondary">
                                                            Collected
                                                        </Typography>
                                                        <Typography sx={{ fontWeight: 700 }}>
                                                            {formatCurrency(event.collected_total)}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 4 }}>
                                                        <Typography variant="overline" color="text.secondary">
                                                            Remaining
                                                        </Typography>
                                                        <Typography sx={{ fontWeight: 700 }}>
                                                            {formatCurrency(Math.max(Number(event.base) - Number(event.collected_total || 0), 0))}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 4 }}>
                                                        <Typography variant="overline" color="text.secondary">
                                                            Collection base
                                                        </Typography>
                                                        <Typography sx={{ fontWeight: 700 }}>
                                                            {formatCurrency(event.base)}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No active collection progress is visible right now.
                                </Typography>
                            )}
                        </Stack>
                    </MotionCard>
                </Grid>
                <Grid size={{ xs: 12, lg: 5 }}>
                    <MotionCard variant="outlined" sx={{ height: "100%" }}>
                        <Stack spacing={1.5} sx={{ p: 2.25 }}>
                            <Stack spacing={0.5}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <TrendingUpRoundedIcon color="primary" />
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                        Recent Activity
                                    </Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    Latest payment postings and ledger changes across visible contribution rows.
                                </Typography>
                            </Stack>
                            {recentActivity.length ? recentActivity.map((activity) => (
                                <Paper
                                    key={activity.id}
                                    variant="outlined"
                                    sx={{
                                        p: 1.4,
                                        borderRadius: 2.25,
                                        bgcolor: alpha(brandColors.primary[100], theme.palette.mode === "dark" ? 0.08 : 0.36),
                                        borderColor: alpha(brandColors.primary[300], theme.palette.mode === "dark" ? 0.24 : 0.16)
                                    }}
                                >
                                    <Stack spacing={0.55}>
                                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                                {activity.title}
                                            </Typography>
                                            <Chip
                                                size="small"
                                                label={formatContributionStatusText(activity.status)}
                                                color={getContributionStatusColor(activity.status)}
                                                variant={activity.status === "pending" ? "outlined" : "filled"}
                                            />
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary">
                                            {activity.member}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {activity.message}
                                        </Typography>
                                        <Stack direction="row" justifyContent="space-between" spacing={1} flexWrap="wrap">
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                {formatCurrency(activity.amount)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(activity.when)}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            )) : (
                                <Typography variant="body2" color="text.secondary">
                                    No recent collection activity is visible yet.
                                </Typography>
                            )}
                        </Stack>
                    </MotionCard>
                </Grid>
            </Grid>

            <MotionCard variant="outlined">
                <Stack spacing={1.4} sx={{ p: 2.25 }}>
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.2}>
                        <Stack spacing={0.4}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <EventRoundedIcon color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                    Active Events Overview
                                </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                                See which live events are collecting, how far each one has progressed, and where follow-up is still needed.
                            </Typography>
                        </Stack>
                        <Button component={RouterLink} to="/events" variant="outlined" startIcon={<LaunchRoundedIcon />}>
                            Open events
                        </Button>
                    </Stack>
                    <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2.5 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Event</TableCell>
                                    <TableCell>Deadline</TableCell>
                                    <TableCell>Target</TableCell>
                                    <TableCell>Collected</TableCell>
                                    <TableCell>Pending</TableCell>
                                    <TableCell>Members paid</TableCell>
                                    <TableCell>Progress</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {overviewEvents.map((event) => {
                                    const collectionBase = Number(event.target_amount || event.expected_total || 0);
                                    const progress = collectionBase ? Math.min(Math.round((Number(event.collected_total || 0) / collectionBase) * 100), 100) : 0;

                                    return (
                                        <TableRow key={event.event_id} hover>
                                            <TableCell>
                                                <Stack spacing={0.3}>
                                                    <Typography sx={{ fontWeight: 700 }}>
                                                        {event.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {getEventTypeLabel(event.event_type)}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>{formatDate(event.deadline)}</TableCell>
                                            <TableCell>{formatCurrency(collectionBase)}</TableCell>
                                            <TableCell>{formatCurrency(event.collected_total)}</TableCell>
                                            <TableCell>{formatCurrency(event.pending_total)}</TableCell>
                                            <TableCell>{event.paid_members} / {event.paid_members + event.pending_members}</TableCell>
                                            <TableCell sx={{ minWidth: 160 }}>
                                                <Stack spacing={0.55}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={progress}
                                                        sx={{
                                                            height: 8,
                                                            borderRadius: 999,
                                                            backgroundColor: alpha(brandColors.primary[300], theme.palette.mode === "dark" ? 0.14 : 0.18),
                                                            "& .MuiLinearProgress-bar": {
                                                                borderRadius: 999
                                                            }
                                                        }}
                                                    />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {progress}% funded
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="small" label={formatEventStatusText(event.status)} color={getEventStatusColor(event.status)} />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button component={RouterLink} to={`/events/${event.event_id}`} variant="outlined" size="small">
                                                    Open
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {!overviewEvents.length ? (
                                    <TableRow>
                                        <TableCell colSpan={9}>
                                            <Typography sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
                                                No active events are visible right now.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : null}
                            </TableBody>
                        </Table>
                    </Paper>
                </Stack>
            </MotionCard>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <MotionCard variant="outlined" sx={{ height: "100%" }}>
                        <Stack spacing={1.6} sx={{ p: 2.25 }}>
                            <Stack spacing={0.4}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <ChecklistRoundedIcon color="primary" />
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                        Operational Flow
                                    </Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    Keep the contribution workflow predictable by moving through the same sequence every time.
                                </Typography>
                            </Stack>
                            <Grid container spacing={1.5}>
                                {operationalFlow.map((step, index) => (
                                    <Grid key={step.title} size={{ xs: 12, md: 6 }}>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                height: "100%",
                                                p: 1.6,
                                                borderRadius: 2.5,
                                                bgcolor: alpha(brandColors.primary[100], theme.palette.mode === "dark" ? 0.08 : 0.36),
                                                borderColor: alpha(brandColors.primary[300], theme.palette.mode === "dark" ? 0.2 : 0.18)
                                            }}
                                        >
                                            <Stack spacing={1}>
                                                <Box
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: 1.75,
                                                        display: "grid",
                                                        placeItems: "center",
                                                        fontWeight: 800,
                                                        color: brandColors.primary[900],
                                                        bgcolor: alpha(brandColors.primary[500], 0.12)
                                                    }}
                                                >
                                                    {index + 1}
                                                </Box>
                                                <Typography variant="body1" sx={{ fontWeight: 800 }}>
                                                    {step.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {step.detail}
                                                </Typography>
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Stack>
                    </MotionCard>
                </Grid>
                <Grid size={{ xs: 12, lg: 5 }}>
                    <MotionCard variant="outlined" sx={{ height: "100%" }}>
                        <Stack spacing={1.6} sx={{ p: 2.25 }}>
                            <Stack spacing={0.4}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <LaunchRoundedIcon color="primary" />
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                        Quick Actions
                                    </Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    Jump straight into the three operational places used most often during daily collection work.
                                </Typography>
                            </Stack>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 1.6,
                                    borderRadius: 2.5,
                                    bgcolor: alpha(brandColors.primary[100], theme.palette.mode === "dark" ? 0.08 : 0.36)
                                }}
                            >
                                <Stack spacing={1.1}>
                                    <Button component={RouterLink} to="/members" variant="outlined" startIcon={<GroupRoundedIcon />} fullWidth>
                                        Manage Members
                                    </Button>
                                    <Button component={RouterLink} to="/policies" variant="outlined" startIcon={<PolicyRoundedIcon />} fullWidth>
                                        Define Policies
                                    </Button>
                                    <Button component={RouterLink} to="/contributions" variant="contained" startIcon={<ReceiptLongRoundedIcon />} fullWidth>
                                        Open Ledger
                                    </Button>
                                </Stack>
                            </Paper>
                            <Grid container spacing={1.2}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Paper variant="outlined" sx={{ p: 1.35, borderRadius: 2 }}>
                                        <Typography variant="overline" color="text.secondary">
                                            Active events
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                            {String(summary?.active_events ?? 0)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Paper variant="outlined" sx={{ p: 1.35, borderRadius: 2 }}>
                                        <Typography variant="overline" color="text.secondary">
                                            Open balance
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                            {formatCurrency(summary?.pending_contributions ?? 0)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Paper variant="outlined" sx={{ p: 1.35, borderRadius: 2 }}>
                                        <Typography variant="overline" color="text.secondary">
                                            Paid momentum
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                            {`${Math.round((summary?.participation_rate ?? 0) * 100)}%`}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Stack>
                    </MotionCard>
                </Grid>
            </Grid>
        </Stack>
    );
}

function MemberDashboardView() {
    const [events, setEvents] = useState<ContributionEventSummary[]>([]);
    const [rows, setRows] = useState<ContributionLedgerRow[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get(endpoints.events, { params: { page_size: 100 } }),
            api.get(endpoints.contributions, { params: { page_size: 100 } })
        ])
            .then(([eventsResponse, contributionResponse]) => {
                setEvents(eventsResponse.data.data.items || []);
                setRows(contributionResponse.data.data.items || []);
            })
            .catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load your contribution summary.")))
            .finally(() => setLoading(false));
    }, []);

    const totals = useMemo(() => {
        const activeEvents = events.filter((event) => event.status === "active" || event.status === "collection").length;
        const currentYear = new Date().getFullYear();
        const pendingAmount = rows.reduce((sum, row) => sum + Math.max(Number(row.expected_amount || 0) - Number(row.amount_paid || 0), 0), 0);
        const totalPaidThisYear = rows.reduce((sum, row) => {
            if (!row.paid_at) {
                return sum;
            }

            const paidYear = new Date(row.paid_at).getFullYear();
            return paidYear === currentYear ? sum + Number(row.amount_paid || 0) : sum;
        }, 0);
        const participationRate = rows.length
            ? rows.filter((row) => row.status === "paid" || row.status === "partial" || row.status === "waived").length / rows.length
            : 0;

        return {
            activeEvents,
            pendingAmount,
            totalPaidThisYear,
            participationRate
        };
    }, [events, rows]);

    const pendingRows = rows.filter((row) => row.status === "pending" || row.status === "partial");
    const recentEvents = events.slice(0, 4);
    const recentPayments = rows.filter((row) => row.status === "paid" && row.paid_at).slice(0, 4);
    const showInitialSkeleton = loading && !events.length && !rows.length;

    if (showInitialSkeleton) {
        return <DataPageSkeleton statCards={4} tableColumns={4} tableRows={5} detailPanels={2} />;
    }

    return (
        <Stack spacing={3}>
            <PageHero
                eyebrow="Your contribution workspace"
                title="See what is active, what you owe, and what you have already contributed."
                description="Members use Fund-Me to follow active contribution events, review obligations, and keep personal contribution history visible."
                tone="surface"
                actions={
                    <Button component={RouterLink} to="/my-contributions" variant="contained" color="secondary">
                        Open my contributions
                    </Button>
                }
            />

            {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}
            {loading ? <LinearProgress /> : null}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                    <StatCard icon={HourglassTopRoundedIcon} label="Pending contributions" value={formatCurrency(totals.pendingAmount)} helper="Amount you still owe across active contribution obligations." tone="warning" />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                    <StatCard icon={PaidRoundedIcon} label="Total paid this year" value={formatCurrency(totals.totalPaidThisYear)} helper="Payments recorded in the current calendar year." tone="success" />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                    <StatCard icon={CelebrationRoundedIcon} label="Active events" value={String(totals.activeEvents)} helper="Support events currently open and visible to your member account." />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                    <StatCard icon={AssessmentRoundedIcon} label="Participation rate" value={`${Math.round(totals.participationRate * 100)}%`} helper="Your participation across the contribution events already assigned to you." />
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Paper sx={{ overflow: "hidden" }}>
                        <Stack spacing={0.5} sx={{ p: 2.25 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                My Pending Contributions
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                These are the contribution obligations that still need your payment action.
                            </Typography>
                        </Stack>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Event</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Deadline</TableCell>
                                    <TableCell align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pendingRows.slice(0, 5).map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell>
                                            <Stack spacing={0.35}>
                                                <Typography sx={{ fontWeight: 700 }}>
                                                    {row.events?.title || "Contribution event"}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {row.events?.event_type ? formatEventTypeText(row.events.event_type) : "Support event"}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{formatCurrency(Math.max(Number(row.expected_amount || 0) - Number(row.amount_paid || 0), 0))}</TableCell>
                                        <TableCell>{formatDate(row.events?.deadline || null)}</TableCell>
                                        <TableCell align="right">
                                            <Button component={RouterLink} to={`/events?pay=${row.event_id}`} variant="contained" size="small">
                                                Pay Contribution
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!pendingRows.length ? (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <Typography sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
                                                You have no pending contribution obligations right now.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : null}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <MotionCard variant="outlined" sx={{ height: "100%" }}>
                        <Stack spacing={1.25} sx={{ p: 2.25 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Contribution history summary
                            </Typography>
                            {recentPayments.length ? recentPayments.map((row) => (
                                <Stack key={row.id} spacing={0.35}>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        {row.events?.title || "Contribution event"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatCurrency(row.amount_paid)} paid on {formatDate(row.paid_at || null)}
                                    </Typography>
                                </Stack>
                            )) : (
                                <Typography variant="body2" color="text.secondary">
                                    No completed contributions yet in your visible history.
                                </Typography>
                            )}
                            <Button component={RouterLink} to="/my-contributions" variant="outlined">
                                View full history
                            </Button>
                        </Stack>
                    </MotionCard>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 6 }}>
                    <MotionCard variant="outlined">
                        <Stack spacing={1.2} sx={{ p: 2.25 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Recent events
                            </Typography>
                            {recentEvents.length ? recentEvents.map((event) => (
                                <Stack key={event.event_id} direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack spacing={0.3}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {event.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatEventTypeText(event.event_type)} · deadline {formatDate(event.deadline)}
                                        </Typography>
                                    </Stack>
                                    <Chip size="small" label={event.status} color={event.status === "active" || event.status === "collection" ? "success" : "default"} />
                                </Stack>
                            )) : (
                                <Typography variant="body2" color="text.secondary">
                                    No active events are visible right now.
                                </Typography>
                            )}
                            <Button component={RouterLink} to="/events" variant="outlined">
                                Open events
                            </Button>
                        </Stack>
                    </MotionCard>
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                    <MotionCard variant="outlined" sx={{ height: "100%" }}>
                        <Stack spacing={1.2} sx={{ p: 2.25 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Member guidance
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Use the Events page to see active support drives that apply to you and open the contribution workspace for any pending payment. My Contributions keeps only your posted payment history.
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Keep your phone number updated in Profile so contribution payment prompts reach the correct handset.
                            </Typography>
                        </Stack>
                    </MotionCard>
                </Grid>
            </Grid>
        </Stack>
    );
}

function formatEventTypeText(value: string) {
    return value.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatEventStatusText(value: ContributionEventSummary["status"]) {
    return value.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatContributionStatusText(value: ContributionLedgerRow["status"]) {
    return value.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function getEventStatusColor(status: ContributionEventSummary["status"]): "success" | "warning" | "default" {
    if (status === "active" || status === "collection") {
        return "success";
    }

    if (status === "draft") {
        return "warning";
    }

    return "default";
}

function getContributionStatusColor(status: ContributionLedgerRow["status"]): "success" | "warning" | "default" {
    if (status === "paid") {
        return "success";
    }

    if (status === "partial") {
        return "warning";
    }

    return "default";
}

export function DashboardPage() {
    const { user } = useAuth();

    if (hasRole(user, "admin")) {
        return <AdminDashboardView />;
    }

    if (hasRole(user, "fund_manager")) {
        return <FundManagerDashboardView />;
    }

    return <MemberDashboardView />;
}
