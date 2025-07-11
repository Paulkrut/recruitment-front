"use client"

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import PageContainer from '@/app/components/container/PageContainer';
import ProfileBanner from '@/app/components/apps/userprofile2/profile/ProfileBanner';
import GalleryCard from '@/app/components/apps/userprofile2/connections/GalleryCard';


const Gallery = () => {
  return (
    <PageContainer title="Gallery" description="this is Gallery">
      <Grid container spacing={3}>
        <Grid item sm={12}>
          <ProfileBanner />
        </Grid>
        <Grid item sm={12}>
        <Box mx={3}>
          <GalleryCard />
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Gallery;
