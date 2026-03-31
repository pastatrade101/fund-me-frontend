import type { ContributionPolicy } from "../types/api";

export const policyEventTypeOptions = [
    { value: "funeral", label: "Funeral" },
    { value: "wedding", label: "Wedding" },
    { value: "medical_emergency", label: "Medical Emergency" }
] as const;

export const familyMemberOptions = [
    { value: "member", label: "Member" },
    { value: "spouse", label: "Spouse" },
    { value: "parent", label: "Parent" },
    { value: "child", label: "Child" }
] as const;

export const contributorGroupOptions = [
    {
        value: "all_staff",
        label: "All Staff",
        helper: "Permanent, contract, and intern staff all contribute.",
        eligibleEmploymentTypes: ["permanent", "contract", "intern"] as const
    },
    {
        value: "permanent_only",
        label: "Permanent Staff Only",
        helper: "Only permanent staff contribute.",
        eligibleEmploymentTypes: ["permanent"] as const
    },
    {
        value: "permanent_contract",
        label: "Permanent + Contract",
        helper: "Permanent and contract staff contribute. Interns are excluded.",
        eligibleEmploymentTypes: ["permanent", "contract"] as const
    }
] as const;

export function getEventTypeLabel(value?: string | null) {
    return policyEventTypeOptions.find((option) => option.value === value)?.label || value || "N/A";
}

export function getFamilyLabel(value?: string | null) {
    return familyMemberOptions.find((option) => option.value === value)?.label || value || "N/A";
}

export function getContributorPresetKey(policy: Pick<ContributionPolicy, "eligible_employment_types"> | { eligible_employment_types: string[] }) {
    const normalized = [...new Set(policy.eligible_employment_types)].sort().join(",");

    if (normalized === "contract,intern,permanent") {
        return "all_staff";
    }

    if (normalized === "permanent") {
        return "permanent_only";
    }

    return "permanent_contract";
}

export function getContributorLabel(policy: Pick<ContributionPolicy, "eligible_employment_types"> | { eligible_employment_types: string[] }) {
    const presetKey = getContributorPresetKey(policy);
    return contributorGroupOptions.find((option) => option.value === presetKey)?.label || "Custom";
}
