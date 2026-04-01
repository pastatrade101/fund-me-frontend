import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Alert, Box, Button, Chip, Grid, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { DataPageSkeleton } from "../common/DataPageSkeleton";
import { PageHero } from "../common/PageHero";
import { StatCard } from "../common/StatCard";
import { GradientButton } from "../ui";
import { MotionCard } from "../../ui/motion";
import { api, getApiErrorMessage } from "../../lib/api";
import { endpoints } from "../../lib/endpoints";
import type {
    AdminGovernanceOverview,
    GovernanceAlert,
    GovernanceHealthItem,
    GovernanceHealthStatus,
    GovernanceOverallStatus,
    GovernanceTrendPoint
} from "../../types/api";
import { formatCurrency, formatDateTime } from "../../pages/page-format";

function formatStatusLabel(status: GovernanceOverallStatus) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatAlertTime(value: string) {
    const date = new Date(value);
    const isToday = new Date().toDateString() === date.toDateString();

    return new Intl.DateTimeFormat("en-TZ", isToday
        ? { hour: "2-digit", minute: "2-digit" }
        : { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatCompactDay(value: string) {
    return new Intl.DateTimeFormat("en-TZ", {
        month: "short",
        day: "numeric"
    }).format(new Date(`${value}T00:00:00.000Z`));
}

function getHealthTone(themeMode: "light" | "dark", status: GovernanceHealthStatus) {
    if (status === "critical") {
        return {
            text: "#DC2626",
            background: alpha("#DC2626", themeMode === "dark" ? 0.18 : 0.08),
            border: alpha("#DC2626", themeMode === "dark" ? 0.34 : 0.16)
        };
    }

    if (status === "warning") {
        return {
            text: "#D97706",
            background: alpha("#D97706", themeMode === "dark" ? 0.18 : 0.1),
            border: alpha("#D97706", themeMode === "dark" ? 0.34 : 0.18)
        };
    }

    return {
        text: "#059669",
        background: alpha("#059669", themeMode === "dark" ? 0.18 : 0.09),
        border: alpha("#059669", themeMode === "dark" ? 0.34 : 0.16)
    };
}

function getAlertTone(themeMode: "light" | "dark", severity: GovernanceAlert["severity"]) {
    if (severity === "critical") {
        return {
            text: "#DC2626",
            background: alpha("#DC2626", themeMode === "dark" ? 0.14 : 0.08),
            border: alpha("#DC2626", themeMode === "dark" ? 0.34 : 0.16)
        };
    }

    if (severity === "warning") {
        return {
            text: "#EA580C",
            background: alpha("#EA580C", themeMode === "dark" ? 0.15 : 0.08),
            border: alpha("#EA580C", themeMode === "dark" ? 0.34 : 0.16)
        };
    }

    return {
        text: "#2563EB",
        background: alpha("#2563EB", themeMode === "dark" ? 0.14 : 0.08),
        border: alpha("#2563EB", themeMode === "dark" ? 0.3 : 0.14)
    };
}

function parseLatencyValue(value: string) {
    const match = String(value).match(/(\d+(?:\.\d+)?)\s*ms/i);

    if (!match) {
        return null;
    }

    const latency = Number(match[1]);
    return Number.isFinite(latency) ? latency : null;
}

function getHealthBenchmark(item: GovernanceHealthItem) {
    if (item.key === "database") {
        return "Target under 180ms";
    }

    if (item.key === "payments") {
        return "Gateway connectivity";
    }

    if (item.key === "queue") {
        return "Worker processing mode";
    }

    if (item.key === "uptime") {
        return "Service runtime";
    }

    return "Availability signal";
}

function getHealthMeterValue(item: GovernanceHealthItem) {
    if (item.key !== "database") {
        return null;
    }

    const latency = parseLatencyValue(item.value);

    if (latency === null) {
        return null;
    }

    return Math.max(0, Math.min((latency / 400) * 100, 100));
}

function GovernanceTrendChart({ data }: { data: GovernanceTrendPoint[] }) {
    const theme = useTheme();
    const width = 920;
    const height = 280;
    const padding = { top: 20, right: 18, bottom: 36, left: 36 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(
        1,
        ...data.flatMap((point) => [point.total_contributions, point.total_payments, point.failed_payments])
    );
    const legend = [
        { key: "total_contributions", label: "Contributions", color: theme.palette.primary.main },
        { key: "total_payments", label: "Payments", color: theme.palette.success.main },
        { key: "failed_payments", label: "Failed", color: theme.palette.error.main }
    ] as const;

    const seriesPoints = legend.map((series) => {
        const points = data.map((point, index) => {
            const x = padding.left + ((innerWidth / Math.max(data.length - 1, 1)) * index);
            const y = padding.top + (innerHeight - ((point[series.key] / maxValue) * innerHeight));
            return `${x},${y}`;
        }).join(" ");

        return { ...series, points };
    });

    const tickValues = [maxValue, Math.round(maxValue / 2), 0];

    return (
        <Stack spacing={2}>
            <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
                {legend.map((series) => (
                    <Stack key={series.key} direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 18, height: 4, borderRadius: 999, bgcolor: series.color }} />
                        <Typography variant="body2" color="text.secondary">
                            {series.label}
                        </Typography>
                    </Stack>
                ))}
            </Stack>

            <Box
                sx={{
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.1)}`,
                    background: theme.palette.mode === "dark"
                        ? `linear-gradient(180deg, ${alpha("#FFFFFF", 0.03)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`
                        : `linear-gradient(180deg, ${alpha("#FFFFFF", 0.84)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
                    overflow: "hidden"
                }}
            >
                <Box component="svg" viewBox={`0 0 ${width} ${height}`} sx={{ width: "100%", height: "auto", display: "block" }}>
                    {tickValues.map((tickValue, index) => {
                        const y = padding.top + (innerHeight - ((tickValue / maxValue) * innerHeight));

                        return (
                            <g key={index}>
                                <line
                                    x1={padding.left}
                                    y1={y}
                                    x2={width - padding.right}
                                    y2={y}
                                    stroke={alpha(theme.palette.text.secondary, 0.18)}
                                    strokeDasharray="4 6"
                                />
                                <text
                                    x={padding.left - 12}
                                    y={y + 4}
                                    textAnchor="end"
                                    fontSize="11"
                                    fill={theme.palette.text.secondary}
                                >
                                    {tickValue}
                                </text>
                            </g>
                        );
                    })}

                    {seriesPoints.map((series) => (
                        <polyline
                            key={series.key}
                            fill="none"
                            stroke={series.color}
                            strokeWidth="3"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            points={series.points}
                        />
                    ))}

                    {[0, Math.floor((data.length - 1) / 2), data.length - 1].map((tickIndex) => {
                        const point = data[tickIndex];
                        const x = padding.left + ((innerWidth / Math.max(data.length - 1, 1)) * tickIndex);

                        return (
                            <text
                                key={point.date}
                                x={x}
                                y={height - 10}
                                textAnchor={tickIndex === 0 ? "start" : tickIndex === data.length - 1 ? "end" : "middle"}
                                fontSize="11"
                                fill={theme.palette.text.secondary}
                            >
                                {formatCompactDay(point.date)}
                            </text>
                        );
                    })}
                </Box>
            </Box>
        </Stack>
    );
}

function SystemHealthPanel({ items }: { items: GovernanceHealthItem[] }) {
    const theme = useTheme();

    return (
        <MotionCard variant="outlined" sx={{ height: "100%" }} id="system-health">
            <Stack spacing={2} sx={{ p: 2.25, scrollMarginTop: 96 }}>
                <Stack spacing={0.5}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        System Health
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Monitor core infrastructure signals without entering the operational workflow.
                    </Typography>
                </Stack>

                <Grid container spacing={1.5}>
                    {items.map((item) => {
                        const tone = getHealthTone(theme.palette.mode, item.status);
                        const meterValue = getHealthMeterValue(item);
                        const statusLabel = item.status === "healthy" ? "Healthy" : item.status === "warning" ? "Warning" : "Critical";

                        return (
                            <Grid key={item.key} size={{ xs: 12, md: 6, xl: 4 }}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        position: "relative",
                                        overflow: "hidden",
                                        height: "100%",
                                        p: 1.65,
                                        borderRadius: 3,
                                        borderColor: tone.border,
                                        bgcolor: theme.palette.mode === "dark"
                                            ? `linear-gradient(180deg, ${alpha("#FFFFFF", 0.02)} 0%, ${tone.background} 100%)`
                                            : `linear-gradient(180deg, ${alpha("#FFFFFF", 0.9)} 0%, ${tone.background} 100%)`,
                                        "&::before": {
                                            content: "\"\"",
                                            position: "absolute",
                                            inset: "0 0 auto 0",
                                            height: 4,
                                            background: `linear-gradient(90deg, ${tone.text} 0%, ${alpha(tone.text, 0.12)} 100%)`
                                        }
                                    }}
                                >
                                    <Stack spacing={1.35} sx={{ height: "100%", position: "relative", zIndex: 1 }}>
                                        <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
                                            <Typography
                                                variant="overline"
                                                sx={{
                                                    color: "text.secondary",
                                                    letterSpacing: 1.6,
                                                    fontWeight: 700
                                                }}
                                            >
                                                {item.label}
                                            </Typography>
                                            <Chip
                                                size="small"
                                                label={statusLabel}
                                                variant="outlined"
                                                sx={{
                                                    borderRadius: 999,
                                                    borderColor: alpha(tone.text, theme.palette.mode === "dark" ? 0.35 : 0.16),
                                                    color: tone.text,
                                                    bgcolor: alpha("#FFFFFF", theme.palette.mode === "dark" ? 0.04 : 0.55),
                                                    fontWeight: 700
                                                }}
                                            />
                                        </Stack>

                                        <Stack spacing={0.35}>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "text.secondary",
                                                    textTransform: "uppercase",
                                                    letterSpacing: 1.4
                                                }}
                                            >
                                                Observed now
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: { xs: "2.25rem", md: "2.5rem" },
                                                    lineHeight: 1,
                                                    fontWeight: 800,
                                                    letterSpacing: -1.4,
                                                    fontVariantNumeric: "tabular-nums"
                                                }}
                                            >
                                                {item.value}
                                            </Typography>
                                        </Stack>

                                        <Typography variant="body2" color="text.secondary" sx={{ flex: 1, minHeight: 56 }}>
                                            {item.detail}
                                        </Typography>

                                        <Stack spacing={0.7}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={meterValue ?? 100}
                                                sx={{
                                                    height: 7,
                                                    borderRadius: 999,
                                                    bgcolor: alpha(tone.text, theme.palette.mode === "dark" ? 0.14 : 0.08),
                                                    "& .MuiLinearProgress-bar": {
                                                        borderRadius: 999,
                                                        backgroundColor: tone.text
                                                    }
                                                }}
                                            />
                                            <Stack direction="row" justifyContent="space-between" spacing={1} useFlexGap flexWrap="wrap">
                                                <Typography variant="caption" color="text.secondary">
                                                    {getHealthBenchmark(item)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: tone.text, fontWeight: 700 }}>
                                                    {item.key === "database" && meterValue !== null ? "Critical above 400ms" : statusLabel}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            </Stack>
        </MotionCard>
    );
}

function SystemAlertsPanel({ alerts }: { alerts: GovernanceAlert[] }) {
    const theme = useTheme();

    return (
        <MotionCard variant="outlined" sx={{ height: "100%" }} id="system-alerts">
            <Stack spacing={1.8} sx={{ p: 2.25, scrollMarginTop: 96 }}>
                <Stack spacing={0.45}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        System Alerts
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Risk monitoring for payment, platform, and infrastructure anomalies.
                    </Typography>
                </Stack>

                <Stack spacing={1.2}>
                    {alerts.map((alert) => {
                        const tone = getAlertTone(theme.palette.mode, alert.severity);

                        return (
                            <Paper
                                key={alert.id}
                                variant="outlined"
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2.5,
                                    borderColor: tone.border,
                                    bgcolor: tone.background
                                }}
                            >
                                <Stack spacing={0.8}>
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Box
                                                sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: "50%",
                                                    bgcolor: tone.text,
                                                    boxShadow: `0 0 0 6px ${alpha(tone.text, theme.palette.mode === "dark" ? 0.12 : 0.08)}`
                                                }}
                                            />
                                            <Typography sx={{ fontWeight: 800, color: tone.text }}>
                                                {alert.title}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatAlertTime(alert.timestamp)}
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary">
                                        {alert.detail}
                                    </Typography>
                                </Stack>
                            </Paper>
                        );
                    })}
                </Stack>
            </Stack>
        </MotionCard>
    );
}

function ActivityFeedPanel({ activity }: { activity: AdminGovernanceOverview["activity_feed"] }) {
    const theme = useTheme();

    return (
        <MotionCard variant="outlined" id="platform-activity">
            <Stack spacing={2} sx={{ p: 2.25, scrollMarginTop: 96 }}>
                <Stack spacing={0.45}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Recent Platform Activity
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Chronological oversight of the most recent governance-relevant platform events.
                    </Typography>
                </Stack>

                <Stack spacing={1.3}>
                    {activity.length ? activity.map((item, index) => {
                        const tone = getAlertTone(theme.palette.mode, item.severity === "success" ? "info" : item.severity);

                        return (
                            <Stack key={item.id} direction="row" spacing={1.35} alignItems="flex-start">
                                <Stack alignItems="center" sx={{ pt: 0.4 }}>
                                    <Box
                                        sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: "50%",
                                            bgcolor: item.severity === "success" ? theme.palette.success.main : tone.text,
                                            boxShadow: `0 0 0 6px ${alpha(item.severity === "success" ? theme.palette.success.main : tone.text, theme.palette.mode === "dark" ? 0.12 : 0.08)}`
                                        }}
                                    />
                                    {index < activity.length - 1 ? (
                                        <Box
                                            sx={{
                                                width: 2,
                                                minHeight: 44,
                                                mt: 0.7,
                                                borderRadius: 999,
                                                bgcolor: alpha(theme.palette.text.secondary, 0.14)
                                            }}
                                        />
                                    ) : null}
                                </Stack>

                                <Stack spacing={0.35} sx={{ pb: 0.6 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 54 }}>
                                            {formatAlertTime(item.timestamp)}
                                        </Typography>
                                        <Typography sx={{ fontWeight: 800 }}>
                                            {item.title}
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.detail}
                                    </Typography>
                                </Stack>
                            </Stack>
                        );
                    }) : (
                        <Typography variant="body2" color="text.secondary">
                            No platform activity is available in the audit trail yet.
                        </Typography>
                    )}
                </Stack>
            </Stack>
        </MotionCard>
    );
}

export function AdminGovernanceDashboard() {
    const [overview, setOverview] = useState<AdminGovernanceOverview | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        let disposed = false;

        const load = async (initial: boolean) => {
            if (initial) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            try {
                const response = await api.get(endpoints.adminGovernance);

                if (!disposed) {
                    setOverview(response.data.data);
                    setErrorMessage("");
                }
            } catch (error) {
                if (!disposed) {
                    setErrorMessage(getApiErrorMessage(error, "Unable to load governance console."));
                }
            } finally {
                if (!disposed) {
                    if (initial) {
                        setLoading(false);
                    } else {
                        setRefreshing(false);
                    }
                }
            }
        };

        void load(true);
        const interval = window.setInterval(() => {
            void load(false);
        }, 60000);

        return () => {
            disposed = true;
            window.clearInterval(interval);
        };
    }, []);

    const statusChip = useMemo(() => {
        if (!overview) {
            return null;
        }

        if (overview.overall_status === "critical") {
            return { label: "Critical", color: "#DC2626" };
        }

        if (overview.overall_status === "degraded") {
            return { label: "Degraded", color: "#D97706" };
        }

        return { label: "Healthy", color: "#059669" };
    }, [overview]);

    if (loading && !overview) {
        return <DataPageSkeleton statCards={5} tableColumns={4} tableRows={6} detailPanels={4} />;
    }

    if (!overview) {
        return <Alert severity="warning">{errorMessage || "Unable to load governance console."}</Alert>;
    }

    return (
        <Stack spacing={3}>
            <PageHero
                eyebrow="Governance console"
                title="Enterprise-grade oversight for platform health, financial integrity, and audit control."
                description="Admin governs the platform. Fund Managers continue to own event launch, contribution collection, and payment operations."
                tone="surface"
                actions={
                    <>
                        <GradientButton component={RouterLink} to="/staff">
                            Manage staff
                        </GradientButton>
                        <Button component={RouterLink} to="/reports" variant="outlined">
                            Open reports
                        </Button>
                        <Button component={RouterLink} to="/audit-logs" variant="outlined">
                            Review audit trail
                        </Button>
                    </>
                }
            />

            <Alert severity="info">
                Admin guardrails are active. Event creation, contribution collection, and payment processing remain restricted to Fund Managers.
            </Alert>

            {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}
            {(loading || refreshing) ? <LinearProgress /> : null}

            <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Platform KPIs
                    </Typography>
                    {statusChip ? (
                        <Chip
                            size="small"
                            label={`System status: ${statusChip.label}`}
                            sx={{
                                borderRadius: 1.5,
                                bgcolor: alpha(statusChip.color, 0.08),
                                color: statusChip.color,
                                fontWeight: 700
                            }}
                        />
                    ) : null}
                </Stack>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6, xl: 2.4 }}>
                        <StatCard
                            icon={BadgeRoundedIcon}
                            label="Fund Managers"
                            value={String(overview.platform_kpis.fund_managers.value)}
                            helper="Operational staff accounts provisioned for the contribution platform."
                            trendLabel={overview.platform_kpis.fund_managers.trend.label}
                            trendDirection={overview.platform_kpis.fund_managers.trend.direction}
                            trendTone={overview.platform_kpis.fund_managers.trend.tone}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, xl: 2.4 }}>
                        <StatCard
                            icon={VerifiedUserRoundedIcon}
                            label="Active Staff"
                            value={String(overview.platform_kpis.active_staff.value)}
                            helper="Staff accounts currently enabled for governance or operations access."
                            tone="success"
                            trendLabel={overview.platform_kpis.active_staff.trend.label}
                            trendDirection={overview.platform_kpis.active_staff.trend.direction}
                            trendTone={overview.platform_kpis.active_staff.trend.tone}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, xl: 2.4 }}>
                        <StatCard
                            icon={GroupRoundedIcon}
                            label="Total Members"
                            value={String(overview.platform_kpis.total_members.value)}
                            helper="Registered members within the contribution ecosystem."
                            trendLabel={overview.platform_kpis.total_members.trend.label}
                            trendDirection={overview.platform_kpis.total_members.trend.direction}
                            trendTone={overview.platform_kpis.total_members.trend.tone}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, xl: 2.4 }}>
                        <StatCard
                            icon={HistoryRoundedIcon}
                            label="Audit Entries (7d)"
                            value={String(overview.platform_kpis.audit_entries_7d.value)}
                            helper="Governance and platform actions logged during the last seven days."
                            tone="warning"
                            trendLabel={overview.platform_kpis.audit_entries_7d.trend.label}
                            trendDirection={overview.platform_kpis.audit_entries_7d.trend.direction}
                            trendTone={overview.platform_kpis.audit_entries_7d.trend.tone}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, xl: 2.4 }}>
                        <StatCard
                            icon={ShieldRoundedIcon}
                            label="Active Actors (7d)"
                            value={String(overview.platform_kpis.active_actors_7d.value)}
                            helper="Distinct authenticated users captured in the recent governance trail."
                            trendLabel={overview.platform_kpis.active_actors_7d.trend.label}
                            trendDirection={overview.platform_kpis.active_actors_7d.trend.direction}
                            trendTone={overview.platform_kpis.active_actors_7d.trend.tone}
                        />
                    </Grid>
                </Grid>
            </Stack>

            <Box id="financial-integrity" sx={{ scrollMarginTop: 96 }}>
                <Stack spacing={1}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Financial Integrity
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6, xl: 2.4 }} id="total-contributions">
                            <StatCard
                                icon={AssessmentRoundedIcon}
                                label="Total Contributions"
                                value={formatCurrency(overview.financial_integrity.total_contributions.value)}
                                helper="All contribution value already posted into the platform ledger."
                                trendLabel={overview.financial_integrity.total_contributions.trend.label}
                                trendDirection={overview.financial_integrity.total_contributions.trend.direction}
                                trendTone={overview.financial_integrity.total_contributions.trend.tone}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6, xl: 2.4 }} id="pending-payments">
                            <StatCard
                                icon={HourglassTopRoundedIcon}
                                label="Pending Payments"
                                value={String(overview.financial_integrity.pending_payments.value)}
                                helper="Contribution payment sessions still awaiting completion or expiry."
                                tone="warning"
                                trendLabel={overview.financial_integrity.pending_payments.trend.label}
                                trendDirection={overview.financial_integrity.pending_payments.trend.direction}
                                trendTone={overview.financial_integrity.pending_payments.trend.tone}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6, xl: 2.4 }}>
                            <StatCard
                                icon={WarningAmberRoundedIcon}
                                label="Failed Payments"
                                value={String(overview.financial_integrity.failed_payments.value)}
                                helper="Failed or expired payment attempts tracked across the last thirty days."
                                tone="warning"
                                trendLabel={overview.financial_integrity.failed_payments.trend.label}
                                trendDirection={overview.financial_integrity.failed_payments.trend.direction}
                                trendTone={overview.financial_integrity.failed_payments.trend.tone}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6, xl: 2.4 }} id="refund-monitoring">
                            <StatCard
                                icon={ReceiptLongRoundedIcon}
                                label="Refund Requests"
                                value={String(overview.financial_integrity.refund_requests.value)}
                                helper="Refund activity currently recorded in governance and audit workflows."
                                trendLabel={overview.financial_integrity.refund_requests.trend.label}
                                trendDirection={overview.financial_integrity.refund_requests.trend.direction}
                                trendTone={overview.financial_integrity.refund_requests.trend.tone}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6, xl: 2.4 }}>
                            <StatCard
                                icon={PaidRoundedIcon}
                                label="Platform Revenue"
                                value={formatCurrency(overview.financial_integrity.platform_revenue.value)}
                                helper="Platform fees earned from contribution payments that have already settled."
                                tone="success"
                                trendLabel={overview.financial_integrity.platform_revenue.trend.label}
                                trendDirection={overview.financial_integrity.platform_revenue.trend.direction}
                                trendTone={overview.financial_integrity.platform_revenue.trend.tone}
                            />
                        </Grid>
                    </Grid>
                </Stack>
            </Box>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <SystemHealthPanel items={overview.system_health} />
                </Grid>
                <Grid size={{ xs: 12, lg: 5 }}>
                    <SystemAlertsPanel alerts={overview.system_alerts} />
                </Grid>
            </Grid>

            <MotionCard variant="outlined" id="contribution-trend">
                <Stack spacing={2} sx={{ p: 2.25, scrollMarginTop: 96 }}>
                    <Stack spacing={0.45}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            Contribution Volume (Last 30 Days)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Track contribution growth, payment reliability, and failed transaction patterns across the platform.
                        </Typography>
                    </Stack>
                    <GovernanceTrendChart data={overview.contribution_trend} />
                </Stack>
            </MotionCard>

            <ActivityFeedPanel activity={overview.activity_feed} />

            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    borderRadius: 3,
                    borderColor: alpha("#2563EB", 0.12),
                    bgcolor: alpha("#2563EB", 0.04)
                }}
            >
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                            Last governance refresh
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {formatDateTime(overview.generated_at)}
                        </Typography>
                    </Box>
                    <Button component={RouterLink} to="/reports" variant="outlined">
                        Open financial reports
                    </Button>
                </Stack>
            </Paper>
        </Stack>
    );
}
