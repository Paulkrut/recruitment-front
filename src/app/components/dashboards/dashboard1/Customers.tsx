import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import dynamic from "next/dynamic";
import React from "react";
import { useTheme } from "@mui/material/styles";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import DashboardCard from "../../shared/DashboardCard";
import SkeletonCustomersCard from "../skeleton/CustomerCard";


interface CustomersCardProps {
  isLoading: boolean;
}

const Customers = ({ isLoading }: CustomersCardProps) => {
  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.light;

  // chart
  const optionscolumnchart: any = {
    chart: {
      type: "area",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: {
        show: false,
      },
      height: 103,
      sparkline: {
        enabled: true,
      },
      group: 'sparklines',
    },
    colors: [primary, secondary],
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0,
        inverseColors: false,
        opacityFrom: 0.05,
        opacityTo: 0,
        stops: [20, 180],
      },
    },
    markers: {
      size: 0,
    },
    tooltip: {
      theme: theme.palette.mode === "dark" ? "dark" : "light",
      fillSeriesColor: false,
    },
  };
  const seriescolumnchart = [
    {
      name: '',
      data: [25, 66, 20, 40, 12, 30],
    },
  ];

  return (
    <>
       {isLoading ? (
        <SkeletonCustomersCard />
      ) : (
        <DashboardCard
      title="Customers"
      subtitle="Last 7 days"
      action={
        <Box textAlign="right">
          <Typography variant="h5" display="block">
            6,380
          </Typography>
          <Box
            bgcolor="success.light"
            color="success.main"
            fontSize="12px"
            p="0px 7px"
            border="1px solid "
            borderRadius={2}
          >
            +26.5%
          </Box>
        </Box>
      }
    >
      <>
        <Box mt={5}>
          <Chart
            options={optionscolumnchart}
            series={seriescolumnchart}
            type="area"
            height={103}
            width={"100%"}
          />
        </Box>

        <Stack direction="row" spacing={2} mt={4}>
          <Typography variant="subtitle1" color="textSecondary">
            April 07 - April 14
          </Typography>
          <Typography
            variant="subtitle1"
            color="textSecondary"
            ml="auto !important"
          >
            6,380
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2} mt={1}>
          <Typography variant="subtitle1" color="textSecondary">
            Last Week
          </Typography>
          <Typography
            variant="subtitle1"
            color="textSecondary"
            ml="auto !important"
          >
            4,298
          </Typography>
        </Stack>
      </>
    </DashboardCard>
      )}
    </>
    
  );
};

export default Customers;
