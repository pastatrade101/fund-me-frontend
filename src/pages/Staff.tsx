import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, LinearProgress, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { DataPageSkeleton } from "../components/common/DataPageSkeleton";
import { PageHero } from "../components/common/PageHero";
import { StatCard } from "../components/common/StatCard";
import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import type { StaffProfile, StaffSummary } from "../types/api";
import { formatDate } from "./page-format";

export function StaffPage() {
    const [staff, setStaff] = useState<StaffProfile[]>([]);
    const [summary, setSummary] = useState<StaffSummary | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [draft, setDraft] = useState({
        full_name: "",
        email: "",
        phone: "",
        role: "fund_manager",
        status: "active",
        temporary_password: ""
    });

    const loadStaff = async () => {
        setLoading(true);

        try {
            const [staffResponse, summaryResponse] = await Promise.all([
                api.get(endpoints.staff),
                api.get(endpoints.staffSummary)
            ]);

            setStaff(staffResponse.data.data.items || []);
            setSummary(summaryResponse.data.data || null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStaff().catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load staff accounts.")));
    }, []);

    if (loading && !staff.length && !summary) {
        return <DataPageSkeleton statCards={3} tableColumns={5} tableRows={5} />;
    }

    const resetDraft = () => {
        setDraft({
            full_name: "",
            email: "",
            phone: "",
            role: "fund_manager",
            status: "active",
            temporary_password: ""
        });
    };

    const closeCreateDialog = () => {
        if (creating) {
            return;
        }

        resetDraft();
        setCreateDialogOpen(false);
    };

    const handleCreateStaff = async () => {
        try {
            setCreating(true);
            setErrorMessage("");
            await api.post(endpoints.staff, draft);
            resetDraft();
            setCreateDialogOpen(false);
            await loadStaff();
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Unable to create fund manager account."));
        } finally {
            setCreating(false);
        }
    };

    return (
        <Stack spacing={3}>
            <PageHero
                eyebrow="Governance and access"
                title="Create Fund Manager accounts and keep operational access tightly controlled."
                description="Admin manages internal staff access here. Only Fund Manager accounts are provisioned from this workspace."
                tone="surface"
                actions={
                    <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateDialogOpen(true)}>
                        New fund manager
                    </Button>
                }
            />

            {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}
            {loading ? <LinearProgress /> : null}

            <Grid container spacing={2} id="fund-managers" sx={{ scrollMarginTop: 96 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard icon={AdminPanelSettingsRoundedIcon} label="Fund managers" value={String(summary?.fund_managers ?? "—")} helper="All Fund Manager accounts registered in Fund-Me." />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard icon={PersonAddAlt1RoundedIcon} label="Active staff" value={String(summary?.active_fund_managers ?? "—")} helper="Fund managers currently able to access the operational workspace." tone="success" />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard icon={MarkEmailReadRoundedIcon} label="Member base" value={String(summary?.total_members ?? "—")} helper="Registered members visible across the workplace contribution system." />
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ overflow: "hidden" }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Staff</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Created</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {staff.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Stack spacing={0.25}>
                                                <Typography sx={{ fontWeight: 700 }}>{item.full_name}</Typography>
                                                <Typography variant="body2" color="text.secondary">{item.email}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{item.phone}</TableCell>
                                        <TableCell sx={{ textTransform: "capitalize" }}>{item.role.replace("_", " ")}</TableCell>
                                        <TableCell sx={{ textTransform: "capitalize" }}>{item.status}</TableCell>
                                        <TableCell>{formatDate(item.created_at)}</TableCell>
                                    </TableRow>
                                ))}
                                {!staff.length ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Typography sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                                                No staff accounts created yet.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : null}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>
            </Grid>

            <Dialog
                open={createDialogOpen}
                onClose={closeCreateDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ pr: 7 }}>
                    Create fund manager
                    <IconButton
                        onClick={closeCreateDialog}
                        disabled={creating}
                        sx={{ position: "absolute", right: 12, top: 12 }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={1.75} sx={{ pt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                            Provision a new operational account. Only the <strong>Fund Manager</strong> role can be assigned here.
                        </Typography>
                        <TextField label="Full name" value={draft.full_name} onChange={(event) => setDraft((current) => ({ ...current, full_name: event.target.value }))} />
                        <TextField label="Email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} />
                        <TextField
                            label="Phone"
                            value={draft.phone}
                            onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
                            helperText="Use 0712345678 or +255712345678. The backend will normalize it."
                        />
                        <TextField select label="Role" value={draft.role} onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value }))}>
                            <MenuItem value="fund_manager">Fund Manager</MenuItem>
                        </TextField>
                        <TextField select label="Status" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </TextField>
                        <TextField
                            label="Temporary password"
                            type="password"
                            value={draft.temporary_password}
                            onChange={(event) => setDraft((current) => ({ ...current, temporary_password: event.target.value }))}
                            helperText="Share this one-time password securely with the staff member."
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={closeCreateDialog} disabled={creating}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={creating || !draft.full_name || !draft.email || !draft.phone || !draft.temporary_password}
                        onClick={handleCreateStaff}
                    >
                        {creating ? "Creating..." : "Create account"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
