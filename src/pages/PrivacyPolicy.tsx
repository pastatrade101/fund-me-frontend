import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PrivacyTipRoundedIcon from "@mui/icons-material/PrivacyTipRounded";
import { alpha, Box, Button, Chip, Container, Divider, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { brandColors } from "../theme/colors";

const privacySections = [
    {
        title: "Information collected",
        body: "Fund-Me may process names, email addresses, phone numbers, departments, roles, contribution obligations, payment order details, audit activity, and account recovery events. Additional payment-related metadata may be received from integrated mobile money providers."
    },
    {
        title: "How information is used",
        body: "Your information is used to authenticate users, assign role-based access, generate contribution obligations, process payments, post receipts, support reporting, maintain audit trails, and operate the platform securely and reliably."
    },
    {
        title: "Payment and gateway data",
        body: "When a contribution payment is initiated, the system may share the minimum required transaction details with payment partners such as Snippe and related telecom or gateway providers. This includes payer phone details, transaction identifiers, and payment amounts needed to complete the request."
    },
    {
        title: "Access control and visibility",
        body: "Access to data is restricted according to user role. Members can access only their own permitted records. Fund Managers and administrators may access the data necessary to perform operational, reporting, governance, and compliance responsibilities within the organization."
    },
    {
        title: "Security measures",
        body: "The platform uses authenticated access, server-side authorization checks, audit logging, and managed infrastructure controls to reduce unauthorized access risk. No system can guarantee absolute security, so users must also protect their credentials and devices."
    },
    {
        title: "Retention and records",
        body: "Contribution histories, payment records, audit logs, and operational records may be retained for finance, compliance, dispute resolution, reporting, and internal governance. Retention periods may be determined by organizational policy, legal obligations, and operational needs."
    },
    {
        title: "Third-party services",
        body: "The platform relies on third-party infrastructure and service providers, including hosting, authentication, database, and payment partners. Those providers may process information on behalf of the platform within the scope necessary to deliver the service."
    },
    {
        title: "Policy updates and contact",
        body: "This policy may be updated as the platform, payment integrations, or governance requirements change. If you need clarification about how your information is handled, contact the authorized administrator or Fund Manager responsible for your workspace."
    }
];

export function PrivacyPolicyPage() {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                py: { xs: 3, md: 6 },
                background: `
                    radial-gradient(circle at top right, ${alpha(brandColors.accent[300], 0.16)} 0%, transparent 28%),
                    linear-gradient(180deg, ${alpha(brandColors.primary[100], 0.56)} 0%, #F8FAFC 48%)
                `
            }}
        >
            <Container maxWidth="md">
                <Stack spacing={3}>
                    <Button
                        component={RouterLink}
                        to="/signin"
                        startIcon={<ArrowBackRoundedIcon />}
                        sx={{ alignSelf: "flex-start" }}
                    >
                        Back to sign in
                    </Button>

                    <Paper
                        sx={{
                            p: { xs: 3, md: 4 },
                            borderRadius: 4,
                            boxShadow: "0 24px 72px rgba(15, 23, 42, 0.12)"
                        }}
                    >
                        <Stack spacing={3}>
                            <Stack spacing={1.5}>
                                <Stack direction="row" spacing={1.25} alignItems="center">
                                    <Box
                                        component="img"
                                        src="/changa2.svg"
                                        alt="Changa logo"
                                        sx={{ width: 42, height: 42, objectFit: "contain" }}
                                    />
                                    <Chip
                                        icon={<PrivacyTipRoundedIcon />}
                                        label="Privacy Policy"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Stack>
                                <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: -1 }}>
                                    Fund-Me Privacy Policy
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                                    Effective April 1, 2026. This page explains what information Fund-Me processes, why it is used, and how access to contribution and payment records is controlled.
                                </Typography>
                            </Stack>

                            <Divider />

                            <Stack spacing={2.25}>
                                {privacySections.map((section) => (
                                    <Stack key={section.title} spacing={0.7}>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                            {section.title}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                            {section.body}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </Box>
    );
}
