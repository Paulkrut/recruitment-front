import React from "react";
import { useTheme } from "@mui/material/styles";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const SkeletonCongratulationsCard = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const borderColor = theme.palette.divider;

  return (
    <Card
      sx={{
        padding: 0,
        border: !customizer.isCardShadow ? `1px solid ${borderColor}` : "none",
      }}
      elevation={customizer.isCardShadow ? 9 : 0}
      variant={!customizer.isCardShadow ? "outlined" : undefined}
    >
      <CardContent sx={{ position: "relative" }}>
        <Typography variant="h5" mb={1}>
          <Skeleton variant="rounded" width={125} height={21} />
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          <Skeleton variant="rounded" width={250} height={21} />
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Stack spacing={3} mt={3}>
              <Stack direction="row" spacing={2} mb={1} alignItems="center">
                <Skeleton variant="rounded" width={38} height={38} />
                <Box>
                  <Typography variant="h6" mb={1} fontWeight="600">
                    <Skeleton variant="rounded" width={245} height={25} />
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    <Skeleton variant="rounded" width={245} height={25} />
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} mb={1} alignItems="center">
                <Skeleton variant="rounded" width={38} height={38} />
                <Box>
                  <Typography variant="h6" mb={1} fontWeight="600">
                    <Skeleton variant="rounded" width={245} height={25} />
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    <Skeleton variant="rounded" width={245} height={25} />
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} mb={1} alignItems="center">
                <Skeleton variant="rounded" width={38} height={38} />
                <Box>
                  <Typography variant="h6" mb={1} fontWeight="600">
                    <Skeleton variant="rounded" width={245} height={25} />
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    <Skeleton variant="rounded" width={245} height={25} />
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardContent>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          alignItems={"center"}
          mb={3}
        >
          <Box>
            <Typography variant="h5" mb={1}>
              <Skeleton variant="rounded" width={125} height={21} />
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              <Skeleton variant="rounded" width={250} height={21} />
            </Typography>
          </Box>

          <Skeleton variant="rounded" width={140} height={40} />
        </Stack>
        <Stack>
          <Skeleton variant="rounded" width={504} height={220} />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SkeletonCongratulationsCard;
