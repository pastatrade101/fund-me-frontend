import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import {
    Alert,
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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import type { ContributionPolicy, EventPreviewResponse } from "../types/api";
import { familyMemberOptions, getContributorLabel, getEventTypeLabel, getFamilyLabel } from "../utils/policy-config";
import { formatCurrency, formatDate } from "./page-format";

const wizardSteps = ["Select Policy", "Event Details", "Eligibility Preview", "Confirm & Launch"];

function toDeadlineIso(value: string) {
    return new Date(`${value}T23:59:00`).toISOString();
}

export function EventCreatePage() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [policies, setPolicies] = useState<ContributionPolicy[]>([]);
    const [preview, setPreview] = useState<EventPreviewResponse | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [loadingPolicies, setLoadingPolicies] = useState(true);
    const [previewing, setPreviewing] = useState(false);
    const [launching, setLaunching] = useState(false);
    const [draft, setDraft] = useState({
        policy_id: "",
        title: "",
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

    const selectedPolicy = policies.find((policy) => policy.id === draft.policy_id) || null;

    const fetchPreview = async () => {
        setPreviewing(true);
        setErrorMessage("");

        try {
            const response = await api.post(endpoints.eventPreview, {
                ...draft,
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
                                <TextField
                                    label="Beneficiary Name"
                                    fullWidth
                                    value={draft.beneficiary_name}
                                    onChange={(event) => setDraft((current) => ({ ...current, beneficiary_name: event.target.value }))}
                                    helperText="Example: John M"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    select
                                    label="Relationship to Member"
                                    fullWidth
                                    value={draft.relationship_to_member}
                                    onChange={(event) => setDraft((current) => ({ ...current, relationship_to_member: event.target.value as typeof current.relationship_to_member }))}
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
                                <TextField
                                    type="date"
                                    label="Event Deadline"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={draft.deadline}
                                    onChange={(event) => setDraft((current) => ({ ...current, deadline: event.target.value }))}
                                    helperText="Contributors will be expected to pay by this date."
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
                                    disabled={activeStep === 0 ? !draft.policy_id : !draft.title || !draft.beneficiary_name || !draft.deadline || draft.target_amount <= 0}
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
                                            const response = await api.post(endpoints.events, {
                                                ...draft,
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
