"use client";
import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeSettings } from "@/utils/theme/Theme";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import "@/utils/i18n";
import "@/app/api/index";
import { UserProvider } from "@/contexts/UserContext";

const MyApp = ({ children }: { children: React.ReactNode }) => {
    const theme = ThemeSettings();

    return (
        <>
            <AppRouterCacheProvider options={{ enableCssLayer: true }}>
                <ThemeProvider theme={theme}>
                    <UserProvider>
                        <CssBaseline />
                        {children}
                    </UserProvider>
                </ThemeProvider>
            </AppRouterCacheProvider>
        </>
    );
};

export default MyApp;
