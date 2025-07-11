import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography'
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";

const ProfileCard = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const borderColor = theme.palette.divider;

  return (
    <Card
      sx={{
        padding: 0,
        border: !customizer.isCardShadow ? `1px solid ${borderColor}` : "none",
      }}
      elevation={customizer.isCardShadow ? 9 : 0}
      variant={!customizer.isCardShadow ? "outlined" : undefined}
    >
      <CardContent>
        <Box mb={3} display="flex" justifyContent="space-between">
          <Avatar
            src="/images/profile/user3.jpg"
            sx={{
              width: 60,
              height: 60,
            }}
          ></Avatar>
          <Typography variant="subtitle1" fontWeight={500} color="warning.main">
            #1 in DevOps
          </Typography>
        </Box>

        <Typography variant="h5">Adam Johnson</Typography>
        <Typography variant="subtitle1" fontWeight={500} color="textSecondary">
          Top Developer
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
