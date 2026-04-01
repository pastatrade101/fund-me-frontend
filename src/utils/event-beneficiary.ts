import { api } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import type { AuthUserProfile, Member } from "../types/api";

export type BeneficiaryOption = {
    id: string;
    full_name: string;
    subtitle: string;
    email?: string;
    source: "member" | "current_user";
};

function normalize(value: string | null | undefined) {
    return String(value || "").trim().toLowerCase();
}

function formatEmploymentType(value: Member["employment_type"]) {
    return value === "permanent" ? "Permanent" : value === "contract" ? "Contract" : "Intern";
}

function formatStaffRole(value: NonNullable<AuthUserProfile["staff"]>["role"]) {
    return value === "fund_manager" ? "Fund Manager" : "Admin";
}

export function buildBeneficiaryOptions(members: Member[], user: AuthUserProfile | null): BeneficiaryOption[] {
    const memberOptions: BeneficiaryOption[] = [...members]
        .sort((a, b) => a.full_name.localeCompare(b.full_name))
        .map((member) => ({
            id: member.id,
            full_name: member.full_name,
            subtitle: `${member.department} · ${formatEmploymentType(member.employment_type)}`,
            email: member.email,
            source: "member"
        }));

    const existingKeys = new Set(
        memberOptions.flatMap((option) => [
            normalize(option.id),
            normalize(option.email),
            normalize(option.full_name)
        ])
    );

    const currentMember = user?.member;
    const currentStaff = user?.staff;

    if (currentMember) {
        const duplicate = existingKeys.has(normalize(currentMember.id)) ||
            existingKeys.has(normalize(currentMember.email)) ||
            existingKeys.has(normalize(currentMember.full_name));

        if (!duplicate) {
            memberOptions.unshift({
                id: `self-member-${currentMember.id}`,
                full_name: currentMember.full_name,
                subtitle: `${currentMember.department} · Your account`,
                email: currentMember.email,
                source: "current_user"
            });
        }
    } else if (currentStaff) {
        const duplicate = existingKeys.has(normalize(currentStaff.id)) ||
            existingKeys.has(normalize(currentStaff.email)) ||
            existingKeys.has(normalize(currentStaff.full_name));

        if (!duplicate) {
            memberOptions.unshift({
                id: `self-staff-${currentStaff.id}`,
                full_name: currentStaff.full_name,
                subtitle: `${formatStaffRole(currentStaff.role)} · Your account`,
                email: currentStaff.email,
                source: "current_user"
            });
        }
    }

    return memberOptions;
}

export function findBeneficiaryOptionByName(options: BeneficiaryOption[], fullName: string) {
    const target = normalize(fullName);
    return options.find((option) => normalize(option.full_name) === target) || null;
}

function extractMemberItems(payload: unknown) {
    if (Array.isArray(payload)) {
        return payload as Member[];
    }

    if (payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown[] }).items)) {
        return (payload as { items: Member[] }).items;
    }

    return [];
}

export async function fetchActiveBeneficiaryMembers() {
    const pageSize = 100;
    const collectedMembers: Member[] = [];
    let page = 1;
    let total = Number.POSITIVE_INFINITY;

    while (collectedMembers.length < total) {
        const response = await api.get(endpoints.members, {
            params: {
                page,
                page_size: pageSize,
                status: "active"
            }
        });

        const payload = response.data?.data;
        const members = extractMemberItems(payload);
        const nextTotal = Number((payload as { pagination?: { total?: number } } | undefined)?.pagination?.total);

        collectedMembers.push(...members);

        if (!Number.isFinite(nextTotal)) {
            break;
        }

        total = nextTotal;

        if (!members.length || collectedMembers.length >= total) {
            break;
        }

        page += 1;
    }

    return collectedMembers;
}
