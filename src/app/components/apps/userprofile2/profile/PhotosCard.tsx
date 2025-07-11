import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from "react";
import BlankCard from "../../../../components/shared/BlankCard";
import { IconBrandGithub, IconBrandReact } from "@tabler/icons-react";
import Link from "next/link";

const others = [
  {
    icon: <IconBrandGithub size="18" />,
    title: "Backend Developer",
    subtext: "120 members",
    color: "info.light",
    darkcolor: "info.main",
  },
  {
    icon: <IconBrandReact size="18" />,
    title: "React Developer",
    subtext: "86 members",
    color: "primary.light",
    darkcolor: "primary.main",
  },
];
const PhotosCard = () => {
  return (
    <BlankCard>
      <Box p={3}>
        <Typography variant="h5" mb={2}>
          Teams
        </Typography>
        {
          others.map((other,index)=>{
            return(
              <Stack direction="row" gap={2} alignItems="center" mb={3} key={index+1}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  height: "40px",
                  width: "40px",
                  backgroundColor: other.color,
                  color: other.darkcolor,
                }}
              >
                {other.icon}
              </Box>
              <Box>
                <Typography variant="h6" fontSize="14px">
                  {other.title}
                </Typography>
                <Typography variant="subtitle2">{other.subtext}</Typography>
              </Box>
            </Stack>
            )
          })
        }
        <Typography
          sx={{
            "& a": {
              color: "primary.main",
              fontWeight: 500,
            },
          }}
        >
          <Link href="/">View all</Link>
        </Typography>
      </Box>
    </BlankCard>
  );
};

export default PhotosCard;
