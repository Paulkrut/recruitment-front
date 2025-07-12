"use client";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import React from 'react';
import { Providers } from "@/store/providers";

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

export default function MuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </Providers>
  );
} 