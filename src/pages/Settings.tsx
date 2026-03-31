import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import DomainAddRoundedIcon from "@mui/icons-material/DomainAddRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    LinearProgress,
    MenuItem,
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
import { useEffect, useMemo, useState } from "react";

import { DataPageSkeleton } from "../components/common/DataPageSkeleton";
import { PageHero } from "../components/common/PageHero";
import { StatCard } from "../components/common/StatCard";
import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import type { Department, PlatformFeeSettings } from "../types/api";
import { formatDate } from "./page-format";

const defaultFeeDraft = {
    platform_fee_percentage: "1.5",
    gateway_fee_percentage: "1.5",
    gateway_flat_fee: "1500",
    minimum_contribution_amount: "3000"
};

function toFeeDraft(settings: PlatformFeeSettings | null) {
    if (!settings) {
        return defaultFeeDraft;
    }

    return {
        platform_fee_percentage: String(settings.platform_fee_percentage),
        gateway_fee_percentage: String(settings.gateway_fee_percentage),
        gateway_flat_fee: String(settings.gateway_flat_fee),
        minimum_contribution_amount: String(settings.minimum_contribution_amount)
    };
}

export function SettingsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [platformFeeSettings, setPlatformFeeSettings] = useState<PlatformFeeSettings | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [savingPlatformFee, setSavingPlatformFee] = useState(false);
    const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
    const [platformFeeDialogOpen, setPlatformFeeDialogOpen] = useState(false);
    const [updatingDepartmentId, setUpdatingDepartmentId] = useState<string | null>(null);
    const [draft, setDraft] = useState({
        name: "",
        status: "active"
    });
    const [feeDraft, setFeeDraft] = useState(defaultFeeDraft);

    const loadDepartments = async () => {
        const response = await api.get(endpoints.departments);
        setDepartments(response.data.data || []);
    };

    const loadPlatformFeeSettings = async () => {
        const response = await api.get(endpoints.adminPlatformFee);
        const nextSettings = response.data.data || null;
        setPlatformFeeSettings(nextSettings);
        setFeeDraft(toFeeDraft(nextSettings));
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([
            loadDepartments(),
            loadPlatformFeeSettings()
        ])
            .catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load settings.")))
            .finally(() => setLoading(false));
    }, []);

    const activeDepartments = departments.filter((department) => department.status === "active").length;
    const platformFeePercentage = Number(feeDraft.platform_fee_percentage);
    const gatewayFeePercentage = Number(feeDraft.gateway_fee_percentage);
    const gatewayFlatFee = Number(feeDraft.gateway_flat_fee);
    const minimumContributionAmount = Number(feeDraft.minimum_contribution_amount);
    const feeDraftValid = feeDraft.platform_fee_percentage.trim() !== ""
        && feeDraft.gateway_fee_percentage.trim() !== ""
        && feeDraft.gateway_flat_fee.trim() !== ""
        && feeDraft.minimum_contribution_amount.trim() !== ""
        && Number.isFinite(platformFeePercentage)
        && Number.isFinite(gatewayFeePercentage)
        && Number.isFinite(gatewayFlatFee)
        && Number.isFinite(minimumContributionAmount)
        && platformFeePercentage >= 0
        && gatewayFeePercentage >= 0
        && gatewayFlatFee >= 0
        && minimumContributionAmount > 0;
    const liveFeeSummary = useMemo(() => {
        if (!platformFeeSettings) {
            return "No live platform fee configuration is available yet.";
        }

        if (!feeDraftValid) {
            return "Enter non-negative platform and gateway fee values plus a positive minimum contribution amount.";
        }

        return `Platform ${platformFeePercentage}% + gateway ${gatewayFeePercentage}% and ${gatewayFlatFee.toLocaleString()} flat, with a minimum contribution of ${minimumContributionAmount.toLocaleString()}.`;
    }, [
        feeDraftValid,
        gatewayFeePercentage,
        gatewayFlatFee,
        minimumContributionAmount,
        platformFeePercentage,
        platformFeeSettings
    ]);

    if (loading && !departments.length && !platformFeeSettings) {
        return <DataPageSkeleton statCards={6} tableColumns={4} tableRows={5} detailPanels={2} />;
    }

    return (
        <Stack spacing={3}>
            <PageHero
                eyebrow="Platform controls"
                title="Keep governance, fee policy, and department ownership explicit."
                description="Fund-Me governance now covers both the operational structure and the live platform fee policy applied to member mobile money payments."
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
                    <StatCard icon={PaidRoundedIcon} label="Live fee rate" value={platformFeeSettings ? `${platformFeeSettings.platform_fee_percentage}%` : "—"} helper="Current platform fee percentage applied on top of member contribution payments." />
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Stack spacing={2}>
                        <Paper sx={{ p: 2.5 }}>
                            <Stack spacing={1.5}>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                    Add department
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Admin defines the official department list here. Fund Managers then use it when creating members and department-based contribution policies.
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => setDepartmentDialogOpen(true)}
                                >
                                    Add department
                                </Button>
                            </Stack>
                        </Paper>

                        <Paper sx={{ p: 2.5 }}>
                            <Stack spacing={1.5}>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                    Payment fee configuration
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Configure the platform percentage, gateway costs, and minimum contribution allowed for mobile money payments. Only the contribution amount is credited into the event fund.
                                </Typography>
                                <Alert severity="info">
                                    {liveFeeSummary}
                                </Alert>
                                <Typography variant="caption" color="text.secondary">
                                    {platformFeeSettings
                                        ? `Last updated ${formatDate(platformFeeSettings.updated_at)}`
                                        : "No active platform fee has been saved yet."}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => setPlatformFeeDialogOpen(true)}
                                >
                                    Configure payment fees
                                </Button>
                            </Stack>
                        </Paper>
                    </Stack>
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

            <Dialog
                open={departmentDialogOpen}
                onClose={() => !creating && setDepartmentDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Add department</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={1.5} sx={{ pt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                            Create an official department entry for member assignment and policy scope controls.
                        </Typography>
                        <TextField
                            label="Department name"
                            value={draft.name}
                            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                            placeholder="Finance"
                            autoFocus
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
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDepartmentDialogOpen(false)} disabled={creating}>
                        Cancel
                    </Button>
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
                                setDepartmentDialogOpen(false);
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
                </DialogActions>
            </Dialog>

            <Dialog
                open={platformFeeDialogOpen}
                onClose={() => !savingPlatformFee && setPlatformFeeDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Payment fee configuration</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={1.5} sx={{ pt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                            Set the full mobile money pricing model charged on top of the contribution amount.
                        </Typography>
                        <TextField
                            label="Platform fee percentage"
                            type="number"
                            value={feeDraft.platform_fee_percentage}
                            onChange={(event) => setFeeDraft((current) => ({ ...current, platform_fee_percentage: event.target.value }))}
                            inputProps={{ min: 0, step: "0.1" }}
                            helperText="This is the platform fee charged on top of the contribution amount."
                            autoFocus
                        />
                        <TextField
                            label="Gateway fee percentage"
                            type="number"
                            value={feeDraft.gateway_fee_percentage}
                            onChange={(event) => setFeeDraft((current) => ({ ...current, gateway_fee_percentage: event.target.value }))}
                            inputProps={{ min: 0, step: "0.1" }}
                            helperText="Snippe percentage fee charged on top of the contribution amount."
                        />
                        <TextField
                            label="Gateway flat fee"
                            type="number"
                            value={feeDraft.gateway_flat_fee}
                            onChange={(event) => setFeeDraft((current) => ({ ...current, gateway_flat_fee: event.target.value }))}
                            inputProps={{ min: 0, step: "1" }}
                            helperText="Flat mobile money cost added to each payment request."
                        />
                        <TextField
                            label="Minimum contribution amount"
                            type="number"
                            value={feeDraft.minimum_contribution_amount}
                            onChange={(event) => setFeeDraft((current) => ({ ...current, minimum_contribution_amount: event.target.value }))}
                            inputProps={{ min: 1, step: "1" }}
                            helperText="Contributions below this amount are rejected to avoid unfair gateway costs."
                        />
                        <Alert severity="info">
                            {liveFeeSummary}
                        </Alert>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setPlatformFeeDialogOpen(false)} disabled={savingPlatformFee}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        disabled={savingPlatformFee || !feeDraftValid}
                        onClick={async () => {
                            try {
                                setSavingPlatformFee(true);
                                setErrorMessage("");
                                const response = await api.post(endpoints.adminPlatformFee, {
                                    platform_fee_percentage: platformFeePercentage,
                                    gateway_fee_percentage: gatewayFeePercentage,
                                    gateway_flat_fee: gatewayFlatFee,
                                    minimum_contribution_amount: minimumContributionAmount
                                });
                                const nextSettings = response.data.data || null;
                                setPlatformFeeSettings(nextSettings);
                                setFeeDraft(toFeeDraft(nextSettings));
                                setPlatformFeeDialogOpen(false);
                            } catch (error) {
                                setErrorMessage(getApiErrorMessage(error, "Unable to save platform fee settings."));
                            } finally {
                                setSavingPlatformFee(false);
                            }
                        }}
                    >
                        {savingPlatformFee ? "Saving..." : "Save payment fees"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
