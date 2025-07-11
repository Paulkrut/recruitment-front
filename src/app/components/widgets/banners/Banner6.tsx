import React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IconArrowUpRight } from  '@tabler/icons-react';
import Image from 'next/image';

const Banner6 = () => {
  return (
    <Card elevation={0} sx={{ py: 0 }}>
      <CardContent sx={{ py: 4, px: 2 }}>
        <Grid container justifyContent="space-between">
          <Grid item sm={6} display="flex" alignItems="center">
            <Box>
              <Box
                gap="16px" mb={5}
                sx={{
                  display: {
                    xs: 'block',
                    sm: 'flex',
                  },
                  alignItems: 'center',
                }}
              >
                <Avatar src='/images/profile/user1.jpg' alt="img" sx={{ width: 40, height: 40 }} />
                <Typography variant="h5" whiteSpace="nowrap">
                  Welcome back Mike Nielsen!
                </Typography>
              </Box>

              <Stack spacing={2}  direction="row" divider={<Divider orientation="vertical" flexItem />}>
                <Box>
                <Typography variant="h2" whiteSpace="nowrap">$2,340 <span><IconArrowUpRight width={18} color="#39B69A" /></span></Typography>
                <Typography variant="subtitle1" whiteSpace="nowrap">Today’s Sales</Typography>
                </Box>
                <Box>
                <Typography variant="h2" whiteSpace="nowrap">35%<span><IconArrowUpRight width={18} color="#39B69A" /></span></Typography>
                <Typography variant="subtitle1" whiteSpace="nowrap">Performance</Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
          <Grid item sm={6}>
            <Box mb="-51px">
              <Image src='/images/backgrounds/welcome-bg.png' alt='img' width={340} height={204} style={{ width: "340px", height: "204px" }} />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Banner6;
