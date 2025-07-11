import React from "react";
import FeaturesTitle from "./FeaturesTitle";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {
  IconAdjustments,
  IconArchive,
  IconArrowsShuffle,
  IconBook,
  IconBuildingCarousel,
  IconCalendar,
  IconChartPie,
  IconDatabase,
  IconDiamond,
  IconLanguageKatakana,
  IconLayersIntersect,
  IconMessages,
  IconRefresh,
  IconTag,
  IconWand,
} from "@tabler/icons-react";
import AnimationFadeIn from "../animation/Animation";
import BlankCard from "../../shared/BlankCard";

interface FeaturesType {
  icon: React.ReactElement;
  title: string;
  subtext: string;
  color: any;
}

const featuresData: FeaturesType[] = [
  {
    icon: <IconWand width={30} height={30} strokeWidth={1.5} />,
    color: 'primary',
    title: "6 Theme Colors",
    subtext: "We have included 6 pre-defined Theme Colors with Elegant Admin.",
  },
  {
    icon: <IconArchive width={30} height={30} strokeWidth={1.5} />,
    color: "secondary",
    title: "65+ Page Templates",
    subtext: "Yes, we have 4 demos & 65+ Pages per demo to make it easier.",
  },
  {
    icon: <IconAdjustments width={30} height={30} strokeWidth={1.5} />,
    color: "warning",
    title: "45+ UI Components",
    subtext: "Almost 45+ UI Components being given with Spike Admin Pack.",
  },
  {
    icon: <IconTag width={30} height={30} strokeWidth={1.5} />,
    color: "error",
    title: "Material Ui",
    subtext: "Its been made with Material Ui and full responsive layout.",
  },
  {
    icon: <IconDiamond width={30} height={30} strokeWidth={1.5} />,
    color: "success",
    title: "3400+ Font Icons",
    subtext:
      "Lots of Icon Fonts are included here in the package of Spike Admin.",
  },
  {
    icon: <IconDatabase width={30} height={30} strokeWidth={1.5} />,
    color: "primary",
    title: "Axios",
    subtext:
      "Axios is a promise-based HTTP Client for node.js and the browser.",
  },
  {
    icon: <IconLanguageKatakana width={30} height={30} strokeWidth={1.5} />,
    color: "secondary",
    title: "i18 React",
    subtext:
      "react-i18 is a powerful internationalization framework for React.",
  },
  {
    icon: <IconBuildingCarousel width={30} height={30} strokeWidth={1.5} />,
    color: "warning",
    title: "Slick Carousel",
    subtext: "The Last React Carousel You will Ever Need!",
  },
  {
    icon: <IconArrowsShuffle width={30} height={30} strokeWidth={1.5} />,
    color: "error",
    title: "Easy to Customize",
    subtext: "Customization will be easy as we understand your pain.",
  },
  {
    icon: <IconChartPie width={30} height={30} strokeWidth={1.5} />,
    color: "success",
    title: "Lots of Chart Options",
    subtext: "You name it and we have it, Yes lots of variations for Charts.",
  },
  {
    icon: <IconCalendar width={30} height={30} strokeWidth={1.5} />,
    color: "primary",
    title: "Calendar Design",
    subtext: "Calendar is available with our package & in nice design.",
  },
  {
    icon: <IconMessages width={30} height={30} strokeWidth={1.5} />,
    color: "error",
    title: "Dedicated Support",
    subtext: "We believe in supreme support is key and we offer that.",
  },
  {
    icon: <IconLayersIntersect width={30} height={30} strokeWidth={1.5} />,
    color: "primary",
    title: "Lots of Table Examples",
    subtext: "Data Tables are initial requirement and we added.",
  },
  {
    icon: <IconRefresh width={30} height={30} strokeWidth={1.5} />,
    color: "secondary",
    title: "Regular Updates",
    subtext: "We are constantly updating our pack with new features.",
  },
  {
    icon: <IconBook width={30} height={30} strokeWidth={1.5} />,
    color: "warning",
    title: "Detailed Documentation",
    subtext: "We have made detailed documentation, that's easy.",
  },
  
  
];

const Features = () => {
  return (
    <Box py={12}>
      <Container maxWidth="lg">
        <FeaturesTitle />
        <AnimationFadeIn>
          <Box mt={10}>
            <Grid container spacing={3}>
              {featuresData.map((feature, index) => (
                <Grid item xs={12} sm={4} lg={3} key={index}>
                  <BlankCard>
                    <CardContent>
                      <Avatar
                        sx={{
                          bgcolor: `${feature.color}` + ".light",
                          color: `${feature.color}` + ".main",
                          width: 50,
                          height: 50, borderRadius: "18px"
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h5" mt={3}>
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        color="textSecondary"
                        mt={1}
                      >
                        {feature.subtext}
                      </Typography>
                    </CardContent>
                  </BlankCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        </AnimationFadeIn>
      </Container>
    </Box>
  );
};

export default Features;
