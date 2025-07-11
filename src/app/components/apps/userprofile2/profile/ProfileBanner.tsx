import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Badge from '@mui/material/Badge';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useSelector } from "@/store/hooks";
import {
  IconPlus,
} from "@tabler/icons-react";
import ProfileTab from "./ProfileTab";
import BlankCard from "../../../shared/BlankCard";
import React from "react";
import Image from "next/image";

const ProfileBanner = () => {
  const customizer = useSelector((state) => state.customizer);
  const br = `${customizer.borderRadius}px`;

  const ProfileImage = styled(Box)(() => ({
    backgroundImage: "linear-gradient(#50b2fc,#f44c66)",
    borderRadius: "50%",
    width: "110px",
    height: "110px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }));

  return (
    <>
      <Avatar
        src="/images/backgrounds/profilebg-2.jpg"
        alt="profilecover"
        sx={{ width: "100%", borderRadius: br, height: "330px" }}
      />
      <Box mx={3} mt={-6}>
        <BlankCard>
          <Box p={4} pb={0}>
            <Stack direction="row" alignItems="center" spacing={3} mb={3}>
              <Badge
                badgeContent={<IconPlus size={20} />}
                color="primary"
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
              >
                <Avatar
                  src="/images/profile/user1.jpg"
                  alt="image"
                  sx={{ width: 100, height: 100 }}
                />
              </Badge>
              <Box>
                <Typography variant="h3" display="flex" alignItems="center" gap={1}>
                Mike Nielsen{" "}
                  <Box
                    bgcolor="primary.light"
                    color="primary.main"
                    fontSize="12px"
                    p="0px 7px" lineHeight="20px"
                    border="1px solid "
                    borderRadius={2}
                  >
                    Admin
                  </Box>
                </Typography>
                <Typography variant="h6" fontWeight="400" mt="3px" mb="4px">
                  Dream big. Think different. Do great!
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <Box
                    component="span"
                    sx={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "100%",
                      backgroundColor: "success.main",
                    }}
                  />
                  Active
                </Typography>
              </Box>
              <Box ml="auto !important">
                <Button variant="contained">Edit Profile</Button>
              </Box>
            </Stack>
            {/**TabbingPart**/}
            <ProfileTab />
          </Box>
        </BlankCard>
      </Box>
    </>
  );
};

export default ProfileBanner;
