import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import { Alert, Grid, LinearProgress, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { DataPageSkeleton } from "../components/common/DataPageSkeleton";
import { PageHero } from "../components/common/PageHero";
import { StatCard } from "../components/common/StatCard";
import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import type { AuditLogEntry, AuditLogSummary } from "../types/api";
import { formatDate } from "./page-format";

export function AuditLogsPage() {
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [summary, setSummary] = useState<AuditLogSummary | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get(endpoints.auditLogs, { params: { page_size: 50 } }),
            api.get(endpoints.auditLogSummary)
        ])
            .then(([auditLogResponse, summaryResponse]) => {
                setAuditLogs(auditLogResponse.data.data.items || []);
                setSummary(summaryResponse.data.data || null);
            })
            .catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load audit logs.")))
            .finally(() => setLoading(false));
    }, []);

    if (loading && !auditLogs.length && !summary) {
        return <DataPageSkeleton statCards={3} tableColumns={5} tableRows={6} />;
    }

    return (
        <Stack spacing={3}>
            <PageHero
                eyebrow="Audit and oversight"
                title="Review the operational trail behind every policy, event, contribution, and access change."
                description="Audit logs stay read-only for admin oversight so governance can inspect the system without entering operational workflows."
                tone="surface"
            />

            {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}
            {loading ? <LinearProgress /> : null}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard icon={HistoryRoundedIcon} label="Total log entries" value={String(summary?.total_logs ?? "—")} helper="All recorded audit entries captured by the backend." />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard icon={InsightsRoundedIcon} label="Last 7 days" value={String(summary?.last_7_days_logs ?? "—")} helper="Recent governance and operational actions recorded this week." tone="warning" />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard icon={VerifiedUserRoundedIcon} label="Active actors" value={String(summary?.active_actors_last_7_days ?? "—")} helper="Distinct users who performed audited actions in the last 7 days." tone="success" />
                </Grid>
            </Grid>

            <Paper sx={{ overflow: "hidden" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Action</TableCell>
                            <TableCell>Entity</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Entity ID</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {auditLogs.map((entry) => (
                            <TableRow key={entry.id}>
                                <TableCell>{formatDate(entry.timestamp)}</TableCell>
                                <TableCell>{entry.action}</TableCell>
                                <TableCell>{entry.entity}</TableCell>
                                <TableCell>{entry.user_id || "System"}</TableCell>
                                <TableCell>{entry.entity_id || "—"}</TableCell>
                            </TableRow>
                        ))}
                        {!auditLogs.length ? (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Typography sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                                        No audit logs recorded yet.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </Paper>
        </Stack>
    );
}
