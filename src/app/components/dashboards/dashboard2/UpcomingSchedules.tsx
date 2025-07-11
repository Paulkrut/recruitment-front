import React from "react";
import DashboardCard from "../../shared/DashboardCard";
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { IconClock, IconDotsVertical } from "@tabler/icons-react";
import Scrollbar from "@/app/components/custom-scroll/Scrollbar";

const UpcomingSchedules = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // tabs
  const [value, setValue] = React.useState("1");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <DashboardCard
      title="Upcoming Schedules"
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
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList
              onChange={handleChange}
              aria-label="lab API tabs example"
              variant="fullWidth"
              sx={{
                "& .MuiTab-root.Mui-selected": {
                  background: (theme) => theme.palette.primary.main,
                  color: "white",
                  borderRadius: "8px",
                },
                "& .MuiTabs-indicator": {
                  display: "none",
                },
              }}
            >
              <Tab label="1 to 3" value="1" />
              <Tab label="4 to 7" value="2" />
              <Tab label="8 to 10" value="3" />
            </TabList>
          </Box>
          <TabPanel
            value="1"
            sx={{
              "&.MuiTabPanel-root": {
                padding: "24px 0 0",
              },
            }}
          >
            <Scrollbar sx={{ height: "340px" }}>
              <Grid container>
                <Grid item xs={2} textAlign="left">
                  <Stack direction="column" spacing={4}>
                    <Typography variant="subtitle1">8:00</Typography>
                    <Typography variant="subtitle1">8:30</Typography>
                    <Typography variant="subtitle1">9:00</Typography>
                    <Typography variant="subtitle1">9:30</Typography>
                    <Typography variant="subtitle1">10:00</Typography>
                    <Typography variant="subtitle1">10:30</Typography>
                    <Typography variant="subtitle1">11:00</Typography>
                    <Typography variant="subtitle1">11:30</Typography>
                    <Typography variant="subtitle1">12:00</Typography>
                    <Typography variant="subtitle1">12:30</Typography>
                    <Typography variant="subtitle1">13:00</Typography>
                    <Typography variant="subtitle1">13:30</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={10}>
                  <Paper elevation={9} sx={{ mt: 7 }}>
                    <Box
                      p={2}
                      sx={{
                        borderWidth: "0 0 0 5px",
                        borderStyle: "solid",
                        borderColor: "primary.main",
                      }}
                    >
                      <Typography variant="h6">Marketing Meeting</Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        color="textSecondary"
                        mb={6}
                      >
                        <IconClock width={18} />
                        <Typography variant="subtitle1">
                          08:30 - 10:00
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <AvatarGroup
                          max={4}
                          sx={{ justifyContent: "flex-end" }}
                        >
                          <Avatar
                            alt="Remy Sharp"
                            src="/images/profile/user1.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Travis Howard"
                            src="/images/profile/user2.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Cindy Baker"
                            src="/images/profile/user3.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Agnes Walker"
                            src="/images/profile/user4.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                        </AvatarGroup>
                        <Typography variant="subtitle1">+18</Typography>
                      </Stack>
                    </Box>
                  </Paper>
                  <Paper elevation={9} sx={{ mt: 6 }}>
                    <Box
                      p={2}
                      sx={{
                        borderWidth: "0 0 0 5px",
                        borderStyle: "solid",
                        borderColor: "success.main",
                      }}
                    >
                      <Typography variant="h6">Applied mathematics</Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        color="textSecondary"
                        mb={6}
                      >
                        <IconClock width={18} />
                        <Typography variant="subtitle1">
                          10:15 - 11:45
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <AvatarGroup
                          max={4}
                          sx={{ justifyContent: "flex-end" }}
                        >
                          <Avatar
                            alt="Remy Sharp"
                            src="/images/profile/user1.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Travis Howard"
                            src="/images/profile/user2.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Cindy Baker"
                            src="/images/profile/user3.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Agnes Walker"
                            src="/images/profile/user4.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                        </AvatarGroup>
                        <Typography variant="subtitle1">+18</Typography>
                      </Stack>
                    </Box>
                  </Paper>
                  <Paper elevation={9} sx={{ mt: 5 }}>
                    <Box
                      p={2}
                      sx={{
                        borderWidth: "0 0 0 5px",
                        borderStyle: "solid",
                        borderColor: "error.main",
                      }}
                    >
                      <Typography variant="h6">
                        SEO Session with Team
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        color="textSecondary"
                        mb={6}
                      >
                        <IconClock width={18} />
                        <Typography variant="subtitle1">
                          12:00 - 13:25
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <AvatarGroup
                          max={4}
                          sx={{ justifyContent: "flex-end" }}
                        >
                          <Avatar
                            alt="Remy Sharp"
                            src="/images/profile/user1.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Travis Howard"
                            src="/images/profile/user2.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Cindy Baker"
                            src="/images/profile/user3.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Agnes Walker"
                            src="/images/profile/user4.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                        </AvatarGroup>
                        <Typography variant="subtitle1">+18</Typography>
                      </Stack>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Scrollbar>
          </TabPanel>
          <TabPanel
            value="2"
            sx={{
              "&.MuiTabPanel-root": {
                padding: "24px 0 0",
              },
            }}
          >
            <Scrollbar sx={{ height: "340px" }}>
              <Grid container>
                <Grid item xs={2} textAlign="left">
                  <Stack direction="column" spacing={4}>
                    <Typography variant="subtitle1">8:00</Typography>
                    <Typography variant="subtitle1">8:30</Typography>
                    <Typography variant="subtitle1">9:00</Typography>
                    <Typography variant="subtitle1">9:30</Typography>
                    <Typography variant="subtitle1">10:00</Typography>
                    <Typography variant="subtitle1">10:30</Typography>
                    <Typography variant="subtitle1">11:00</Typography>
                    <Typography variant="subtitle1">11:30</Typography>
                    <Typography variant="subtitle1">12:00</Typography>
                    <Typography variant="subtitle1">12:30</Typography>
                    <Typography variant="subtitle1">13:00</Typography>
                    <Typography variant="subtitle1">13:30</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={10}>
                  <Paper elevation={9} sx={{ mt: 7 }}>
                    <Box
                      p={2}
                      sx={{
                        borderWidth: "0 0 0 5px",
                        borderStyle: "solid",
                        borderColor: "success.main",
                      }}
                    >
                      <Typography variant="h6">Marketing Meeting</Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        color="textSecondary"
                        mb={6}
                      >
                        <IconClock width={18} />
                        <Typography variant="subtitle1">
                          08:30 - 10:00
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <AvatarGroup
                          max={4}
                          sx={{ justifyContent: "flex-end" }}
                        >
                          <Avatar
                            alt="Remy Sharp"
                            src="/images/profile/user1.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Travis Howard"
                            src="/images/profile/user2.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Cindy Baker"
                            src="/images/profile/user3.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Agnes Walker"
                            src="/images/profile/user4.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                        </AvatarGroup>
                        <Typography variant="subtitle1">+18</Typography>
                      </Stack>
                    </Box>
                  </Paper>
                  <Paper elevation={9} sx={{ mt: 6 }}>
                    <Box
                      p={2}
                      sx={{
                        borderWidth: "0 0 0 5px",
                        borderStyle: "solid",
                        borderColor: "error.main",
                      }}
                    >
                      <Typography variant="h6">Applied mathematics</Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        color="textSecondary"
                        mb={6}
                      >
                        <IconClock width={18} />
                        <Typography variant="subtitle1">
                          10:15 - 11:45
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <AvatarGroup
                          max={4}
                          sx={{ justifyContent: "flex-end" }}
                        >
                          <Avatar
                            alt="Remy Sharp"
                            src="/images/profile/user1.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Travis Howard"
                            src="/images/profile/user2.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Cindy Baker"
                            src="/images/profile/user3.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Agnes Walker"
                            src="/images/profile/user4.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                        </AvatarGroup>
                        <Typography variant="subtitle1">+18</Typography>
                      </Stack>
                    </Box>
                  </Paper>
                  <Paper elevation={9} sx={{ mt: 5 }}>
                    <Box
                      p={2}
                      sx={{
                        borderWidth: "0 0 0 5px",
                        borderStyle: "solid",
                        borderColor: "primary.main",
                      }}
                    >
                      <Typography variant="h6">
                        SEO Session with Team
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        color="textSecondary"
                        mb={6}
                      >
                        <IconClock width={18} />
                        <Typography variant="subtitle1">
                          12:00 - 13:25
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <AvatarGroup
                          max={4}
                          sx={{ justifyContent: "flex-end" }}
                        >
                          <Avatar
                            alt="Remy Sharp"
                            src="/images/profile/user1.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Travis Howard"
                            src="/images/profile/user2.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Cindy Baker"
                            src="/images/profile/user3.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Agnes Walker"
                            src="/images/profile/user4.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                        </AvatarGroup>
                        <Typography variant="subtitle1">+18</Typography>
                      </Stack>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Scrollbar>
          </TabPanel>
          <TabPanel
            value="3"
            sx={{
              "&.MuiTabPanel-root": {
                padding: "24px 0 0",
              },
            }}
          >
            <Scrollbar sx={{ height: "340px" }}>
              <Grid container>
                <Grid item xs={2} textAlign="left">
                  <Stack direction="column" spacing={4}>
                    <Typography variant="subtitle1">8:00</Typography>
                    <Typography variant="subtitle1">8:30</Typography>
                    <Typography variant="subtitle1">9:00</Typography>
                    <Typography variant="subtitle1">9:30</Typography>
                    <Typography variant="subtitle1">10:00</Typography>
                    <Typography variant="subtitle1">10:30</Typography>
                    <Typography variant="subtitle1">11:00</Typography>
                    <Typography variant="subtitle1">11:30</Typography>
                    <Typography variant="subtitle1">12:00</Typography>
                    <Typography variant="subtitle1">12:30</Typography>
                    <Typography variant="subtitle1">13:00</Typography>
                    <Typography variant="subtitle1">13:30</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={10}>
                  <Paper elevation={9} sx={{ mt: 7 }}>
                    <Box
                      p={2}
                      sx={{
                        borderWidth: "0 0 0 5px",
                        borderStyle: "solid",
                        borderColor: "secondary.main",
                      }}
                    >
                      <Typography variant="h6">Marketing Meeting</Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        color="textSecondary"
                        mb={6}
                      >
                        <IconClock width={18} />
                        <Typography variant="subtitle1">
                          08:30 - 10:00
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <AvatarGroup
                          max={4}
                          sx={{ justifyContent: "flex-end" }}
                        >
                          <Avatar
                            alt="Remy Sharp"
                            src="/images/profile/user1.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Travis Howard"
                            src="/images/profile/user2.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Cindy Baker"
                            src="/images/profile/user3.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Agnes Walker"
                            src="/images/profile/user4.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                        </AvatarGroup>
                        <Typography variant="subtitle1">+18</Typography>
                      </Stack>
                    </Box>
                  </Paper>
                  <Paper elevation={9} sx={{ mt: 6 }}>
                    <Box
                      p={2}
                      sx={{
                        borderWidth: "0 0 0 5px",
                        borderStyle: "solid",
                        borderColor: "warning.main",
                      }}
                    >
                      <Typography variant="h6">Applied mathematics</Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        color="textSecondary"
                        mb={6}
                      >
                        <IconClock width={18} />
                        <Typography variant="subtitle1">
                          10:15 - 11:45
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <AvatarGroup
                          max={4}
                          sx={{ justifyContent: "flex-end" }}
                        >
                          <Avatar
                            alt="Remy Sharp"
                            src="/images/profile/user1.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Travis Howard"
                            src="/images/profile/user2.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Cindy Baker"
                            src="/images/profile/user3.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Agnes Walker"
                            src="/images/profile/user4.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                        </AvatarGroup>
                        <Typography variant="subtitle1">+18</Typography>
                      </Stack>
                    </Box>
                  </Paper>
                  <Paper elevation={9} sx={{ mt: 5 }}>
                    <Box
                      p={2}
                      sx={{
                        borderWidth: "0 0 0 5px",
                        borderStyle: "solid",
                        borderColor: "success.main",
                      }}
                    >
                      <Typography variant="h6">
                        SEO Session with Team
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        color="textSecondary"
                        mb={6}
                      >
                        <IconClock width={18} />
                        <Typography variant="subtitle1">
                          12:00 - 13:25
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <AvatarGroup
                          max={4}
                          sx={{ justifyContent: "flex-end" }}
                        >
                          <Avatar
                            alt="Remy Sharp"
                            src="/images/profile/user1.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Travis Howard"
                            src="/images/profile/user2.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Cindy Baker"
                            src="/images/profile/user3.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Avatar
                            alt="Agnes Walker"
                            src="/images/profile/user4.jpg"
                            sx={{ width: 32, height: 32 }}
                          />
                        </AvatarGroup>
                        <Typography variant="subtitle1">+18</Typography>
                      </Stack>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Scrollbar>
          </TabPanel>
        </TabContext>
      </>
    </DashboardCard>
  );
};

export default UpcomingSchedules;
