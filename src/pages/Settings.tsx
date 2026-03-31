import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import DomainAddRoundedIcon from "@mui/icons-material/DomainAddRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { Alert, Button, Grid, LinearProgress, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { DataPageSkeleton } from "../components/common/DataPageSkeleton";
import { PageHero } from "../components/common/PageHero";
import { StatCard } from "../components/common/StatCard";
import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import type { Department } from "../types/api";
import { formatDate } from "./page-format";

export function SettingsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [updatingDepartmentId, setUpdatingDepartmentId] = useState<string | null>(null);
    const [draft, setDraft] = useState({
        name: "",
        status: "active"
    });

    const loadDepartments = async () => {
        setLoading(true);

        try {
            const response = await api.get(endpoints.departments);
            setDepartments(response.data.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDepartments().catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load departments.")));
    }, []);

    if (loading && !departments.length) {
        return <DataPageSkeleton statCards={6} tableColumns={4} tableRows={5} detailPanels={1} />;
    }

    const activeDepartments = departments.filter((department) => department.status === "active").length;

    return (
        <Stack spacing={3}>
            <PageHero
                eyebrow="Platform controls"
                title="Keep governance, role ownership, and reporting discipline explicit."
                description="Fund-Me is designed for internal workplace use, so the settings area should stay governance-focused: staff access, departments, exports, and audit discipline."
                tone="surface"
            />

            {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}
            {loading ? <LinearProgress /> : null}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard icon={AdminPanelSettingsRoundedIcon} label="Role model" value="3 roles" helper="Admin, Fund Manager, and Member. Governance stays with Admin while Fund Manager runs daily operations." />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard icon={SecurityRoundedIcon} label="Security base" value="Supabase Auth" helper="Bearer-token auth with backend role checks and RLS-ready schema." tone="success" />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard icon={TuneRoundedIcon} label="Policy engine" value="Rule driven" helper="Eligibility rules determine who receives each contribution obligation." />
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard icon={ApartmentRoundedIcon} label="Departments" value={String(departments.length)} helper="Departments currently registered for member assignment and policy scope control." />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard icon={DomainAddRoundedIcon} label="Active departments" value={String(activeDepartments)} helper="Only active departments can be selected by Fund Managers in daily operations." tone="success" />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard icon={TuneRoundedIcon} label="Operational effect" value="Live" helper="Department changes feed the member registry and department-based policy scope immediately." />
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Paper sx={{ p: 2.5 }}>
                        <Stack spacing={1.5}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Add department
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Admin defines the official department list here. Fund Managers then use it when creating members and department-based contribution policies.
                            </Typography>
                            <TextField
                                label="Department name"
                                value={draft.name}
                                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                                placeholder="Finance"
                            />
                            <TextField
                                select
                                label="Status"
                                value={draft.status}
                                onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
                            >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </TextField>
                            <Button
                                variant="contained"
                                disabled={creating || draft.name.trim().length < 2}
                                onClick={async () => {
                                    try {
                                        setCreating(true);
                                        setErrorMessage("");
                                        await api.post(endpoints.departments, {
                                            name: draft.name.trim(),
                                            status: draft.status
                                        });
                                        setDraft({
                                            name: "",
                                            status: "active"
                                        });
                                        await loadDepartments();
                                    } catch (error) {
                                        setErrorMessage(getApiErrorMessage(error, "Unable to create department."));
                                    } finally {
                                        setCreating(false);
                                    }
                                }}
                            >
                                {creating ? "Saving..." : "Create department"}
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Paper sx={{ overflow: "hidden" }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Department</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {departments.map((department) => {
                                    const nextStatus = department.status === "active" ? "inactive" : "active";

                                    return (
                                        <TableRow key={department.id}>
                                            <TableCell sx={{ fontWeight: 700 }}>{department.name}</TableCell>
                                            <TableCell sx={{ textTransform: "capitalize" }}>{department.status}</TableCell>
                                            <TableCell>{formatDate(department.created_at)}</TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    disabled={updatingDepartmentId === department.id}
                                                    onClick={async () => {
                                                        try {
                                                            setUpdatingDepartmentId(department.id);
                                                            setErrorMessage("");
                                                            await api.patch(endpoints.departmentStatus(department.id), {
                                                                status: nextStatus
                                                            });
                                                            await loadDepartments();
                                                        } catch (error) {
                                                            setErrorMessage(getApiErrorMessage(error, "Unable to update department status."));
                                                        } finally {
                                                            setUpdatingDepartmentId(null);
                                                        }
                                                    }}
                                                >
                                                    {updatingDepartmentId === department.id ? "Saving..." : nextStatus === "active" ? "Activate" : "Deactivate"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {!departments.length ? (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <Typography sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                                                No departments added yet.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : null}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>
            </Grid>
        </Stack>
    );
}
