import React from "react";
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import DashboardCard from "../../shared/DashboardCard";

const SkeletonSalesCard = () => {

    return (
        <DashboardCard>
            <>
                <Typography variant="h4" mb={1}><Skeleton variant="rounded" width={112} height={25} /></Typography>
                <Typography variant="subtitle2" color="textSecondary" mb={3}>
                    <Skeleton variant="rounded" width={112} height={21} />
                </Typography>
                <Box className="rounded-bars">
                    <Skeleton variant="rounded" width={112} height={80  } />
                </Box>
            </>
        </DashboardCard>
    );
};

export default SkeletonSalesCard;
