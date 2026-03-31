import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { useAuth } from "../auth/AuthContext";
import { api, getApiErrorMessage } from "../lib/api";
import { endpoints } from "../lib/endpoints";
import { brandColors, darkThemeColors } from "../theme/colors";

function formatLabel(value: string | undefined) {
    if (!value) {
        return "Not set";
    }

    return value
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function InfoRow({
    icon,
    label,
    value,
    helper
}: {
    icon: ReactNode;
    label: string;
    value: string;
    helper?: string;
}) {
    const theme = useTheme();
    const isWarmDark = theme.palette.mode === "dark";
    return (
        <Box
            sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: `1px solid ${isWarmDark ? alpha(brandColors.warning, 0.22) : brandColors.neutral.border}`,
                backgroundColor: isWarmDark ? alpha(brandColors.warning, 0.08) : alpha(brandColors.primary[100], 0.34)
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Avatar
                    variant="rounded"
                    sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(isWarmDark ? brandColors.warning : brandColors.primary[500], 0.12),
                        color: isWarmDark ? "#FCD34D" : brandColors.primary[700]
                    }}
                >
                    {icon}
                </Avatar>
                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", letterSpacing: 0.45, textTransform: "uppercase" }}
                    >
                        {label}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {value}
                    </Typography>
                    {helper ? (
                        <Typography variant="body2" color="text.secondary">
                            {helper}
                        </Typography>
                    ) : null}
                </Stack>
            </Stack>
        </Box>
    );
}

export function ProfilePage() {
    const theme = useTheme();
    const { user, refreshProfile } = useAuth();
    const [editableFullName, setEditableFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        setEditableFullName(user?.member?.full_name || "");
        setPhone(user?.member?.phone || "");
    }, [user?.member?.full_name, user?.member?.phone]);

    const member = user?.member;
    const fullName = member?.full_name || "Member";
    const department = member?.department || "Unassigned";
    const employmentType = formatLabel(member?.employment_type);
    const memberStatus = formatLabel(member?.status);
    const initials =
        fullName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("") || "M";
    const hasChanges =
        phone.trim() !== (member?.phone || "").trim() ||
        editableFullName.trim() !== (member?.full_name || "").trim();
    const isWarmDark = theme.palette.mode === "dark";

    return (
        <Stack spacing={3}>
            <Paper
                sx={{
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 2,
                    border: `1px solid ${isWarmDark ? alpha(brandColors.warning, 0.24) : alpha(brandColors.primary[300], 0.22)}`,
                    background: isWarmDark
                        ? `linear-gradient(180deg, ${alpha(darkThemeColors.paper, 0.98)} 0%, ${alpha("#111827", 0.98)} 100%)`
                        : `linear-gradient(180deg, ${alpha(brandColors.primary[100], 0.42)} 0%, #FFFFFF 100%)`
                }}
            >
                <Grid container spacing={2.5} alignItems="stretch">
                    <Grid size={{ xs: 12, lg: 7 }}>
                        <Stack spacing={1.5}>
                            <Typography
                                variant="overline"
                                sx={{ color: isWarmDark ? "#FDE68A" : brandColors.primary[700], letterSpacing: 2.2, fontWeight: 700 }}
                            >
                                Profile control panel
                            </Typography>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar
                                    sx={{
                                        width: 58,
                                        height: 58,
                                        bgcolor: alpha(isWarmDark ? brandColors.warning : brandColors.primary[500], 0.14),
                                        color: isWarmDark ? "#FDE68A" : brandColors.primary[900],
                                        fontWeight: 800,
                                        fontSize: 22
                                    }}
                                >
                                    {initials}
                                </Avatar>
                                <Stack spacing={0.25}>
                                    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                                        {fullName}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Keep your name and payment phone number accurate so contribution prompts reach you without delays.
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                <Chip
                                    label={`Department: ${department}`}
                                    sx={{
                                        bgcolor: isWarmDark ? alpha(brandColors.warning, 0.08) : alpha(brandColors.primary[100], 0.9),
                                        border: `1px solid ${isWarmDark ? alpha(brandColors.warning, 0.24) : alpha(brandColors.primary[300], 0.3)}`,
                                        color: isWarmDark ? "#FDE68A" : "inherit"
                                    }}
                                />
                                <Chip
                                    label={`Employment: ${employmentType}`}
                                    sx={{
                                        bgcolor: isWarmDark ? alpha(brandColors.warning, 0.08) : alpha(brandColors.primary[100], 0.9),
                                        border: `1px solid ${isWarmDark ? alpha(brandColors.warning, 0.24) : alpha(brandColors.primary[300], 0.3)}`,
                                        color: isWarmDark ? "#FDE68A" : "inherit"
                                    }}
                                />
                                <Chip
                                    icon={<CheckCircleRoundedIcon />}
                                    label={memberStatus}
                                    sx={{
                                        bgcolor: alpha(brandColors.success, 0.1),
                                        color: brandColors.success,
                                        border: `1px solid ${alpha(brandColors.success, 0.18)}`,
                                        "& .MuiChip-icon": { color: brandColors.success }
                                    }}
                                />
                            </Stack>
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 5 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                height: "100%",
                                p: 2,
                                borderRadius: 2,
                                border: `1px solid ${isWarmDark ? alpha(brandColors.warning, 0.22) : alpha(brandColors.primary[300], 0.18)}`,
                                background: isWarmDark
                                    ? `linear-gradient(135deg, ${alpha(darkThemeColors.paper, 0.9)} 0%, ${alpha(brandColors.warning, 0.08)} 100%)`
                                    : `linear-gradient(135deg, ${alpha(brandColors.primary[500], 0.08)} 0%, ${alpha(brandColors.accent[100], 0.55)} 100%)`
                            }}
                        >
                            <Stack spacing={1.5}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                    What you can manage here
                                </Typography>
                                <Stack spacing={1.25}>
                                    <InfoRow
                                        icon={<PersonRoundedIcon fontSize="small" />}
                                        label="Editable"
                                        value="Full name"
                                        helper="Shown on your member profile and contribution records."
                                    />
                                    <InfoRow
                                        icon={<PhoneIphoneRoundedIcon fontSize="small" />}
                                        label="Editable"
                                        value="Payment phone"
                                        helper="Used for Snippe mobile money approval requests."
                                    />
                                    <InfoRow
                                        icon={<ShieldRoundedIcon fontSize="small" />}
                                        label="Protected"
                                        value="Email and eligibility fields"
                                        helper="Managed separately to protect sign-in and contribution rules."
                                    />
                                </Stack>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>

            {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}
            {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
                        <Stack spacing={2.25}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Avatar
                                    variant="rounded"
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        bgcolor: alpha(brandColors.primary[500], 0.12),
                                        color: brandColors.primary[700]
                                    }}
                                >
                                    <PhoneIphoneRoundedIcon />
                                </Avatar>
                                <Stack spacing={0.25}>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                        Profile basics
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Update the member name shown in Fund-Me and the phone number used for mobile money prompts.
                                    </Typography>
                                </Stack>
                            </Stack>

                            <Alert
                                severity="info"
                                icon={<InfoOutlinedIcon fontSize="inherit" />}
                                sx={{
                                    borderRadius: 1.5,
                                    border: `1px solid ${alpha(brandColors.info, 0.16)}`
                                }}
                            >
                                Email remains locked to protect sign-in and account security. Only your display name and payment phone number can be changed here.
                            </Alert>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Full name"
                                        fullWidth
                                        value={editableFullName}
                                        onChange={(event) => setEditableFullName(event.target.value)}
                                        helperText="Shown on your member profile and contribution records."
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Phone number"
                                        fullWidth
                                        value={phone}
                                        onChange={(event) => setPhone(event.target.value)}
                                        placeholder="+2557XXXXXXXX"
                                        helperText="Used for mobile money contribution prompts."
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Email address"
                                        fullWidth
                                        value={member?.email || ""}
                                        InputProps={{ readOnly: true }}
                                        helperText="Locked because it is tied to your sign-in account."
                                    />
                                </Grid>
                            </Grid>

                            <Divider />

                            <Stack
                                direction={{ xs: "column", md: "row" }}
                                spacing={2}
                                justifyContent="space-between"
                                alignItems={{ xs: "stretch", md: "center" }}
                            >
                                <Stack spacing={0.5}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                        Save only when something changed
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Department, employment type, member status, and account email are managed separately from this screen.
                                    </Typography>
                                </Stack>
                                <Button
                                    variant="contained"
                                    startIcon={<SaveRoundedIcon />}
                                    disabled={saving || !phone.trim() || !editableFullName.trim() || !hasChanges}
                                    onClick={async () => {
                                        try {
                                            setSaving(true);
                                            setErrorMessage("");
                                            setSuccessMessage("");
                                            await api.patch(endpoints.memberSelfProfile, {
                                                full_name: editableFullName,
                                                phone
                                            });
                                            await refreshProfile();
                                            setSuccessMessage("Profile updated successfully.");
                                        } catch (error) {
                                            setErrorMessage(getApiErrorMessage(error, "Unable to update your profile."));
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                    sx={{ minWidth: { xs: "100%", md: 220 } }}
                                >
                                    {saving ? "Saving..." : "Save contact changes"}
                                </Button>
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, lg: 5 }}>
                    <Stack spacing={2}>
                        <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
                            <Stack spacing={1.75}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Avatar
                                        variant="rounded"
                                        sx={{
                                            width: 42,
                                            height: 42,
                                            bgcolor: alpha(brandColors.primary[500], 0.12),
                                            color: brandColors.primary[700]
                                        }}
                                    >
                                        <BadgeRoundedIcon />
                                    </Avatar>
                                    <Stack spacing={0.25}>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                            Member record
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Identity and eligibility fields controlled by the registry.
                                        </Typography>
                                    </Stack>
                                </Stack>

                                <InfoRow
                                    icon={<PersonRoundedIcon fontSize="small" />}
                                    label="Full name"
                                    value={fullName}
                                    helper="Current name on your registry record."
                                />
                                <InfoRow
                                    icon={<ApartmentRoundedIcon fontSize="small" />}
                                    label="Department"
                                    value={department}
                                />
                                <InfoRow
                                    icon={<ShieldRoundedIcon fontSize="small" />}
                                    label="Employment type"
                                    value={employmentType}
                                />
                                <InfoRow
                                    icon={<CheckCircleRoundedIcon fontSize="small" />}
                                    label="Member status"
                                    value={memberStatus}
                                    helper="Shows whether your account is eligible to participate in contribution events."
                                />
                            </Stack>
                        </Paper>

                        <Paper
                            sx={{
                                p: { xs: 2, md: 2.5 },
                                borderRadius: 2,
                                background: `linear-gradient(180deg, ${alpha(brandColors.accent[100], 0.44)} 0%, ${alpha("#FFFFFF", 0.98)} 100%)`
                            }}
                        >
                            <Stack spacing={1.5}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Avatar
                                        variant="rounded"
                                        sx={{
                                            width: 42,
                                            height: 42,
                                            bgcolor: alpha(brandColors.info, 0.12),
                                            color: brandColors.info
                                        }}
                                    >
                                        <InfoOutlinedIcon />
                                    </Avatar>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                        Update guidance
                                    </Typography>
                                </Stack>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                        Phone drives payment prompts
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Snippe mobile money approval requests are pushed to the number saved on this profile.
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                        Email anchors account access
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        This email remains read-only because it is tied to sign-in and account security.
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                        Managed fields stay protected
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        If your department or employment type is wrong, contact the Fund Manager instead of editing it locally.
                                    </Typography>
                                </Box>
                                <Divider />
                                <Stack direction="row" spacing={1.25} alignItems="center">
                                    <AlternateEmailRoundedIcon color="primary" fontSize="small" />
                                    <Typography variant="body2" color="text.secondary">
                                        Account email: <strong>{member?.email || "Not set"}</strong>
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </Stack>
    );
}
