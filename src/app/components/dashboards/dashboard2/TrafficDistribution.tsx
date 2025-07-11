import Box from '@mui/material/Box';
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

const TrafficDistribution = () => {
  const theme = useTheme();

  const primary = theme.palette.primary.main;
  const info = theme.palette.info.main;
  const error = theme.palette.error.main;
  const warning = theme.palette.warning.main;
  const secondary = theme.palette.secondary.light;

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
      title: "4,106",
      subtitle: "Oragnic Traffic",
      color: primary,
      profit: true,
    },
    {
      title: "3,500",
      subtitle: "Refferal Traffic",
      color: error,
      profit: false,
    },
    {
      title: "3,319",
      subtitle: "Direct Traffic",
      color: warning,
      profit: false,
    },
  ];

  // chart
  const optionscolumnchart: any = {
    chart: {
      type: "donut",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: {
        show: false,
      },
      height: 250,
    },
    labels: ["Others", "Direct Traffic", "Refferal Traffic", "Oragnic Traffic"],
    colors: [ secondary, warning,  error,  primary],
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          background: "none",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "18px",
              color: undefined,
              offsetY: 5,
            },
            value: {
              show: false,
              color: "#98aab4",
            },
          },
        },
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
    tooltip: {
      theme: theme.palette.mode === "dark" ? "dark" : "light",
      fillSeriesColor: false,
    },
  };
  const seriescolumnchart = [5368, 3319, 3500, 4106];

  return (
    <DashboardCard
      title="Traffic Distribution"
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
        <Grid spacing={3} container display="flex" alignItems="center">
          <Grid item xs={12} sm={7}>
            <Box height="250px">
              <Chart
                options={optionscolumnchart}
                series={seriescolumnchart}
                type="donut"
                height={250}
                width={"100%"}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={5} display="flex" alignItems="center">
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
                    <Box
                      sx={{
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderColor: stat.color,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                      }}
                    >
                    </Box>
                    <Box>
                      <Typography variant="h6" mb="4px">
                        {stat.title}{" "}
                        {stat.profit ? (
                          <Typography
                            component="span"
                            variant="subtitle2"
                            ml={1}
                            fontSize="12px"
                            color="success.main"
                          >
                            +23%
                          </Typography>
                        ) : (
                          ""
                        )}
                      </Typography>
                      <Typography variant="subtitle2" color="textSecondary">
                        {stat.subtitle}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </>
    </DashboardCard>
  );
};

export default TrafficDistribution;
