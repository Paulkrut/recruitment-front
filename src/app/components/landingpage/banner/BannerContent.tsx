import React from "react";
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';


const StyledButton = styled(Button)(() => ({
  padding: "13px 35px",
  fontSize: "16px",
  borderRadius: "30px",
}));

const BannerContent = () => {
  

  return (
    <>
      <Stack justifyContent="center" spacing={1} gap={2}>
        <Typography
          variant="h1"
          fontWeight={800}
          textAlign="center"
          sx={{
            fontSize: {
              md: "52px",
            },
            lineHeight: {
              md: "62px",
            },
          }}
        >
          Revolutionize your development with Powerful Material UI dashboard
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="center">
          <Typography variant="h5" fontWeight={500} textAlign="center">
            Spike comes with light & dark color skins, well designed dashboards,
            applications and pages
          </Typography>
        </Stack>
      </Stack>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2} mt={6}
        alignItems="center"
        justifyContent="center"
      >
        <StyledButton href="/" variant="contained" color="primary" size="large">
          Live Preview
        </StyledButton>
        <StyledButton href="/" variant="outlined" color="primary" size="large">
          Documentation
        </StyledButton>
      </Stack>

      
    </>
  );
};

export default BannerContent;
