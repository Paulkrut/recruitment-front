"use client";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import PageContainer from "@/app/components/container/PageContainer";
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import AuthForgotPassword from "../../authForms/AuthForgotPassword";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

export default function ForgotPassword() {

  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));
  const customizer = useSelector((state: AppState) => state.customizer);

  return (
    <PageContainer
      title="Forgot Password Page"
      description="this is Sample page"
    >
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
                  <Grid item xs={12} sm={12} lg={6}>
                    <Box
                      sx={{
                        marginLeft: {
                          lg: 9,
                        },
                      }}
                    >
                      <Typography variant="h4" fontWeight="700">
                        Forgot your password?
                      </Typography>

                      <Typography
                        color="textSecondary"
                        variant="subtitle2"
                        fontSize="16px"
                        fontWeight="400"
                        mt={2}
                      >
                        Please enter the email address associated with your
                        account and We will email you a link to reset your
                        password.
                      </Typography>
                      <AuthForgotPassword />
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

