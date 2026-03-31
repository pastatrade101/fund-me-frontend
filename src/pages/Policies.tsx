import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PauseCircleOutlineRoundedIcon from "@mui/icons-material/PauseCircleOutlineRounded";
import PolicyRoundedIcon from "@mui/icons-material/PolicyRounded";
import { Alert, Button, Chip, LinearProgress, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DataPageSkeleton } from "../components/common/DataPageSkeleton";
import { PageHero } from "../components/common/PageHero";
import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import type { ContributionPolicy } from "../types/api";
import { getContributorLabel, getEventTypeLabel, getFamilyLabel } from "../utils/policy-config";
import { formatCurrency } from "./page-format";

export function PoliciesPage() {
    const navigate = useNavigate();
    const [policies, setPolicies] = useState<ContributionPolicy[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [deactivatingId, setDeactivatingId] = useState("");

    const loadPolicies = async () => {
        setLoading(true);

        try {
            const response = await api.get(endpoints.policies);
            setPolicies(response.data.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPolicies().catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load contribution policies.")));
    }, []);

    if (loading && !policies.length) {
        return <DataPageSkeleton statCards={0} tableColumns={8} tableRows={5} />;
    }

    return (
        <Stack spacing={3}>
            <PageHero
                eyebrow="Policy configuration"
                title="Configure contribution rules once and reuse them whenever support events are launched."
                description="Each policy defines how much each eligible member contributes, which family relationships qualify, and how long the collection window stays open. Event targets are set later when a specific support drive is launched."
                tone="surface"
                actions={
                    <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/policies/create")}>
                        Create Policy
                    </Button>
                }
            />

            {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}
            {loading ? <LinearProgress /> : null}

            <Paper sx={{ overflow: "hidden" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Policy Name</TableCell>
                            <TableCell>Event Type</TableCell>
                            <TableCell>Per-Member Amount</TableCell>
                            <TableCell>Eligible Members</TableCell>
                            <TableCell>Eligible Family</TableCell>
                            <TableCell>Deadline</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {policies.map((policy) => (
                            <TableRow key={policy.id} hover>
                                <TableCell>
                                    <Stack spacing={0.4}>
                                        <Typography sx={{ fontWeight: 700 }}>{policy.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Used in {policy.used_event_count || 0} event(s)
                                        </Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell>{getEventTypeLabel(policy.event_type)}</TableCell>
                                <TableCell>{formatCurrency(policy.amount)}</TableCell>
                                <TableCell>{getContributorLabel(policy)}</TableCell>
                                <TableCell>{policy.eligible_family.map((item) => getFamilyLabel(item)).join(", ")}</TableCell>
                                <TableCell>{policy.deadline_days} day(s)</TableCell>
                                <TableCell>
                                    <Chip
                                        label={policy.is_active ? "Active" : "Inactive"}
                                        color={policy.is_active ? "success" : "default"}
                                        size="small"
                                        variant={policy.is_active ? "filled" : "outlined"}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<EditRoundedIcon />}
                                            onClick={() => navigate(`/policies/${policy.id}/edit`)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="small"
                                            color="inherit"
                                            variant="outlined"
                                            startIcon={<PauseCircleOutlineRoundedIcon />}
                                            disabled={!policy.is_active || deactivatingId === policy.id}
                                            onClick={async () => {
                                                try {
                                                    setDeactivatingId(policy.id);
                                                    setErrorMessage("");
                                                    await api.post(endpoints.policyDeactivate(policy.id));
                                                    await loadPolicies();
                                                } catch (error) {
                                                    setErrorMessage(getApiErrorMessage(error, "Unable to deactivate policy."));
                                                } finally {
                                                    setDeactivatingId("");
                                                }
                                            }}
                                        >
                                            {deactivatingId === policy.id ? "Working..." : "Deactivate"}
                                        </Button>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!policies.length ? (
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <Stack spacing={1} alignItems="center" sx={{ py: 5 }}>
                                        <PolicyRoundedIcon color="disabled" />
                                        <Typography sx={{ fontWeight: 700 }}>No policies created yet.</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Start by creating a contribution policy for funeral, wedding, or medical emergency support.
                                        </Typography>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </Paper>
        </Stack>
    );
}
