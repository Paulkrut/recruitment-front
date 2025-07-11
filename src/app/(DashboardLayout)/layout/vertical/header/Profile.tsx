import React, { useState } from "react";
import Link from "next/link";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import { Icon } from "@iconify/react";

import { Stack } from "@mui/system";

const profile = [
  {
    href: "/apps/user-profile/profile",
    title: "My Profile",
    subtitle: "Account Settings",
    icon: <Icon icon="solar:wallet-2-line-duotone" width="20" height="20" />,
    color: "primary",
  },
  {
    href: "/apps/email",
    title: "My Inbox",
    subtitle: "Messages & Emails",
    icon: <Icon icon="solar:shield-minimalistic-line-duotone" width="20" height="20" />,
    color: "success",
  },
  {
    href: "/apps/notes",
    title: "My Tasks",
    subtitle: "To-do and Daily Tasks",
    icon: <Icon icon="solar:card-2-line-duotone" width="20" height="20" />,
    color: "error",
  },
];

const Profile = () => {

  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));

  const [anchorEl2, setAnchorEl2] = useState(null);
  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  return (
    <Box>
      <Button
        size="large"
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === "object" && {
            color: "primary.main",
          }),
          display: "flex",
          gap: 2,
        }}
        onClick={handleClick2}
      >
        <Avatar
          src={"/images/profile/user1.jpg"}
          alt={"ProfileImg"}
          sx={{
            width: 45,
            height: 45,
          }}
        />
        
        {lgUp ? <Box textAlign="left">
          <Typography variant="h6" color="textPrimary" display="flex" alignItems="center"> Mike Nielsen</Typography>
          <Typography variant="subtitle2" color="textSecondary"> Admin</Typography>
        </Box> : ""}
      </Button>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiMenu-paper": {
            width: "360px",
            p: 4,
          },
        }}
      >
        <Typography variant="h5">User Profile</Typography>
        <Stack direction="row" py={3} spacing={2} alignItems="center">
          <Avatar
            src={"/images/profile/user1.jpg"}
            alt={"ProfileImg"}
            sx={{ width: 95, height: 95 }}
          />
          <Box>
            <Typography variant="h6" color="textPrimary" fontWeight={600}>
            Mike Nielsen
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
            Admin
            </Typography>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <Icon icon="solar:letter-line-duotone" width="15" height="15" />
              info@spike.com
            </Typography>
          </Box>
        </Stack>
        <Divider />
        {profile.map((profile) => (
          <Box key={profile.title}>
            <Box sx={{ py: 2, px: 0 }} className="hover-text-primary">
              <Link href={profile.href}>
                <Stack direction="row" spacing={2}>
                  <Box
                    minWidth="45px"
                    height="45px"
                    bgcolor={profile.color + ".light"}
                    color={profile.color + ".main"}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >

                    {profile.icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="textPrimary"
                      className="text-hover"
                      noWrap
                      sx={{
                        width: "240px",
                      }}
                    >
                      {profile.title}
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="subtitle2"
                      sx={{
                        width: "240px",
                      }}
                      noWrap
                    >
                      {profile.subtitle}
                    </Typography>
                  </Box>
                </Stack>
              </Link>
            </Box>
          </Box>
        ))}
        <Box mt={2}>
          <Button
            href="/auth/auth1/login"
            variant="contained"
            color="primary"
            component={Link}
            fullWidth
          >
            Log out
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
