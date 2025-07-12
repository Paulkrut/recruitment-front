"use client";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import PageContainer from "@/app/components/container/PageContainer";
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import AuthTwoSteps from "../../authForms/AuthTwoSteps";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

export default function TwoSteps() {
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));
  const customizer = useSelector((state: AppState) => state.customizer);

  return (
    <PageContainer title="Two Steps Page" description="this is Sample page">
      <Box display="flex" alignItems="center">
        <Box
          position="relative"
          width="100%"
          sx={{
            maxWidth: "1600px",
            height: "calc(100vh - 20px)",
            margin: "10px auto",
            background: (theme) => theme.palette.grey[200],
            overflow: "hidden",
            borderRadius: customizer.borderRadius / 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              position: "relative",
              "&:before": {
                content: "''",
                position: "absolute",
                left: "-125px",
                bottom: "-60px",
                width: "300px",
                height: "300px",
                borderRadius: "100%",
                backgroundColor: "error.main",
              },
              "&:after": {
                content: "''",
                position: "absolute",
                top: "-65px",
                right: "-60px",
                width: "304px",
                height: "315px",
                backgroundRepeat: "no-repeat",
                background: "url('/images/backgrounds/shap-login.png')",
              },
            }}
          >
            <Box
              width="100%"
              sx={{
                position: "relative",
                borderRadius: customizer.borderRadius / 18,
                zIndex: 1,
                margin: {
                  lg: "50px auto 50px auto",
                  sm: "0 20px ",
                  xs: "0 15px",
                },
                boxShadow: "0 2px 30px 15px rgba(37,83,185,.1)",
                backgroundColor: "white",
                maxWidth: {
                  xs: "340px",
                  sm: "500px",
                  lg: "1320px",
                },
              }}
            >
              <Box
                px={4}
                pb={4}
                pt={2}
                sx={{
                  paddingLeft: {
                    lg: 8,
                  },
                  paddingRight: {
                    lg: 8,
                  },
                }}
              >
                <Logo />
                <Grid
                  container
                  spacing={3}
                  justifyContent="space-between"
                  sx={{ mb: 4 }}
                >
                  {lgUp ? (
                    <Grid item xs={12} sm={6}>
                      <Avatar
                        src="/images/backgrounds/login3-bg.png"
                        alt="login"
                        sx={{
                          width: "500px",
                          height: "500px",
                          maxWidth: "100%",
                          borderRadius: 0,
                          margin: "0 auto",
                        }}
                      />
                    </Grid>
                  ) : (
                    ""
                  )}
                  <Grid item xs={12} sm={6} lg={5}>
                    <Box
                      sx={{
                        marginLeft: {
                          lg: 9,
                        },
                      }}
                    >
                      <Typography variant="h4" fontWeight="700">
                        Two Step Verification
                      </Typography>

                      <Typography
                        variant="subtitle1"
                        fontSize="16px"
                        color="textSecondary"
                        mt={2}
                        mb={1}
                      >
                        We sent a verification code to your mobile. Enter the
                        code from the mobile in the field below.
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="700" mb={1}>
                        ******1234
                      </Typography>
                      <AuthTwoSteps />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
}
