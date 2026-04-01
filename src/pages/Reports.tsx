import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import {
    Alert,
    Button,
    Chip,
    Grid,
    LinearProgress,
    MenuItem,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DataPageSkeleton } from "../components/common/DataPageSkeleton";
import { PageHero } from "../components/common/PageHero";
import { StatCard } from "../components/common/StatCard";
import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import { brandColors } from "../theme/colors";
import type {
    ContributionEventSummary,
    ContributionLedgerRow,
    Department,
    DepartmentParticipationRow,
    YearlyContributionSummaryRow
} from "../types/api";
import { getEventTypeLabel } from "../utils/policy-config";
import { formatCurrency, formatDate, formatDateTime } from "./page-format";

type ReportTab = "events" | "outstanding" | "members" | "departments" | "yearly";

type ReportRow = Record<string, string | number | null | undefined>;

const reportTabs: Array<{ value: ReportTab; label: string }> = [
    { value: "events", label: "Event Summary" },
    { value: "outstanding", label: "Outstanding" },
    { value: "members", label: "Member History" },
    { value: "departments", label: "Department Participation" },
    { value: "yearly", label: "Yearly Summary" }
];

const defaultFilters = {
    search: "",
    event_type: "",
    department: "",
    status: "",
    date_from: "",
    date_to: ""
};

function sanitizeFilenamePart(value: string) {
    return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

export function ReportsPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState<ReportTab>("events");
    const [loading, setLoading] = useState(true);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [eventSummary, setEventSummary] = useState<ContributionEventSummary[]>([]);
    const [memberHistory, setMemberHistory] = useState<ContributionLedgerRow[]>([]);
    const [outstandingRows, setOutstandingRows] = useState<ContributionLedgerRow[]>([]);
    const [departmentSummary, setDepartmentSummary] = useState<DepartmentParticipationRow[]>([]);
    const [yearlySummary, setYearlySummary] = useState<YearlyContributionSummaryRow[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [filters, setFilters] = useState(defaultFilters);

    useEffect(() => {
        let active = true;

        const params = Object.fromEntries(
            Object.entries(filters).filter(([, value]) => value)
        );

        setLoading(true);
        setErrorMessage("");

        Promise.all([
            api.get(endpoints.reports.eventSummary, { params }),
            api.get(endpoints.reports.memberHistory, { params }),
            api.get(endpoints.reports.outstanding, { params }),
            api.get(endpoints.reports.departmentParticipation, { params }),
            api.get(endpoints.reports.yearlySummary, { params }),
            api.get(endpoints.departments)
        ])
            .then(([eventResponse, memberResponse, outstandingResponse, departmentResponse, yearlyResponse, departmentsResponse]) => {
                if (!active) {
                    return;
                }

                setEventSummary(eventResponse.data.data || []);
                setMemberHistory(memberResponse.data.data || []);
                setOutstandingRows(outstandingResponse.data.data || []);
                setDepartmentSummary(departmentResponse.data.data || []);
                setYearlySummary(yearlyResponse.data.data || []);
                setDepartments(departmentsResponse.data.data || []);
            })
            .catch((error) => {
                if (!active) {
                    return;
                }

                setErrorMessage(getApiErrorMessage(error, "Unable to load reporting workspace."));
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [filters.date_from, filters.date_to, filters.department, filters.event_type, filters.search, filters.status, refreshKey]);

    const totalCollected = eventSummary.reduce((sum, row) => sum + Number(row.collected_total || 0), 0);
    const totalPending = eventSummary.reduce((sum, row) => sum + Number(row.pending_total || 0), 0);
    const totalTarget = eventSummary.reduce((sum, row) => sum + Number(row.target_amount || 0), 0);
    const totalProjected = eventSummary.reduce((sum, row) => sum + Number(row.expected_total || 0), 0);
    const paidMembers = eventSummary.reduce((sum, row) => sum + Number(row.paid_members || 0), 0);
    const totalTrackedMembers = eventSummary.reduce((sum, row) => sum + Number(row.paid_members || 0) + Number(row.pending_members || 0), 0);
    const participationRate = totalTrackedMembers ? Math.round((paidMembers / totalTrackedMembers) * 100) : 0;
    const targetCoverageBase = totalTarget || totalProjected;
    const targetCoverage = targetCoverageBase ? Math.min(Math.round((totalCollected / targetCoverageBase) * 100), 100) : 0;

    const activeFilters = useMemo(() => {
        return [
            filters.search ? `Search: ${filters.search}` : null,
            filters.event_type ? `Type: ${getEventTypeLabel(filters.event_type)}` : null,
            filters.department ? `Department: ${filters.department}` : null,
            filters.status ? `Status: ${filters.status}` : null,
            filters.date_from ? `From: ${formatDate(filters.date_from)}` : null,
            filters.date_to ? `To: ${formatDate(filters.date_to)}` : null
        ].filter(Boolean) as string[];
    }, [filters.date_from, filters.date_to, filters.department, filters.event_type, filters.search, filters.status]);

    const eventRows = useMemo<ReportRow[]>(() => eventSummary.map((row) => ({
        event_id: row.event_id,
        title: row.title,
        event_type: getEventTypeLabel(row.event_type),
        deadline: formatDate(row.deadline),
        target: row.target_amount ? formatCurrency(row.target_amount) : "Not set",
        projected: formatCurrency(row.expected_total),
        collected: formatCurrency(row.collected_total),
        pending: formatCurrency(row.pending_total),
        status: row.status,
        members: `${row.paid_members} paid · ${row.pending_members} pending`
    })), [eventSummary]);

    const outstandingTableRows = useMemo<ReportRow[]>(() => outstandingRows.map((row) => ({
        id: row.id,
        event_id: row.event_id,
        member: row.members?.full_name || "Member",
        department: row.members?.department || "Unassigned",
        event: row.events?.title || "Event",
        event_type: row.events?.event_type ? getEventTypeLabel(row.events.event_type) : "N/A",
        deadline: formatDate(row.events?.deadline || null),
        expected: formatCurrency(row.expected_amount),
        paid: formatCurrency(row.amount_paid),
        outstanding: formatCurrency(Math.max(Number(row.expected_amount || 0) - Number(row.amount_paid || 0), 0)),
        status: row.status
    })), [outstandingRows]);

    const memberHistoryRows = useMemo<ReportRow[]>(() => memberHistory.map((row) => ({
        id: row.id,
        event_id: row.event_id,
        member: row.members?.full_name || "Member",
        department: row.members?.department || "Unassigned",
        event: row.events?.title || "Event",
        event_type: row.events?.event_type ? getEventTypeLabel(row.events.event_type) : "N/A",
        expected: formatCurrency(row.expected_amount),
        paid: formatCurrency(row.amount_paid),
        status: row.status,
        payment_method: row.payment_method || "N/A",
        reference: row.payment_reference || "N/A",
        paid_at: formatDateTime(row.paid_at || null)
    })), [memberHistory]);

    const departmentRows = useMemo<ReportRow[]>(() => departmentSummary.map((row) => ({
        department: row.department,
        events_participated: row.events_participated,
        total_contributed: formatCurrency(row.total_contributed)
    })), [departmentSummary]);

    const yearlyRows = useMemo<ReportRow[]>(() => yearlySummary.map((row) => ({
        year: row.year,
        total_contributed: formatCurrency(row.total_contributed),
        payments_recorded: row.payments_recorded
    })), [yearlySummary]);

    const reportConfig = useMemo(() => {
        if (activeTab === "events") {
            return {
                title: "Event Summary",
                description: "Support target, projected obligation, collected amount, and unresolved exposure per event.",
                rowLabel: `${eventRows.length} event row(s)`,
                exportRows: eventRows,
                columns: [
                    { accessorKey: "title", header: "Event", size: 240 },
                    { accessorKey: "event_type", header: "Type", size: 140 },
                    { accessorKey: "deadline", header: "Deadline", size: 120 },
                    { accessorKey: "target", header: "Target", size: 130 },
                    { accessorKey: "projected", header: "Projected", size: 130 },
                    { accessorKey: "collected", header: "Collected", size: 130 },
                    { accessorKey: "pending", header: "Pending", size: 130 },
                    {
                        accessorKey: "status",
                        header: "Status",
                        size: 120,
                        Cell: ({ cell }) => (
                            <Chip
                                size="small"
                                label={String(cell.getValue())}
                                color={String(cell.getValue()) === "closed" ? "default" : String(cell.getValue()) === "active" || String(cell.getValue()) === "collection" ? "success" : "default"}
                            />
                        )
                    },
                    { accessorKey: "members", header: "Members", size: 160 },
                    {
                        id: "action",
                        header: "Action",
                        size: 120,
                        enableSorting: false,
                        enableColumnFilter: false,
                        Cell: ({ row }) => (
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<OpenInNewRoundedIcon />}
                                onClick={() => navigate(`/events/${row.original.event_id}`)}
                            >
                                Open
                            </Button>
                        )
                    }
                ] as MRT_ColumnDef<ReportRow>[]
            };
        }

        if (activeTab === "outstanding") {
            return {
                title: "Outstanding Contributions",
                description: "Open and partially paid obligations that still need follow-up.",
                rowLabel: `${outstandingTableRows.length} outstanding row(s)`,
                exportRows: outstandingTableRows,
                columns: [
                    { accessorKey: "member", header: "Member", size: 180 },
                    { accessorKey: "department", header: "Department", size: 140 },
                    { accessorKey: "event", header: "Event", size: 220 },
                    { accessorKey: "event_type", header: "Type", size: 140 },
                    { accessorKey: "deadline", header: "Deadline", size: 120 },
                    { accessorKey: "expected", header: "Expected", size: 120 },
                    { accessorKey: "paid", header: "Paid", size: 120 },
                    { accessorKey: "outstanding", header: "Outstanding", size: 130 },
                    {
                        accessorKey: "status",
                        header: "Status",
                        size: 120,
                        Cell: ({ cell }) => (
                            <Chip
                                size="small"
                                label={String(cell.getValue())}
                                color={String(cell.getValue()) === "partial" ? "warning" : "default"}
                                variant={String(cell.getValue()) === "pending" ? "outlined" : "filled"}
                            />
                        )
                    },
                    {
                        id: "action",
                        header: "Action",
                        size: 120,
                        enableSorting: false,
                        enableColumnFilter: false,
                        Cell: ({ row }) => (
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<OpenInNewRoundedIcon />}
                                onClick={() => navigate(`/events/${row.original.event_id}`)}
                            >
                                Open
                            </Button>
                        )
                    }
                ] as MRT_ColumnDef<ReportRow>[]
            };
        }

        if (activeTab === "members") {
            return {
                title: "Member Contribution History",
                description: "Ledger traceability across members, events, methods, and payment references.",
                rowLabel: `${memberHistoryRows.length} member ledger row(s)`,
                exportRows: memberHistoryRows,
                columns: [
                    { accessorKey: "member", header: "Member", size: 180 },
                    { accessorKey: "department", header: "Department", size: 140 },
                    { accessorKey: "event", header: "Event", size: 200 },
                    { accessorKey: "event_type", header: "Type", size: 140 },
                    { accessorKey: "expected", header: "Expected", size: 120 },
                    { accessorKey: "paid", header: "Paid", size: 120 },
                    {
                        accessorKey: "status",
                        header: "Status",
                        size: 110,
                        Cell: ({ cell }) => (
                            <Chip
                                size="small"
                                label={String(cell.getValue())}
                                color={String(cell.getValue()) === "paid" ? "success" : String(cell.getValue()) === "partial" ? "warning" : "default"}
                            />
                        )
                    },
                    { accessorKey: "payment_method", header: "Method", size: 130 },
                    { accessorKey: "reference", header: "Reference", size: 160 },
                    { accessorKey: "paid_at", header: "Paid at", size: 170 }
                ] as MRT_ColumnDef<ReportRow>[]
            };
        }

        if (activeTab === "departments") {
            return {
                title: "Department Participation",
                description: "Department-level engagement and contribution volume across visible events.",
                rowLabel: `${departmentRows.length} department row(s)`,
                exportRows: departmentRows,
                columns: [
                    { accessorKey: "department", header: "Department", size: 220 },
                    { accessorKey: "events_participated", header: "Events Participated", size: 180 },
                    { accessorKey: "total_contributed", header: "Total Contributed", size: 180 }
                ] as MRT_ColumnDef<ReportRow>[]
            };
        }

        return {
            title: "Yearly Summary",
            description: "Annual contribution volume and posting activity for governance review.",
            rowLabel: `${yearlyRows.length} yearly bucket(s)`,
            exportRows: yearlyRows,
            columns: [
                { accessorKey: "year", header: "Year", size: 140 },
                { accessorKey: "total_contributed", header: "Total Contributed", size: 200 },
                { accessorKey: "payments_recorded", header: "Payments Recorded", size: 180 }
            ] as MRT_ColumnDef<ReportRow>[]
        };
    }, [activeTab, departmentRows, eventRows, memberHistoryRows, navigate, outstandingTableRows, yearlyRows]);

    const handleExportCsv = () => {
        const csvConfig = mkConfig({
            filename: `fund-me-${sanitizeFilenamePart(activeTab)}-${new Date().toISOString().slice(0, 10)}`,
            useKeysAsHeaders: true
        });

        const csv = generateCsv(csvConfig)(reportConfig.exportRows);
        download(csvConfig)(csv);
    };

    const handleExportPdf = async () => {
        try {
            setPdfLoading(true);
            const params = {
                ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
                report: activeTab
            };

            const response = await api.get(endpoints.reports.exportPdf, {
                params,
                responseType: "blob"
            });

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            const header = response.headers["content-disposition"] as string | undefined;
            const filenameMatch = header?.match(/filename="([^"]+)"/);
            anchor.href = url;
            anchor.download = filenameMatch?.[1] || `fund-me-${activeTab}.pdf`;
            anchor.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Unable to export PDF report."));
        } finally {
            setPdfLoading(false);
        }
    };

    const table = useMaterialReactTable({
        columns: reportConfig.columns,
        data: reportConfig.exportRows,
        enableDensityToggle: false,
        enableFullScreenToggle: false,
        enableGlobalFilter: false,
        enableColumnFilters: false,
        enableHiding: false,
        enableColumnActions: false,
        enableRowSelection: false,
        enableRowNumbers: true,
        enableStickyHeader: true,
        initialState: {
            pagination: {
                pageIndex: 0,
                pageSize: 10
            }
        },
        state: {
            isLoading: loading,
            showProgressBars: loading,
            showAlertBanner: Boolean(errorMessage)
        },
        muiTableContainerProps: {
            sx: { maxHeight: 560 }
        },
        muiTablePaperProps: {
            variant: "outlined",
            sx: {
                borderRadius: 3,
                overflow: "hidden"
            }
        },
        muiTopToolbarProps: {
            sx: {
                px: 2,
                py: 1.5,
                background: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.12 : 0.08),
                borderBottom: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.28 : 0.2)}`
            }
        },
        positionToolbarAlertBanner: "bottom",
        renderTopToolbarCustomActions: () => (
            <Stack spacing={0.5}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {reportConfig.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {reportConfig.description}
                </Typography>
            </Stack>
        ),
        renderBottomToolbarCustomActions: () => (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                {reportConfig.rowLabel}
            </Typography>
        )
    });

    const showInitialSkeleton = (
        loading &&
        !eventSummary.length &&
        !memberHistory.length &&
        !outstandingRows.length &&
        !departmentSummary.length &&
        !yearlySummary.length
    );

    if (showInitialSkeleton) {
        return <DataPageSkeleton statCards={4} tableColumns={6} tableRows={6} detailPanels={1} />;
    }

    return (
        <Stack spacing={3}>
            <PageHero
                eyebrow="Audit-ready reporting"
                title="Review workplace contribution performance from one export-ready reporting layer."
                description="Filter by event type, department, payment status, and date range, then export the exact report the Fund Manager needs for finance or audit follow-up."
                tone="surface"
                actions={
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshRoundedIcon />}
                            onClick={() => setRefreshKey((current) => current + 1)}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadRoundedIcon />}
                            onClick={handleExportCsv}
                        >
                            Export CSV
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<DescriptionRoundedIcon />}
                            onClick={() => void handleExportPdf()}
                            disabled={pdfLoading}
                        >
                            {pdfLoading ? "Generating PDF..." : "Export PDF"}
                        </Button>
                    </Stack>
                }
            />

            {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}

            <Paper sx={{ p: 2.25 }}>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <FilterListRoundedIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            Report filters
                        </Typography>
                    </Stack>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4, xl: 3 }}>
                            <TextField
                                label="Search"
                                fullWidth
                                value={filters.search}
                                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                                helperText="Search event names, members, departments, or references."
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4, xl: 2 }}>
                            <TextField
                                select
                                label="Event type"
                                fullWidth
                                value={filters.event_type}
                                onChange={(event) => setFilters((current) => ({ ...current, event_type: event.target.value }))}
                            >
                                <MenuItem value="">All event types</MenuItem>
                                <MenuItem value="funeral">Funeral</MenuItem>
                                <MenuItem value="wedding">Wedding</MenuItem>
                                <MenuItem value="medical_emergency">Medical Emergency</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4, xl: 2 }}>
                            <TextField
                                select
                                label="Department"
                                fullWidth
                                value={filters.department}
                                onChange={(event) => setFilters((current) => ({ ...current, department: event.target.value }))}
                            >
                                <MenuItem value="">All departments</MenuItem>
                                {departments.map((department) => (
                                    <MenuItem key={department.id} value={department.name}>
                                        {department.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4, xl: 2 }}>
                            <TextField
                                select
                                label="Payment status"
                                fullWidth
                                value={filters.status}
                                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                            >
                                <MenuItem value="">All statuses</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="partial">Partial</MenuItem>
                                <MenuItem value="paid">Paid</MenuItem>
                                <MenuItem value="waived">Waived</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4, xl: 1.5 }}>
                            <TextField
                                label="Date from"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={filters.date_from}
                                onChange={(event) => setFilters((current) => ({ ...current, date_from: event.target.value }))}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4, xl: 1.5 }}>
                            <TextField
                                label="Date to"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={filters.date_to}
                                onChange={(event) => setFilters((current) => ({ ...current, date_to: event.target.value }))}
                            />
                        </Grid>
                    </Grid>
                    <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {activeFilters.length ? activeFilters.map((filter) => (
                                <Chip key={filter} size="small" label={filter} />
                            )) : (
                                <Typography variant="body2" color="text.secondary">
                                    No filters applied. All visible reporting rows are included in CSV and PDF exports.
                                </Typography>
                            )}
                        </Stack>
                        <Button
                            color="inherit"
                            onClick={() => setFilters(defaultFilters)}
                        >
                            Reset filters
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            <Grid container spacing={2} id="financial-reports" sx={{ scrollMarginTop: 96 }}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <StatCard icon={AssessmentRoundedIcon} label="Reported events" value={String(eventSummary.length)} helper="Events included in the current reporting dataset." />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <StatCard icon={TrendingUpRoundedIcon} label="Collected total" value={formatCurrency(totalCollected)} helper="Total contributions already posted into the ledger." tone="success" />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <StatCard icon={EventBusyRoundedIcon} label="Pending balance" value={formatCurrency(totalPending)} helper="Contribution balance still outstanding across visible events." tone="warning" />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <StatCard icon={GroupRoundedIcon} label="Participation rate" value={`${participationRate}%`} helper={`${paidMembers} paid member(s) across ${totalTrackedMembers} tracked obligation(s).`} />
                </Grid>
            </Grid>

            <Paper sx={{ p: 2.25 }}>
                <Stack spacing={1.25}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Collection coverage
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Measure how far current collections have moved against the active fundraising target or projected obligation base.
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={targetCoverage}
                        sx={{ height: 10, borderRadius: 999 }}
                    />
                    <Stack direction="row" justifyContent="space-between" flexWrap="wrap">
                        <Typography variant="body2" color="text.secondary">
                            Collected {formatCurrency(totalCollected)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Coverage base {formatCurrency(targetCoverageBase)}
                        </Typography>
                    </Stack>
                </Stack>
            </Paper>

            <Paper id="contribution-reports" sx={{ overflow: "hidden", scrollMarginTop: 96 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, value: ReportTab) => setActiveTab(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {reportTabs.map((tab) => (
                        <Tab key={tab.value} value={tab.value} label={tab.label} />
                    ))}
                </Tabs>
                {loading ? <LinearProgress /> : null}
                <MaterialReactTable table={table} />
            </Paper>
        </Stack>
    );
}
