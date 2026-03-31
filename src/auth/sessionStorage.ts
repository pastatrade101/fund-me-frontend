import type { AuthSession } from "../types/api";

export const ACCESS_TOKEN_KEY = "fund-me:access-token";
export const REFRESH_TOKEN_KEY = "fund-me:refresh-token";

function getBrowserStorages() {
    if (typeof window === "undefined") {
        return [];
    }

    return [window.localStorage, window.sessionStorage];
}

export function clearStoredSession() {
    for (const storage of getBrowserStorages()) {
        storage.removeItem(ACCESS_TOKEN_KEY);
        storage.removeItem(REFRESH_TOKEN_KEY);
    }
}

export function persistSession(session: AuthSession, rememberMe: boolean) {
    clearStoredSession();

    const storage = rememberMe ? window.localStorage : window.sessionStorage;
    storage.setItem(ACCESS_TOKEN_KEY, session.access_token);
    storage.setItem(REFRESH_TOKEN_KEY, session.refresh_token || "");
}

export function readStoredSession(): AuthSession | null {
    const storages = getBrowserStorages();

    for (const storage of storages) {
        const accessToken = storage.getItem(ACCESS_TOKEN_KEY);

        if (!accessToken) {
            continue;
        }

        return {
            access_token: accessToken,
            refresh_token: storage.getItem(REFRESH_TOKEN_KEY) || ""
        };
    }

    return null;
}

export function readStoredAccessToken() {
    return readStoredSession()?.access_token || null;
}
