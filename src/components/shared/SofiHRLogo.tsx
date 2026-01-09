import Image from "next/image";
import Link from "next/link";
import { Box } from "@mui/material";

interface LogoProps {
  width?: number;
  height?: number;
  href?: string;
  priority?: boolean;
}

export default function SofiHRLogo({ 
  width = 120, 
  height = 35,
  href = "/",
  priority = false 
}: LogoProps) {
  const logo = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        cursor: href ? "pointer" : "default",
        position: "relative",
        width: width,
        height: height,
      }}
    >
      <Image
        src="/sofihr-logo.svg"
        alt="SofiHR"
        width={width}
        height={height}
        priority={priority}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </Box>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", display: "flex" }}>
        {logo}
      </Link>
    );
  }

  return logo;
}

