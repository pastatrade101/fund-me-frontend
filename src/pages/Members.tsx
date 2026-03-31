import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import VpnKeyRoundedIcon from "@mui/icons-material/VpnKeyRounded";
import { Alert, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, LinearProgress, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

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

type BulkMemberUploadRow = {
    full_name: string;
    department: string;
    phone: string;
    email: string;
    employment_type: "permanent" | "contract" | "intern";
    status: "active" | "inactive";
    temporary_password: string;
    source_row_number: number;
};

type BulkMemberUploadFailure = {
    source_row_number: number;
    full_name: string;
    email: string;
    reason: string;
};

type BulkMemberUploadSuccess = BulkMemberUploadRow & {
    member_id: string;
};

type BulkMemberUploadResult = {
    successes: BulkMemberUploadSuccess[];
    failures: BulkMemberUploadFailure[];
};

const csvTemplate = [
    "full_name,department,phone,email,employment_type,status",
    "Jane Doe,Finance,0712345678,jane.doe@example.com,permanent,active",
    "John Smith,HR,0756789123,john.smith@example.com,contract,inactive"
].join("\n");

const csvHeaderAliases: Record<string, string> = {
    full_name: "full_name",
    fullname: "full_name",
    name: "full_name",
    department: "department",
    phone: "phone",
    phone_number: "phone",
    email: "email",
    employment_type: "employment_type",
    employment: "employment_type",
    status: "status"
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

function normalizeCsvHeader(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

function parseCsv(text: string) {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentValue = "";
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
        const character = text[index];
        const nextCharacter = text[index + 1];

        if (character === "\"") {
            if (inQuotes && nextCharacter === "\"") {
                currentValue += "\"";
                index += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (character === "," && !inQuotes) {
            currentRow.push(currentValue.trim());
            currentValue = "";
            continue;
        }

        if ((character === "\n" || character === "\r") && !inQuotes) {
            if (character === "\r" && nextCharacter === "\n") {
                index += 1;
            }

            currentRow.push(currentValue.trim());
            if (currentRow.some((value) => value !== "")) {
                rows.push(currentRow);
            }
            currentRow = [];
            currentValue = "";
            continue;
        }

        currentValue += character;
    }

    currentRow.push(currentValue.trim());
    if (currentRow.some((value) => value !== "")) {
        rows.push(currentRow);
    }

    return rows;
}

function generateTemporaryPassword() {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const numbers = "23456789";
    const symbols = "@#$%";
    const all = `${upper}${lower}${numbers}${symbols}`;
    const password = [
        upper[Math.floor(Math.random() * upper.length)],
        lower[Math.floor(Math.random() * lower.length)],
        numbers[Math.floor(Math.random() * numbers.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
    ];

    while (password.length < 12) {
        password.push(all[Math.floor(Math.random() * all.length)]);
    }

    for (let index = password.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [password[index], password[swapIndex]] = [password[swapIndex], password[index]];
    }

    return password.join("");
}

function parseBulkMembersCsv(text: string, departments: Department[]) {
    const departmentLookup = new Map(
        departments.map((department) => [department.name.trim().toLowerCase(), department.name])
    );
    const rows = parseCsv(text);
    const errors: string[] = [];

    if (rows.length < 2) {
        return {
            rows: [] as BulkMemberUploadRow[],
            errors: ["CSV must include a header row and at least one member row."]
        };
    }

    const headerRow = rows[0].map((header) => csvHeaderAliases[normalizeCsvHeader(header)] || normalizeCsvHeader(header));
    const headerIndex = new Map<string, number>();

    headerRow.forEach((header, index) => {
        if (header) {
            headerIndex.set(header, index);
        }
    });

    for (const requiredHeader of ["full_name", "department", "phone", "email"]) {
        if (!headerIndex.has(requiredHeader)) {
            errors.push(`Missing required CSV column: ${requiredHeader}`);
        }
    }

    if (errors.length) {
        return { rows: [] as BulkMemberUploadRow[], errors };
    }

    const seenEmails = new Set<string>();
    const seenPhones = new Set<string>();
    const parsedRows: BulkMemberUploadRow[] = [];

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
        const row = rows[rowIndex];
        const sourceRowNumber = rowIndex + 1;
        const getValue = (header: string) => row[headerIndex.get(header) ?? -1]?.trim() || "";

        const fullName = getValue("full_name");
        const departmentValue = getValue("department");
        const phone = getValue("phone");
        const email = getValue("email").toLowerCase();
        const employmentType = (getValue("employment_type") || "permanent").toLowerCase();
        const status = (getValue("status") || "active").toLowerCase();
        const rowErrors: string[] = [];

        if (!fullName) {
            rowErrors.push("full_name is required");
        }

        if (!departmentValue) {
            rowErrors.push("department is required");
        }

        if (!phone) {
            rowErrors.push("phone is required");
        }

        if (!email) {
            rowErrors.push("email is required");
        }

        const canonicalDepartment = departmentLookup.get(departmentValue.toLowerCase());
        if (departmentValue && !canonicalDepartment) {
            rowErrors.push(`department '${departmentValue}' is not an active department`);
        }

        if (!["permanent", "contract", "intern"].includes(employmentType)) {
            rowErrors.push(`employment_type '${employmentType}' is invalid`);
        }

        if (!["active", "inactive"].includes(status)) {
            rowErrors.push(`status '${status}' is invalid`);
        }

        if (email) {
            if (seenEmails.has(email)) {
                rowErrors.push(`email '${email}' is duplicated in the file`);
            }
            seenEmails.add(email);
        }

        const normalizedPhone = phone.replace(/\s+/g, "");
        if (normalizedPhone) {
            if (seenPhones.has(normalizedPhone)) {
                rowErrors.push(`phone '${phone}' is duplicated in the file`);
            }
            seenPhones.add(normalizedPhone);
        }

        if (rowErrors.length) {
            errors.push(`Row ${sourceRowNumber}: ${rowErrors.join(", ")}`);
            continue;
        }

        parsedRows.push({
            full_name: fullName,
            department: canonicalDepartment || departmentValue,
            phone,
            email,
            employment_type: employmentType as BulkMemberUploadRow["employment_type"],
            status: status as BulkMemberUploadRow["status"],
            temporary_password: generateTemporaryPassword(),
            source_row_number: sourceRowNumber
        });
    }

    return { rows: parsedRows, errors };
}

async function copyText(value: string) {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
}

export function MembersPage() {
    const bulkFileInputRef = useRef<HTMLInputElement | null>(null);
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
    const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false);
    const [bulkUploadFileName, setBulkUploadFileName] = useState("");
    const [bulkUploadRows, setBulkUploadRows] = useState<BulkMemberUploadRow[]>([]);
    const [bulkUploadError, setBulkUploadError] = useState("");
    const [bulkUploading, setBulkUploading] = useState(false);
    const [bulkUploadResults, setBulkUploadResults] = useState<BulkMemberUploadResult | null>(null);
    const [bulkUploadResultsOpen, setBulkUploadResultsOpen] = useState(false);
    const [bulkCopyMessage, setBulkCopyMessage] = useState("");
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

    const resetBulkUploadState = () => {
        setBulkUploadFileName("");
        setBulkUploadRows([]);
        setBulkUploadError("");
        setBulkUploading(false);
        if (bulkFileInputRef.current) {
            bulkFileInputRef.current.value = "";
        }
    };

    const openBulkUploadPicker = () => {
        setBulkCopyMessage("");
        bulkFileInputRef.current?.click();
    };

    const closeBulkUploadDialog = () => {
        if (bulkUploading) {
            return;
        }

        setBulkUploadDialogOpen(false);
        resetBulkUploadState();
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

    const handleCsvFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        try {
            const text = await file.text();
            const parsed = parseBulkMembersCsv(text, departments);

            setBulkUploadFileName(file.name);
            setBulkUploadRows(parsed.rows);
            setBulkUploadError(parsed.errors.join("\n"));
            setBulkUploadDialogOpen(true);
        } catch (error) {
            setBulkUploadFileName(file.name);
            setBulkUploadRows([]);
            setBulkUploadError(getApiErrorMessage(error, "Unable to read the CSV file."));
            setBulkUploadDialogOpen(true);
        }
    };

    const handleDownloadCsvTemplate = () => {
        const blob = new Blob([csvTemplate], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "fund-me-members-template.csv";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    };

    const handleBulkUpload = async () => {
        try {
            setBulkUploading(true);
            setErrorMessage("");
            setBulkCopyMessage("");

            const successes: BulkMemberUploadSuccess[] = [];
            const failures: BulkMemberUploadFailure[] = [];

            for (const row of bulkUploadRows) {
                try {
                    const response = await api.post(endpoints.members, {
                        full_name: row.full_name,
                        department: row.department,
                        phone: row.phone,
                        email: row.email,
                        employment_type: row.employment_type,
                        status: row.status,
                        temporary_password: row.temporary_password
                    });

                    successes.push({
                        ...row,
                        member_id: response.data.data.id
                    });
                } catch (error) {
                    failures.push({
                        source_row_number: row.source_row_number,
                        full_name: row.full_name,
                        email: row.email,
                        reason: getApiErrorMessage(error, "Unable to create member.")
                    });
                }
            }

            if (successes.length) {
                await loadMembers();
            }

            setBulkUploadResults({ successes, failures });
            setBulkUploadResultsOpen(true);
            setBulkUploadDialogOpen(false);
            resetBulkUploadState();
        } finally {
            setBulkUploading(false);
        }
    };

    const handleCopyCredentialRow = async (row: BulkMemberUploadSuccess) => {
        await copyText(
            [
                `Full name: ${row.full_name}`,
                `Email: ${row.email}`,
                `Department: ${row.department}`,
                `Temporary password: ${row.temporary_password}`
            ].join("\n")
        );
        setBulkCopyMessage(`Copied credentials for ${row.full_name}.`);
    };

    const handleCopyAllCredentials = async () => {
        if (!bulkUploadResults?.successes.length) {
            return;
        }

        await copyText(
            bulkUploadResults.successes
                .map((row) => `${row.full_name},${row.email},${row.department},${row.temporary_password}`)
                .join("\n")
        );
        setBulkCopyMessage("Copied all generated member credentials.");
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
            <input
                ref={bulkFileInputRef}
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={handleCsvFileSelected}
            />

            <PageHero
                eyebrow="Member management"
                title="Register employees once and let Fund-Me drive eligibility from clean staff data."
                description="Fund Managers maintain the member registry, keep employment data clean, and let policy rules determine contribution eligibility automatically."
                tone="surface"
                actions={
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                        <Button variant="outlined" startIcon={<UploadFileRoundedIcon />} onClick={openBulkUploadPicker} disabled={!departments.length}>
                            Upload CSV
                        </Button>
                        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreateDialog} disabled={!departments.length}>
                            New member
                        </Button>
                    </Stack>
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
                open={bulkUploadDialogOpen}
                onClose={closeBulkUploadDialog}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle sx={{ pr: 7 }}>
                    Bulk upload members
                    <IconButton
                        onClick={closeBulkUploadDialog}
                        disabled={bulkUploading}
                        sx={{ position: "absolute", right: 12, top: 12 }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2}>
                        <Alert severity="info">
                            Upload a CSV with <strong>full_name</strong>, <strong>department</strong>, <strong>phone</strong>,
                            and <strong>email</strong>. Optional columns: <strong>employment_type</strong> and <strong>status</strong>.
                            A temporary password will be generated automatically for each valid row.
                        </Alert>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                            <Button variant="outlined" startIcon={<FileDownloadRoundedIcon />} onClick={handleDownloadCsvTemplate}>
                                Download template
                            </Button>
                            <Button variant="outlined" startIcon={<UploadFileRoundedIcon />} onClick={openBulkUploadPicker}>
                                Choose another CSV
                            </Button>
                        </Stack>

                        {bulkUploadFileName ? (
                            <Typography variant="body2" color="text.secondary">
                                Selected file: <strong>{bulkUploadFileName}</strong>
                            </Typography>
                        ) : null}

                        {bulkUploadError ? (
                            <Alert severity="warning" sx={{ whiteSpace: "pre-line" }}>
                                {bulkUploadError}
                            </Alert>
                        ) : null}

                        {bulkUploadRows.length ? (
                            <>
                                <Alert severity="success">
                                    {bulkUploadRows.length} member row{bulkUploadRows.length === 1 ? "" : "s"} validated and ready to import.
                                </Alert>
                                <Paper sx={{ overflow: "hidden", borderRadius: 2 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Row</TableCell>
                                                <TableCell>Full name</TableCell>
                                                <TableCell>Department</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>Employment</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {bulkUploadRows.slice(0, 6).map((row) => (
                                                <TableRow key={`${row.email}-${row.source_row_number}`}>
                                                    <TableCell>{row.source_row_number}</TableCell>
                                                    <TableCell>{row.full_name}</TableCell>
                                                    <TableCell>{row.department}</TableCell>
                                                    <TableCell>{row.email}</TableCell>
                                                    <TableCell>{row.employment_type}</TableCell>
                                                    <TableCell>{row.status}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Paper>
                                {bulkUploadRows.length > 6 ? (
                                    <Typography variant="caption" color="text.secondary">
                                        Previewing the first 6 rows only.
                                    </Typography>
                                ) : null}
                            </>
                        ) : null}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={closeBulkUploadDialog} disabled={bulkUploading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={bulkUploading || !bulkUploadRows.length || Boolean(bulkUploadError)}
                        onClick={handleBulkUpload}
                    >
                        {bulkUploading ? "Creating members..." : `Create ${bulkUploadRows.length || ""} members`.trim()}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={bulkUploadResultsOpen}
                onClose={() => setBulkUploadResultsOpen(false)}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle sx={{ pr: 7 }}>
                    Bulk upload results
                    <IconButton
                        onClick={() => setBulkUploadResultsOpen(false)}
                        sx={{ position: "absolute", right: 12, top: 12 }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2}>
                        {bulkCopyMessage ? <Alert severity="success">{bulkCopyMessage}</Alert> : null}
                        {bulkUploadResults ? (
                            <>
                                <Alert severity={bulkUploadResults.failures.length ? "warning" : "success"}>
                                    {bulkUploadResults.successes.length} member{bulkUploadResults.successes.length === 1 ? "" : "s"} created.
                                    {bulkUploadResults.failures.length
                                        ? ` ${bulkUploadResults.failures.length} row${bulkUploadResults.failures.length === 1 ? "" : "s"} failed.`
                                        : " All rows imported successfully."}
                                </Alert>

                                {bulkUploadResults.successes.length ? (
                                    <Paper sx={{ overflow: "hidden", borderRadius: 2 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Member</TableCell>
                                                    <TableCell>Email</TableCell>
                                                    <TableCell>Department</TableCell>
                                                    <TableCell>Temp password</TableCell>
                                                    <TableCell align="right">Copy</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {bulkUploadResults.successes.map((row) => (
                                                    <TableRow key={row.member_id}>
                                                        <TableCell>{row.full_name}</TableCell>
                                                        <TableCell>{row.email}</TableCell>
                                                        <TableCell>{row.department}</TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}>
                                                                {row.temporary_password}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                startIcon={<ContentCopyRoundedIcon />}
                                                                onClick={() => handleCopyCredentialRow(row)}
                                                            >
                                                                Copy
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Paper>
                                ) : null}

                                {bulkUploadResults.failures.length ? (
                                    <Paper sx={{ overflow: "hidden", borderRadius: 2 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Row</TableCell>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Email</TableCell>
                                                    <TableCell>Reason</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {bulkUploadResults.failures.map((row) => (
                                                    <TableRow key={`${row.source_row_number}-${row.email}`}>
                                                        <TableCell>{row.source_row_number}</TableCell>
                                                        <TableCell>{row.full_name || "Unknown"}</TableCell>
                                                        <TableCell>{row.email || "Unknown"}</TableCell>
                                                        <TableCell>{row.reason}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Paper>
                                ) : null}
                            </>
                        ) : null}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setBulkUploadResultsOpen(false)}>
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<ContentCopyRoundedIcon />}
                        disabled={!bulkUploadResults?.successes.length}
                        onClick={handleCopyAllCredentials}
                    >
                        Copy all credentials
                    </Button>
                </DialogActions>
            </Dialog>

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
