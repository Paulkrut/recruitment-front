import React from "react";
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import dynamic from "next/dynamic";
import { useTheme } from "@mui/material/styles";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import DashboardCard from "../../shared/DashboardCard";
import SkeletonProductsCard from "../skeleton/ProductCard";

interface ProductsCardProps {
  isLoading: boolean;
}

const Products = ({ isLoading }: ProductsCardProps) => {
  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const info = theme.palette.info.main;
  const error = theme.palette.error.main;

  // chart
  const optionscolumnchart: any = {
    chart: {
      type: "donut",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: {
        show: false,
      },
      height: 170,
      stacked: true,
    },
    labels: ["2022", "2021", "2020"],
    colors: [primary, error, info],
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        donut: {
          size: "85%",
        },
      },
    },
    stroke: {
      show: false,
    },

    dataLabels: {
      enabled: false,
    },

    legend: {
      show: false,
    },
    tooltip: {
      theme: theme.palette.mode === "dark" ? "dark" : "light",
      fillSeriesColor: false,
    },
  };
  const seriescolumnchart = [70, 18, 12];

  return (
    <>
      {isLoading ? (
        <SkeletonProductsCard />
      ) : (
        <DashboardCard
          title="Products"
          subtitle="Last 7 days"
          action={
            <Box textAlign="right">
              <Typography variant="h5" display="block">
                432
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
            <Box className="rounded-bars" mt={5}>
              <Chart
                options={optionscolumnchart}
                series={seriescolumnchart}
                type="donut"
                height={170}
                width={"100%"}
              />
            </Box>

            <Typography
              variant="subtitle1"
              color="textSecondary"
              textAlign="center"
              mt={2}
            >
              $18k Profit more than month
            </Typography>
          </>
        </DashboardCard>
      )}
    </>
  );
};

export default Products;
