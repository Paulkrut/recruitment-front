import React from "react";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
const Footer = () => {
  return (
    <Box
      sx={{
        borderRadius: 0,
        backgroundColor: (theme) => theme.palette.background.paper,
        padding: "30px 0 30px",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} textAlign="center">
            <Typography fontSize="14px" color="textSecondary" mt={1}>
              All rights reserved by Spike Admin. Designed & Developed by
              <Link
                target="_blank"
                underline="none"
                href="https://wrappixel.com/"
              >
                <Typography component="span" display="inline">
                  {" "}
                  Wrappixel
                </Typography>{" "}
              </Link>
              .
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
