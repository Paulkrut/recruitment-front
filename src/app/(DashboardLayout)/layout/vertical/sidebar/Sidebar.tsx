import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import SidebarItems from "./SidebarItems";
import Logo from "../../shared/logo/Logo";
import { useSelector, useDispatch } from "@/store/hooks";
import {
  hoverSidebar,
  toggleMobileSidebar,
} from "@/store/customizer/CustomizerSlice";
import Scrollbar from "@/app/components/custom-scroll/Scrollbar";
import { AppState } from "@/store/store";
import { Icon } from "@iconify/react";

export default function Sidebar() {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();
  const toggleWidth =
    customizer.isCollapse && !customizer.isSidebarHover
      ? customizer.MiniSidebarWidth
      : customizer.SidebarWidth;

  const onHoverEnter = () => {
    if (customizer.isCollapse) {
      dispatch(hoverSidebar(true));
    }
  };

  const onHoverLeave = () => {
    dispatch(hoverSidebar(false));
  };

  return (
    <>
      {!lgUp ? (
        <Box
          sx={{
            zIndex: 100,
            width: toggleWidth,
            flexShrink: 0,
            ...(customizer.isCollapse && {
              position: "absolute",
            }),
            borderRadius: "13px",
          }}
        >
          {/* ------------------------------------------- */}
          {/* Sidebar for desktop */}
          {/* ------------------------------------------- */}
          <Drawer
            anchor="left"
            open
            onMouseEnter={onHoverEnter}
            onMouseLeave={onHoverLeave}
            variant="permanent"
            PaperProps={{
              sx: {
                boxShadow: customizer.isCardShadow ? 9 : 0,
                transition: theme.transitions.create("width", {
                  duration: theme.transitions.duration.shortest,
                }),
                width: toggleWidth,
                borderRight: 0,
                boxSizing: "border-box",
                top: 20,
                left: 20,
                bottom: 20,
                borderRadius: "13px",
                height: "calc(100% - 40px)",
              },
            }}
          >
            {/* ------------------------------------------- */}
            {/* Sidebar Box */}
            {/* ------------------------------------------- */}
            <Box
              sx={{
                height: "100%",
              }}
            >
              {/* ------------------------------------------- */}
              {/* Logo */}
              {/* ------------------------------------------- */}
              <Box px={2}>
                <Logo />
              </Box>
              <Scrollbar
                sx={{
                  height: customizer.isCollapse
                    ? "calc(100% - 90px)"
                    : "calc(100% - 200px)",
                }}
              >
                {/* ------------------------------------------- */}
                {/* Sidebar Items */}
                {/* ------------------------------------------- */}
                <SidebarItems />
              </Scrollbar>
              {customizer.isCollapse ? null : (
                <Box px={3} py={2} m={3} bgcolor="primary.light">
                  <Stack
                    direction="row"
                    gap={2}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box display="flex" alignItems="center">
                      <Avatar
                        src={"/images/profile/user1.jpg"}
                        sx={{ width: 45, height: 45 }}
                      />
                      <Box ml={2}>
                        <Typography variant="h5">Mike</Typography>
                        <Typography variant="subtitle1">Admin</Typography>
                      </Box>
                    </Box>
                    <IconButton color="primary" href="/auth/auth1/login">
                      <Icon
                        icon="solar:logout-line-duotone"
                        width={24}
                        height={24}
                      />
                    </IconButton>
                  </Stack>
                </Box>
              )}
            </Box>
          </Drawer>
        </Box>
      ) : (
        <Drawer
          anchor="left"
          open={customizer.isMobileSidebar}
          onClose={() => dispatch(toggleMobileSidebar())}
          variant="temporary"
          PaperProps={{
            sx: {
              width: customizer.SidebarWidth,
              border: "0 !important",
              boxShadow: (theme) => theme.shadows[8],
            },
          }}
        >
          {/* ------------------------------------------- */}
          {/* Logo */}
          {/* ------------------------------------------- */}
          <Box px={2}>
            <Logo />
          </Box>
          {/* ------------------------------------------- */}
          {/* Sidebar For Mobile */}
          {/* ------------------------------------------- */}
          <SidebarItems />
        </Drawer>
      )}
    </>
  );
}
