"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled, useTheme } from "@mui/material/styles";
import React, { useState } from "react";
import Header from "./layout/vertical/header/Header";
import Sidebar from "./layout/vertical/sidebar/Sidebar";
import Customizer from "./layout/shared/customizer/Customizer";
import Navigation from "./layout/horizontal/navbar/Navigation";
import HorizontalHeader from "./layout/horizontal/header/Header";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: "transparent",
}));

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const MainWrapper = styled("div")(() => ({
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    padding: customizer.isHorizontal ? 0 : "20px",
  }));

  return (
    <MainWrapper>
      <title>Spike NextJs 14.0.3</title>
      {/* ------------------------------------------- */}
      {/* Main Wrapper */}
      {/* ------------------------------------------- */}
      <Box width="100%">
        {/* ------------------------------------------- */}
        {/* Sidebar */}
        {/* ------------------------------------------- */}
        {customizer.isHorizontal ? "" : <Sidebar />}

        {customizer.isHorizontal ? <HorizontalHeader /> : ""}

        {customizer.isHorizontal ? <Navigation /> : ""}
        <PageWrapper
          className="page-wrapper"
          sx={{
            ...(customizer.isCollapse && {
              [theme.breakpoints.up("lg")]: {
                ml: `${customizer.MiniSidebarWidth}px`,
              },
            }),
            ...(!customizer.isCollapse &&
              !customizer.isHorizontal && {
                [theme.breakpoints.up("lg")]: {
                  ml: `${customizer.SidebarWidth}px`,
                },
              }),
          }}
        >
          <Container
            sx={{
              maxWidth:
                customizer.isLayout === "boxed" ? "lg" : "100%!important",
            }}
          >
            {/* ------------------------------------------- */}
            {/* Header */}
            {/* ------------------------------------------- */}
            {customizer.isHorizontal ? " " : <Header />}

            {/* ------------------------------------------- */}
            {/* PageContent */}
            {/* ------------------------------------------- */}

            <Box
              sx={{
                minHeight: "calc(100vh - 170px)",
                py: { sm: 3 },
              }}
            >
              {children}
            </Box>

            {/* ------------------------------------------- */}
            {/* End Page */}
            {/* ------------------------------------------- */}
          </Container>
          <Customizer />
        </PageWrapper>
      </Box>
    </MainWrapper>
  );
}
