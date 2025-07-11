import React from "react";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AnimationFadeIn from "../animation/Animation";

//Carousel slider for product
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "./testimonial.css";

interface SliderType {
  title: string;
  subtitle: string;
  avatar: string;
  subtext: string;
}

const SliderData: SliderType[] = [
  {
    title: "Jenny Wilson",
    subtitle: "Features avaibility",
    avatar: "/images/profile/user-1.jpg",
    subtext:
      "Such a beautiful, detailed, and extensive template. Spike admin is the perfect foundation for any project. I highly recommend this huge time saver.",
  },
  {
    title: "Minshan Cui",
    subtitle: "Features avaibility",
    avatar: "/images/profile/user-2.jpg",
    subtext:
      "The quality of design is excellent, customizability and flexibility much better than the other products available in the market.I strongly recommend the AdminMart to other.",
  },
  {
    title: "Eminson Mendoza",
    subtitle: "Features avaibility",
    avatar: "/images/profile/user-3.jpg",
    subtext:
      "This template is great, UI-rich and up-to-date. Although it is pretty much complete, I suggest to improve a bit of documentation. Thanks & Highly recomended!",
  },
  {
    title: "Jenny Wilson",
    subtitle: "Features avaibility",
    avatar: "/images/profile/user-4.jpg",
    subtext:
      " The dashboard template from Wrappixel has helped me provide a clean and sleek look to my dashboard and made it look exactly the way I wanted it to, mainly without having.",
  },
  {
    title: "Minshan Cui",
    subtitle: "Features avaibility",
    avatar: "/images/profile/user-5.jpg",
    subtext:
      "The quality of design is excellent, customizability and flexibility much better than the other products available in the market.I strongly recommend the AdminMart to other.",
  },
  {
    title: "Eminson Mendoza",
    subtitle: "Features avaibility",
    avatar: "/images/profile/user-6.jpg",
    subtext:
      "This template is great, UI-rich and up-to-date. Although it is pretty much complete, I suggest to improve a bit of documentation. Thanks & Highly recomended!",
  },
];

const Testimonial = () => {
  const [value, setValue] = React.useState<number | null>(5);

  const settings = {
    className: "testimonial-slider",
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <Box
      pt={14}
      pb={11}
      sx={{
        backgroundColor: (theme) => theme.palette.background.paper,
        borderRadius: 0
      }}
    >
      <Container maxWidth="lg">
        <Box mt={5}>
          <AnimationFadeIn>
            <Slider {...settings}>
              {SliderData.map((slider, index) => (
                <Box p="15px" key={index}>
                  <CardContent>
                    <Box textAlign="center" mb={5}>
                      <Rating
                        size="large"
                        name="simple-controlled"
                        value={value}
                        onChange={(event, newValue) => {
                          setValue(newValue);
                        }}
                      />

                      <Typography
                        fontWeight={500}
                        sx={{
                          fontSize: {
                            xs: "22px",
                            lg: "36px",
                          },
                          lineHeight: {
                            xs: "36px",
                            lg: "43px",
                          },
                        }}
                        color="textSecondary"
                        mt={3}
                      >
                        {slider.subtext}
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Avatar
                        src={slider.avatar}
                        alt="user"
                        sx={{ width: 64, height: 64 }}
                      />
                      <Box ml={2}>
                        <Typography variant="h6" fontSize="18px">
                          {slider.title}
                        </Typography>
                        <Typography color="textSecondary" variant="subtitle1">
                          {slider.subtitle}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Box>
              ))}
            </Slider>
          </AnimationFadeIn>
        </Box>
      </Container>
    </Box>
  );
};

export default Testimonial;
