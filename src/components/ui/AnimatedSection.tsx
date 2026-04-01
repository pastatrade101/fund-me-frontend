import { Box, Container, Skeleton, Stack } from "@mui/material";
import { useTheme, type SxProps, type Theme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { GlassCard } from "./GlassCard";

const sectionVariants = {
    hidden: {
        opacity: 0,
        y: 42
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.72,
            ease: [0.16, 1, 0.3, 1],
            staggerChildren: 0.1,
            delayChildren: 0.08
        }
    }
} as const;

interface AnimatedSectionProps {
    id?: string;
    children: ReactNode;
    placeholder?: ReactNode;
    placeholderSx?: SxProps<Theme>;
    sectionSx?: SxProps<Theme>;
    rootMargin?: string;
    threshold?: number;
    py?: number | string | { xs?: number | string; md?: number | string; lg?: number | string };
}

export function AnimatedSection({
    id,
    children,
    placeholder,
    placeholderSx,
    sectionSx,
    rootMargin = "0px 0px -10% 0px",
    threshold = 0.18,
    py = { xs: 8, md: 11 }
}: AnimatedSectionProps) {
    const theme = useTheme();
    const [revealed, setRevealed] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (revealed) {
            return;
        }

        const node = ref.current;

        if (!node) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    setRevealed(true);
                    observer.disconnect();
                }
            },
            { rootMargin, threshold }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [revealed, rootMargin, threshold]);

    return (
        <Box
            id={id}
            ref={ref}
            sx={[
                {
                    position: "relative",
                    overflow: "hidden",
                    isolation: "isolate",
                    scrollMarginTop: { xs: 88, md: 100 }
                },
                ...(Array.isArray(sectionSx) ? sectionSx : sectionSx ? [sectionSx] : [])
            ]}
        >
            {revealed ? (
                <motion.section
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    style={{ position: "relative", zIndex: 1 }}
                >
                    {children}
                </motion.section>
            ) : (
                <Box sx={{ position: "relative", zIndex: 1 }}>
                    <Container maxWidth="lg" sx={{ py }}>
                        {placeholder ?? (
                            <GlassCard
                                tint="strong"
                                sx={[
                                    {
                                        p: { xs: 3, md: 4 },
                                        minHeight: { xs: 260, md: 320 },
                                        borderRadius: theme.fundMe.radius.lg
                                    },
                                    ...(Array.isArray(placeholderSx) ? placeholderSx : placeholderSx ? [placeholderSx] : [])
                                ]}
                            >
                                <Stack spacing={2.25}>
                                    <Skeleton variant="rounded" width={144} height={28} />
                                    <Skeleton variant="text" width="48%" height={54} />
                                    <Skeleton variant="text" width="86%" height={24} />
                                    <Skeleton variant="text" width="76%" height={24} />
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                                            gap: 1.5,
                                            pt: 1
                                        }}
                                    >
                                        {[0, 1, 2].map((index) => (
                                            <Skeleton key={index} variant="rounded" height={138} />
                                        ))}
                                    </Box>
                                </Stack>
                            </GlassCard>
                        )}
                    </Container>
                </Box>
            )}
        </Box>
    );
}
