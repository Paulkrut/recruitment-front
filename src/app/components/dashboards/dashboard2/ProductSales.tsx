import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DashboardCard from "../../shared/DashboardCard";
import {
  IconDotsVertical,
  IconUserCircle,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from "@mui/material/styles";
import React from "react";
import { Icon } from "@iconify/react";

const ProductSales = () => {
  const theme = useTheme();

  const primary = theme.palette.primary.main;
  const primarylight = theme.palette.primary.light;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // chart
  const optionproductsaleschart: any = {
    chart: {
      type: "area",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: {
        show: false,
      },
      height: 240,
    },

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0,
        inverseColors: false,
        opacityFrom: 0.2,
        opacityTo: 0,
        stops: [20, 180],
      },
    },
    dataLabels: {
      enabled: false,
    },

    grid: {
      borderColor: "rgba(0,0,0,0.1)",
      strokeDashArray: 4,
      strokeWidth: 1,
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    stroke: {
      curve: "smooth",
      width: "2",
    },
    xaxis: {
      categories: ["2016", "2017", "2018", "2019", "2020", "2021", "2022"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
    tooltip: {
      theme: theme.palette.mode === "dark" ? "dark" : "light",
      fillSeriesColor: false,
    },
  };
  const seriesproductsaleschart = [
    {
      colors: [primary],
      name: "Product Sales",
      data: [13, 15, 14, 17, 16, 19, 17],
    },
  ];

  return (
    <DashboardCard
      title="Product Sales"
      action={
        <>
          <IconButton
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
          >
            <IconDotsVertical />
          </IconButton>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleClose}>Add</MenuItem>
            <MenuItem onClick={handleClose}>Edit</MenuItem>
            <MenuItem onClick={handleClose}>Delete</MenuItem>
          </Menu>
        </>
      }
    >
      <>
        <Box height="240px" className="rounded-bars">
          <Chart
            options={optionproductsaleschart}
            series={seriesproductsaleschart}
            type="area"
            height={240}
            width={"100%"}
          />
        </Box>

        <Stack direction="row" alignItems="center" spacing={2} mt={2}>
          <Avatar
            sx={{
              bgcolor: primarylight,
              color: primary,
              width: 46,
              height: 46,
            }}
          >
            <Icon icon="solar:user-circle-linear" width="24" height="24" />
          </Avatar>
          <Box>
            <Typography variant="h6" mb="2px" display="flex" gap={2}>
              36,436
              <Box
                bgcolor="success.light"
                color="success.main"
                fontSize="12px"
                p="0px 7px"
                border="1px solid "
                borderRadius={2}
              >
                +23%
              </Box>
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              New Customer
            </Typography>
          </Box>
        </Stack>
      </>
    </DashboardCard>
  );
};

export default ProductSales;
