import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Alert, Button, Stack } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { PolicyEditor, type PolicyDraft } from "../components/policies/PolicyEditor";
import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";

export function PolicyCreatePage() {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [draft, setDraft] = useState<PolicyDraft>({
        name: "",
        event_type: "funeral",
        amount: 20000,
        eligible_employment_types: ["permanent", "contract", "intern"],
        eligible_family: ["member", "spouse", "parent", "child"],
        deadline_days: 5
    });

    return (
        <Stack spacing={3}>
            <Button startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: "flex-start" }} onClick={() => navigate("/policies")}>
                Back to policies
            </Button>
            {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}
            <PolicyEditor
                title="Create contribution policy"
                description="Define how much each eligible member should contribute under this rule. The separate event target is captured later when a support event is launched."
                draft={draft}
                saving={saving}
                errorMessage=""
                submitLabel="Save Policy"
                onDraftChange={setDraft}
                onCancel={() => navigate("/policies")}
                onSubmit={async () => {
                    try {
                        setSaving(true);
                        setErrorMessage("");
                        await api.post(endpoints.policies, draft);
                        navigate("/policies");
                    } catch (error) {
                        setErrorMessage(getApiErrorMessage(error, "Unable to create contribution policy."));
                    } finally {
                        setSaving(false);
                    }
                }}
            />
        </Stack>
    );
}
