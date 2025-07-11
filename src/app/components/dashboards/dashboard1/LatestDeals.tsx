import React from "react";
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from "@mui/material/styles";
import DashboardCard from "../../shared/DashboardCard";

const LatestDeals = () => {
  // chart color
  const theme = useTheme();

  return (
    <DashboardCard
      title="Latest Deal"
      subtitle="Last 7 days"
      action={
        <Box
          bgcolor="success.light"
          color="success.main"
          fontSize="12px"
          p="0px 7px"
          border="1px solid "
          borderRadius={2}
        >
          86.5%
        </Box>
      }
    >
      <>
        <Box>
          <Stack direction="row" justifyContent="space-between" mb={1} mt={5}>
            <Typography variant="h5">$98,500</Typography>
            <Typography variant="h6" display="flex" alignItems="center">$1,22,900</Typography>
          </Stack>
          <LinearProgress value={20} variant="determinate" />
          <Typography variant="subtitle1" color="textSecondary" mt={1}>Coupons used: 18/22</Typography>

        </Box>
        <Typography variant="h6" fontSize="14px" mt={7} mb={1}>
          Recent Purchasers
        </Typography>
        <Stack justifyContent="start">
          <AvatarGroup total={12} sx={{ justifyContent: "flex-end" }}>
            <Avatar
              sx={{ width: 35, height: 35 }}
              alt="Remy Sharp"
              src={"/images/profile/user1.jpg"}
            />
            <Avatar
              sx={{ width: 35, height: 35 }}
              alt="Travis Howard"
              src={"/images/profile/user2.jpg"}
            />
            <Avatar
              sx={{ width: 35, height: 35 }}
              alt="Cindy Baker"
              src={"/images/profile/user3.jpg"}
            />
            <Avatar
              sx={{ width: 35, height: 35 }}
              alt="Agnes Walker"
              src={"/images/profile/user4.jpg"}
            />
            <Avatar
              sx={{ width: 35, height: 35 }}
              alt="Agnes Walker"
              src={"/images/profile/user5.jpg"}
            />
          </AvatarGroup>
        </Stack>
      </>
    </DashboardCard>
  );
};

export default LatestDeals;
