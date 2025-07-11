import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useTheme } from "@mui/material/styles";
import {
  IconBrandProducthunt,
  IconCurrencyDollar,
  IconReportMoney,
} from "@tabler/icons-react";
import Image from "next/image";
import { Icon } from "@iconify/react";

const TopCards = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const borderColor = theme.palette.divider;

  const stats = [
    {
      title: "2358",
      percent: "+23",
      subtitle: "Sales",
      icon: "/images/backgrounds/top-warning-shape.png",
      iconsm:  <Icon icon="solar:ruble-linear" width="30" height="30" />
    },
    {
      title: "356",
      percent: "+8",
      subtitle: "Refunds",
      icon: "/images/backgrounds/top-error-shape.png",
      iconsm:  <Icon icon="solar:archive-down-minimlistic-line-duotone" width="30" height="30" />
    },
    {
      title: "235.8",
      percent: "-3",
      subtitle: "Earnings",
      icon: "/images/backgrounds/top-info-shape.png",
      iconsm:  <Icon icon="solar:dollar-linear" width="30" height="30" />
    },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, i) => (
        <Grid item lg={4} sm={4} xs={12} key={i}>
          <Card
            sx={{
              padding: 0,
              border: !customizer.isCardShadow
                ? `1px solid ${borderColor}`
                : "none",
              backgroundColor: "primary.main",
              color: "white",
              position: "relative",
            }}
            elevation={customizer.isCardShadow ? 9 : 0}
            variant={!customizer.isCardShadow ? "outlined" : undefined}
          >
            <Image src={stat.icon} alt="img" className="top-img" width={59} height={81} />
            <CardContent>
              <Box mb={4}>
               {stat.iconsm}
              </Box>
              <Typography variant="h4">
                {stat.title}
                <Typography
                  component="span"
                  variant="subtitle2"
                  fontSize="12px" ml="3px"
                >
                  {stat.percent}%
                </Typography>
              </Typography>
              <Typography component="span" variant="subtitle2">
                {stat.subtitle}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default TopCards;
