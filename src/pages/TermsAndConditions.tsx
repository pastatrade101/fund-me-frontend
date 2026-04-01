import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import { alpha, Box, Button, Chip, Container, Divider, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { brandColors } from "../theme/colors";

const termsSections = [
    {
        title: "Use of the platform",
        body: "Fund-Me is provided for workplace contribution management, member access, contribution event tracking, payment processing, reporting, and operational administration. You must use the platform only for lawful organizational activity and approved internal fundraising workflows."
    },
    {
        title: "Account responsibility",
        body: "Each user is responsible for keeping sign-in credentials secure, using accurate identity and contact details, and immediately reporting suspected unauthorized access. Member recovery tools are intended only for the account holder. Staff access remains controlled by authorized administrators."
    },
    {
        title: "Contribution and payment terms",
        body: "Contribution obligations, payment previews, platform fees, gateway fees, and settlement rules are determined by the active system configuration and event policy. Amounts shown before payment approval are the authoritative payable amounts for that transaction. Only the contribution amount is credited to the event fund."
    },
    {
        title: "Operational controls",
        body: "Administrators and Fund Managers may configure departments, members, policies, events, fee settings, and reporting access according to organizational authority. System audit logs, payment records, and contribution histories may be used for compliance, operations, finance review, and dispute resolution."
    },
    {
        title: "Acceptable conduct",
        body: "You must not misuse the system, attempt to bypass role controls, interfere with payment processing, submit misleading information, or access data outside your authorized scope. Abuse of the platform may result in suspension of access and internal disciplinary action."
    },
    {
        title: "Availability and changes",
        body: "The service may be updated, reconfigured, restricted, or temporarily unavailable for maintenance, security, payment gateway issues, or operational changes. Features, fee settings, and workflows may change as the organization and service operators refine the platform."
    },
    {
        title: "Limitation of responsibility",
        body: "The platform operators and organization will take reasonable steps to maintain secure and accurate service operations, but they are not responsible for losses caused by incorrect user input, third-party gateway downtime, delayed telecom prompts, invalid contact details, or external infrastructure failures."
    },
    {
        title: "Contact and governance",
        body: "Questions about contribution records, access rights, or organizational policy should be directed to the authorized Fund Manager or Administrator responsible for your workspace. Continued use of the system indicates acceptance of these terms."
    }
];

export function TermsAndConditionsPage() {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                py: { xs: 3, md: 6 },
                background: `
                    radial-gradient(circle at top left, ${alpha(brandColors.accent[300], 0.16)} 0%, transparent 28%),
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
                                        icon={<GavelRoundedIcon />}
                                        label="Terms & Conditions"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Stack>
                                <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: -1 }}>
                                    Fund-Me Terms & Conditions
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                                    Effective April 1, 2026. These terms govern the use of the Fund-Me workplace contribution platform by members, Fund Managers, administrators, and other authorized users.
                                </Typography>
                            </Stack>

                            <Divider />

                            <Stack spacing={2.25}>
                                {termsSections.map((section) => (
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
