import React from "react";
import Box from '@mui/material/Box';
import bannerbgImg1 from "/public/images/landingpage/slider-group.png";
import Image from "next/image";

const BannerSlider = () => {
  return (
    <Box
      sx={{
        overflow: "hidden",
        position: "relative",
        paddingTop: 10,
        paddingBottom: 10,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%", 
        }}
      >
        <Box
          width="100%"
          sx={{
            animation: "45s linear 0s infinite normal none running slide",
          }}
        >
          <Image src={bannerbgImg1} alt="bg-img" />
        </Box>
        <Box
          width="100%"
          sx={{
            animation: "45s linear 0s infinite normal none running slide",
          }}
        >
          <Image src={bannerbgImg1} alt="bg-img" />
        </Box>
        <Box
          width="100%"
          sx={{
            animation: "45s linear 0s infinite normal none running slide",
          }}
        >
          <Image src={bannerbgImg1} alt="bg-img" />
        </Box>
        <Box
          width="100%"
          sx={{
            animation: "45s linear 0s infinite normal none running slide",
          }}
        >
          <Image src={bannerbgImg1} alt="bg-img" />
        </Box>
        <Box
          width="100%"
          sx={{
            animation: "45s linear 0s infinite normal none running slide",
          }}
        >
          <Image src={bannerbgImg1} alt="bg-img" />
        </Box>
      </Box>
    </Box>
  );
};

export default BannerSlider;
