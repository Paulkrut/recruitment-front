import React from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import BlankCard from "../../shared/BlankCard";
import AnimationFadeIn from "../animation/Animation";

const ImgCard = styled(BlankCard)(() => ({
  backgroundImage: `url('/images/landingpage/shape/line-bg.svg')`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center center",
}));

const StyledButton = styled(Button)(() => ({
  padding: "13px 48px",
  fontSize: "16px",
  borderRadius: "30px",
}));

const C2a = () => {
  return (
    <Box
      pt={7}
      sx={{
        pb: {
          xs: "70px",
          lg: "120px",
        },
        backgroundColor: (theme) => theme.palette.background.paper,
      }}
    >
      <Container maxWidth="lg">
        <AnimationFadeIn>
          <Grid container justifyContent="center" spacing={3}>
            <Grid item xs={12} sm={10} lg={6}>
              <ImgCard>
                <CardContent sx={{ py: 5 }}>
                  <Box textAlign="center">
                    <Typography variant="h3" fontWeight={600}>
                      Haven&apos;t found an answer to your question?
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={400}
                      color="textSecondary"
                      mt={2}
                    >
                      Connect with us either on discord or email us
                    </Typography>
                  </Box>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={3}
                    mt={5}
                    justifyContent="center"
                    mb={3}
                  >
                    <StyledButton
                      variant="contained"
                      color="primary"
                      href="https://discord.com/invite/eMzE8F6Wqs"
                    >
                      Ask on Discord
                    </StyledButton>
                    <StyledButton
                      variant="outlined"
                      color="primary"
                      href="https://support.wrappixel.com/"
                    >
                      Submit Ticket
                    </StyledButton>
                  </Stack>
                </CardContent>
              </ImgCard>
            </Grid>
          </Grid>
        </AnimationFadeIn>
      </Container>
    </Box>
  );
};

export default C2a;
