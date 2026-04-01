import axios from "axios";

import { readStoredAccessToken } from "../auth/sessionStorage";

const runtimeApiUrl = typeof window !== "undefined"
    ? window.__APP_CONFIG__?.apiUrl
    : undefined;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || runtimeApiUrl || "/api"
});

api.interceptors.request.use((config) => {
    const token = readStoredAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong.") {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.error?.message || error.message || fallback;
    }

    return fallback;
}

export { api };
