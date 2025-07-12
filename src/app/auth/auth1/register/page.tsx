"use client";
import Link from "next/link";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import PageContainer from "@/app/components/container/PageContainer";
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import AuthRegister from "../../authForms/AuthRegister";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

export default function Register() {
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));
  const customizer = useSelector((state: AppState) => state.customizer);

  return (
    <PageContainer title="Register Page" description="this is Sample page">
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
                bottom: "-10px",
                width: "300px",
                height: "300px",
                borderRadius: "100%",
                backgroundColor: "error.main",
              },
              "&:after": {
                content: "''",
                position: "absolute",
                top: "0",
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
                backgroundColor: (theme:any)=>theme.palette.mode==="light"?"white":"#111c2d",
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
                      <AuthRegister
                        title="Welcome to Spike Admin"
                        subtext={
                          <Typography
                            variant="subtitle1"
                            color="textSecondary"
                            mb={1}
                          >
                            Your Admin Dashboard
                          </Typography>
                        }
                        subtitle={
                          <Stack direction="row" spacing={1} mt={3}>
                            <Typography
                              color="textSecondary"
                              variant="h6"
                              fontWeight="400"
                            >
                              Already have an Account?
                            </Typography>
                            <Typography
                              component={Link}
                              href="/auth/auth1/login"
                              fontWeight="500"
                              sx={{
                                textDecoration: "none",
                                color: "primary.main",
                              }}
                            >
                              Sign In
                            </Typography>
                          </Stack>
                        }
                      />
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
