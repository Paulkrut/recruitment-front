"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";

const drawerWidth = 220;

const navItems: { label: string; href: string }[] = [
  { label: "Дашборд", href: "/hr/dashboard" },
  { label: "Кандидаты", href: "/hr/candidates" },
  { label: "Тесты", href: "/hr/tests" },
  { label: "Вакансии", href: "/hr/vacancies" },
];

export default function HrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        color="default"
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            HR-панель
          </Typography>
          <Box sx={{ ml: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {pathname}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.href} disablePadding>
                <ListItemButton selected={pathname.startsWith(item.href)} component={Link as any} href={item.href}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* spacer */}
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
} 