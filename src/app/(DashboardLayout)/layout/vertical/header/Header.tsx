import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled } from '@mui/material/styles';
import { useSelector, useDispatch } from "@/store/hooks";
import {
  toggleSidebar,
  toggleMobileSidebar,
} from "@/store/customizer/CustomizerSlice";
import { Icon } from "@iconify/react";
import Notifications from "./Notification";
import Profile from "./Profile";
import CompanyInfo from "./CompanyInfo";
import BalanceInfo from "./BalanceInfo";
import { AppState } from "@/store/store";
import { shadows } from "@/utils/theme/Shadows";

const Header = () => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const smUp = useMediaQuery((theme: any) => theme.breakpoints.up("sm"));
  

  // drawer
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: shadows[9],
    background: theme.palette.background.paper,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    // [theme.breakpoints.up("lg")]: {
    minHeight: customizer.TopbarHeight,
    // },
    borderRadius: 13,
    marginBottom: theme.spacing(3), // Отступ снизу
  }));
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: "100%",
    color: theme.palette.text.secondary,
    minHeight: customizer.TopbarHeight,
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <Stack spacing={1.5} direction="row" alignItems="center">
          {/* ------------------------------------------- */}
          {/* Toggle Button Sidebar */}
          {/* ------------------------------------------- */}
          <Button
            color="inherit"
            aria-label="menu"
            size="large"
            className="btn-rounded-circle-40"
            onClick={
              lgUp
                ? () => dispatch(toggleSidebar())
                : () => dispatch(toggleMobileSidebar())
            }
          >
            <Icon icon="solar:list-bold-duotone" width="24" height="24" />
          </Button>

          {/* ------------------------------------------- */}
          {/* Company Info - показываем на больших экранах */}
          {/* ------------------------------------------- */}
          {lgUp && (
            <>
              <Divider orientation="vertical" flexItem sx={{ height: 30, alignSelf: 'center' }} />
              <CompanyInfo />
            </>
          )}
        </Stack>

        <Box flexGrow={1} />

        <Stack spacing={1.5} direction="row" alignItems="center">
          {/* ------------------------------------------- */}
          {/* Balance Info - основная информация */}
          {/* ------------------------------------------- */}
          {smUp && <BalanceInfo />}
          
          {/* ------------------------------------------- */}
          {/* Notifications */}
          {/* ------------------------------------------- */}
          <Notifications />
          
          {/* ------------------------------------------- */}
          {/* User Profile */}
          {/* ------------------------------------------- */}
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default Header;
