import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VpnKeyRoundedIcon from "@mui/icons-material/VpnKeyRounded";
import { Alert, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, LinearProgress, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { DataPageSkeleton } from "../components/common/DataPageSkeleton";
import { PageHero } from "../components/common/PageHero";
import { StatCard } from "../components/common/StatCard";
import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import type { Department, Member } from "../types/api";
import { formatDate } from "./page-format";

type MemberDraft = {
    full_name: string;
    department: string;
    phone: string;
    email: string;
    employment_type: "permanent" | "contract" | "intern";
    status: "pending_signup" | "active" | "inactive";
    temporary_password: string;
};

function createEmptyDraft(): MemberDraft {
    return {
        full_name: "",
        department: "",
        phone: "",
        email: "",
        employment_type: "permanent",
        status: "active",
        temporary_password: ""
    };
}

function getMemberInitials(member: Member) {
    return member.full_name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "M";
}

function getStatusChip(member: Member) {
    if (member.status === "active") {
        return <Chip size="small" color="success" label="Active" />;
    }

    if (member.status === "inactive") {
        return <Chip size="small" color="default" label="Inactive" />;
    }

    return <Chip size="small" color="warning" label="Pending signup" />;
}

function getAccessChip(member: Member) {
    if (member.auth_user_id) {
        return <Chip size="small" color="success" label="Login ready" icon={<VpnKeyRoundedIcon />} />;
    }

    return <Chip size="small" color="warning" label="Needs login" icon={<VpnKeyRoundedIcon />} />;
}

export function MembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [savingMember, setSavingMember] = useState(false);
    const [memberDialogOpen, setMemberDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [draft, setDraft] = useState<MemberDraft>(createEmptyDraft());
    const [filters, setFilters] = useState({
        search: "",
        department: "all",
        status: "all"
    });

    const loadDepartments = async () => {
        setLoadingDepartments(true);

        try {
            const response = await api.get(endpoints.departments, { params: { status: "active" } });
            setDepartments(response.data.data || []);
        } finally {
            setLoadingDepartments(false);
        }
    };

    const loadMembers = async () => {
        setLoadingMembers(true);

        try {
            const params: Record<string, string | number> = {
                page_size: 100
            };

            if (filters.search.trim()) {
                params.search = filters.search.trim();
            }

            if (filters.department !== "all") {
                params.department = filters.department;
            }

            if (filters.status !== "all") {
                params.status = filters.status;
            }

            const response = await api.get(endpoints.members, { params });
            setMembers(response.data.data.items || []);
        } finally {
            setLoadingMembers(false);
        }
    };

    useEffect(() => {
        loadDepartments()
            .catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load members.")));
    }, []);

    useEffect(() => {
        loadMembers().catch((error) => setErrorMessage(getApiErrorMessage(error, "Unable to load members.")));
    }, [filters.search, filters.department, filters.status]);

    const resetDraft = () => {
        setDraft(createEmptyDraft());
        setSelectedMember(null);
    };

    const openCreateDialog = () => {
        resetDraft();
        setDialogMode("create");
        setMemberDialogOpen(true);
    };

    const openEditDialog = (member: Member) => {
        setSelectedMember(member);
        setDialogMode("edit");
        setDraft({
            full_name: member.full_name,
            department: member.department,
            phone: member.phone,
            email: member.email,
            employment_type: member.employment_type,
            status: member.status,
            temporary_password: ""
        });
        setMemberDialogOpen(true);
    };

    const closeMemberDialog = () => {
        if (savingMember) {
            return;
        }

        resetDraft();
        setMemberDialogOpen(false);
    };

    const handleSaveMember = async () => {
        try {
            setSavingMember(true);
            setErrorMessage("");
            const payload = {
                ...draft,
                ...(draft.temporary_password ? { temporary_password: draft.temporary_password } : {})
            };

            if (dialogMode === "create") {
                await api.post(endpoints.members, payload);
            } else if (selectedMember) {
                await api.patch(endpoints.member(selectedMember.id), payload);
            }

            resetDraft();
            setMemberDialogOpen(false);
            await loadMembers();
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, dialogMode === "create" ? "Unable to create member." : "Unable to update member."));
        } finally {
            setSavingMember(false);
        }
    };

    const handleStatusToggle = async (member: Member) => {
        if (member.status === "pending_signup" || !member.auth_user_id) {
            openEditDialog(member);
            return;
        }

        const nextStatus = member.status === "inactive" ? "active" : "inactive";

        try {
            setErrorMessage("");
            await api.patch(endpoints.memberStatus(member.id), { status: nextStatus });
            await loadMembers();
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Unable to update member status."));
        }
    };

    const registeredCount = members.length;
    const pendingCount = members.filter((member) => member.status === "pending_signup" || !member.auth_user_id).length;
    const loginReadyCount = members.filter((member) => Boolean(member.auth_user_id)).length;
    const isProvisioningLogin = dialogMode === "edit" && selectedMember && !selectedMember.auth_user_id;
    const isCreateMode = dialogMode === "create";
    const needsTempPassword = isCreateMode || (isProvisioningLogin && draft.status === "active");
    const canSaveMember = Boolean(
        departments.length &&
        draft.full_name &&
        draft.department &&
        draft.phone &&
        draft.email &&
        (!needsTempPassword || draft.temporary_password)
    );

    if ((loadingDepartments || loadingMembers) && !members.length && !departments.length) {
        return <DataPageSkeleton statCards={3} tableColumns={7} tableRows={6} detailPanels={1} />;
    }

    return (
        <Stack spacing={3}>
            <PageHero
                eyebrow="Member management"
                title="Register employees once and let Fund-Me drive eligibility from clean staff data."
                description="Fund Managers maintain the member registry, keep employment data clean, and let policy rules determine contribution eligibility automatically."
                tone="surface"
                actions={
                    <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreateDialog}>
                        New member
                    </Button>
                }
            />

            {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}
            {(loadingDepartments || loadingMembers) ? <LinearProgress /> : null}
            {!departments.length ? (
                <Alert severity="info">
                    Admin has not added any active departments yet. Add departments from Settings before registering members.
                </Alert>
            ) : null}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard icon={BadgeRoundedIcon} label="Registered members" value={String(registeredCount)} helper="Current staff records provisioned inside Fund-Me." />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard icon={BusinessRoundedIcon} label="Pending signup" value={String(pendingCount)} helper="Members who still need to complete simple signup." tone="warning" />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard icon={BadgeRoundedIcon} label="Login ready" value={String(loginReadyCount)} helper="Members with a linked Fund-Me login already provisioned." tone="success" />
                </Grid>
            </Grid>

            <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                <Stack spacing={2}>
                    <Stack
                        direction={{ xs: "column", lg: "row" }}
                        spacing={1.5}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", lg: "center" }}
                    >
                        <Stack spacing={0.5}>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                Member registry
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Search, filter, edit, and control member access from one operational table.
                            </Typography>
                        </Stack>
                        <Chip
                            icon={<ManageAccountsRoundedIcon />}
                            label={`${members.length} result${members.length === 1 ? "" : "s"}`}
                            color="primary"
                            variant="outlined"
                        />
                    </Stack>

                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                label="Search members"
                                placeholder="Name, email, or phone"
                                value={filters.search}
                                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchRoundedIcon />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                select
                                label="Department"
                                value={filters.department}
                                onChange={(event) => setFilters((current) => ({ ...current, department: event.target.value }))}
                            >
                                <MenuItem value="all">All departments</MenuItem>
                                {departments.map((department) => (
                                    <MenuItem key={department.id} value={department.name}>
                                        {department.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                select
                                label="Member status"
                                value={filters.status}
                                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                            >
                                <MenuItem value="all">All statuses</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                                <MenuItem value="pending_signup">Pending signup</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>

                    <Paper sx={{ overflow: "hidden", borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Member</TableCell>
                                    <TableCell>Department</TableCell>
                                    <TableCell>Employment</TableCell>
                                    <TableCell>Access</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loadingMembers ? (
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                                                Loading members...
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : null}
                                {members.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar sx={{ width: 40, height: 40 }}>
                                                    {getMemberInitials(member)}
                                                </Avatar>
                                                <Stack spacing={0.3}>
                                                    <Typography sx={{ fontWeight: 700 }}>{member.full_name}</Typography>
                                                    <Typography variant="body2" color="text.secondary">{member.email}</Typography>
                                                    <Typography variant="body2" color="text.secondary">{member.phone}</Typography>
                                                </Stack>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{member.department}</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                variant="outlined"
                                                label={member.employment_type.charAt(0).toUpperCase() + member.employment_type.slice(1)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Stack spacing={0.6}>
                                                {getAccessChip(member)}
                                                <Typography variant="caption" color="text.secondary">
                                                    {member.auth_user_id ? "Auth account linked" : "Provision login from edit"}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{getStatusChip(member)}</TableCell>
                                        <TableCell>{formatDate(member.created_at)}</TableCell>
                                        <TableCell align="right">
                                            <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="flex-end">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<EditRoundedIcon />}
                                                    onClick={() => openEditDialog(member)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant={member.status === "active" ? "text" : "contained"}
                                                    color={member.status === "active" ? "inherit" : "primary"}
                                                    onClick={() => handleStatusToggle(member)}
                                                >
                                                    {member.status === "pending_signup" || !member.auth_user_id
                                                        ? "Provision login"
                                                        : member.status === "inactive"
                                                            ? "Activate"
                                                            : "Deactivate"}
                                                </Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!loadingMembers && !members.length ? (
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                                                No members match the current filters.
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : null}
                            </TableBody>
                        </Table>
                    </Paper>
                </Stack>
            </Paper>

            <Dialog
                open={memberDialogOpen}
                onClose={closeMemberDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ pr: 7 }}>
                    {dialogMode === "create" ? "Add member" : "Edit member"}
                    <IconButton
                        onClick={closeMemberDialog}
                        disabled={savingMember}
                        sx={{ position: "absolute", right: 12, top: 12 }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={1.75} sx={{ pt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                            {dialogMode === "create"
                                ? "Register a new member profile and provision a login with a one-time password so the member can access Fund-Me immediately."
                                : "Update the member record, keep department and contact data clean, and provision login access when needed."}
                        </Typography>
                        {dialogMode === "edit" && selectedMember && !selectedMember.auth_user_id ? (
                            <Alert severity="info">
                                This member does not have a login yet. Set a temporary password below if you want to activate access now.
                            </Alert>
                        ) : null}
                        <TextField label="Full name" value={draft.full_name} onChange={(event) => setDraft((current) => ({ ...current, full_name: event.target.value }))} />
                        <TextField
                            select
                            label="Department"
                            value={draft.department}
                            onChange={(event) => setDraft((current) => ({ ...current, department: event.target.value }))}
                            helperText={departments.length ? "Choose from the admin-managed department list." : "Admin must first create an active department in Settings."}
                        >
                            {departments.map((department) => (
                                <MenuItem key={department.id} value={department.name}>
                                    {department.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Phone" value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} />
                        <TextField label="Email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} />
                        <TextField
                            select
                            label="Employment type"
                            value={draft.employment_type}
                            onChange={(event) => setDraft((current) => ({ ...current, employment_type: event.target.value as MemberDraft["employment_type"] }))}
                        >
                            <MenuItem value="permanent">Permanent</MenuItem>
                            <MenuItem value="contract">Contract</MenuItem>
                            <MenuItem value="intern">Intern</MenuItem>
                        </TextField>
                        <TextField
                            select
                            label="Status"
                            value={draft.status}
                            onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as MemberDraft["status"] }))}
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                            {dialogMode === "edit" && !selectedMember?.auth_user_id ? (
                                <MenuItem value="pending_signup">Pending signup</MenuItem>
                            ) : null}
                        </TextField>
                        {dialogMode === "create" || !selectedMember?.auth_user_id ? (
                            <TextField
                                label="Temporary password"
                                type="password"
                                value={draft.temporary_password}
                                onChange={(event) => setDraft((current) => ({ ...current, temporary_password: event.target.value }))}
                                helperText={
                                    dialogMode === "create"
                                        ? "Share this one-time password securely with the member. They can sign in immediately."
                                        : "Optional while editing. Required only if you want to provision login access for this pending member."
                                }
                            />
                        ) : null}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={closeMemberDialog} disabled={savingMember}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={savingMember || !canSaveMember}
                        onClick={handleSaveMember}
                    >
                        {savingMember
                            ? "Saving..."
                            : dialogMode === "create"
                                ? "Create member"
                                : "Save changes"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
