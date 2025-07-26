import { useSelector } from "@/store/hooks";
import Link from "next/link";
import { styled } from '@mui/material/styles';
import { AppState } from "@/store/store";
import { Typography } from "@mui/material";

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
    <LinkStyled href="/">
      <Typography
        variant="h5"
        fontWeight={900}
        sx={{
          color: customizer.activeMode === "dark" ? "white" : "primary.main",
          letterSpacing: 2,
          fontFamily: 'Montserrat, Roboto, Arial',
          textShadow: customizer.activeMode === "dark" 
            ? '0 2px 12px rgba(255, 255, 255, 0.1)' 
            : '0 2px 12px rgba(76, 175, 80, 0.08)',
          userSelect: 'none',
          fontSize: customizer.isCollapse && !customizer.isSidebarHover ? '1rem' : '1.25rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        SofiHR Panel
      </Typography>
    </LinkStyled>
  );
}
