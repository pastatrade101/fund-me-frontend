import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren
} from "react";

import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import type { AuthSession, AuthUserProfile } from "../types/api";
import { clearStoredSession, persistSession, readStoredSession } from "./sessionStorage";

interface AuthContextValue {
    loading: boolean;
    session: AuthSession | null;
    user: AuthUserProfile | null;
    signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
    signOut: () => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<AuthSession | null>(null);
    const [user, setUser] = useState<AuthUserProfile | null>(null);

    const refreshProfile = useCallback(async () => {
        const storedSession = readStoredSession();
        const token = storedSession?.access_token;

        if (!token) {
            setUser(null);
            setSession(null);
            return;
        }

        const { data } = await api.get(endpoints.auth.me);
        setUser(data.data);
        setSession(storedSession);
    }, []);

    useEffect(() => {
        refreshProfile()
            .catch(() => {
                clearStoredSession();
                setSession(null);
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, [refreshProfile]);

    const signIn = useCallback(async (email: string, password: string, rememberMe: boolean) => {
        const response = await api.post(endpoints.auth.login, { email, password });
        const authData = response.data.data;
        const nextSession = authData.session as AuthSession;

        if (!nextSession?.access_token) {
            throw new Error("Backend did not return a session token.");
        }

        persistSession(nextSession, rememberMe);
        setSession(nextSession);
        await refreshProfile();
    }, [refreshProfile]);

    const signOut = useCallback(() => {
        clearStoredSession();
        setSession(null);
        setUser(null);
    }, []);

    const value = useMemo(() => ({
        loading,
        session,
        user,
        signIn,
        signOut,
        refreshProfile
    }), [loading, refreshProfile, session, signIn, signOut, user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider.");
    }

    return context;
}

export function toAuthErrorMessage(error: unknown, fallback = "Unable to authenticate.") {
    return getApiErrorMessage(error, fallback);
}
