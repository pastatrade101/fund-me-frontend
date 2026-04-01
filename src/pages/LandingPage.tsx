import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import Diversity3RoundedIcon from "@mui/icons-material/Diversity3Rounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import SparkleRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import {
    alpha,
    Box,
    Button,
    Chip,
    Container,
    Divider,
    Drawer,
    IconButton,
    Paper,
    Stack,
    Switch,
    Typography,
    type SxProps,
    type Theme
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { AnimatedSection, GradientButton, HeroCard } from "../components/ui";
import { brandColors } from "../theme/colors";
import { useUI } from "../ui/UIProvider";

const sectionItems = [
    { label: "Why Fund-Me", id: "problem" },
    { label: "Platform", id: "solution" },
    { label: "Features", id: "features" },
    { label: "Pricing", id: "pricing" }
] as const;

const problemCards = [
    {
        title: "Managers spend days following up",
        body: "Collections often depend on manual reminders, screenshots, and repeated calls to confirm who has already paid."
    },
    {
        title: "Amounts become inconsistent fast",
        body: "Different people track different figures, making it hard to confirm the true event balance or who still owes."
    },
    {
        title: "Records are weak after the event",
        body: "When the collection closes, finance and leadership are left with incomplete history and poor accountability."
    },
    {
        title: "Members do not trust the process",
        body: "Without a visible ledger, staff can feel unsure about fairness, transparency, and where the money actually went."
    }
] as const;

const solutionHighlights = [
    "Create contribution events for funerals, weddings, emergencies, celebrations, and staff support initiatives.",
    "Trigger mobile money payment requests that members approve directly on their phones.",
    "Keep a transparent ledger of paid, pending, partial, and outstanding contributions.",
    "Monitor live contribution status, payment fees, and event balances from one manager workspace."
] as const;

const featureCards = [
    {
        icon: SparkleRoundedIcon,
        title: "Contribution Events",
        body: "Create and manage structured workplace support events with clear rules, deadlines, and contribution expectations."
    },
    {
        icon: Groups2RoundedIcon,
        title: "Member Contribution Tracking",
        body: "Know exactly who has paid, who is pending, and which contributions still need action."
    },
    {
        icon: PhoneIphoneRoundedIcon,
        title: "Mobile Money Payments",
        body: "Members approve contribution requests on their phones with a familiar mobile money flow."
    },
    {
        icon: ReceiptLongRoundedIcon,
        title: "Transparent Contribution Ledger",
        body: "Every contribution is recorded, visible, and easy to reconcile when questions come up."
    },
    {
        icon: InsightsRoundedIcon,
        title: "Manager Dashboard",
        body: "Fund managers see collections, event finance, contribution status, and progress in real time."
    }
] as const;

const workflowSteps = [
    {
        step: "Step 1",
        title: "Manager creates an event",
        body: "Set the event, contribution policy, deadline, and target support amount from one workspace."
    },
    {
        step: "Step 2",
        title: "Members receive a request",
        body: "Each eligible member gets a structured contribution request tied to the event."
    },
    {
        step: "Step 3",
        title: "Members approve on phone",
        body: "The payment request is approved through mobile money instead of manual transfer follow-ups."
    },
    {
        step: "Step 4",
        title: "Ledger updates automatically",
        body: "The event ledger, paid status, and finance view update once the payment confirms."
    }
] as const;

const trustPoints = [
    "Visible contribution records for every event",
    "Transparent collection totals and member status",
    "Fair contribution management with clear policies",
    "Accountability for managers, members, and finance teams"
] as const;

const targetUsers = [
    {
        icon: BusinessCenterRoundedIcon,
        title: "Corporate teams",
        body: "Run structured staff support collections without finance chaos."
    },
    {
        icon: ShieldRoundedIcon,
        title: "Government institutions",
        body: "Improve governance, record keeping, and contribution visibility."
    },
    {
        icon: HandshakeRoundedIcon,
        title: "NGOs",
        body: "Coordinate internal staff support fairly across departments and roles."
    },
    {
        icon: Diversity3RoundedIcon,
        title: "Departments",
        body: "Handle workplace solidarity events with cleaner communication and follow-through."
    },
    {
        icon: Groups2RoundedIcon,
        title: "Staff associations",
        body: "Track member participation and collection status from one source of truth."
    },
    {
        icon: AutoGraphRoundedIcon,
        title: "Workplace groups",
        body: "Support emergencies and celebrations with transparent contribution progress."
    }
] as const;

const pricingPoints = [
    "Small transparent platform fee per contribution",
    "Mobile money costs shown clearly before approval",
    "Event fund amount stays separated from processing costs",
    "No opaque reconciliation after the collection closes"
] as const;

const sectionTransition = {
    duration: 0.6,
    ease: [0.16, 1, 0.3, 1]
} as const;

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.06
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 22 },
    visible: {
        opacity: 1,
        y: 0,
        transition: sectionTransition
    }
};

const heroVisualContainerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.12
        }
    }
};

const heroVisualCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1]
        }
    }
};

function SectionIntro({
    eyebrow,
    title,
    body,
    align = "left"
}: {
    eyebrow: string;
    title: string;
    body: string;
    align?: "left" | "center";
}) {
    const theme = useTheme();
    const isLight = theme.palette.mode === "light";

    return (
        <Stack
            spacing={1.5}
            sx={{
                maxWidth: align === "center" ? 760 : 620,
                mx: align === "center" ? "auto" : 0,
                textAlign: align
            }}
        >
            <Chip
                label={eyebrow}
                color="primary"
                variant="outlined"
                sx={{
                    alignSelf: align === "center" ? "center" : "flex-start",
                    bgcolor: isLight ? alpha(brandColors.primary[100], 0.86) : alpha(theme.palette.primary.main, 0.12),
                    borderColor: alpha(theme.palette.primary.main, isLight ? 0.18 : 0.24),
                    color: isLight ? brandColors.primary[900] : theme.palette.primary.light,
                    fontWeight: 700
                }}
            />
            <Typography
                variant="h3"
                sx={{
                    fontWeight: 800,
                    letterSpacing: -1.4,
                    fontSize: { xs: "2rem", md: "3rem" },
                    lineHeight: 1.04
                }}
            >
                {title}
            </Typography>
            <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                    fontSize: { xs: "1rem", md: "1.08rem" },
                    lineHeight: 1.8
                }}
            >
                {body}
            </Typography>
        </Stack>
    );
}

function HeroVisual() {
    const theme = useTheme();
    const isLight = theme.palette.mode === "light";
    const mutedTrack = isLight ? alpha(brandColors.primary[100], 0.88) : alpha("#FFFFFF", 0.08);
    const softSurface = isLight ? alpha(brandColors.primary[100], 0.42) : alpha(theme.palette.primary.main, 0.08);
    const softBorder = isLight ? alpha(brandColors.primary[500], 0.1) : alpha(theme.palette.primary.main, 0.2);
    const progressGradient = isLight
        ? `linear-gradient(90deg, ${brandColors.primary[700]} 0%, ${brandColors.accent[500]} 100%)`
        : `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.light} 100%)`;

    return (
        <Box sx={{ position: "relative", width: "100%", maxWidth: "100%" }}>
            <Box
                sx={{
                    position: "absolute",
                    inset: { xs: 0, md: 6 },
                    borderRadius: theme.fundMe.radius.xl,
                    background: isLight
                        ? `
                            radial-gradient(circle at top right, ${alpha(brandColors.accent[300], 0.24)} 0%, transparent 30%),
                            radial-gradient(circle at bottom left, ${alpha(brandColors.primary[300], 0.18)} 0%, transparent 28%)
                        `
                        : `
                            radial-gradient(circle at top right, ${alpha(theme.palette.primary.light, 0.16)} 0%, transparent 30%),
                            radial-gradient(circle at bottom left, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 28%)
                        `,
                    pointerEvents: "none"
                }}
            />
            <motion.div initial="hidden" animate="visible" variants={heroVisualContainerVariants}>
                <Stack spacing={1.5} sx={{ position: "relative", zIndex: 1 }}>
                    <motion.div variants={heroVisualCardVariants}>
                        <HeroCard
                            eyebrow="Workplace support event"
                            title="Contribution progress"
                            badge="Active workflow"
                        >
                            <Stack spacing={1.8}>
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                        gap: 1.25
                                    }}
                                >
                                    {[
                                        { label: "Event setup", value: "Configured" },
                                        { label: "Payment flow", value: "Enabled" },
                                        { label: "Tracking", value: "Live" }
                                    ].map((item) => (
                                        <Paper
                                            key={item.label}
                                            sx={{
                                                p: 1.4,
                                                borderRadius: 2.5,
                                                bgcolor: softSurface,
                                                borderColor: softBorder
                                            }}
                                        >
                                            <Typography variant="overline" color="text.secondary">
                                                {item.label}
                                            </Typography>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                                {item.value}
                                            </Typography>
                                        </Paper>
                                    ))}
                                </Box>

                                <Stack spacing={0.85}>
                                    <Stack spacing={0.35}>
                                    <Typography variant="body2" color="text.secondary">
                                        Collection progress
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Requests and approvals move through one contribution workflow.
                                        </Typography>
                                    </Stack>
                                    <Box
                                        sx={{
                                            height: 10,
                                            borderRadius: 999,
                                            overflow: "hidden",
                                            bgcolor: mutedTrack
                                        }}
                                    >
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "76%" }}
                                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
                                            style={{
                                                height: "100%",
                                                borderRadius: 999,
                                                background: progressGradient
                                            }}
                                        />
                                    </Box>
                                </Stack>
                            </Stack>
                        </HeroCard>
                    </motion.div>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                            gap: 1.5,
                            alignItems: "stretch"
                        }}
                    >
                        <motion.div variants={heroVisualCardVariants} style={{ height: "100%" }}>
                            <HeroCard
                                eyebrow="Payment request"
                                title="Mobile payment request"
                                description="Waiting for approval"
                                icon={<PhoneIphoneRoundedIcon fontSize="small" />}
                                tone="dark"
                                sx={{ height: "100%" }}
                            >
                                <Stack spacing={1}>
                                    {[
                                        "Prompt sent",
                                        "Approval pending"
                                    ].map((item, index) => (
                                        <Stack key={item} direction="row" spacing={1} alignItems="center">
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: 999,
                                                    bgcolor: index === 0 ? alpha("#FFFFFF", 0.88) : alpha("#FFFFFF", 0.42)
                                                }}
                                            />
                                            <Typography variant="body2" sx={{ color: alpha("#FFFFFF", 0.74) }}>
                                                {item}
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </HeroCard>
                        </motion.div>

                        <motion.div variants={heroVisualCardVariants} style={{ height: "100%" }}>
                            <HeroCard
                                eyebrow="Payment tracking"
                                title="Live contribution tracking"
                                description="Automatic ledger update"
                                sx={{ height: "100%" }}
                            >
                                <Stack spacing={1.4}>
                                    <Stack spacing={1}>
                                        {[
                                            { label: "Payment status", width: "78%" },
                                            { label: "Contribution record", width: "66%" },
                                            { label: "Manager view", width: "72%" }
                                        ].map((item, index) => (
                                            <Stack key={item.label} spacing={0.55}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.label}
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 999,
                                                        overflow: "hidden",
                                                        bgcolor: mutedTrack
                                                    }}
                                                >
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: item.width }}
                                                        transition={{
                                                            duration: 0.6,
                                                            ease: [0.16, 1, 0.3, 1],
                                                            delay: 0.22 + (index * 0.08)
                                                        }}
                                                        style={{
                                                            height: "100%",
                                                            borderRadius: 999,
                                                            background: progressGradient
                                                        }}
                                                    />
                                                </Box>
                                            </Stack>
                                            ))}
                                    </Stack>
                                </Stack>
                            </HeroCard>
                        </motion.div>
                    </Box>
                </Stack>
            </motion.div>
        </Box>
    );
}

function HeroMeshBackground() {
    const theme = useTheme();
    const isLight = theme.palette.mode === "light";

    const blobs = [
        {
            top: "-10%",
            left: "-8%",
            size: "clamp(17.5rem, 28vw, 26rem)",
            gradient: `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.main, isLight ? 0.24 : 0.18)} 0%, ${alpha(theme.palette.primary.light, isLight ? 0.16 : 0.12)} 34%, transparent 72%)`,
            transition: { duration: 30, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" as const },
            animate: { x: [0, 24, -10, 0], y: [0, 18, -8, 0], scale: [1, 1.06, 0.98, 1] }
        },
        {
            top: "8%",
            right: "-6%",
            size: "clamp(16rem, 24vw, 23.75rem)",
            gradient: `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.secondary.main, isLight ? 0.2 : 0.16)} 0%, ${alpha(theme.palette.secondary.light, isLight ? 0.15 : 0.11)} 30%, transparent 74%)`,
            transition: { duration: 34, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" as const },
            animate: { x: [0, -20, 12, 0], y: [0, 12, -14, 0], scale: [1, 1.04, 0.97, 1] }
        },
        {
            bottom: "-18%",
            left: "34%",
            size: "clamp(16rem, 22vw, 22.5rem)",
            gradient: `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.light, isLight ? 0.18 : 0.14)} 0%, ${alpha(theme.palette.secondary.main, isLight ? 0.12 : 0.1)} 36%, transparent 74%)`,
            transition: { duration: 28, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" as const },
            animate: { x: [0, 18, -14, 0], y: [0, -16, 10, 0], scale: [1, 1.05, 0.96, 1] }
        }
    ];

    return (
        <Box
            sx={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                borderRadius: "inherit",
                pointerEvents: "none"
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background: `
                        linear-gradient(135deg, ${alpha(theme.palette.background.default, isLight ? 0.92 : 0.96)} 0%, ${alpha(theme.palette.primary.light, isLight ? 0.08 : 0.04)} 52%, ${alpha(theme.palette.secondary.light, isLight ? 0.06 : 0.03)} 100%)
                    `
                }}
            />

            {blobs.map((blob, index) => (
                <motion.div
                    key={index}
                    animate={blob.animate}
                    transition={blob.transition}
                    style={{
                        position: "absolute",
                        width: blob.size,
                        height: blob.size,
                        top: blob.top,
                        right: blob.right,
                        bottom: blob.bottom,
                        left: blob.left,
                        borderRadius: "999px",
                        background: blob.gradient,
                        filter: "blur(14px)",
                        transform: "translate3d(0, 0, 0)",
                        willChange: "transform"
                    }}
                />
            ))}

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background: `
                        linear-gradient(180deg, ${alpha(theme.palette.background.default, isLight ? 0.06 : 0.12)} 0%, transparent 24%, transparent 72%, ${alpha(theme.palette.background.default, isLight ? 0.18 : 0.24)} 100%),
                        linear-gradient(90deg, ${alpha(theme.palette.primary.light, isLight ? 0.05 : 0.03)} 0%, transparent 22%, transparent 78%, ${alpha(theme.palette.secondary.light, isLight ? 0.05 : 0.03)} 100%)
                    `
                }}
            />
        </Box>
    );
}

export function LandingPage() {
    const { session } = useAuth();
    const { toggleTheme } = useUI();
    const theme = useTheme();
    const isLight = theme.palette.mode === "light";
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const pageBackground = isLight
        ? `
            radial-gradient(circle at top left, ${alpha(brandColors.accent[300], 0.16)} 0%, transparent 26%),
            radial-gradient(circle at 85% 22%, ${alpha(brandColors.primary[300], 0.14)} 0%, transparent 22%),
            linear-gradient(180deg, #F7FBFF 0%, #F8FAFC 48%, #F2F7FF 100%)
        `
        : `
            radial-gradient(circle at top left, ${alpha(theme.palette.primary.light, 0.14)} 0%, transparent 28%),
            radial-gradient(circle at 82% 18%, ${alpha(theme.palette.primary.main, 0.16)} 0%, transparent 24%),
            linear-gradient(180deg, #07101F 0%, #081122 48%, #0A1630 100%)
        `;
    const chromeSurface = isLight ? alpha("#FFFFFF", 0.84) : alpha("#081122", 0.82);
    const sectionSurface = isLight ? alpha("#FFFFFF", 0.84) : alpha("#0E1730", 0.92);
    const accentSurface = isLight ? alpha(brandColors.primary[100], 0.62) : alpha(theme.palette.primary.main, 0.12);
    const subtleBorder = isLight ? alpha(brandColors.primary[500], 0.12) : alpha("#FFFFFF", 0.08);
    const softShadow = isLight ? "0 18px 44px rgba(15, 23, 42, 0.05)" : "0 18px 44px rgba(0, 0, 0, 0.22)";
    const strongShadow = isLight ? "0 22px 48px rgba(15, 23, 42, 0.06)" : "0 22px 48px rgba(0, 0, 0, 0.28)";
    const headerShadow = isLight ? "0 18px 42px rgba(15, 23, 42, 0.06)" : "0 18px 42px rgba(0, 0, 0, 0.28)";
    const darkAccentText = theme.palette.primary.light;
    const heroPrimaryTo = session ? "/dashboard" : "/signin";

    const buildSectionMesh = ({
        accentPosition,
        primaryPosition,
        lightBase,
        darkBase,
        accentStrength = 0.16,
        primaryStrength = 0.14
    }: {
        accentPosition: string;
        primaryPosition: string;
        lightBase: [string, string];
        darkBase: [string, string];
        accentStrength?: number;
        primaryStrength?: number;
    }): SxProps<Theme> => ({
        background: isLight
            ? `
                radial-gradient(circle at ${accentPosition}, ${alpha(brandColors.accent[300], accentStrength)} 0%, transparent 28%),
                radial-gradient(circle at ${primaryPosition}, ${alpha(brandColors.primary[300], primaryStrength)} 0%, transparent 24%),
                linear-gradient(180deg, ${lightBase[0]} 0%, ${lightBase[1]} 100%)
            `
            : `
                radial-gradient(circle at ${accentPosition}, ${alpha(theme.palette.primary.light, accentStrength * 0.72)} 0%, transparent 30%),
                radial-gradient(circle at ${primaryPosition}, ${alpha(theme.palette.primary.main, primaryStrength * 0.78)} 0%, transparent 26%),
                linear-gradient(180deg, ${darkBase[0]} 0%, ${darkBase[1]} 100%)
            `,
        "&::before": {
            content: "\"\"",
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: isLight
                ? `linear-gradient(135deg, ${alpha("#FFFFFF", 0.4)} 0%, transparent 32%, transparent 72%, ${alpha(brandColors.accent[100], 0.18)} 100%)`
                : `linear-gradient(135deg, ${alpha("#FFFFFF", 0.03)} 0%, transparent 34%, transparent 70%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`
        }
    });

    const problemSectionSx = buildSectionMesh({
        accentPosition: "14% 18%",
        primaryPosition: "88% 72%",
        lightBase: ["#F8FBFF", "#EEF6FF"],
        darkBase: ["#08111F", "#0A1630"]
    });

    const solutionSectionSx = buildSectionMesh({
        accentPosition: "84% 22%",
        primaryPosition: "16% 82%",
        lightBase: ["#F7FBFF", "#F3F8FF"],
        darkBase: ["#081425", "#0B1833"],
        accentStrength: 0.18,
        primaryStrength: 0.15
    });

    const featuresSectionSx = buildSectionMesh({
        accentPosition: "10% 36%",
        primaryPosition: "90% 16%",
        lightBase: ["#F9FCFF", "#F2F8FF"],
        darkBase: ["#081223", "#0B1730"],
        accentStrength: 0.17,
        primaryStrength: 0.15
    });

    const workflowSectionSx = buildSectionMesh({
        accentPosition: "88% 16%",
        primaryPosition: "12% 84%",
        lightBase: ["#F8FBFF", "#EDF6FF"],
        darkBase: ["#07111F", "#0A1530"],
        accentStrength: 0.18,
        primaryStrength: 0.14
    });

    const trustSectionSx = buildSectionMesh({
        accentPosition: "18% 18%",
        primaryPosition: "84% 68%",
        lightBase: ["#FAFCFF", "#F3F9FF"],
        darkBase: ["#08111E", "#0B162B"],
        accentStrength: 0.15,
        primaryStrength: 0.16
    });

    const audienceSectionSx = buildSectionMesh({
        accentPosition: "86% 26%",
        primaryPosition: "12% 72%",
        lightBase: ["#F9FCFF", "#F0F8FF"],
        darkBase: ["#08101C", "#0B1528"],
        accentStrength: 0.16,
        primaryStrength: 0.15
    });

    const pricingSectionSx = buildSectionMesh({
        accentPosition: "16% 20%",
        primaryPosition: "84% 18%",
        lightBase: ["#F8FBFF", "#EEF7FF"],
        darkBase: ["#0A111C", "#0D1729"],
        accentStrength: 0.18,
        primaryStrength: 0.14
    });

    const ctaSectionSx = buildSectionMesh({
        accentPosition: "84% 16%",
        primaryPosition: "16% 82%",
        lightBase: ["#F7FBFF", "#EEF6FF"],
        darkBase: ["#09101A", "#0C1526"],
        accentStrength: 0.18,
        primaryStrength: 0.16
    });

    const primaryCta = useMemo(
        () => ({
            label: session ? "Open workspace" : "Sign in to Fund-Me",
            to: session ? "/dashboard" : "/signin"
        }),
        [session]
    );

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    const handleSectionSelect = (id: string) => {
        setMobileMenuOpen(false);
        scrollToSection(id);
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                position: "relative",
                overflowX: "hidden",
                background: pageBackground
            }}
        >
            <Container maxWidth="lg" sx={{ pt: { xs: 2.5, md: 3 }, pb: { xs: 9, md: 12 } }}>
                <Paper
                    variant="outlined"
                    sx={{
                        px: { xs: 1.5, md: 2.5 },
                        py: { xs: 1, md: 1.25 },
                        mb: { xs: 5, md: 7 },
                        borderRadius: { xs: 2, md: 3 },
                        bgcolor: chromeSurface,
                        backdropFilter: "blur(18px)",
                        borderColor: subtleBorder,
                        boxShadow: headerShadow,
                        position: "sticky",
                        top: { xs: 12, md: 18 },
                        zIndex: 12
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                    >
                        <Stack direction="row" spacing={1.25} alignItems="center">
                            <Box
                                component="img"
                                src="/changa2.svg"
                                alt="Fund-Me logo"
                                sx={{ width: 34, height: 34, objectFit: "contain" }}
                            />
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: -0.2 }}>
                                    Fund-Me
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Workplace contribution management
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" } }}>
                                {sectionItems.map((item) => (
                                    <Button
                                        key={item.id}
                                        color="inherit"
                                        onClick={() => scrollToSection(item.id)}
                                        sx={{
                                            color: "text.primary",
                                            fontWeight: 700,
                                            px: 1.35
                                        }}
                                    >
                                        {item.label}
                                    </Button>
                                ))}
                            </Stack>

                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ display: { xs: "none", md: "flex" } }}
                            >
                                <Stack
                                    direction="row"
                                    spacing={0.8}
                                    alignItems="center"
                                    sx={{
                                        px: 1.1,
                                        py: 0.45,
                                        borderRadius: 2,
                                        border: `1px solid ${subtleBorder}`,
                                        bgcolor: isLight ? alpha("#FFFFFF", 0.78) : alpha("#0E1730", 0.78)
                                    }}
                                >
                                    <LightModeRoundedIcon sx={{ fontSize: 18, color: isLight ? brandColors.warning : "text.secondary" }} />
                                    <Switch
                                        checked={!isLight}
                                        onChange={() => toggleTheme()}
                                        size="small"
                                    />
                                    <DarkModeRoundedIcon sx={{ fontSize: 18, color: !isLight ? darkAccentText : "text.secondary" }} />
                                </Stack>

                                <Button component={RouterLink} to="/signin" variant="text" color="inherit" sx={{ fontWeight: 700 }}>
                                    Sign in
                                </Button>
                                <GradientButton
                                    component={RouterLink}
                                    to={primaryCta.to}
                                    endIcon={<ArrowOutwardRoundedIcon />}
                                    sx={{ minWidth: 212 }}
                                >
                                    {primaryCta.label}
                                </GradientButton>
                            </Stack>

                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ display: { xs: "flex", md: "none" } }}>
                                <IconButton
                                    onClick={toggleTheme}
                                    sx={{
                                        borderRadius: 2,
                                        border: `1px solid ${subtleBorder}`,
                                        bgcolor: isLight ? alpha("#FFFFFF", 0.78) : alpha("#0E1730", 0.78)
                                    }}
                                >
                                    {isLight ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
                                </IconButton>
                                <IconButton
                                    onClick={() => setMobileMenuOpen(true)}
                                    sx={{
                                        borderRadius: 2,
                                        border: `1px solid ${subtleBorder}`,
                                        bgcolor: isLight ? alpha("#FFFFFF", 0.78) : alpha("#0E1730", 0.78)
                                    }}
                                >
                                    <MenuRoundedIcon />
                                </IconButton>
                            </Stack>
                        </Stack>
                    </Stack>
                </Paper>

                <Drawer
                    anchor="right"
                    open={mobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                    PaperProps={{
                        sx: {
                            width: "min(88vw, 340px)",
                            p: 2,
                            bgcolor: theme.palette.background.paper
                        }
                    }}
                >
                    <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1.1} alignItems="center">
                                <Box
                                    component="img"
                                    src="/changa2.svg"
                                    alt="Fund-Me logo"
                                    sx={{ width: 32, height: 32, objectFit: "contain" }}
                                />
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                        Fund-Me
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Workplace contribution management
                                    </Typography>
                                </Box>
                            </Stack>
                            <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ borderRadius: 2 }}>
                                <CloseRoundedIcon />
                            </IconButton>
                        </Stack>

                        <Divider />

                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            justifyContent="space-between"
                                sx={{
                                    px: 1.2,
                                    py: 1,
                                    border: `1px solid ${subtleBorder}`,
                                    borderRadius: 2,
                                    bgcolor: isLight ? alpha(brandColors.primary[100], 0.48) : alpha(theme.palette.primary.main, 0.08)
                                }}
                            >
                            <Stack spacing={0.2}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                    Dark mode
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Switch landing page appearance
                                </Typography>
                            </Stack>
                            <Switch checked={!isLight} onChange={() => toggleTheme()} />
                        </Stack>

                        <Stack spacing={0.5}>
                            {sectionItems.map((item) => (
                                <Button
                                    key={item.id}
                                    fullWidth
                                    color="inherit"
                                    onClick={() => handleSectionSelect(item.id)}
                                    sx={{ justifyContent: "flex-start", py: 1.2, fontWeight: 700 }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Stack>

                        <Divider />

                        <Stack spacing={1}>
                            <Button component={RouterLink} to="/signin" fullWidth variant="outlined" onClick={() => setMobileMenuOpen(false)}>
                                Sign in
                            </Button>
                            <GradientButton
                                component={RouterLink}
                                to={primaryCta.to}
                                fullWidth
                                endIcon={<ArrowOutwardRoundedIcon />}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {primaryCta.label}
                            </GradientButton>
                        </Stack>
                    </Stack>
                </Drawer>

                <Box
                    component={motion.section}
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    sx={{ pb: { xs: 7, md: 9 } }}
                >
                    <Box
                        sx={{
                            position: "relative",
                            overflow: "hidden",
                            borderRadius: { xs: 3, md: 4 },
                            px: { xs: 2, md: 3 },
                            py: { xs: 3, md: 4 },
                            border: `1px solid ${alpha(theme.palette.primary.main, isLight ? 0.08 : 0.14)}`,
                            boxShadow: isLight ? "0 28px 80px rgba(15, 23, 42, 0.05)" : "0 28px 80px rgba(0, 0, 0, 0.24)"
                        }}
                    >
                        <HeroMeshBackground />

                        <Box
                            sx={{
                                position: "relative",
                                zIndex: 1,
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) minmax(460px, 0.82fr)" },
                                alignItems: "center",
                                gap: { xs: 4, md: 6 },
                                "& > *": {
                                    minWidth: 0
                                }
                            }}
                        >
                            <motion.div variants={itemVariants}>
                                <Stack spacing={3.2}>
                                <Chip
                                    label="Mobile money powered workplace support"
                                    color="primary"
                                    variant="outlined"
                                    sx={{
                                        alignSelf: "flex-start",
                                        bgcolor: isLight ? alpha(brandColors.primary[100], 0.82) : alpha(theme.palette.primary.main, 0.12),
                                        borderColor: alpha(theme.palette.primary.main, isLight ? 0.18 : 0.24),
                                        color: isLight ? "inherit" : darkAccentText,
                                        fontWeight: 700
                                    }}
                                />
                                <Typography
                                    variant="h1"
                                    sx={{
                                        fontSize: { xs: "2.8rem", md: "3rem", lg: "3.2rem", xl: "3.35rem" },
                                        fontWeight: 800,
                                        letterSpacing: { xs: -2.2, md: -2 },
                                        lineHeight: { xs: 1.02, md: 1 },
                                        maxWidth: { xs: "none", md: 560, lg: 600 }
                                    }}
                                >
                                    <Box component="span" sx={{ display: { xs: "inline", md: "block" } }}>
                                        Stop chasing
                                    </Box>
                                    <Box component="span" sx={{ display: "block", whiteSpace: { lg: "nowrap", xs: "normal" } }}>
                                        workplace contributions.
                                    </Box>
                                </Typography>
                                <Typography
                                    variant="h5"
                                    color="text.secondary"
                                    sx={{
                                        maxWidth: 660,
                                        fontWeight: 500,
                                        lineHeight: 1.65,
                                        fontSize: { xs: "1.05rem", md: "1.28rem" }
                                    }}
                                >
                                    Fund-Me helps organizations run transparent workplace support collections for weddings,
                                    funerals, emergencies, and celebrations using mobile money payments and real-time
                                    tracking.
                                </Typography>

                                <Stack spacing={1.2}>
                                    {[
                                        "Launch contribution events in minutes",
                                        "Send mobile money payment prompts to members",
                                        "Track contributions and payments in real time"
                                    ].map((benefit) => (
                                        <Stack key={benefit} direction="row" spacing={1.25} alignItems="center">
                                            <Box
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: 1.5,
                                                    display: "grid",
                                                    placeItems: "center",
                                                    bgcolor: alpha(brandColors.success, 0.12),
                                                    color: brandColors.success,
                                                    flexShrink: 0
                                                }}
                                            >
                                                <CheckRoundedIcon sx={{ fontSize: 16 }} />
                                            </Box>
                                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                                                {benefit}
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Stack>

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                    <GradientButton
                                        component={RouterLink}
                                        to={heroPrimaryTo}
                                        size="large"
                                        endIcon={<ArrowOutwardRoundedIcon />}
                                        sx={{ minWidth: 208 }}
                                    >
                                        Sign in to Fund-Me
                                    </GradientButton>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        onClick={() => scrollToSection("workflow")}
                                        sx={{ minWidth: 184 }}
                                    >
                                        See how it works
                                    </Button>
                                </Stack>

                                <Stack direction="row" flexWrap="wrap" gap={1}>
                                    {[
                                        "Transparent support collections",
                                        "Real-time contribution tracking",
                                        "Manager-ready reporting"
                                    ].map((item) => (
                                        <Chip
                                            key={item}
                                            label={item}
                                            variant="outlined"
                                            sx={{
                                                bgcolor: chromeSurface,
                                                borderColor: subtleBorder
                                            }}
                                        />
                                    ))}
                                </Stack>
                                </Stack>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <HeroVisual />
                            </motion.div>
                        </Box>
                    </Box>
                </Box>
            </Container>

            <AnimatedSection id="problem" sectionSx={problemSectionSx}>
                <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 0.78fr) minmax(0, 1.02fr)" },
                            gap: { xs: 3.5, md: 5 }
                        }}
                    >
                        <motion.div variants={itemVariants}>
                            <SectionIntro
                                eyebrow="The problem"
                                title="Workplace contribution processes break when they rely on reminders and spreadsheets."
                                body="Most organizations still manage support collections through chat groups, manual follow-up, and inconsistent records. That slows down urgent support and makes fairness harder to prove."
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                                    gap: 1.5
                                }}
                            >
                                {problemCards.map((card) => (
                                    <motion.div key={card.title} variants={itemVariants}>
                                        <Paper
                                            sx={{
                                                p: 2.2,
                                                height: "100%",
                                                borderRadius: 3,
                                                bgcolor: sectionSurface,
                                                boxShadow: softShadow
                                            }}
                                        >
                                            <Stack spacing={1}>
                                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                                    {card.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                                                    {card.body}
                                                </Typography>
                                            </Stack>
                                        </Paper>
                                    </motion.div>
                                ))}
                            </Box>
                        </motion.div>
                    </Box>
                </Container>
            </AnimatedSection>

            <AnimatedSection id="solution" sectionSx={solutionSectionSx}>
                <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 0.86fr) minmax(0, 0.94fr)" },
                            gap: { xs: 3.5, md: 5 },
                            alignItems: "center"
                        }}
                    >
                        <motion.div variants={itemVariants}>
                            <SectionIntro
                                eyebrow="The solution"
                                title="Fund-Me gives every workplace collection a clean workflow, a visible ledger, and a trusted finance view."
                                body="Instead of chasing payments, managers launch structured events, members approve on mobile money, and the platform keeps the contribution record current for everyone who needs to see progress."
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Paper
                                sx={{
                                    p: { xs: 2.2, md: 2.6 },
                                    borderRadius: 3,
                                    bgcolor: sectionSurface,
                                    boxShadow: strongShadow
                                }}
                            >
                                <Stack spacing={2}>
                                    {solutionHighlights.map((item, index) => (
                                        <Stack key={item} direction="row" spacing={1.35} alignItems="flex-start">
                                            <Box
                                                sx={{
                                                    width: 34,
                                                    height: 34,
                                                    borderRadius: 1.5,
                                                    display: "grid",
                                                    placeItems: "center",
                                                    bgcolor: alpha(theme.palette.primary.main, isLight ? 0.1 : 0.12),
                                                    color: isLight ? brandColors.primary[900] : darkAccentText,
                                                    fontWeight: 800,
                                                    flexShrink: 0
                                                }}
                                            >
                                                {index + 1}
                                            </Box>
                                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                                {item}
                                            </Typography>
                                        </Stack>
                                    ))}

                                    <Divider />

                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
                                            gap: 1.25
                                        }}
                                    >
                                        {[
                                            { label: "Events", value: "Automated" },
                                            { label: "Payments", value: "Phone approvals" },
                                            { label: "Visibility", value: "Real time" }
                                        ].map((item) => (
                                            <Paper
                                                key={item.label}
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: 2.5,
                                                    bgcolor: accentSurface,
                                                    borderColor: subtleBorder
                                                }}
                                            >
                                                <Typography variant="overline" color="text.secondary">
                                                    {item.label}
                                                </Typography>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                                    {item.value}
                                                </Typography>
                                            </Paper>
                                        ))}
                                    </Box>
                                </Stack>
                            </Paper>
                        </motion.div>
                    </Box>
                </Container>
            </AnimatedSection>

            <AnimatedSection id="features" sectionSx={featuresSectionSx}>
                <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
                    <motion.div variants={itemVariants}>
                        <SectionIntro
                            eyebrow="Core features"
                            title="Everything needed to run contribution events without confusion."
                            body="Fund-Me brings contribution operations, payment execution, tracking, and reporting into one workspace so workplace support can move faster and feel fairer."
                            align="center"
                        />
                    </motion.div>

                    <Box sx={{ height: 28 }} />

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(5, minmax(0, 1fr))" },
                            gap: 1.5
                        }}
                    >
                        {featureCards.map((feature) => {
                            const Icon = feature.icon;

                            return (
                                <motion.div key={feature.title} variants={itemVariants}>
                                    <Paper
                                        sx={{
                                            p: 2.2,
                                            height: "100%",
                                            borderRadius: 3,
                                            bgcolor: sectionSurface,
                                            boxShadow: softShadow
                                        }}
                                    >
                                        <Stack spacing={1.35}>
                                            <Box
                                                sx={{
                                                    width: 42,
                                                    height: 42,
                                                    borderRadius: 2,
                                                    display: "grid",
                                                    placeItems: "center",
                                                    bgcolor: alpha(theme.palette.primary.main, isLight ? 0.12 : 0.14),
                                                    color: isLight ? brandColors.primary[900] : darkAccentText
                                                }}
                                            >
                                                <Icon />
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                                {feature.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                                                {feature.body}
                                            </Typography>
                                        </Stack>
                                    </Paper>
                                </motion.div>
                            );
                        })}
                    </Box>
                </Container>
            </AnimatedSection>

            <AnimatedSection id="workflow" sectionSx={workflowSectionSx}>
                <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
                    <motion.div variants={itemVariants}>
                        <SectionIntro
                            eyebrow="How it works"
                            title="A clear contribution workflow from event setup to posted payment."
                            body="Managers launch the event, members receive a request, approve from their phones, and the ledger updates automatically once the payment completes."
                            align="center"
                        />
                    </motion.div>

                    <Box sx={{ height: 28 }} />

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "repeat(4, minmax(0, 1fr))" },
                            gap: 1.5
                        }}
                    >
                        {workflowSteps.map((item) => (
                            <motion.div key={item.title} variants={itemVariants}>
                                <Paper
                                    sx={{
                                        p: 2.2,
                                        height: "100%",
                                        borderRadius: 3,
                                        bgcolor: sectionSurface,
                                        boxShadow: softShadow
                                    }}
                                >
                                    <Stack spacing={1.1}>
                                        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800 }}>
                                            {item.step}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                                            {item.body}
                                        </Typography>
                                    </Stack>
                                </Paper>
                            </motion.div>
                        ))}
                    </Box>
                </Container>
            </AnimatedSection>

            <AnimatedSection id="trust" sectionSx={trustSectionSx}>
                <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 0.84fr) minmax(0, 0.96fr)" },
                            gap: { xs: 3.5, md: 5 }
                        }}
                    >
                        <motion.div variants={itemVariants}>
                            <SectionIntro
                                eyebrow="Trust and transparency"
                                title="Built for organizations that need clarity, fairness, and accountability."
                                body="Fund-Me keeps contribution records visible, event collections transparent, and fee handling understandable so workplace support can remain credible."
                            />

                            <Stack spacing={1.2} sx={{ mt: 3 }}>
                                {trustPoints.map((point) => (
                                    <Stack key={point} direction="row" spacing={1.2} alignItems="flex-start">
                                        <TaskAltRoundedIcon sx={{ mt: "3px", color: brandColors.success, fontSize: 20 }} />
                                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                            {point}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Paper
                                sx={{
                                    p: { xs: 2.25, md: 2.6 },
                                    borderRadius: 3,
                                    bgcolor: sectionSurface,
                                    boxShadow: strongShadow
                                }}
                            >
                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={1.2} alignItems="center">
                                        <Box
                                            sx={{
                                                width: 42,
                                                height: 42,
                                                borderRadius: 2,
                                                display: "grid",
                                                placeItems: "center",
                                                bgcolor: alpha(theme.palette.primary.main, isLight ? 0.12 : 0.14),
                                                color: isLight ? brandColors.primary[900] : darkAccentText
                                            }}
                                        >
                                            <ShieldRoundedIcon />
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                                Clear finance visibility
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Managers can see what was contributed, what was collected, and what remains pending.
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Paper
                                        sx={{
                                            p: 2,
                                            borderRadius: 2.5,
                                            bgcolor: accentSurface,
                                            borderColor: subtleBorder
                                        }}
                                    >
                                        <Stack spacing={1.2}>
                                            {[
                                                { label: "Contribution records", value: "Visible per member" },
                                                { label: "Event collection status", value: "Live totals" },
                                                { label: "Audit and accountability", value: "Manager-ready" },
                                                { label: "Fee transparency", value: "Shown before payment approval" }
                                            ].map((item) => (
                                                <Stack key={item.label} direction="row" justifyContent="space-between" spacing={2}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.label}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, textAlign: "right" }}>
                                                        {item.value}
                                                    </Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Paper>
                                </Stack>
                            </Paper>
                        </motion.div>
                    </Box>
                </Container>
            </AnimatedSection>

            <AnimatedSection id="audience" sectionSx={audienceSectionSx}>
                <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
                    <motion.div variants={itemVariants}>
                        <SectionIntro
                            eyebrow="Built for"
                            title="Fund-Me fits organizations that run internal support collections at scale."
                            body="From formal institutions to staff communities, the platform is designed for teams that want support initiatives to be structured, visible, and easy to manage."
                            align="center"
                        />
                    </motion.div>

                    <Box sx={{ height: 28 }} />

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
                            gap: 1.5
                        }}
                    >
                        {targetUsers.map((item) => {
                            const Icon = item.icon;

                            return (
                                <motion.div key={item.title} variants={itemVariants}>
                                    <Paper
                                        sx={{
                                            p: 2.2,
                                            height: "100%",
                                            borderRadius: 3,
                                            bgcolor: sectionSurface,
                                            boxShadow: softShadow
                                        }}
                                    >
                                        <Stack direction="row" spacing={1.3} alignItems="flex-start">
                                            <Box
                                                sx={{
                                                    width: 42,
                                                    height: 42,
                                                    borderRadius: 2,
                                                    display: "grid",
                                                    placeItems: "center",
                                                    bgcolor: alpha(theme.palette.primary.main, isLight ? 0.12 : 0.14),
                                                    color: isLight ? brandColors.primary[900] : darkAccentText,
                                                    flexShrink: 0
                                                }}
                                            >
                                                <Icon />
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                                    {item.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                                                    {item.body}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </motion.div>
                            );
                        })}
                    </Box>
                </Container>
            </AnimatedSection>

            <AnimatedSection id="pricing" sectionSx={pricingSectionSx}>
                <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 0.86fr) minmax(320px, 0.74fr)" },
                            gap: { xs: 3.5, md: 5 },
                            alignItems: "stretch"
                        }}
                    >
                        <motion.div variants={itemVariants}>
                            <SectionIntro
                                eyebrow="Transparent pricing"
                                title="A fair fee model that stays clear before every payment."
                                body="Fund-Me applies a small platform fee per contribution and makes payment-related costs visible before a member approves. That keeps pricing understandable and collections easier to trust."
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Paper
                                sx={{
                                    p: { xs: 2.25, md: 2.8 },
                                    borderRadius: 3,
                                    bgcolor: isLight ? "#08173C" : "transparent",
                                    background: isLight
                                        ? undefined
                                        : `linear-gradient(135deg, #141009 0%, #2C1F08 56%, #5B4009 100%)`,
                                    color: "common.white",
                                    boxShadow: isLight ? "0 26px 60px rgba(8, 23, 60, 0.2)" : "0 26px 60px rgba(0, 0, 0, 0.26)"
                                }}
                            >
                                <Stack spacing={2}>
                                    <Typography variant="overline" sx={{ color: alpha("#FFFFFF", 0.7) }}>
                                        Pricing model
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1 }}>
                                        Simple, visible, contribution-based pricing.
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: alpha("#FFFFFF", 0.74), lineHeight: 1.8 }}>
                                        Members see the exact amount before approval, managers keep the event fund separate
                                        from processing costs, and everyone gets a cleaner record at the end of the collection.
                                    </Typography>

                                    <Divider sx={{ borderColor: alpha("#FFFFFF", 0.12) }} />

                                    <Stack spacing={1.15}>
                                        {pricingPoints.map((item) => (
                                            <Stack key={item} direction="row" spacing={1.2} alignItems="flex-start">
                                                <CheckRoundedIcon sx={{ mt: "3px", color: isLight ? brandColors.accent[300] : darkAccentText, fontSize: 20 }} />
                                                <Typography variant="body2" sx={{ color: alpha("#FFFFFF", 0.8), lineHeight: 1.8 }}>
                                                    {item}
                                                </Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Stack>
                            </Paper>
                        </motion.div>
                    </Box>
                </Container>
            </AnimatedSection>

            <AnimatedSection id="cta" sectionSx={ctaSectionSx} placeholderSx={{ minHeight: { xs: 220, md: 260 } }}>
                <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
                    <motion.div variants={itemVariants}>
                        <Paper
                            sx={{
                                p: { xs: 3, md: 5 },
                                borderRadius: 4,
                                background: isLight
                                    ? `
                                        radial-gradient(circle at top right, ${alpha(brandColors.accent[300], 0.18)} 0%, transparent 28%),
                                        linear-gradient(135deg, ${brandColors.primary[900]} 0%, ${brandColors.primary[700]} 58%, ${brandColors.accent[500]} 100%)
                                    `
                                    : `
                                        radial-gradient(circle at top right, ${alpha(theme.palette.primary.light, 0.14)} 0%, transparent 28%),
                                        linear-gradient(135deg, #171108 0%, #3B2808 58%, ${theme.palette.primary.main} 100%)
                                    `,
                                color: "common.white",
                                boxShadow: isLight ? "0 32px 72px rgba(10, 5, 115, 0.24)" : "0 32px 72px rgba(0, 0, 0, 0.28)"
                            }}
                        >
                            <Stack spacing={2.2} sx={{ maxWidth: 760 }}>
                                <Chip
                                    label="Make workplace support easier to run"
                                    sx={{
                                        alignSelf: "flex-start",
                                        bgcolor: alpha("#FFFFFF", 0.12),
                                        color: "common.white",
                                        borderColor: alpha("#FFFFFF", 0.16)
                                    }}
                                    variant="outlined"
                                />
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 800,
                                        letterSpacing: -1.4,
                                        lineHeight: 1.04,
                                        fontSize: { xs: "2rem", md: "3rem" }
                                    }}
                                >
                                    Replace contribution chaos with a transparent workplace support system.
                                </Typography>
                                <Typography variant="body1" sx={{ color: alpha("#FFFFFF", 0.78), lineHeight: 1.8 }}>
                                    Adopt Fund-Me to stop manual follow-ups, improve contribution accountability, and make
                                    workplace support feel faster, clearer, and more credible for everyone involved.
                                </Typography>
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                    <GradientButton
                                        component={RouterLink}
                                        to={primaryCta.to}
                                        color="secondary"
                                        size="large"
                                        endIcon={<ArrowOutwardRoundedIcon />}
                                        sx={{ minWidth: 220 }}
                                    >
                                        {primaryCta.label}
                                    </GradientButton>
                                    <Button
                                        component={RouterLink}
                                        to="/signin"
                                        variant="outlined"
                                        size="large"
                                        sx={{
                                            minWidth: 176,
                                            color: "common.white",
                                            borderColor: alpha("#FFFFFF", 0.24)
                                        }}
                                    >
                                        Talk to your admin
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    </motion.div>
                </Container>
            </AnimatedSection>

            <Box
                component="footer"
                sx={{
                    width: "100%",
                    mt: { xs: 1, md: 2 },
                    borderTop: `1px solid ${subtleBorder}`,
                    bgcolor: isLight ? alpha("#FFFFFF", 0.64) : alpha("#081122", 0.82),
                    backdropFilter: "blur(18px)"
                }}
            >
                <Container maxWidth="lg" sx={{ py: { xs: 2.6, md: 3 } }}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                    >
                        <Stack direction="row" spacing={1.25} alignItems="center">
                            <Box
                                component="img"
                                src="/changa2.svg"
                                alt="Fund-Me logo"
                                sx={{ width: 30, height: 30, objectFit: "contain" }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                Fund-Me helps organizations manage internal support collections with transparency, mobile money,
                                and cleaner records.
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1.5} flexWrap="wrap">
                            <Button component={RouterLink} to="/signin" color="inherit">
                                Sign in
                            </Button>
                            <Button component={RouterLink} to="/terms-and-conditions" color="inherit">
                                Terms & Conditions
                            </Button>
                            <Button component={RouterLink} to="/privacy-policy" color="inherit">
                                Privacy Policy
                            </Button>
                        </Stack>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
}
