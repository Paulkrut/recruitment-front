import React from "react";
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DashboardCard from "../../shared/DashboardCard";

const SkeletonProductsCard = () => {
  return (
    <DashboardCard
      title="Products"
      subtitle="Last 7 days"
      action={
        <Box textAlign="right">
          <Typography variant="h5" mb={1} display="block">
            <Skeleton variant="rounded" width={90} height={21} />
          </Typography>
          <Skeleton variant="rounded" width={50} height={21} />
        </Box>
      }
    >
      <>
        <Box className="rounded-bars" mt={3}>
          <Skeleton variant="rounded" width={215} height={150} />
        </Box>

        <Typography variant="h6" mb={1} fontWeight="600" mt={3}>
          <Skeleton variant="rounded" width={180} height={25} />
        </Typography>
      </>
    </DashboardCard>
  );
};

export default SkeletonProductsCard;
