import { Grid, Paper, Skeleton, Stack } from "@mui/material";

type DataPageSkeletonProps = {
    statCards?: number;
    tableColumns?: number;
    tableRows?: number;
    detailPanels?: number;
    showHero?: boolean;
};

export function DataPageSkeleton({
    statCards = 3,
    tableColumns = 5,
    tableRows = 5,
    detailPanels = 0,
    showHero = true
}: DataPageSkeletonProps) {
    return (
        <Stack spacing={3}>
            {showHero ? (
                <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Stack spacing={1.5}>
                        <Skeleton variant="text" width={180} height={22} />
                        <Skeleton variant="text" width="52%" height={52} />
                        <Skeleton variant="text" width="72%" height={26} />
                        <Stack direction="row" spacing={1}>
                            <Skeleton variant="rounded" width={140} height={40} />
                            <Skeleton variant="rounded" width={124} height={40} />
                        </Stack>
                    </Stack>
                </Paper>
            ) : null}

            {statCards > 0 ? (
                <Grid container spacing={2}>
                    {Array.from({ length: statCards }).map((_, index) => (
                        <Grid key={index} size={{ xs: 12, md: 6, xl: 12 / Math.min(statCards, 4) }}>
                            <Paper sx={{ p: 2.25, borderRadius: 2 }}>
                                <Stack spacing={1.25}>
                                    <Skeleton variant="text" width={130} height={22} />
                                    <Skeleton variant="text" width={110} height={52} />
                                    <Skeleton variant="text" width="82%" height={22} />
                                </Stack>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            ) : null}

            {detailPanels > 0 ? (
                <Grid container spacing={2}>
                    {Array.from({ length: detailPanels }).map((_, index) => (
                        <Grid key={index} size={{ xs: 12, lg: 12 / Math.min(detailPanels, 2) }}>
                            <Paper sx={{ p: 2.25, borderRadius: 2 }}>
                                <Stack spacing={1.25}>
                                    <Skeleton variant="text" width={180} height={30} />
                                    {Array.from({ length: 4 }).map((__, rowIndex) => (
                                        <Skeleton key={rowIndex} variant="text" width={`${78 - rowIndex * 8}%`} height={22} />
                                    ))}
                                </Stack>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            ) : null}

            <Paper sx={{ p: 2.25, borderRadius: 2, overflow: "hidden" }}>
                <Stack spacing={1.2}>
                    <Stack direction="row" spacing={2}>
                        {Array.from({ length: tableColumns }).map((_, index) => (
                            <Skeleton key={index} variant="text" width={index === 0 ? 140 : 100} height={24} />
                        ))}
                    </Stack>
                    {Array.from({ length: tableRows }).map((_, rowIndex) => (
                        <Stack key={rowIndex} direction="row" spacing={2}>
                            {Array.from({ length: tableColumns }).map((__, columnIndex) => (
                                <Skeleton
                                    key={columnIndex}
                                    variant="text"
                                    width={columnIndex === 0 ? 160 : columnIndex === tableColumns - 1 ? 96 : 120}
                                    height={28}
                                />
                            ))}
                        </Stack>
                    ))}
                </Stack>
            </Paper>
        </Stack>
    );
}
