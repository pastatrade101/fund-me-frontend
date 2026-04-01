import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import PolicyRoundedIcon from "@mui/icons-material/PolicyRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import {
    AppBar,
    Avatar,
    Badge,
    Box,
    Chip,
    Divider,
    Drawer,
    IconButton,
    InputAdornment,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    OutlinedInput,
    Paper,
    Stack,
    Tooltip,
    Toolbar,
    Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useState, type MouseEvent } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { brandColors } from "../../theme/colors";
import { useUI } from "../../ui/UIProvider";
import { useAuth } from "../../auth/AuthContext";
import { formatRoleLabel, getPrimaryRole, type AppRole } from "../../auth/roles";
import { api } from "../../lib/api";
import { endpoints } from "../../lib/endpoints";
import type { GovernanceOverallStatus } from "../../types/api";

const defaultExpandedSidebarWidth = 272;
const defaultCollapsedSidebarWidth = 88;
const memberExpandedSidebarWidth = 340;
const memberCollapsedSidebarWidth = 96;
const appBarHeight = 76;
const brandLogoSrc = "/changa2.svg";

type NavItem = {
    to: string;
    label: string;
    icon: typeof DashboardRoundedIcon;
    description?: string;
};

type NavSection = {
    label: string;
    items: NavItem[];
};

function BrandLogo({
    size = 44
}: {
    size?: number;
}) {
    return (
        <Box
            component="img"
            src={brandLogoSrc}
            alt="Changa logo"
            sx={{
                width: size,
                height: size,
                objectFit: "contain",
                display: "block"
            }}
        />
    );
}

const navItemsByRole: Record<AppRole, NavItem[]> = {
    admin: [
        { to: "/dashboard", label: "Dashboard", icon: DashboardRoundedIcon },
        { to: "/staff", label: "Staff", icon: BadgeRoundedIcon },
        { to: "/reports", label: "Reports", icon: BarChartRoundedIcon },
        { to: "/settings", label: "Settings", icon: SettingsRoundedIcon },
        { to: "/audit-logs", label: "Audit Logs", icon: FactCheckRoundedIcon }
    ],
    fund_manager: [
        {
            to: "/dashboard",
            label: "Dashboard",
            icon: DashboardRoundedIcon,
            description: "Track active events, collection totals, and operational performance."
        },
        {
            to: "/members",
            label: "Members",
            icon: GroupRoundedIcon,
            description: "Manage the member registry and contribution eligibility data."
        },
        {
            to: "/policies",
            label: "Policies",
            icon: PolicyRoundedIcon,
            description: "Configure per-member contribution rules and event coverage."
        },
        {
            to: "/events",
            label: "Events",
            icon: CelebrationRoundedIcon,
            description: "Launch contribution drives and monitor collection progress."
        },
        {
            to: "/contributions",
            label: "Contributions",
            icon: PaymentsRoundedIcon,
            description: "Review ledger activity, receipts, and contribution posting."
        },
        {
            to: "/reports",
            label: "Reports",
            icon: BarChartRoundedIcon,
            description: "Inspect operational reporting and export contribution views."
        }
    ],
    member: [
        {
            to: "/dashboard",
            label: "Dashboard",
            icon: DashboardRoundedIcon,
            description: "Review your obligations, active events, and recent payment activity."
        },
        {
            to: "/events",
            label: "Events",
            icon: CelebrationRoundedIcon,
            description: "See active contribution events and start payment from one place."
        },
        {
            to: "/my-contributions",
            label: "My Contributions",
            icon: PaymentsRoundedIcon,
            description: "Open receipts and view completed contribution history."
        },
        {
            to: "/profile",
            label: "Profile",
            icon: PersonRoundedIcon,
            description: "Keep your name and payment phone current."
        }
    ]
};

const adminNavSections: NavSection[] = [
    {
        label: "Dashboard",
        items: [
            {
                to: "/dashboard",
                label: "Dashboard",
                icon: DashboardRoundedIcon,
                description: "Governance console overview."
            }
        ]
    },
    {
        label: "Staff Management",
        items: [
            {
                to: "/staff",
                label: "Staff Accounts",
                icon: BadgeRoundedIcon,
                description: "Staff accounts and Fund Manager oversight."
            }
        ]
    },
    {
        label: "Financial Oversight",
        items: [
            {
                to: "/dashboard#financial-integrity",
                label: "Contributions Summary",
                icon: BarChartRoundedIcon,
                description: "Collections and oversight KPIs."
            },
            {
                to: "/dashboard#pending-payments",
                label: "Payment Monitoring",
                icon: PaymentsRoundedIcon,
                description: "Pending, failed, and gateway risk."
            }
        ]
    },
    {
        label: "Reports",
        items: [
            {
                to: "/reports#financial-reports",
                label: "Financial Reports",
                icon: BarChartRoundedIcon,
                description: "Finance and governance reporting."
            }
        ]
    },
    {
        label: "Security",
        items: [
            {
                to: "/audit-logs",
                label: "Audit Logs",
                icon: FactCheckRoundedIcon,
                description: "Audit trail visibility."
            }
        ]
    },
    {
        label: "System Settings",
        items: [
            {
                to: "/settings",
                label: "System Settings",
                icon: SettingsRoundedIcon,
                description: "Platform configuration."
            }
        ]
    }
];

function getWorkspaceCopy(role: AppRole) {
    if (role === "admin") {
        return {
            title: "Fund-Me Governance Console",
            subtitle: "Monitor health, financial integrity, audit control, and staff access."
        };
    }

    if (role === "fund_manager") {
        return {
            title: "Fund-Me Operations",
            subtitle: "Run policies, events, collections, and reporting from one workspace."
        };
    }

    return {
        title: "Member Workspace",
        subtitle: "Digital member workspace"
    };
}

function formatGovernanceStatusLabel(status: GovernanceOverallStatus) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function getInitials(value: string) {
    return (
        value
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("") || "M"
    );
}

function isSelectedPath(pathname: string, search: string, hash: string, to: string) {
    const target = new URL(to, "https://fund-me.local");

    if (target.hash) {
        return pathname === target.pathname && hash === target.hash;
    }

    if (target.search) {
        return pathname === target.pathname && search === target.search;
    }

    return pathname === target.pathname || pathname.startsWith(`${target.pathname}/`);
}

function SidebarContent({ collapsed, primaryRole }: { collapsed: boolean; primaryRole: AppRole }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { closeMobileSidebar, theme } = useUI();
    const { user, signOut } = useAuth();
    const navItems = primaryRole === "admin"
        ? adminNavSections.flatMap((section) => section.items)
        : navItemsByRole[primaryRole];
    const isPortalShell = primaryRole === "member" || primaryRole === "fund_manager" || primaryRole === "admin";
    const isWarmDark = theme === "dark";
    const accentColor = isWarmDark ? "#FBBF24" : brandColors.primary[900];
    const accentColorSoft = isWarmDark ? alpha(brandColors.warning, 0.14) : alpha(brandColors.primary[100], 0.56);
    const accentBorderColor = isWarmDark ? alpha(brandColors.warning, 0.28) : alpha(brandColors.primary[300], 0.34);
    const accentTextColor = isWarmDark ? "#FDE68A" : brandColors.primary[900];
    const accentIconColor = isWarmDark ? "#FCD34D" : brandColors.primary[700];
    const member = user?.member;
    const staff = user?.staff;
    const displayName = member?.full_name || staff?.full_name || user?.email?.split("@")[0] || "User";
    const summarySubtitle = primaryRole === "member"
        ? (member?.department || "Assigned department")
        : primaryRole === "admin"
            ? "Governance workspace"
            : "Operations workspace";
    const statusLabel = primaryRole === "member"
        ? (
            member?.status === "active"
                ? "Live activity"
                : member?.status === "pending_signup"
                    ? "Pending signup"
                    : "Inactive"
        )
        : primaryRole === "admin"
            ? (staff?.status === "active" ? "Governance live" : "Inactive")
            : (staff?.status === "active" ? "Operations live" : "Inactive");
    const primaryChipLabel = primaryRole === "member"
        ? "Member"
        : primaryRole === "admin"
            ? "Admin"
            : "Fund Manager";
    const footerTitle = primaryRole === "member"
        ? "Secure member session"
        : primaryRole === "admin"
            ? "Governance command center"
            : "Operational command center";
    const footerDescription = primaryRole === "member"
        ? "Real-time obligations, payment tracking, and self-service history in one place."
        : primaryRole === "admin"
            ? "System health, financial integrity, audit visibility, and staff access oversight from one shell."
            : "Policies, events, collections, and reports coordinated from one operational shell.";

    const handleNavigate = (to: string) => {
        closeMobileSidebar();
        navigate(to);
    };

    const handleSignOut = () => {
        signOut();
        navigate("/signin");
    };

    if (isPortalShell) {
        return (
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}>
                <Box
                    sx={{
                        px: collapsed ? 1.25 : 2,
                        py: 1.5,
                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={collapsed ? 0 : 1.5}
                        alignItems="center"
                        justifyContent={collapsed ? "center" : "flex-start"}
                    >
                        <Avatar
                            sx={{
                                width: 44,
                                height: 44,
                                bgcolor: alpha("#FFFFFF", isWarmDark ? 0.08 : 0.14),
                                boxShadow: `0 12px 24px ${
                                    isWarmDark ? alpha(brandColors.warning, 0.18) : alpha(brandColors.primary[900], 0.2)
                                }`
                            }}
                        >
                            <BrandLogo />
                        </Avatar>
                        {!collapsed ? (
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                    Fund-Me
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Workplace contributions
                                </Typography>
                            </Box>
                        ) : null}
                    </Stack>
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        px: collapsed ? 0.9 : 1.25,
                        py: 1.25,
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    {!collapsed ? (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 1.5,
                                mb: 1.5,
                                borderRadius: 2.5,
                                border: `1px solid ${isWarmDark ? alpha(brandColors.warning, 0.22) : alpha(brandColors.primary[300], 0.18)}`,
                                background: isWarmDark
                                    ? `linear-gradient(180deg, ${alpha("#FFFFFF", 0.04)} 0%, ${alpha(brandColors.warning, 0.06)} 100%)`
                                    : `linear-gradient(180deg, ${alpha(brandColors.primary[100], 0.34)} 0%, #FFFFFF 100%)`
                            }}
                        >
                            <Stack spacing={1.5}>
                                <Stack direction="row" spacing={1.25} alignItems="center">
                                    <Avatar
                                        sx={{
                                            width: 44,
                                            height: 44,
                                            bgcolor: isWarmDark ? alpha(brandColors.warning, 0.14) : alpha(brandColors.primary[500], 0.14),
                                            color: isWarmDark ? "#FDE68A" : brandColors.primary[900],
                                            fontWeight: 800
                                        }}
                                    >
                                        {getInitials(displayName)}
                                    </Avatar>
                                    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                                            {displayName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {summarySubtitle}
                                        </Typography>
                                    </Stack>
                                </Stack>
                                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                    <Chip label={primaryChipLabel} size="small" sx={{ borderRadius: 1.5 }} />
                                    <Chip
                                        label={statusLabel}
                                        size="small"
                                        sx={{
                                            borderRadius: 1.5,
                                            bgcolor: alpha(brandColors.success, 0.14),
                                            color: brandColors.success,
                                            fontWeight: 700
                                        }}
                                    />
                                </Stack>
                            </Stack>
                        </Paper>
                    ) : (
                        <Stack alignItems="center" sx={{ mb: 2.25 }}>
                            <Avatar
                                sx={{
                                    width: 52,
                                    height: 52,
                                    bgcolor: isWarmDark ? alpha(brandColors.warning, 0.14) : alpha(brandColors.primary[500], 0.14),
                                    color: isWarmDark ? "#FDE68A" : brandColors.primary[900],
                                    fontWeight: 800
                                }}
                            >
                                {getInitials(displayName)}
                            </Avatar>
                        </Stack>
                    )}

                    {!collapsed ? (
                        <Typography
                            variant="overline"
                            sx={{ px: 1, mb: 0.75, color: "text.secondary", letterSpacing: 1.8, fontWeight: 700 }}
                        >
                            Workspace
                        </Typography>
                    ) : null}

                    <List sx={{ display: "grid", gap: 0.2, p: 0 }}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const selected = isSelectedPath(location.pathname, location.search, location.hash, item.to);
                            const button = (
                                <ListItemButton
                                    key={item.to}
                                    selected={selected}
                                    onClick={() => handleNavigate(item.to)}
                                    sx={{
                                        alignItems: collapsed ? "center" : "flex-start",
                                        justifyContent: collapsed ? "center" : "flex-start",
                                        gap: collapsed ? 0 : 1,
                                        minHeight: collapsed ? 48 : 54,
                                        px: collapsed ? 0 : 1.5,
                                        py: collapsed ? 0.95 : 1,
                                        borderRadius: 1.75,
                                        border: `1px solid ${selected ? accentBorderColor : "transparent"}`,
                                        background: selected ? accentColorSoft : "transparent",
                                        boxShadow: selected ? `inset 0 0 0 1px ${alpha("#FFFFFF", 0.45)}` : "none",
                                        color: selected ? accentTextColor : "text.primary",
                                        "&:hover": {
                                            background: selected ? accentColorSoft : alpha(isWarmDark ? brandColors.warning : brandColors.primary[100], isWarmDark ? 0.08 : 0.3)
                                        },
                                        "&.Mui-selected": {
                                            background: accentColorSoft,
                                            color: accentTextColor
                                        },
                                        "&.Mui-selected:hover": {
                                            background: accentColorSoft
                                        }
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mt: collapsed ? 0 : 0.1,
                                            color: "inherit"
                                        }}
                                    >
                                        <Box
                                            sx={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: 1.75,
                                            display: "grid",
                                            placeItems: "center",
                                            bgcolor: selected ? (isWarmDark ? alpha(brandColors.warning, 0.14) : alpha(brandColors.primary[500], 0.12)) : "transparent",
                                            color: accentIconColor
                                        }}
                                    >
                                        <Icon fontSize="small" />
                                        </Box>
                                    </ListItemIcon>
                                    {!collapsed ? (
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{
                                                fontWeight: 500,
                                                color: selected ? accentTextColor : "text.primary"
                                            }}
                                        />
                                    ) : null}
                                </ListItemButton>
                            );

                            return collapsed ? (
                                <Tooltip key={item.to} title={item.label} placement="right">
                                    {button}
                                </Tooltip>
                            ) : button;
                        })}
                    </List>

                    <Box sx={{ mt: "auto", pt: 2 }}>
                        {!collapsed ? (
                            <Paper
                                elevation={0}
                            sx={{
                                p: 1.5,
                                mb: 1,
                                borderRadius: 2.5,
                                border: `1px solid ${isWarmDark ? alpha(brandColors.warning, 0.22) : alpha(brandColors.primary[300], 0.18)}`,
                                background: isWarmDark
                                    ? `linear-gradient(180deg, ${alpha("#FFFFFF", 0.04)} 0%, ${alpha(brandColors.warning, 0.05)} 100%)`
                                    : `linear-gradient(180deg, ${alpha(brandColors.accent[100], 0.44)} 0%, #FFFFFF 100%)`
                            }}
                        >
                                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                                    <Avatar
                                        variant="rounded"
                                        sx={{
                                            width: 38,
                                            height: 38,
                                            bgcolor: alpha(brandColors.success, 0.14),
                                            color: brandColors.success
                                        }}
                                    >
                                        <ShieldRoundedIcon fontSize="small" />
                                    </Avatar>
                                    <Stack spacing={0.4}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                            {footerTitle}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {footerDescription}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Paper>
                        ) : null}

                        <ListItemButton
                            onClick={handleSignOut}
                            sx={{
                                borderRadius: 2,
                                px: collapsed ? 0 : 1.25,
                                justifyContent: collapsed ? "center" : "flex-start"
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: collapsed ? 0 : 34, justifyContent: "center" }}>
                                <LogoutRoundedIcon fontSize="small" />
                            </ListItemIcon>
                            {!collapsed ? <ListItemText primary="Sign out" /> : null}
                        </ListItemButton>
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", px: collapsed ? 1.25 : 2, py: 2 }}>
            <Stack
                direction="row"
                spacing={collapsed ? 0 : 1.5}
                alignItems="center"
                justifyContent={collapsed ? "center" : "flex-start"}
                sx={{ mb: 2.5, minHeight: 48 }}
            >
                <Avatar sx={{ bgcolor: isWarmDark ? alpha(brandColors.warning, 0.16) : brandColors.primary[900], color: isWarmDark ? "#FDE68A" : "inherit", width: 44, height: 44 }}>
                    <BrandLogo />
                </Avatar>
                {!collapsed ? (
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            Fund-Me
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Workplace contributions
                        </Typography>
                    </Box>
                ) : null}
            </Stack>

            {collapsed ? (
                <List sx={{ gap: 0.5, display: "grid" }}>
                    {adminNavSections.flatMap((section) => section.items).map((item) => {
                        const Icon = item.icon;
                        const selected = isSelectedPath(location.pathname, location.search, location.hash, item.to);
                        const button = (
                            <ListItemButton
                                key={item.to}
                                selected={selected}
                                onClick={() => handleNavigate(item.to)}
                                sx={{
                                    minHeight: 46,
                                    borderRadius: 1,
                                    px: 1.25,
                                    justifyContent: "center",
                                    bgcolor: selected ? alpha(isWarmDark ? brandColors.warning : brandColors.primary[100], isWarmDark ? 0.14 : 0.9) : "transparent",
                                    color: selected ? (isWarmDark ? "#FDE68A" : brandColors.primary[900]) : "text.primary"
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: "inherit",
                                        minWidth: 0,
                                        justifyContent: "center"
                                    }}
                                >
                                    <Icon fontSize="small" />
                                </ListItemIcon>
                            </ListItemButton>
                        );

                        return (
                            <Tooltip key={item.to} title={item.label} placement="right">
                                {button}
                            </Tooltip>
                        );
                    })}
                </List>
            ) : (
                <List sx={{ gap: 0.35, display: "grid", p: 0 }}>
                    {adminNavSections.flatMap((section) => section.items).map((item) => {
                        const Icon = item.icon;
                        const selected = isSelectedPath(location.pathname, location.search, location.hash, item.to);

                        return (
                            <ListItemButton
                                key={item.to}
                                selected={selected}
                                onClick={() => handleNavigate(item.to)}
                                sx={{
                                    minHeight: 46,
                                    borderRadius: 1.25,
                                    px: 1.5,
                                    alignItems: "center",
                                    bgcolor: selected ? alpha(isWarmDark ? brandColors.warning : brandColors.primary[100], isWarmDark ? 0.14 : 0.9) : "transparent",
                                    color: selected ? (isWarmDark ? "#FDE68A" : brandColors.primary[900]) : "text.primary"
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: "inherit",
                                        minWidth: 36,
                                        mt: 0.15
                                    }}
                                >
                                    <Icon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{ fontWeight: 500 }}
                                />
                            </ListItemButton>
                        );
                    })}
                </List>
            )}

            <Box sx={{ mt: "auto", pt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Box
                    sx={{
                        p: collapsed ? 1 : 1.5,
                        borderRadius: 1,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.12 : 0.05)
                    }}
                >
                    {!collapsed ? (
                        <>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {user?.email || "No session"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {formatRoleLabel(primaryRole)}
                            </Typography>
                        </>
                    ) : null}
                    <ListItemButton
                        onClick={handleSignOut}
                        sx={{
                            borderRadius: 1,
                            px: collapsed ? 0 : 1.25,
                            justifyContent: collapsed ? "center" : "flex-start"
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: collapsed ? 0 : 34, justifyContent: "center" }}>
                            <LogoutRoundedIcon fontSize="small" />
                        </ListItemIcon>
                        {!collapsed ? <ListItemText primary="Sign out" /> : null}
                    </ListItemButton>
                </Box>
            </Box>
        </Box>
    );
}

export function AppShell() {
    const {
        theme,
        toggleTheme,
        isDesktop,
        mobileSidebarOpen,
        desktopSidebarExpanded,
        toggleMobileSidebar,
        closeMobileSidebar,
        toggleDesktopSidebar
    } = useUI();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
    const [adminGovernanceStatus, setAdminGovernanceStatus] = useState<GovernanceOverallStatus | null>(null);
    const primaryRole = getPrimaryRole(user);
    const isPortalShell = primaryRole === "member" || primaryRole === "fund_manager" || primaryRole === "admin";
    const isWarmDark = theme === "dark";
    const shellAccent = isWarmDark ? "#FBBF24" : brandColors.primary[900];
    const shellAccentSoft = isWarmDark ? alpha(brandColors.warning, 0.14) : alpha(brandColors.primary[500], 0.12);
    const shellAccentBorder = isWarmDark ? alpha(brandColors.warning, 0.28) : alpha(brandColors.primary[300], 0.2);
    const shellAccentText = isWarmDark ? "#FDE68A" : brandColors.primary[900];
    const desktopSidebarWidth = isPortalShell
        ? (desktopSidebarExpanded ? memberExpandedSidebarWidth : memberCollapsedSidebarWidth)
        : (desktopSidebarExpanded ? defaultExpandedSidebarWidth : defaultCollapsedSidebarWidth);
    const workspaceCopy = getWorkspaceCopy(primaryRole);
    const avatarLabel = getInitials(
        user?.member?.full_name ||
        user?.staff?.full_name ||
        user?.email ||
        "User"
    );
    const accountMenuOpen = Boolean(accountMenuAnchor);

    useEffect(() => {
        if (primaryRole !== "admin") {
            setAdminGovernanceStatus(null);
            return;
        }

        let disposed = false;

        const loadStatus = async () => {
            try {
                const response = await api.get(endpoints.adminGovernance);

                if (!disposed) {
                    setAdminGovernanceStatus(response.data.data.overall_status || null);
                }
            } catch {
                if (!disposed) {
                    setAdminGovernanceStatus(null);
                }
            }
        };

        void loadStatus();
        const interval = window.setInterval(() => {
            void loadStatus();
        }, 60000);

        return () => {
            disposed = true;
            window.clearInterval(interval);
        };
    }, [primaryRole]);

    const handleAccountMenuOpen = (event: MouseEvent<HTMLElement>) => {
        setAccountMenuAnchor(event.currentTarget);
    };

    const handleAccountMenuClose = () => {
        setAccountMenuAnchor(null);
    };

    const handleSignOutFromMenu = () => {
        handleAccountMenuClose();
        signOut();
        navigate("/signin");
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <AppBar
                position="fixed"
                color="transparent"
                sx={{
                    left: isPortalShell && isDesktop ? `${desktopSidebarWidth}px` : 0,
                    right: 0,
                    width: isPortalShell && isDesktop ? `calc(100% - ${desktopSidebarWidth}px)` : "100%",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    boxShadow: "none",
                    borderRadius: 0,
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    backdropFilter: "blur(18px)",
                    bgcolor: (theme) => alpha(theme.palette.background.default, 0.94),
                    transition: (theme) =>
                        theme.transitions.create(["left", "width"], {
                            duration: theme.transitions.duration.standard
                        })
                }}
            >
                {isPortalShell ? (
                    <Toolbar sx={{ gap: 1.5, minHeight: `${appBarHeight}px !important`, px: { xs: 2, md: 3 } }}>
                        <IconButton
                            onClick={isDesktop ? toggleDesktopSidebar : toggleMobileSidebar}
                            edge="start"
                            sx={{
                                borderRadius: 1.5,
                                border: isWarmDark ? `1px solid ${shellAccentBorder}` : (theme) => `1px solid ${theme.palette.divider}`,
                                color: isWarmDark ? shellAccentText : "inherit"
                            }}
                        >
                            {isDesktop && desktopSidebarExpanded ? <MenuOpenRoundedIcon /> : <MenuRoundedIcon />}
                        </IconButton>

                        <Box
                            component="img"
                            src={brandLogoSrc}
                            alt="Changa logo"
                            sx={{
                                width: 32,
                                height: 32,
                                objectFit: "contain",
                                display: { xs: "none", sm: "block" }
                            }}
                        />

                        <Typography
                            variant="overline"
                            sx={{
                                display: { xs: "none", sm: "block" },
                                color: "text.secondary",
                                letterSpacing: 2.8,
                                fontWeight: 700
                            }}
                        >
                            {workspaceCopy.title}
                        </Typography>

                        <Box sx={{ flex: 1 }} />

                        <OutlinedInput
                            size="small"
                            placeholder={
                                primaryRole === "member"
                                    ? "Search member workspace"
                                    : primaryRole === "admin"
                                        ? "Search governance workspace"
                                        : "Search operations workspace"
                            }
                            startAdornment={
                                <InputAdornment position="start">
                                    <SearchRoundedIcon fontSize="small" sx={{ color: isWarmDark ? shellAccentText : "inherit" }} />
                                </InputAdornment>
                            }
                            sx={{
                                display: { xs: "none", md: "flex" },
                                width: 280,
                                borderRadius: 999,
                                bgcolor: "background.paper",
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: isWarmDark ? alpha(brandColors.warning, 0.26) : alpha(brandColors.primary[300], 0.28)
                                },
                                "& .MuiOutlinedInput-input": {
                                    color: isWarmDark ? "#F8FAFC" : "inherit"
                                }
                            }}
                        />

                        {primaryRole === "admin" ? (
                            <Chip
                                label={`System Status: ${
                                    adminGovernanceStatus
                                        ? `● ${formatGovernanceStatusLabel(adminGovernanceStatus)}`
                                        : "● Unknown"
                                }`}
                                sx={{
                                    display: { xs: "none", lg: "inline-flex" },
                                    borderRadius: 999,
                                    fontWeight: 700,
                                    color: adminGovernanceStatus === "critical"
                                        ? "#DC2626"
                                        : adminGovernanceStatus === "degraded"
                                            ? "#D97706"
                                            : adminGovernanceStatus === "healthy"
                                                ? "#059669"
                                                : "text.secondary",
                                    bgcolor: adminGovernanceStatus === "critical"
                                        ? alpha("#DC2626", 0.08)
                                        : adminGovernanceStatus === "degraded"
                                            ? alpha("#D97706", 0.08)
                                            : adminGovernanceStatus === "healthy"
                                                ? alpha("#059669", 0.08)
                                                : alpha(shellAccent, 0.08)
                                }}
                            />
                        ) : null}

                        <IconButton
                            sx={{
                                borderRadius: 1.5,
                                border: isWarmDark ? `1px solid ${shellAccentBorder}` : (theme) => `1px solid ${theme.palette.divider}`,
                                color: isWarmDark ? shellAccentText : "inherit"
                            }}
                        >
                            <Badge color="error" variant="dot">
                                <NotificationsRoundedIcon />
                            </Badge>
                        </IconButton>

                        <IconButton
                            onClick={toggleTheme}
                            sx={{
                                borderRadius: 1.5,
                                border: isWarmDark ? `1px solid ${shellAccentBorder}` : (theme) => `1px solid ${theme.palette.divider}`,
                                color: isWarmDark ? shellAccentText : "inherit"
                            }}
                        >
                            {theme === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
                        </IconButton>

                        <IconButton
                            onClick={handleAccountMenuOpen}
                            sx={{
                                p: 0,
                                borderRadius: 1.5
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 44,
                                    height: 44,
                                    bgcolor: shellAccentSoft,
                                    color: shellAccent,
                                    fontWeight: 800,
                                    border: `1px solid ${shellAccentBorder}`
                                }}
                            >
                                {avatarLabel}
                            </Avatar>
                        </IconButton>
                    </Toolbar>
                ) : (
                    <Toolbar sx={{ gap: 1.5, minHeight: `${appBarHeight}px !important`, px: { xs: 2, md: 3 } }}>
                        <IconButton
                            onClick={isDesktop ? toggleDesktopSidebar : toggleMobileSidebar}
                            edge="start"
                            sx={{ borderRadius: 1 }}
                        >
                            {isDesktop && desktopSidebarExpanded ? <MenuOpenRoundedIcon /> : <MenuRoundedIcon />}
                        </IconButton>
                        <Box
                            component="img"
                            src={brandLogoSrc}
                            alt="Changa logo"
                            sx={{
                                width: 32,
                                height: 32,
                                objectFit: "contain"
                            }}
                        />
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                {workspaceCopy.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {workspaceCopy.subtitle}
                            </Typography>
                        </Box>
                        {primaryRole === "admin" ? (
                            <Chip
                                label={`System Status: ${
                                    adminGovernanceStatus
                                        ? `● ${formatGovernanceStatusLabel(adminGovernanceStatus)}`
                                        : "● Unknown"
                                }`}
                                sx={{
                                    borderRadius: 999,
                                    fontWeight: 700,
                                    color: adminGovernanceStatus === "critical"
                                        ? "#DC2626"
                                        : adminGovernanceStatus === "degraded"
                                            ? "#D97706"
                                            : adminGovernanceStatus === "healthy"
                                                ? "#059669"
                                                : "text.secondary",
                                    bgcolor: adminGovernanceStatus === "critical"
                                        ? alpha("#DC2626", 0.08)
                                        : adminGovernanceStatus === "degraded"
                                            ? alpha("#D97706", 0.08)
                                            : adminGovernanceStatus === "healthy"
                                                ? alpha("#059669", 0.08)
                                                : alpha(shellAccent, 0.08)
                                }}
                            />
                        ) : null}
                        <IconButton onClick={toggleTheme}>
                            {theme === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
                        </IconButton>
                    </Toolbar>
                )}
            </AppBar>

            <Menu
                anchorEl={accountMenuAnchor}
                open={accountMenuOpen}
                onClose={handleAccountMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                    sx: {
                        mt: 1,
                        minWidth: 220,
                        borderRadius: 2
                    }
                }}
            >
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {user?.member?.full_name || user?.staff?.full_name || "Account"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {user?.email || "No email"}
                    </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleSignOutFromMenu}>
                    <ListItemIcon sx={{ minWidth: 34 }}>
                        <LogoutRoundedIcon fontSize="small" />
                    </ListItemIcon>
                    Sign out
                </MenuItem>
            </Menu>

            <Drawer
                variant={isDesktop ? "permanent" : "temporary"}
                open={isDesktop ? true : mobileSidebarOpen}
                onClose={closeMobileSidebar}
                ModalProps={{ keepMounted: true }}
                PaperProps={{
                    sx: {
                        width: isDesktop ? desktopSidebarWidth : (isPortalShell ? memberExpandedSidebarWidth : defaultExpandedSidebarWidth),
                        top: isPortalShell ? 0 : `${appBarHeight}px`,
                        height: isPortalShell ? "100%" : `calc(100% - ${appBarHeight}px)`,
                        borderRadius: 0,
                        borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                        borderTop: isPortalShell ? (theme) => `1px solid ${theme.palette.divider}` : "none",
                        boxShadow: "none",
                        overflowX: "hidden",
                        transition: (theme) =>
                            theme.transitions.create("width", {
                                duration: theme.transitions.duration.standard
                            })
                    }
                }}
                sx={{
                    width: isDesktop ? desktopSidebarWidth : (isPortalShell ? memberExpandedSidebarWidth : defaultExpandedSidebarWidth),
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: isDesktop ? desktopSidebarWidth : (isPortalShell ? memberExpandedSidebarWidth : defaultExpandedSidebarWidth)
                    }
                }}
            >
                <SidebarContent collapsed={isDesktop ? !desktopSidebarExpanded : false} primaryRole={primaryRole} />
            </Drawer>

            <Box
                component="main"
                sx={{
                    ml: { lg: `${desktopSidebarWidth}px` },
                    minHeight: "100vh",
                    px: { xs: 2, md: 3 },
                    pt: isPortalShell ? { xs: 1.5, md: 2 } : 0,
                    pb: { xs: 2, md: 3 },
                    transition: (theme) =>
                        theme.transitions.create("margin-left", {
                            duration: theme.transitions.duration.standard
                        })
                }}
            >
                <Toolbar sx={{ minHeight: `${appBarHeight}px !important`, px: 0 }} />
                <Outlet />
            </Box>
        </Box>
    );
}
