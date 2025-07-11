import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import DashboardCard from "../../shared/DashboardCard";
import React from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Theme } from '@mui/material/styles';
import { useTheme } from "@mui/material/styles";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

interface MarkerData {
  markerOffset: number;
  color: string;
  name: string;
  coordinates: [number, number];
}

const VisitUsa: React.FC = () => {
  const theme = useTheme();
  
  const markers: MarkerData[] = [
    { markerOffset: -20, color:"#46caeb", name: "Chicago", coordinates: [-87.6298, 41.8781] },
    { markerOffset: -20, color: theme.palette.primary.main, name: "Boston", coordinates: [-71.0589, 42.3601] },
    { markerOffset: -20, color:"#fb977d", name: "Tulsa", coordinates: [-95.9928, 36.154] },
    { markerOffset: -20, color:"#f8c076", name: "Baltimore", coordinates: [-76.6122, 39.2904] },
  ];

  return (
    <DashboardCard title="Visit From USA" subtitle="Top locations">
      <Box>
        <Box
          mb={3}
          height="250px"
          sx={{
            ".dxm-background": {
              fill: (theme) =>
                theme.palette.mode === "dark" ? "#111936" : "white",
            },
          }}
        >
          <ComposableMap projection="geoAlbersUsa">
            <Geographies geography={geoUrl}>
              {({ geographies }) => (
                <>
                  {geographies.map(geo => (
                    <Geography key={geo.rsmKey} geography={geo} fill="#d2d2d2" strokeWidth={4} />
                  ))}
                </>
              )}
            </Geographies>
            {markers.map(({ name, coordinates, markerOffset, color }) => (
              <Marker key={name} coordinates={coordinates}>
                <circle r={15} fill={color} stroke="#fff" strokeWidth={4} />
              </Marker>
            ))}
          </ComposableMap>
        </Box>
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