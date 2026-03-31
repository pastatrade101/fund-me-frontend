import type { AuthUserProfile } from "../types/api";

export type AppRole = "admin" | "fund_manager" | "member";

export function hasRole(user: AuthUserProfile | null, role: AppRole) {
    return !!user?.roles?.includes(role);
}

export function hasAnyRole(user: AuthUserProfile | null, roles: AppRole[]) {
    return roles.some((role) => hasRole(user, role));
}

export function getPrimaryRole(user: AuthUserProfile | null): AppRole {
    if (hasRole(user, "admin")) {
        return "admin";
    }

    if (hasRole(user, "fund_manager")) {
        return "fund_manager";
    }

    return "member";
}

export function formatRoleLabel(role: AppRole) {
    if (role === "fund_manager") {
        return "Fund Manager";
    }

    return role.charAt(0).toUpperCase() + role.slice(1);
}
