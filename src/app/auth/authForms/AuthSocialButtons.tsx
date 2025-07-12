import CustomSocialButton from "@/app/components/forms/theme-elements/CustomSocialButton";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { signInType } from "@/app/(DashboardLayout)/types/auth/auth";

const AuthSocialButtons = ({ title }: signInType) => (
  <>
    <Grid container spacing={3} sx={{ mt: 3 }}>
      <Grid item xs={12} sm={6}>
        <CustomSocialButton fullWidth>
          <Avatar
            src={"/images/svgs/google-icon.svg"}
            alt={"icon1"}
            sx={{
              width: 16,
              height: 16,
              borderRadius: 0,
              mr: 1,
            }}
          />
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              whiteSpace: "nowrap",
              mr: { sm: "3px" },
            }}
          >
            {title}{" "}
          </Box>{" "}
          Google
        </CustomSocialButton>
      </Grid>
      <Grid item xs={12} sm={6}>
        <CustomSocialButton fullWidth>
          <Avatar
            src={"/images/svgs/facebook-icon.svg"}
            alt={"icon2"}
            sx={{
              width: 25,
              height: 25,
              borderRadius: 0,
              mr: 1,
            }}
          />
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              whiteSpace: "nowrap",
              mr: { sm: "3px" },
            }}
          >
            {title}{" "}
          </Box>{" "}
          FB
        </CustomSocialButton>
      </Grid>
    </Grid>
  </>
);

export default AuthSocialButtons;
