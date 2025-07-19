import React, { useState } from "react";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import * as dropdownData from "./data";
import Scrollbar from "@/app/components/custom-scroll/Scrollbar";

import { Icon } from "@iconify/react";
import { Stack } from "@mui/system";
import Link from "next/link";

const Notifications = () => {
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
        aria-controls="msgs-menu"
        aria-haspopup="true"
        className="btn-rounded-circle-40"
        color="inherit"
        onClick={handleClick2}
      >
        <Box
          sx={{
            position: "relative",
            top: "5px",
            animationName: "pulse",
          }}
        >
          <Icon icon="solar:bell-bing-line-duotone" width="24" height="24" />
          <Box
            sx={{
              position: "absolute",
              top: "-14px",
              right: "-5px",
              height: "18px",
              width: "18px",
              zIndex: "10",
              border: "2px solid #4bd08b",
              borderRadius: "70px",
              animationIterationCount: "infinite !important",
              animation: "heartbit 1s ease-out"
            }}
          ></Box>
          <Box
            sx={{
              width: "4px",
              height: "4px",
              borderRadius: "30px",
              position: "absolute",
              right: "2px",
              top: "-7px",
              backgroundColor:"success.main"
            }}
          ></Box>
        </Box>
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
          },
        }}
      >
        <Stack
          direction="row"
          py={2}
          px={4}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">Notifications</Typography>
          <Chip label="5 new" color="primary" size="small" />
        </Stack>
        <Scrollbar sx={{ height: "385px" }}>
          {dropdownData.notifications.map((notification, index) => (
            <Box key={index}>
              <MenuItem sx={{ py: 2, px: 4 }}>
                <Stack direction="row" spacing={2}>
                  <Avatar
                    src={notification.avatar}
                    alt={notification.avatar}
                    sx={{
                      width: 48,
                      height: 48,
                    }}
                  />
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="textPrimary"
                      fontWeight={600}
                      noWrap
                      sx={{
                        width: "240px",
                      }}
                    >
                      {notification.title}
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="subtitle2"
                      sx={{
                        width: "240px",
                      }}
                      noWrap
                    >
                      {notification.subtitle}
                    </Typography>
                  </Box>
                </Stack>
              </MenuItem>
            </Box>
          ))}
        </Scrollbar>
        <Box p={3} pb={1}>
          <Button
            href="/apps/email"
            variant="outlined"
            component={Link}
            color="primary"
            fullWidth
          >
            See all Notifications
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Notifications;
