import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
// images
import mainDemo from "/public/images/landingpage/demos/demo-main.jpg";
import darkDemo from "/public/images/landingpage/demos/demo-dark.jpg";
import horizontalDemo from "/public/images/landingpage/demos/demo-horizontal.jpg";
import rtlDemo from "/public/images/landingpage/demos/demo-rtl.jpg";
import minisidebarDemo from "/public/images/landingpage/demos/demo-minisidebar.jpg";

import app1 from "/public/images/landingpage/apps/app-calendar.jpg";
import app2 from "/public/images/landingpage/apps/app-chat.jpg";
import app3 from "/public/images/landingpage/apps/app-contact.jpg";
import app4 from "/public/images/landingpage/apps/app-email.jpg";
import app5 from "/public/images/landingpage/apps/app-note.jpg";
import app6 from "/public/images/landingpage/apps/app-user-profile.jpg";
import app7 from "/public/images/landingpage/apps/app-blog.jpg";
import app8 from "/public/images/landingpage/apps/app-ticket.jpg";
import app9 from "/public/images/landingpage/apps/app-ecommerce-shop.jpg";
import app11 from "/public/images/landingpage/apps/app-ecommerce-checkout.jpg";
import app12 from "/public/images/landingpage/apps/app-ecommerce-list.jpg";
import app13 from "/public/images/landingpage/apps/app-blog-detail.jpg";
import app14 from "/public/images/landingpage/apps/app-ecommerce-detail.jpg";

import DemoTitle from "./DemoTitle";
import Image from "next/image";

interface DemoTypes {
  link: string;
  img: string | any;
  title: string;
  subtext?: string;
}

const demos: DemoTypes[] = [
  {
    link: "https://spike-nextjs-pro-main.vercel.app/",
    img: mainDemo,
    title: "Main",
    subtext: "Demo"
  },
  {
    link: "https://spike-nextjs-pro-dark.vercel.app/",
    img: darkDemo,
    title: "Dark",
    subtext: "Demo"
  },
  {
    link: "https://spike-nextjs-pro-horizontal.vercel.app/",
    img: horizontalDemo,
    title: "Horizontal",
    subtext: "Demo"
  },
  {
    link: "#",
    img: rtlDemo,
    title: "RTL",
    subtext: "Included with package"
  },
  {
    link: "#",
    img: minisidebarDemo,
    title: "Minisidebar",
    subtext: "Included with package"
  },
];

const apps: DemoTypes[] = [
  {
    link: "https://spike-nextjs-pro-main.vercel.app/apps/calendar",
    img: app1,
    title: "Calendar App",
  },
  {
    link: "https://spike-nextjs-pro-main.vercel.app/apps/chats",
    img: app2,
    title: "Chat App",
  },
  {
    link: "https://spike-nextjs-pro-main.vercel.app/apps/contacts",
    img: app3,
    title: "Contact App",
  },
  {
    link: "https://spike-nextjs-pro-main.vercel.app/apps/email",
    img: app4,
    title: "Email App",
  },
  {
    link: "https://spike-nextjs-pro-main.vercel.app/apps/notes",
    img: app5,
    title: "Note App",
  },
  {
    link: "https://spike-nextjs-pro-main.vercel.app/apps/user-profile2/profile",
    img: app6,
    title: "User Profile App",
  },
  {
    link: "https://spike-nextjs-pro-main.vercel.app/apps/blog/post",
    img: app7,
    title: "Blog App",
  },
  {
    link: "https://spike-nextjs-pro-main.vercel.app/apps/blog/detail/streaming-video-way-before-it-was-cool-go-dark-tomorrow",
    img: app13,
    title: "Blog Detail App",
  },
  {
    link: "https://spike-nextjs-pro-main.vercel.app/apps/tickets",
    img: app8,
    title: "Ticket App",
  },
  {
    link: "https://spike-nextjs-pro-main.vercel.app/apps/ecommerce/shop",
    img: app9,
    title: "eCommerce Shop App",
  },
  {
    link: "https://spike-nextjs-pro-main.vercel.app/apps/ecommerce/checkout",
    img: app11,
    title: "eCommerce Checkout App",
  },
  {
    link: "https://spike-nextjs-pro-main.vercel.app/apps/ecommerce/list",
    img: app12,
    title: "eCommerce List App",
  },
  {
    link: "https://spike-nextjs-pro-main.vercel.app/apps/ecommerce/detail/1",
    img: app14,
    title: "eCommerce Detail App",
  },
];

const StyledBox = styled(Box)(() => ({
  position: "relative",
  borderRadius: "18px 18px 0 0 ",
  ".MuiButton-root": {
    display: "none",
  },
  "&:hover": {
    ".MuiButton-root": {
      display: "block",
      transform: "translate(-50%,-50%)",
      position: "absolute",
      left: "50%",
      right: "50%",
      top: "50%",
      minWidth: "131px",
      zIndex: "9",
    },
    "&:before": {
      content: '""',
      position: "absolute",
      top: "0",
      left: " 0",
      width: "100%",
      height: "100%",
      zIndex: "8",
      borderRadius: "9px 9px 0 0 ",
      backgroundColor: "rgba(0,133,219,.3)",
    },
  },
}));

const DemosApps = () => {
  return (
    <Box
      id="demos"
      pb="140px"
      overflow="hidden" borderRadius="0"
      sx={{
        backgroundColor: (theme) => theme.palette.background.paper,
        pt: {
          xs: "60px",
          lg: "140px",
        },
      }}
    >
      <Container maxWidth="lg">
        {/* Title */}
        <DemoTitle />

        {/* demos */}
        <Box mt={9}>
          <Grid container mt={2} spacing={3}>
            {demos.map((demo, index) => (
              <Grid item xs={12} lg={4} key={index}>
                <Box
                  sx={{
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: (theme) => theme.palette.divider,
                  }}
                >
                  <Box
                    bgcolor="secondary.light"
                    p={2}
                    pb={0}
                    sx={{
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                    }}
                  >
                    <StyledBox>
                      <Image
                        src={demo.img}
                        alt="demo"
                        style={{
                          borderRadius: "8px",
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0,
                          width: "100%",
                          height: "100%",
                          marginBottom: "-5px"
                        }}
                      />
                      <Button
                        variant="contained"
                        color="primary" size="large"
                        href={demo.link}
                        target="_blank"
                      >
                        Live Preview
                      </Button>
                    </StyledBox>
                  </Box>
                  {/* </Link> */}
                  <Box p={2}>
                    <Typography
                      variant="h6"
                      color="textPrimary"
                      fontWeight={500}
                    >
                      {demo.title}
                    </Typography>
                    <Typography
                      variant="h6"
                      color="textSecondary"
                      fontWeight={400}
                      mt={1} fontSize="14px"
                    >
                      {demo.subtext}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
        <Box mb={2} mt={5} textAlign="center">
          <Chip label="Apps" color="primary" />
        </Box>
        {/* apps */}
        <Box>
          <Grid container mt={2} spacing={3}>
            {apps.map((app, index) => (
             <Grid item xs={12} lg={4} key={index}>
             <Box
               sx={{
                 borderWidth: 1,
                 borderStyle: "solid",
                 borderColor: (theme) => theme.palette.divider,
               }}
             >
               <Box
                 bgcolor="secondary.light"
                 p={2}
                 pb={0}
                 sx={{
                   borderBottomLeftRadius: 0,
                   borderBottomRightRadius: 0,
                 }}
               >
                 <StyledBox>
                   <Image
                     src={app.img}
                     alt="app"
                     style={{
                       borderRadius: "8px",
                       borderBottomLeftRadius: 0,
                       borderBottomRightRadius: 0,
                       width: "100%",
                       height: "100%",
                       marginBottom: "-5px"
                     }}
                   />
                   <Button
                     variant="contained"
                     color="primary"
                     size="large"
                     href={app.link}
                     target="_blank"
                   >
                     Live Preview
                   </Button>
                 </StyledBox>
               </Box>
               {/* </Link> */}
               <Box p={2}>
                 <Typography
                   variant="h6"
                   color="textPrimary"
                   fontWeight={500}
                 >
                   {app.title}
                 </Typography>
                 <Typography
                   variant="h6"
                   color="textSecondary"
                   fontWeight={400}
                   mt={1} fontSize="14px"
                 >
                   Application
                 </Typography>
               </Box>
             </Box>
           </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default DemosApps;
