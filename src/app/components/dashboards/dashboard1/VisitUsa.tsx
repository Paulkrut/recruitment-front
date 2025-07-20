import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import DashboardCard from "../../shared/DashboardCard";
import React from "react";




const VisitUsa: React.FC = () => {




  return (
    <DashboardCard title="Visit From USA" subtitle="Top locations">
      <Box>

        <Stack direction="column" spacing={3}>
        <Stack direction="row" spacing={2} justifyContent="space-between">
              <Typography variant="h6" fontSize="14px">
                LA
              </Typography>
              <Box width="100%" mt="6px !important">
                <LinearProgress value={28} color="info" variant="determinate" />
              </Box>
              <Typography variant="h6" fontSize="14px">
                28%
              </Typography>
            </Stack>
            {/* 2 */}
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Typography variant="h6" fontSize="14px">
                NY
              </Typography>
              <Box width="100%" mt="6px !important">
                <LinearProgress
                  value={21}
                  color="primary"
                  variant="determinate"
                />
              </Box>
              <Typography variant="h6" fontSize="14px">
                21%
              </Typography>
            </Stack>
            {/* 3 */}
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Typography variant="h6" fontSize="14px">
                AT
              </Typography>
              <Box width="100%" mt="6px !important">
                <LinearProgress
                  value={18}
                  color="error"
                  variant="determinate"
                />
              </Box>
              <Typography variant="h6" fontSize="14px">
                18%
              </Typography>
            </Stack>
            {/* 4 */}
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Typography variant="h6" fontSize="14px">
                CA
              </Typography>
              <Box width="100%" mt="6px !important">
                <LinearProgress
                  value={12}
                  color="warning"
                  variant="determinate"
                />
              </Box>
              <Typography variant="h6" fontSize="14px">
                12%
              </Typography>
            </Stack>
        </Stack>
      </Box>
    </DashboardCard>
  );
};

export default VisitUsa;
