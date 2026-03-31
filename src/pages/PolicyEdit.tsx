import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Alert, Button, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { DataPageSkeleton } from "../components/common/DataPageSkeleton";
import { PolicyEditor, type PolicyDraft } from "../components/policies/PolicyEditor";
import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import type { ContributionPolicy } from "../types/api";

export function PolicyEditPage() {
    const navigate = useNavigate();
    const { id = "" } = useParams();
    const [policy, setPolicy] = useState<ContributionPolicy | null>(null);
    const [draft, setDraft] = useState<PolicyDraft | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        api.get(endpoints.policy(id))
            .then((response) => {
                const nextPolicy = response.data.data as ContributionPolicy;
                setPolicy(nextPolicy);
                setDraft({
                    name: nextPolicy.name,
                    event_type: nextPolicy.event_type,
                    amount: Number(nextPolicy.amount || 0),
                    eligible_employment_types: nextPolicy.eligible_employment_types,
                    eligible_family: nextPolicy.eligible_family,
                    deadline_days: nextPolicy.deadline_days
                });
            })
            .catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load contribution policy.")))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading || !draft || !policy) {
        return <DataPageSkeleton statCards={0} tableColumns={6} tableRows={4} detailPanels={1} />;
    }

    return (
        <Stack spacing={3}>
            <Button startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: "flex-start" }} onClick={() => navigate("/policies")}>
                Back to policies
            </Button>
            {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}
            <PolicyEditor
                title={`Edit ${policy.name}`}
                description="Update the per-member contribution amount, eligibility, family scope, or deadline. Event type stays locked after the policy has been used."
                draft={draft}
                saving={saving}
                errorMessage=""
                submitLabel="Save Changes"
                onDraftChange={setDraft}
                onCancel={() => navigate("/policies")}
                eventTypeLocked={Boolean(policy.event_type_locked)}
                onSubmit={async () => {
                    try {
                        setSaving(true);
                        setErrorMessage("");
                        await api.patch(endpoints.policy(id), draft);
                        navigate("/policies");
                    } catch (error) {
                        setErrorMessage(getApiErrorMessage(error, "Unable to update contribution policy."));
                    } finally {
                        setSaving(false);
                    }
                }}
            />
        </Stack>
    );
}
