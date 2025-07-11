import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DashboardCard from '../../shared/DashboardCard';

const SkeletonMonthlyEarningsTwoCard = () => {
    return (
        <DashboardCard>
            <>
                <Box mb={3}>
                    <Skeleton variant="rounded" width={190} height={21} />
                </Box>

                <Typography variant="h3" fontWeight="700">
                    <Skeleton variant="rounded" width={150} height={21} />
                </Typography>
                <Stack direction="row" spacing={1} mt={1} mb={3} alignItems="center">
                    <Skeleton variant="rounded" width={150} height={21} />
                </Stack>

                <Skeleton variant="rounded" width={120} height={70} />

            </>
        </DashboardCard>
    );
};

export default SkeletonMonthlyEarningsTwoCard;