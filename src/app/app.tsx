"use client";
import React, { useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeSettings } from "@/utils/theme/Theme";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import "@/app/api/index";
import { UserProvider } from "@/contexts/UserContext";
import { initErrorReporter } from "@/utils/errorReporter";

const MyApp = ({ children }: { children: React.ReactNode }) => {
    const theme = ThemeSettings();

    // Инициализируем систему отслеживания ошибок
    useEffect(() => {
        initErrorReporter();
    }, []);

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
