import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    Grid,
    InputAdornment,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { AppDateField } from "../components/common/AppDateField";
import { DataPageSkeleton } from "../components/common/DataPageSkeleton";
import { PageHero } from "../components/common/PageHero";
import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import type { ContributionEventDetail, Member } from "../types/api";
import { buildBeneficiaryOptions, fetchActiveBeneficiaryMembers, findBeneficiaryOptionByName } from "../utils/event-beneficiary";
import { familyMemberOptions, getContributorLabel, getEventTypeLabel, getFamilyLabel } from "../utils/policy-config";
import { formatCurrency, formatDate } from "./page-format";

function toDeadlineIso(value: string) {
    return new Date(`${value}T23:59:00`).toISOString();
}

export function EventEditPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id = "" } = useParams();
    const [detail, setDetail] = useState<ContributionEventDetail | null>(null);
    const [beneficiaryMembers, setBeneficiaryMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingBeneficiaryMembers, setLoadingBeneficiaryMembers] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [draft, setDraft] = useState({
        title: "",
        beneficiary_member_id: "",
        beneficiary_name: "",
        relationship_to_member: "member" as "member" | "spouse" | "parent" | "child",
        description: "",
        target_amount: 0,
        deadline: ""
    });

    useEffect(() => {
        api.get(endpoints.eventDetail(id))
            .then((response) => {
                const nextDetail = response.data.data as ContributionEventDetail;
                setDetail(nextDetail);
                setDraft({
                    title: nextDetail.event.title || "",
                    beneficiary_member_id: "",
                    beneficiary_name: nextDetail.event.beneficiary_name || "",
                    relationship_to_member: nextDetail.event.relationship_to_member,
                    description: nextDetail.event.description || "",
                    target_amount: Number(nextDetail.event.target_amount || 0),
                    deadline: nextDetail.event.deadline ? String(nextDetail.event.deadline).slice(0, 10) : ""
                });
            })
            .catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load event details for editing.")))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        fetchActiveBeneficiaryMembers()
            .then((members) => setBeneficiaryMembers(members))
            .catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load members for beneficiary selection.")))
            .finally(() => setLoadingBeneficiaryMembers(false));
    }, []);

    const beneficiaryOptions = useMemo(() => buildBeneficiaryOptions(beneficiaryMembers, user), [beneficiaryMembers, user]);
    const selectedBeneficiary = beneficiaryOptions.find((option) => option.id === draft.beneficiary_member_id) || null;

    useEffect(() => {
        if (!detail || draft.relationship_to_member !== "member" || draft.beneficiary_member_id) {
            return;
        }

        const matchedBeneficiary = findBeneficiaryOptionByName(beneficiaryOptions, draft.beneficiary_name);

        if (!matchedBeneficiary) {
            return;
        }

        setDraft((current) => ({
            ...current,
            beneficiary_member_id: matchedBeneficiary.id,
            beneficiary_name: matchedBeneficiary.full_name
        }));
    }, [beneficiaryOptions, detail, draft.beneficiary_member_id, draft.beneficiary_name, draft.relationship_to_member]);

    useEffect(() => {
        if (draft.relationship_to_member !== "member" || !selectedBeneficiary) {
            return;
        }

        if (draft.beneficiary_name === selectedBeneficiary.full_name) {
            return;
        }

        setDraft((current) => ({
            ...current,
            beneficiary_name: selectedBeneficiary.full_name
        }));
    }, [draft.beneficiary_name, draft.relationship_to_member, selectedBeneficiary]);

    useEffect(() => {
        if (!errorMessage) {
            return;
        }

        setErrorMessage("");
    }, [draft, errorMessage]);

    const policySummary = useMemo(() => {
        if (!detail) {
            return [];
        }

        return [
            { label: "Policy", value: detail.event.contribution_policies.name },
            { label: "Event type", value: getEventTypeLabel(detail.event.event_type) },
            { label: "Per-member contribution", value: formatCurrency(detail.event.contribution_policies.amount) },
            { label: "Eligible contributors", value: getContributorLabel(detail.event.contribution_policies) },
            { label: "Eligible family", value: detail.event.contribution_policies.eligible_family.map((value) => getFamilyLabel(value)).join(", ") },
            { label: "Collection window", value: `${detail.event.contribution_policies.deadline_days} day(s)` }
        ];
    }, [detail]);

    if (loading) {
        return <DataPageSkeleton statCards={0} tableColumns={4} tableRows={5} detailPanels={2} />;
    }

    if (!detail) {
        return (
            <Stack spacing={2}>
                <Button startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: "flex-start" }} onClick={() => navigate("/events")}>
                    Back to events
                </Button>
                <Alert severity="warning">{errorMessage || "Event details could not be loaded."}</Alert>
            </Stack>
        );
    }

    const eventLocked = detail.event.status === "closed" || detail.event.status === "archived";

    return (
        <Stack spacing={3}>
            <Button startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: "flex-start" }} onClick={() => navigate(`/events/${id}`)}>
                Back to event dashboard
            </Button>

            <PageHero
                eyebrow="Edit contribution event"
                title={`Update ${detail.event.title}`}
                description="Adjust the operational event details without changing the underlying policy or eligibility rule that already generated the ledger."
                tone="surface"
                actions={
                    <Stack direction="row" spacing={1}>
                        <Chip icon={<LockRoundedIcon />} label="Policy locked" color="default" variant="outlined" />
                        <Chip label={detail.event.status.replace(/_/g, " ")} color={eventLocked ? "default" : "success"} variant={eventLocked ? "outlined" : "filled"} />
                    </Stack>
                }
            />

            {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}
            {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
            {eventLocked ? (
                <Alert severity="info">
                    This event is {detail.event.status.replace(/_/g, " ")}. Event details are locked and can no longer be edited.
                </Alert>
            ) : null}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper sx={{ p: 2.5 }}>
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <EditRoundedIcon color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                    Editable event details
                                </Typography>
                            </Stack>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Event title"
                                        fullWidth
                                        value={draft.title}
                                        disabled={eventLocked || saving}
                                        onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Autocomplete
                                        options={beneficiaryOptions}
                                        value={selectedBeneficiary}
                                        loading={loadingBeneficiaryMembers}
                                        disabled={eventLocked || saving}
                                        onChange={(_, value) => {
                                            setDraft((current) => ({
                                                ...current,
                                                beneficiary_member_id: value?.id || "",
                                                beneficiary_name: current.relationship_to_member === "member"
                                                    ? (value?.full_name || "")
                                                    : current.beneficiary_name
                                            }));
                                        }}
                                        getOptionLabel={(option) => option.full_name}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props}>
                                                <Stack spacing={0.2}>
                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                        {option.full_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {option.subtitle}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={draft.relationship_to_member === "member" ? "Beneficiary member" : "Related member"}
                                                helperText={
                                                    draft.relationship_to_member === "member"
                                                        ? "Select the member who is directly receiving the support. Your own account is included."
                                                        : "Select the member record first, then enter the spouse, parent, or child name below."
                                                }
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <>
                                                            <InputAdornment position="start">
                                                                <PersonSearchRoundedIcon fontSize="small" />
                                                            </InputAdornment>
                                                            {params.InputProps.startAdornment}
                                                        </>
                                                    )
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label={draft.relationship_to_member === "member" ? "Beneficiary name" : "Relative beneficiary name"}
                                        fullWidth
                                        value={draft.beneficiary_name}
                                        disabled={eventLocked || saving || draft.relationship_to_member === "member"}
                                        onChange={(event) => setDraft((current) => ({ ...current, beneficiary_name: event.target.value }))}
                                        helperText={
                                            draft.relationship_to_member === "member"
                                                ? "Loaded automatically from the selected member record."
                                                : "Enter the spouse, parent, or child receiving the support."
                                        }
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        select
                                        label="Relationship to member"
                                        fullWidth
                                        value={draft.relationship_to_member}
                                        disabled={eventLocked || saving}
                                        onChange={(event) => setDraft((current) => {
                                            const nextRelationship = event.target.value as typeof current.relationship_to_member;
                                            const currentSelectedBeneficiary = beneficiaryOptions.find((option) => option.id === current.beneficiary_member_id) || null;
                                            const nextBeneficiaryName = nextRelationship === "member"
                                                ? (currentSelectedBeneficiary?.full_name || "")
                                                : (currentSelectedBeneficiary && current.beneficiary_name === currentSelectedBeneficiary.full_name ? "" : current.beneficiary_name);

                                            return {
                                                ...current,
                                                relationship_to_member: nextRelationship,
                                                beneficiary_name: nextBeneficiaryName
                                            };
                                        })}
                                    >
                                        {familyMemberOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <AppDateField
                                        label="Deadline"
                                        value={draft.deadline}
                                        onChange={(value) => setDraft((current) => ({ ...current, deadline: value }))}
                                        helperText={`Current deadline ${formatDate(detail.event.deadline)}`}
                                        disabled={eventLocked || saving}
                                        disablePast
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        type="number"
                                        label="Support target amount"
                                        fullWidth
                                        disabled={eventLocked || saving}
                                        value={draft.target_amount || ""}
                                        onChange={(event) => setDraft((current) => ({ ...current, target_amount: Number(event.target.value) || 0 }))}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">TSH</InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        label="Description"
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        disabled={eventLocked || saving}
                                        value={draft.description}
                                        onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                                        helperText="Operational notes for the support event."
                                    />
                                </Grid>
                            </Grid>

                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button variant="outlined" disabled={saving} onClick={() => navigate(`/events/${id}`)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<SaveRoundedIcon />}
                                    disabled={eventLocked || saving || !draft.title.trim() || !draft.beneficiary_member_id || !draft.beneficiary_name.trim() || !draft.deadline || !draft.target_amount}
                                    onClick={async () => {
                                        try {
                                            setSaving(true);
                                            setErrorMessage("");
                                            setSuccessMessage("");
                                            await api.patch(endpoints.eventDetail(id), {
                                                title: draft.title.trim(),
                                                beneficiary_name: draft.beneficiary_name.trim(),
                                                relationship_to_member: draft.relationship_to_member,
                                                description: draft.description.trim(),
                                                target_amount: draft.target_amount,
                                                deadline: toDeadlineIso(draft.deadline)
                                            });
                                            setSuccessMessage("Contribution event updated successfully.");
                                            navigate(`/events/${id}`);
                                        } catch (error) {
                                            setErrorMessage(getApiErrorMessage(error, "Unable to update contribution event."));
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                >
                                    {saving ? "Saving..." : "Save event changes"}
                                </Button>
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, lg: 5 }}>
                    <Paper sx={{ p: 2.5 }}>
                        <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <LockRoundedIcon color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                    Locked policy context
                                </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                                Policy and eligibility are already bound to the generated ledger. Editing this event only updates the operational event record.
                            </Typography>
                            {policySummary.map((item) => (
                                <Stack key={item.label} spacing={0.35}>
                                    <Typography variant="overline" color="text.secondary">
                                        {item.label}
                                    </Typography>
                                    <Typography sx={{ fontWeight: 700 }}>
                                        {item.value}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Stack>
    );
}
