import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import {
    Alert,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { DataPageSkeleton } from "../components/common/DataPageSkeleton";
import { PageHero } from "../components/common/PageHero";
import { StatCard } from "../components/common/StatCard";
import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import type { ContributionEventDetail, ContributionLedgerRow, EventFinancialSummary } from "../types/api";
import { getContributorLabel, getEventTypeLabel, getFamilyLabel } from "../utils/policy-config";
import { formatCurrency, formatDate, formatDateTime } from "./page-format";

export function EventDetailPage() {
    const navigate = useNavigate();
    const { id = "" } = useParams();
    const [detail, setDetail] = useState<ContributionEventDetail | null>(null);
    const [financialSummary, setFinancialSummary] = useState<EventFinancialSummary | null>(null);
    const [rows, setRows] = useState<ContributionLedgerRow[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [waiveDialogOpen, setWaiveDialogOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<ContributionLedgerRow | null>(null);
    const [posting, setPosting] = useState(false);
    const [closingEvent, setClosingEvent] = useState(false);
    const [waiveReason, setWaiveReason] = useState("");

    const loadEvent = async () => {
        const [detailResponse, contributionResponse, financialSummaryResponse] = await Promise.all([
            api.get(endpoints.eventDetail(id)),
            api.get(endpoints.eventContributions(id)),
            api.get(endpoints.eventFinancialSummary(id))
        ]);

        setDetail(detailResponse.data.data);
        setRows(contributionResponse.data.data || []);
        setFinancialSummary(financialSummaryResponse.data.data || null);
    };

    useEffect(() => {
        loadEvent()
            .catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load event dashboard.")))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading || !detail) {
        return <DataPageSkeleton statCards={4} tableColumns={6} tableRows={6} detailPanels={2} />;
    }

    const totalContributions = Number(financialSummary?.total_contributions ?? detail.summary.collected_total ?? 0);
    const netEventBalance = Number(financialSummary?.net_event_balance ?? detail.summary.collected_total ?? 0);
    const totalPlatformFees = Number(financialSummary?.platform_fees ?? 0);
    const totalGatewayFees = Number(financialSummary?.gateway_fees ?? 0);

    const collectionOpen = detail.event.status === "active" || detail.event.status === "collection";

    return (
        <Stack spacing={3}>
            <Button startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: "flex-start" }} onClick={() => navigate("/events")}>
                Back to events
            </Button>

            <PageHero
                eyebrow="Event dashboard"
                title={detail.event.title}
                description={`Track collection progress for ${detail.event.beneficiary_name} · ${getFamilyLabel(detail.event.relationship_to_member)} · ${getEventTypeLabel(detail.event.event_type)}.`}
                tone="surface"
                actions={
                    <Stack direction="row" spacing={1}>
                        {collectionOpen ? (
                            <Button
                                variant="outlined"
                                startIcon={<EditRoundedIcon />}
                                onClick={() => navigate(`/events/${id}/edit`)}
                            >
                                Edit Event
                            </Button>
                        ) : null}
                        {collectionOpen ? (
                            <Button
                                variant="contained"
                                onClick={async () => {
                                    try {
                                        setClosingEvent(true);
                                        setErrorMessage("");
                                        await api.post(endpoints.eventClose(id));
                                        await loadEvent();
                                    } catch (error) {
                                        setErrorMessage(getApiErrorMessage(error, "Unable to close event."));
                                    } finally {
                                        setClosingEvent(false);
                                    }
                                }}
                            >
                                {closingEvent ? "Closing..." : "Close Event"}
                            </Button>
                        ) : undefined}
                    </Stack>
                }
            />

            {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <StatCard icon={CheckCircleOutlineRoundedIcon} label="Support Target" value={detail.event.target_amount ? formatCurrency(detail.event.target_amount) : "Not set"} helper="Fundraising goal set for this specific support event." />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <StatCard icon={PaymentsRoundedIcon} label="Projected Total" value={formatCurrency(detail.summary.expected_total)} helper="Total contribution obligation generated from the eligible member ledger." />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <StatCard icon={PaymentsRoundedIcon} label="Net Event Balance" value={formatCurrency(netEventBalance)} helper="Only the contribution amount credited into the event fund." tone="success" />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <StatCard icon={ReportProblemRoundedIcon} label="Platform Fees" value={formatCurrency(totalPlatformFees)} helper={`${financialSummary?.contributors_count ?? 0} contributors processed through the platform.`} tone="warning" />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <StatCard icon={ReportProblemRoundedIcon} label="Gateway Fees" value={formatCurrency(totalGatewayFees)} helper="Snippe mobile money costs added on top of member contributions." tone="warning" />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <StatCard icon={ReportProblemRoundedIcon} label="Pending Total" value={formatCurrency(detail.summary.pending_total)} helper={`${detail.summary.paid_members} of ${detail.summary.paid_members + detail.summary.pending_members} members have fully paid.`} tone="warning" />
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Stack spacing={2}>
                        <Paper sx={{ p: 2.25 }}>
                            <Stack spacing={1.25}>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                    Event Summary
                                </Typography>
                                <PreviewLine label="Policy Used" value={detail.event.contribution_policies.name} />
                                <PreviewLine label="Per-member contribution" value={formatCurrency(detail.event.contribution_policies.amount)} />
                                <PreviewLine label="Support target" value={detail.event.target_amount ? formatCurrency(detail.event.target_amount) : "Not set"} />
                                <PreviewLine label="Eligible Contributors" value={getContributorLabel(detail.event.contribution_policies)} />
                                <PreviewLine label="Eligible Family" value={detail.event.contribution_policies.eligible_family.map((value) => getFamilyLabel(value)).join(", ")} />
                                <PreviewLine label="Deadline" value={formatDateTime(detail.event.deadline)} />
                                <PreviewLine label="Status" value={detail.event.status} />
                            </Stack>
                        </Paper>

                        <Paper sx={{ p: 2.25 }}>
                            <Stack spacing={1.5}>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                    Event Finance Summary
                                </Typography>
                                <FinanceLine label="Total Contributions" value={formatCurrency(totalContributions)} />
                                <FinanceLine label="Platform Fees" value={formatCurrency(totalPlatformFees)} />
                                <FinanceLine label="Gateway Fees (Snippe)" value={formatCurrency(totalGatewayFees)} />
                                <Divider />
                                <FinanceLine label="Net Event Balance" value={formatCurrency(netEventBalance)} emphasize />
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper sx={{ overflow: "hidden" }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Member Name</TableCell>
                                    <TableCell>Department</TableCell>
                                    <TableCell>Expected Amount</TableCell>
                                    <TableCell>Amount Paid</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => {
                                    const rowLocked = !collectionOpen || row.status === "paid" || row.status === "waived";

                                    return (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.members?.full_name || "Member"}</TableCell>
                                            <TableCell>{row.members?.department || "Department"}</TableCell>
                                            <TableCell>{formatCurrency(row.expected_amount)}</TableCell>
                                            <TableCell>{formatCurrency(row.amount_paid)}</TableCell>
                                            <TableCell>
                                                <Chip size="small" label={row.status} color={row.status === "paid" ? "success" : row.status === "partial" ? "warning" : "default"} variant={row.status === "pending" ? "outlined" : "filled"} />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <Button
                                                        size="small"
                                                        color="inherit"
                                                        variant="outlined"
                                                        disabled={rowLocked}
                                                        onClick={() => {
                                                            setSelectedRow(row);
                                                            setWaiveReason("");
                                                            setWaiveDialogOpen(true);
                                                        }}
                                                    >
                                                        Mark Waived
                                                    </Button>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>
            </Grid>

            <Dialog open={waiveDialogOpen} onClose={() => !posting && setWaiveDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Mark Contribution Waived</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={1.5}>
                        <Typography variant="body2" color="text.secondary">
                            Provide a short reason for waiving this contribution record.
                        </Typography>
                        <TextField
                            label="Reason"
                            value={waiveReason}
                            onChange={(event) => setWaiveReason(event.target.value)}
                            multiline
                            rows={3}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWaiveDialogOpen(false)} disabled={posting}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="inherit"
                        disabled={posting || !selectedRow || waiveReason.trim().length < 5}
                        onClick={async () => {
                            if (!selectedRow) {
                                return;
                            }

                            try {
                                setPosting(true);
                                setErrorMessage("");
                                await api.post(endpoints.contributionWaive(selectedRow.id), {
                                    reason: waiveReason.trim()
                                });
                                setWaiveDialogOpen(false);
                                await loadEvent();
                            } catch (error) {
                                setErrorMessage(getApiErrorMessage(error, "Unable to waive contribution."));
                            } finally {
                                setPosting(false);
                            }
                        }}
                    >
                        {posting ? "Saving..." : "Mark Waived"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}

function PreviewLine({ label, value }: { label: string; value: string }) {
    return (
        <Stack spacing={0.35}>
            <Typography variant="overline" color="text.secondary">
                {label}
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
        </Stack>
    );
}

function FinanceLine({
    label,
    value,
    emphasize = false
}: {
    label: string;
    value: string;
    emphasize?: boolean;
}) {
    return (
        <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center">
            <Typography
                variant={emphasize ? "body1" : "body2"}
                color={emphasize ? "text.primary" : "text.secondary"}
                sx={{ fontWeight: emphasize ? 800 : 500 }}
            >
                {label}
            </Typography>
            <Typography
                variant={emphasize ? "h6" : "body1"}
                sx={{ fontWeight: emphasize ? 800 : 700, textAlign: "right" }}
            >
                {value}
            </Typography>
        </Stack>
    );
}
