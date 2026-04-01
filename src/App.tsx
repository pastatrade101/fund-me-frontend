import { Suspense, lazy, type JSX } from "react";
import { Alert, Box, CircularProgress } from "@mui/material";
import { Navigate, Route, Routes, useParams } from "react-router-dom";

import { useAuth } from "./auth/AuthContext";
import { hasAnyRole, type AppRole } from "./auth/roles";

const AppShell = lazy(() => import("./components/layout/AppShell").then((module) => ({ default: module.AppShell })));
const SignInPage = lazy(() => import("./pages/SignIn").then((module) => ({ default: module.SignInPage })));
const ResetPasswordPage = lazy(() => import("./pages/ResetPassword").then((module) => ({ default: module.ResetPasswordPage })));
const TermsAndConditionsPage = lazy(() => import("./pages/TermsAndConditions").then((module) => ({ default: module.TermsAndConditionsPage })));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicy").then((module) => ({ default: module.PrivacyPolicyPage })));
const DashboardPage = lazy(() => import("./pages/Dashboard").then((module) => ({ default: module.DashboardPage })));
const MembersPage = lazy(() => import("./pages/Members").then((module) => ({ default: module.MembersPage })));
const PoliciesPage = lazy(() => import("./pages/Policies").then((module) => ({ default: module.PoliciesPage })));
const PolicyCreatePage = lazy(() => import("./pages/PolicyCreate").then((module) => ({ default: module.PolicyCreatePage })));
const PolicyEditPage = lazy(() => import("./pages/PolicyEdit").then((module) => ({ default: module.PolicyEditPage })));
const EventsPage = lazy(() => import("./pages/Events").then((module) => ({ default: module.EventsPage })));
const EventCreatePage = lazy(() => import("./pages/EventCreate").then((module) => ({ default: module.EventCreatePage })));
const EventEditPage = lazy(() => import("./pages/EventEdit").then((module) => ({ default: module.EventEditPage })));
const EventDetailPage = lazy(() => import("./pages/EventDetail").then((module) => ({ default: module.EventDetailPage })));
const ContributionsPage = lazy(() => import("./pages/Contributions").then((module) => ({ default: module.ContributionsPage })));
const MemberContributionWorkspacePage = lazy(() => import("./pages/MemberContributionWorkspace").then((module) => ({ default: module.MemberContributionWorkspacePage })));
const ReportsPage = lazy(() => import("./pages/Reports").then((module) => ({ default: module.ReportsPage })));
const SettingsPage = lazy(() => import("./pages/Settings").then((module) => ({ default: module.SettingsPage })));
const StaffPage = lazy(() => import("./pages/Staff").then((module) => ({ default: module.StaffPage })));
const AuditLogsPage = lazy(() => import("./pages/AuditLogs").then((module) => ({ default: module.AuditLogsPage })));
const ProfilePage = lazy(() => import("./pages/Profile").then((module) => ({ default: module.ProfilePage })));

function RequireAuth({ children }: { children: JSX.Element }) {
    const { loading, session } = useAuth();

    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!session) {
        return <Navigate to="/signin" replace />;
    }

    return children;
}

function RequireRoles({ children, roles }: { children: JSX.Element; roles: AppRole[] }) {
    const { user } = useAuth();

    if (!hasAnyRole(user, roles)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

function RouteFallback() {
    return (
        <Box sx={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
            <CircularProgress />
        </Box>
    );
}

function LegacyMemberContributionRedirect() {
    const { eventId = "" } = useParams();
    return <Navigate to={`/events/${eventId}/contribution`} replace />;
}

function withRouteSuspense(children: JSX.Element) {
    return (
        <Suspense fallback={<RouteFallback />}>
            {children}
        </Suspense>
    );
}

export default function App() {
    return (
        <Routes>
            <Route path="/signin" element={withRouteSuspense(<SignInPage />)} />
            <Route path="/reset-password" element={withRouteSuspense(<ResetPasswordPage />)} />
            <Route path="/terms-and-conditions" element={withRouteSuspense(<TermsAndConditionsPage />)} />
            <Route path="/privacy-policy" element={withRouteSuspense(<PrivacyPolicyPage />)} />
            <Route
                path="/"
                element={
                    <RequireAuth>
                        {withRouteSuspense(<AppShell />)}
                    </RequireAuth>
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={withRouteSuspense(<DashboardPage />)} />
                <Route path="staff" element={<RequireRoles roles={["admin"]}>{withRouteSuspense(<StaffPage />)}</RequireRoles>} />
                <Route path="members" element={<RequireRoles roles={["fund_manager"]}>{withRouteSuspense(<MembersPage />)}</RequireRoles>} />
                <Route path="policies" element={<RequireRoles roles={["fund_manager"]}>{withRouteSuspense(<PoliciesPage />)}</RequireRoles>} />
                <Route path="policies/create" element={<RequireRoles roles={["fund_manager"]}>{withRouteSuspense(<PolicyCreatePage />)}</RequireRoles>} />
                <Route path="policies/:id/edit" element={<RequireRoles roles={["fund_manager"]}>{withRouteSuspense(<PolicyEditPage />)}</RequireRoles>} />
                <Route path="events" element={<RequireRoles roles={["fund_manager", "member"]}>{withRouteSuspense(<EventsPage />)}</RequireRoles>} />
                <Route path="events/create" element={<RequireRoles roles={["fund_manager"]}>{withRouteSuspense(<EventCreatePage />)}</RequireRoles>} />
                <Route path="events/:id/edit" element={<RequireRoles roles={["fund_manager"]}>{withRouteSuspense(<EventEditPage />)}</RequireRoles>} />
                <Route path="events/:id" element={<RequireRoles roles={["fund_manager"]}>{withRouteSuspense(<EventDetailPage />)}</RequireRoles>} />
                <Route path="events/:eventId/contribution" element={<RequireRoles roles={["member"]}>{withRouteSuspense(<MemberContributionWorkspacePage />)}</RequireRoles>} />
                <Route path="contributions" element={<RequireRoles roles={["fund_manager", "member"]}>{withRouteSuspense(<ContributionsPage />)}</RequireRoles>} />
                <Route path="my-contributions" element={<RequireRoles roles={["member"]}>{withRouteSuspense(<ContributionsPage />)}</RequireRoles>} />
                <Route path="my-contributions/:eventId" element={<RequireRoles roles={["member"]}><LegacyMemberContributionRedirect /></RequireRoles>} />
                <Route path="profile" element={<RequireRoles roles={["member"]}>{withRouteSuspense(<ProfilePage />)}</RequireRoles>} />
                <Route path="reports" element={<RequireRoles roles={["admin", "fund_manager"]}>{withRouteSuspense(<ReportsPage />)}</RequireRoles>} />
                <Route path="settings" element={<RequireRoles roles={["admin"]}>{withRouteSuspense(<SettingsPage />)}</RequireRoles>} />
                <Route path="audit-logs" element={<RequireRoles roles={["admin"]}>{withRouteSuspense(<AuditLogsPage />)}</RequireRoles>} />
            </Route>
            <Route path="*" element={<Alert severity="error">Page not found.</Alert>} />
        </Routes>
    );
}
