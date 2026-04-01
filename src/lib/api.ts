import axios from "axios";

import { readStoredAccessToken } from "../auth/sessionStorage";

const runtimeApiUrl = typeof window !== "undefined"
    ? window.__APP_CONFIG__?.apiUrl
    : undefined;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || runtimeApiUrl || "/api"
});

function humanizeFieldName(value: string) {
    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (match) => match.toUpperCase());
}

function getValidationErrorMessage(details: unknown) {
    const issues = (details as { issues?: { formErrors?: string[]; fieldErrors?: Record<string, string[]> } } | null)?.issues;
    const formError = issues?.formErrors?.find(Boolean);

    if (formError) {
        return formError;
    }

    const fieldEntries = Object.entries(issues?.fieldErrors || {});

    for (const [fieldName, fieldErrors] of fieldEntries) {
        const firstFieldError = fieldErrors?.find(Boolean);

        if (firstFieldError) {
            return `${humanizeFieldName(fieldName)}: ${firstFieldError}`;
        }
    }

    return null;
}

api.interceptors.request.use((config) => {
    const token = readStoredAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong.") {
    if (axios.isAxiosError(error)) {
        const apiError = error.response?.data?.error;
        const validationMessage = apiError?.code === "VALIDATION_ERROR"
            ? getValidationErrorMessage(apiError.details)
            : null;

        return validationMessage || apiError?.message || error.message || fallback;
    }

    return fallback;
}

export { api };
