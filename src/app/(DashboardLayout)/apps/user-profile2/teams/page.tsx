"use client"

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import PageContainer from '@/app/components/container/PageContainer';
import ProfileBanner from '@/app/components/apps/userprofile2/profile/ProfileBanner';
import FollowerCard from '@/app/components/apps/userprofile2/teams/FollowerCard';


const Followers = () => {
  return (
    <PageContainer title="Followers" description="this is Followers">
     
      <Grid container spacing={3}>
        <Grid item sm={12}>
          <ProfileBanner />
        </Grid>
        <Grid item sm={12}>
          <Box mx={3}>
          <FollowerCard />
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Followers;
