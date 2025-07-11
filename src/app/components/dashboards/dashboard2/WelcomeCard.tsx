import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";

const WelcomeCard = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const borderColor = theme.palette.divider;
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("sm"));

  return (
    <Card
      sx={{
        padding: 0,
        border: !customizer.isCardShadow ? `1px solid ${borderColor}` : "none",
        overflow: "unset",
      }}
      elevation={customizer.isCardShadow ? 9 : 0}
      variant={!customizer.isCardShadow ? "outlined" : undefined}
    >
      <CardContent sx={{ position: "relative" }}>
        <Typography variant="h5">Welcome Mike Nielsen</Typography>
        <Typography variant="subtitle2" color="textSecondary" mb={4}>
          Check all the statastics
        </Typography>
        <Button variant="contained" color="primary">
          Visit Now
        </Button>
        {lgUp ? (
          <Image
            src="/images/backgrounds/welcome-bg.png"
            alt="img"
            className="welcome-bg2"
            width={340} height={180}
          />
        ) : (
          ""
        )}
      </CardContent>
    </Card>
  );
};

export default WelcomeCard;
