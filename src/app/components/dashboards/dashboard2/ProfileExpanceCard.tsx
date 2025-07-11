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
import { IconDotsVertical } from "@tabler/icons-react";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from "@mui/material/styles";
import React from "react";
import Image from "next/image";

const ProfielExpanceCard = () => {
  const theme = useTheme();

  const primary = theme.palette.primary.main;
  const info = theme.palette.info.main;
  const infolight = theme.palette.info.light;
  const error = theme.palette.error.main;
  const errorlight = theme.palette.error.light;
  const secondary = theme.palette.secondary.main;
  const secondarylight = theme.palette.secondary.light;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const stats = [
    {
      title: "$63,489.50",
      subtitle: "Earning this year",
      color: error,
      lightcolor: errorlight,
      profit: false,
      icon: "/images/svgs/icon-biology.svg",
    },
    {
      title: "$48,820.00",
      subtitle: "Profit this year",
      color: info,
      lightcolor: infolight,
      profit: true,
      icon: "/images/svgs/icon-erase.svg",
    },
    {
      title: "$103,582.50",
      subtitle: "Overall earnings",
      color: secondary,
      lightcolor: secondarylight,
      profit: false,
      icon: "/images/svgs/icon-globe.svg",
    },
  ];

  // chart
  const optionscolumnchart: any = {
    chart: {
      type: "bar",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: {
        show: false,
      },
      height: 300,
      stacked: true,
    },
    colors: [primary, error],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "27%",
        borderRadius: 6,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: false,
    },

    legend: {
      show: false,
    },
    grid: {
      borderColor: "rgba(0,0,0,0.1)",
      padding: { top: 0, bottom: -8, left: 20, right: 20 },
    },
    xaxis: {
      categories: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      theme: theme.palette.mode === "dark" ? "dark" : "light",
      fillSeriesColor: false,
    },
  };
  const seriescolumnchart = [
    {
      name: "Profit",
      data: [60, 40, 37, 35, 35, 20, 30],
    },
    {
      name: "Expenses",
      data: [15, 30, 15, 35, 25, 30, 30],
    },
  ];

  return (
    <DashboardCard
      title="Profit & Expenses"
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
        <Grid spacing={3} container>
          <Grid item xs={12} sm={7}>
            <Box height="300px" className="rounded-bars">
              <Chart
                options={optionscolumnchart}
                series={seriescolumnchart}
                type="bar"
                height={300}
                width={"100%"}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={5}>
            <Stack spacing={3} my={5}>
              {stats.map((stat, i) => (
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="space-between"
                  alignItems="center"
                  key={i}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: stat.lightcolor,
                        color: stat.color,
                        width: 46,
                        height: 46,
                      }}
                    >
                      <Image src={stat.icon} alt="icon" width={24} height={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" mb="4px">
                        {stat.title} { stat.profit ? <Typography component="span" variant="subtitle2" ml={1} fontSize="12px" color="success.main">+23%</Typography> : ""}
                      </Typography>
                      <Typography variant="subtitle2" color="textSecondary">
                        {stat.subtitle}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              ))}
            </Stack>
            <Button variant="contained" color="primary">
              View Full Report
            </Button>
          </Grid>
        </Grid>
      </>
    </DashboardCard>
  );
};

export default ProfielExpanceCard;
