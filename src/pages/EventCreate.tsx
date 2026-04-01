import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    CardActionArea,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    Paper,
    Stack,
    Step,
    StepLabel,
    Stepper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    MenuItem,
    InputAdornment
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { AppDateField } from "../components/common/AppDateField";
import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import type { ContributionPolicy, EventPreviewResponse, Member } from "../types/api";
import { buildBeneficiaryOptions, fetchActiveBeneficiaryMembers } from "../utils/event-beneficiary";
import { familyMemberOptions, getContributorLabel, getEventTypeLabel, getFamilyLabel } from "../utils/policy-config";
import { formatCurrency, formatDate } from "./page-format";

const wizardSteps = ["Select Policy", "Event Details", "Eligibility Preview", "Confirm & Launch"];

function toDeadlineIso(value: string) {
    return new Date(`${value}T23:59:00`).toISOString();
}

export function EventCreatePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [policies, setPolicies] = useState<ContributionPolicy[]>([]);
    const [beneficiaryMembers, setBeneficiaryMembers] = useState<Member[]>([]);
    const [preview, setPreview] = useState<EventPreviewResponse | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [loadingPolicies, setLoadingPolicies] = useState(true);
    const [loadingBeneficiaryMembers, setLoadingBeneficiaryMembers] = useState(true);
    const [previewing, setPreviewing] = useState(false);
    const [launching, setLaunching] = useState(false);
    const [draft, setDraft] = useState({
        policy_id: "",
        title: "",
        beneficiary_member_id: "",
        beneficiary_name: "",
        relationship_to_member: "member" as "member" | "spouse" | "parent" | "child",
        description: "",
        target_amount: 0,
        deadline: ""
    });

    useEffect(() => {
        api.get(endpoints.policies, { params: { is_active: true } })
            .then((response) => setPolicies(response.data.data || []))
            .catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load contribution policies.")))
            .finally(() => setLoadingPolicies(false));
    }, []);

    useEffect(() => {
        fetchActiveBeneficiaryMembers()
            .then((members) => setBeneficiaryMembers(members))
            .catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load members for beneficiary selection.")))
            .finally(() => setLoadingBeneficiaryMembers(false));
    }, []);

    const selectedPolicy = policies.find((policy) => policy.id === draft.policy_id) || null;
    const beneficiaryOptions = useMemo(() => buildBeneficiaryOptions(beneficiaryMembers, user), [beneficiaryMembers, user]);
    const selectedBeneficiary = beneficiaryOptions.find((option) => option.id === draft.beneficiary_member_id) || null;
    const beneficiarySelectionRequired = Boolean(draft.beneficiary_member_id);
    const beneficiaryNameReady = Boolean(draft.beneficiary_name.trim());
    const canContinueDetails = Boolean(
        draft.title.trim() &&
        beneficiarySelectionRequired &&
        beneficiaryNameReady &&
        draft.deadline &&
        draft.target_amount > 0
    );

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
    }, [draft.relationship_to_member, draft.beneficiary_name, selectedBeneficiary]);

    useEffect(() => {
        if (!errorMessage) {
            return;
        }

        setErrorMessage("");
    }, [draft, errorMessage]);

    const fetchPreview = async () => {
        setPreviewing(true);
        setErrorMessage("");

        try {
            const { beneficiary_member_id, ...payload } = draft;
            const response = await api.post(endpoints.eventPreview, {
                ...payload,
                deadline: toDeadlineIso(draft.deadline)
            });

            setPreview(response.data.data);
            setActiveStep(2);
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Unable to preview the contribution event."));
        } finally {
            setPreviewing(false);
        }
    };

    return (
        <Stack spacing={3}>
            <Button startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: "flex-start" }} onClick={() => navigate("/events")}>
                Back to events
            </Button>

            <Paper sx={{ p: 2.5 }}>
                <Stack spacing={2.5}>
                    <Stack spacing={0.5}>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            Launch Contribution Event
                        </Typography>
                        <Typography color="text.secondary">
                            Work through the wizard to select a policy, capture event details, preview eligibility, and launch the contribution ledger.
                        </Typography>
                    </Stack>

                    <Stepper activeStep={activeStep} alternativeLabel>
                        {wizardSteps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}

                    {activeStep === 0 ? (
                        <Grid container spacing={1.25} alignItems="flex-start">
                            {loadingPolicies ? (
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ minHeight: 220, display: "grid", placeItems: "center" }}>
                                        <CircularProgress />
                                    </Box>
                                </Grid>
                            ) : null}
                            {policies.map((policy) => (
                                <Grid key={policy.id} size={{ xs: 12, md: 6 }}>
                                    <Card
                                        variant={draft.policy_id === policy.id ? "elevation" : "outlined"}
                                        sx={{
                                            borderColor: draft.policy_id === policy.id ? "primary.main" : undefined,
                                            borderRadius: 1.5,
                                            backgroundColor: draft.policy_id === policy.id ? "rgba(25, 118, 210, 0.03)" : "background.paper"
                                        }}
                                    >
                                        <CardActionArea
                                            onClick={() => setDraft((current) => ({ ...current, policy_id: policy.id }))}
                                            sx={{ px: 2, py: 1.75 }}
                                        >
                                            <Stack spacing={1.25} sx={{ width: "100%" }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
                                                    <Stack spacing={0.35}>
                                                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
                                                            {policy.name}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {getEventTypeLabel(policy.event_type)}
                                                        </Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={0.75} alignItems="center" flexShrink={0}>
                                                        {draft.policy_id === policy.id ? <Chip size="small" color="primary" label="Selected" /> : null}
                                                        <RuleRoundedIcon color={draft.policy_id === policy.id ? "primary" : "disabled"} />
                                                    </Stack>
                                                </Stack>

                                                <Grid container spacing={1}>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Box
                                                            sx={{
                                                                px: 1.25,
                                                                py: 1,
                                                                border: "1px solid",
                                                                borderColor: "divider",
                                                                borderRadius: 1.25
                                                            }}
                                                        >
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.35 }}>
                                                                Per-member contribution
                                                            </Typography>
                                                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                                {formatCurrency(policy.amount)}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Box
                                                            sx={{
                                                                px: 1.25,
                                                                py: 1,
                                                                border: "1px solid",
                                                                borderColor: "divider",
                                                                borderRadius: 1.25
                                                            }}
                                                        >
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.35 }}>
                                                                Eligible contributors
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                {getContributorLabel(policy)}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 7 }}>
                                                        <Box
                                                            sx={{
                                                                px: 1.25,
                                                                py: 1,
                                                                border: "1px solid",
                                                                borderColor: "divider",
                                                                borderRadius: 1.25
                                                            }}
                                                        >
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.35 }}>
                                                                Eligible family
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    display: "-webkit-box",
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: "vertical",
                                                                    overflow: "hidden"
                                                                }}
                                                            >
                                                                {policy.eligible_family.map((item) => getFamilyLabel(item)).join(", ")}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 5 }}>
                                                        <Box
                                                            sx={{
                                                                px: 1.25,
                                                                py: 1,
                                                                border: "1px solid",
                                                                borderColor: "divider",
                                                                borderRadius: 1.25
                                                            }}
                                                        >
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.35 }}>
                                                                Collection window
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                                {policy.deadline_days} day(s)
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>

                                                <Typography variant="caption" color="text.secondary">
                                                    Choose this policy to load its contribution rule into the event wizard.
                                                </Typography>
                                            </Stack>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : null}

                    {activeStep === 1 ? (
                        <Grid container spacing={2}>
                            {selectedPolicy ? (
                                <Grid size={{ xs: 12 }}>
                                    <Alert severity="info">
                                        This policy charges <strong>{formatCurrency(selectedPolicy.amount)}</strong> per eligible member. Set the separate support target below for this specific event.
                                    </Alert>
                                </Grid>
                            ) : null}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Event Title"
                                    fullWidth
                                    value={draft.title}
                                    onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                                    helperText="Example: Funeral Support – John's Father"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Autocomplete
                                    options={beneficiaryOptions}
                                    value={selectedBeneficiary}
                                    loading={loadingBeneficiaryMembers}
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
                                    disabled={draft.relationship_to_member === "member"}
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
                                    label="Relationship to Member"
                                    fullWidth
                                    value={draft.relationship_to_member}
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
                                <TextField
                                    type="number"
                                    label="Support target amount"
                                    fullWidth
                                    value={draft.target_amount || ""}
                                    onChange={(event) => setDraft((current) => ({ ...current, target_amount: Number(event.target.value) || 0 }))}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">TSH</InputAdornment>
                                    }}
                                    helperText="This is the fundraising goal for the event. It is separate from the per-member contribution amount."
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <AppDateField
                                    label="Event Deadline"
                                    value={draft.deadline}
                                    onChange={(value) => setDraft((current) => ({ ...current, deadline: value }))}
                                    helperText="Contributors will be expected to pay by this date."
                                    disablePast
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Description"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={draft.description}
                                    onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                                    helperText="Optional notes such as Support for funeral expenses."
                                />
                            </Grid>
                        </Grid>
                    ) : null}

                    {activeStep === 2 ? (
                        preview ? (
                            <Stack spacing={2}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <PreviewMetric label="Eligible Members" value={String(preview.preview.eligible_members)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <PreviewMetric label="Per-member amount" value={formatCurrency(preview.preview.contribution_amount)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <PreviewMetric label="Support target" value={formatCurrency(preview.preview.target_amount)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <PreviewMetric label="Projected ledger total" value={formatCurrency(preview.preview.expected_total)} />
                                    </Grid>
                                </Grid>
                                <Paper variant="outlined" sx={{ overflow: "hidden" }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Member Name</TableCell>
                                                <TableCell>Department</TableCell>
                                                <TableCell align="right">Contribution Amount</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {preview.members.map((member) => (
                                                <TableRow key={member.member_id}>
                                                    <TableCell>{member.full_name}</TableCell>
                                                    <TableCell>{member.department}</TableCell>
                                                    <TableCell align="right">{formatCurrency(member.contribution_amount)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Paper>
                            </Stack>
                        ) : null
                    ) : null}

                    {activeStep === 3 ? (
                        preview ? (
                            <Paper variant="outlined" sx={{ p: 2.5 }}>
                                <Stack spacing={1.25}>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                        Final launch summary
                                    </Typography>
                                    <PreviewLine label="Event Title" value={preview.event.title} />
                                    <PreviewLine label="Policy Used" value={preview.policy.name} />
                                    <PreviewLine label="Per-member contribution" value={formatCurrency(preview.preview.contribution_amount)} />
                                    <PreviewLine label="Support target" value={formatCurrency(preview.preview.target_amount)} />
                                    <PreviewLine label="Eligible Members" value={String(preview.preview.eligible_members)} />
                                    <PreviewLine label="Projected ledger total" value={formatCurrency(preview.preview.expected_total)} />
                                    <PreviewLine label="Deadline" value={formatDate(preview.event.deadline)} />
                                </Stack>
                            </Paper>
                        ) : null
                    ) : null}

                    <Divider />

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Button disabled={activeStep === 0} onClick={() => setActiveStep((current) => Math.max(current - 1, 0))}>
                            Back
                        </Button>
                        <Stack direction="row" spacing={1}>
                            {activeStep < 2 ? (
                                <Button
                                    variant="contained"
                                    disabled={activeStep === 0 ? !draft.policy_id : !canContinueDetails}
                                    onClick={() => {
                                        if (activeStep === 0) {
                                            setActiveStep(1);
                                            return;
                                        }

                                        void fetchPreview();
                                    }}
                                >
                                    {activeStep === 1 && previewing ? "Loading preview..." : "Continue"}
                                </Button>
                            ) : null}
                            {activeStep === 2 ? (
                                <Button
                                    variant="contained"
                                    startIcon={<PreviewRoundedIcon />}
                                    onClick={() => setActiveStep(3)}
                                >
                                    Confirm preview
                                </Button>
                            ) : null}
                            {activeStep === 3 ? (
                                <Button
                                    variant="contained"
                                    startIcon={<RocketLaunchRoundedIcon />}
                                    disabled={launching || !preview}
                                    onClick={async () => {
                                        try {
                                            setLaunching(true);
                                            setErrorMessage("");
                                            const { beneficiary_member_id, ...payload } = draft;
                                            const response = await api.post(endpoints.events, {
                                                ...payload,
                                                deadline: toDeadlineIso(draft.deadline)
                                            });

                                            navigate(`/events/${response.data.data.event.id}`);
                                        } catch (error) {
                                            setErrorMessage(getApiErrorMessage(error, "Unable to launch contribution event."));
                                        } finally {
                                            setLaunching(false);
                                        }
                                    }}
                                >
                                    {launching ? "Launching..." : "Launch Event"}
                                </Button>
                            ) : null}
                        </Stack>
                    </Stack>
                </Stack>
            </Paper>
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

function PreviewMetric({ label, value }: { label: string; value: string }) {
    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={0.5}>
                <Typography variant="overline" color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {value}
                </Typography>
            </Stack>
        </Paper>
    );
}
