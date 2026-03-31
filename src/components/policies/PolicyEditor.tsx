import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import RuleFolderRoundedIcon from "@mui/icons-material/RuleFolderRounded";
import {
    Alert,
    Button,
    Card,
    CardContent,
    Checkbox,
    Divider,
    FormControlLabel,
    FormGroup,
    Grid,
    InputAdornment,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";

import type { ContributionPolicy } from "../../types/api";
import { familyMemberOptions, getContributorLabel, getEventTypeLabel, policyEventTypeOptions, contributorGroupOptions } from "../../utils/policy-config";
import { formatCurrency } from "../../pages/page-format";

export interface PolicyDraft {
    name: string;
    event_type: ContributionPolicy["event_type"];
    amount: number;
    eligible_employment_types: Array<"permanent" | "contract" | "intern">;
    eligible_family: Array<"member" | "spouse" | "parent" | "child">;
    deadline_days: number;
}

interface PolicyEditorProps {
    title: string;
    description: string;
    draft: PolicyDraft;
    saving: boolean;
    errorMessage?: string;
    submitLabel: string;
    onDraftChange: (nextValue: PolicyDraft) => void;
    onSubmit: () => Promise<void> | void;
    onCancel?: () => void;
    eventTypeLocked?: boolean;
}

export function PolicyEditor({
    title,
    description,
    draft,
    saving,
    errorMessage,
    submitLabel,
    onDraftChange,
    onSubmit,
    onCancel,
    eventTypeLocked = false
}: PolicyEditorProps) {
    const selectedContributorPreset = contributorGroupOptions.find((option) => {
        const left = [...option.eligibleEmploymentTypes].sort().join(",");
        const right = [...draft.eligible_employment_types].sort().join(",");
        return left === right;
    })?.value || "permanent_contract";

    return (
        <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 8 }}>
                <Paper sx={{ p: 2.5 }}>
                    <Stack spacing={2.5}>
                        <Stack spacing={0.5}>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                {title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {description}
                            </Typography>
                        </Stack>

                        {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}

                        <Card variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <RuleFolderRoundedIcon color="primary" />
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            Policy setup
                                        </Typography>
                                    </Stack>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 7 }}>
                                            <TextField
                                                label="Policy Name"
                                                fullWidth
                                                value={draft.name}
                                                onChange={(event) => onDraftChange({ ...draft, name: event.target.value })}
                                                helperText="Use a clear name such as Funeral Contribution or Wedding Contribution."
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 5 }}>
                                            <TextField
                                                select
                                                label="Event Type"
                                                fullWidth
                                                value={draft.event_type}
                                                onChange={(event) => onDraftChange({ ...draft, event_type: event.target.value as PolicyDraft["event_type"] })}
                                                helperText={eventTypeLocked ? "Event type is locked once this policy has been used in an event." : "Choose the support category this policy applies to."}
                                                disabled={eventTypeLocked}
                                            >
                                                {policyEventTypeOptions.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                type="number"
                                                label="Per-member contribution amount"
                                                fullWidth
                                                value={draft.amount}
                                                onChange={(event) => onDraftChange({ ...draft, amount: Number(event.target.value) || 0 })}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">TSH</InputAdornment>
                                                }}
                                                helperText="This is the fixed amount each eligible member will be asked to contribute when an event uses this policy. It is not the event target."
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                type="number"
                                                label="Contribution Deadline (days)"
                                                fullWidth
                                                value={draft.deadline_days}
                                                onChange={(event) => onDraftChange({ ...draft, deadline_days: Number(event.target.value) || 0 })}
                                                helperText="How many days contributors have to pay once the event is launched."
                                            />
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <InfoOutlinedIcon color="primary" />
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            Eligible contributors
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary">
                                        Choose who contributes when this policy is used. This controls the employment types included in the contribution ledger.
                                    </Typography>
                                    <FormGroup>
                                        {contributorGroupOptions.map((option) => (
                                            <FormControlLabel
                                                key={option.value}
                                                control={
                                                    <Checkbox
                                                        checked={selectedContributorPreset === option.value}
                                                        onChange={() => onDraftChange({
                                                            ...draft,
                                                            eligible_employment_types: [...option.eligibleEmploymentTypes]
                                                        })}
                                                    />
                                                }
                                                label={
                                                    <Stack spacing={0.25}>
                                                        <Typography sx={{ fontWeight: 700 }}>{option.label}</Typography>
                                                        <Typography variant="body2" color="text.secondary">{option.helper}</Typography>
                                                    </Stack>
                                                }
                                            />
                                        ))}
                                    </FormGroup>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        Eligible family members
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Select which family relationships are valid for events launched under this policy.
                                    </Typography>
                                    <FormGroup>
                                        {familyMemberOptions.map((option) => (
                                            <FormControlLabel
                                                key={option.value}
                                                control={
                                                    <Checkbox
                                                        checked={draft.eligible_family.includes(option.value)}
                                                        onChange={(event) => {
                                                            const nextFamily = event.target.checked
                                                                ? [...draft.eligible_family, option.value]
                                                                : draft.eligible_family.filter((value) => value !== option.value);

                                                            onDraftChange({
                                                                ...draft,
                                                                eligible_family: Array.from(new Set(nextFamily)) as PolicyDraft["eligible_family"]
                                                            });
                                                        }}
                                                    />
                                                }
                                                label={option.label}
                                            />
                                        ))}
                                    </FormGroup>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Stack direction="row" spacing={1.25} justifyContent="flex-end">
                            {onCancel ? <Button onClick={onCancel}>Cancel</Button> : null}
                            <Button
                                variant="contained"
                                disabled={
                                    saving ||
                                    draft.name.trim().length < 3 ||
                                    draft.amount <= 0 ||
                                    draft.deadline_days <= 0 ||
                                    !draft.eligible_employment_types.length ||
                                    !draft.eligible_family.length
                                }
                                onClick={onSubmit}
                            >
                                {saving ? "Saving..." : submitLabel}
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
                <Card variant="outlined" sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
                    <CardContent>
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <PreviewRoundedIcon color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Policy preview
                                </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                                Review the live summary before saving the rule. The policy amount below is the per-member charge, not the fundraiser goal.
                            </Typography>
                            <Divider />
                            <Stack spacing={1}>
                                <Typography variant="overline" color="text.secondary">
                                    {getEventTypeLabel(draft.event_type)}
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                    {draft.name.trim() || "Untitled contribution policy"}
                                </Typography>
                            </Stack>
                            <Stack spacing={1.25}>
                                <PreviewRow label="Each eligible member pays" value={formatCurrency(draft.amount)} />
                                <PreviewRow label="Eligible Contributors" value={getContributorLabel(draft as ContributionPolicy)} />
                                <PreviewRow label="Eligible Family" value={draft.eligible_family.map((value) => familyMemberOptions.find((option) => option.value === value)?.label || value).join(", ")} />
                                <PreviewRow label="Collection window" value={`${draft.deadline_days || 0} day(s)`} />
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
    return (
        <Stack spacing={0.25}>
            <Typography variant="overline" color="text.secondary">
                {label}
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>{value || "Not set"}</Typography>
        </Stack>
    );
}
