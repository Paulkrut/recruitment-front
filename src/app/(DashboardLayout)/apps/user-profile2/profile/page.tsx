"use client";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import PageContainer from "@/app/components/container/PageContainer";

import ProfileBanner from "@/app/components/apps/userprofile2/profile/ProfileBanner";
import IntroCard from "@/app/components/apps/userprofile2/profile/IntroCard";
import PhotosCard from "@/app/components/apps/userprofile2/profile/PhotosCard";
import Post from "@/app/components/apps/userprofile2/profile/Post";

const UserProfile2 = () => {
  return (
    <PageContainer title="Profile" description="this is Profile">
      <Grid container spacing={3}>
        <Grid item sm={12}>
          <ProfileBanner />
        </Grid>

        {/* intro and Photos Card */}
        <Grid item sm={12} lg={4} xs={12}>
          <Box ml={3}>
            <Grid container spacing={2}>
              <Grid item sm={12}>
                <IntroCard />
              </Grid>
              <Grid item sm={12}>
                <PhotosCard />
              </Grid>
            </Grid>
          </Box>
        </Grid>
        {/* Posts Card */}
        <Grid item sm={12} lg={8} xs={12}>
          <Box mr={3}>
            <Post />
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default UserProfile2;
