import { useSelector } from "@/store/hooks";
import Link from "next/link";
import { styled } from '@mui/material/styles';
import { AppState } from "@/store/store";
import { Box } from "@mui/material";
import Image from "next/image";

export default function Logo() {
  const customizer = useSelector((state: AppState) => state.customizer);
  const LinkStyled = styled(Link)(() => ({
    height: customizer.TopbarHeight,
    width: customizer.isCollapse && !customizer.isSidebarHover ? "40px" : "180px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
  }));

  return (
    <LinkStyled href="/hr">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <Image
          src="/sofihr-logo.svg"
          alt="SofiHR"
          width={customizer.isCollapse && !customizer.isSidebarHover ? 40 : 120}
          height={35}
          priority
          style={{
            width: "auto",
            height: "auto",
            maxWidth: customizer.isCollapse && !customizer.isSidebarHover ? "40px" : "120px",
            maxHeight: "35px",
            filter: customizer.activeMode === "dark" ? "brightness(1.2)" : "none",
          }}
        />
      </Box>
    </LinkStyled>
  );
}
