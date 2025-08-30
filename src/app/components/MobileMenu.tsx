"use client";
import React, { memo, useState, useCallback, useMemo } from 'react';
import { Box, IconButton, Menu, MenuItem, Typography, Divider, Button } from '@mui/material';
import { Icon } from '@iconify/react';

interface MobileMenuProps {
  pages: string[];
  onScrollToSection: (sectionName: string) => void;
}

const MobileMenu = memo(({ pages, onScrollToSection }: MobileMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleMenuItemClick = useCallback((page: string) => {
    onScrollToSection(page);
    handleCloseMenu();
  }, [onScrollToSection, handleCloseMenu]);

  // Мемоизируем элементы меню для предотвращения лишних перерисовок
  const menuItems = useMemo(() => 
    pages.map((page) => (
      <MenuItem 
        key={page} 
        onClick={() => handleMenuItemClick(page)}
        sx={{
          py: 1.5,
          px: 2,
          '&:hover': {
            backgroundColor: 'primary.light',
            color: 'primary.contrastText',
          }
        }}
      >
        <Typography textAlign="center" sx={{ fontWeight: 500 }}>
          {page}
        </Typography>
      </MenuItem>
    )), [pages, handleMenuItemClick]);

  return (
    <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", p: 0 }}>
      <IconButton 
        size="large" 
        aria-controls="mobile-menu" 
        aria-haspopup="true" 
        onClick={handleOpenMenu} 
        color="inherit" 
        sx={{ p: 0, mr: 1 }}
      >
        <Icon icon="material-symbols:menu" />
      </IconButton>
      <Menu 
        id="mobile-menu" 
        anchorEl={anchorEl} 
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }} 
        keepMounted 
        transformOrigin={{ vertical: "top", horizontal: "left" }} 
        open={Boolean(anchorEl)} 
        onClose={handleCloseMenu} 
        sx={{ 
          display: { xs: "block", md: "none" },
          '& .MuiPaper-root': {
            minWidth: 200,
            mt: 1,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            borderRadius: 0.5,
          }
        }}
      >
        {menuItems}
        <Divider sx={{ my: 1 }} />
        <MenuItem sx={{ px: 2, py: 1 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            href="/auth/register"
            size="small"
            fullWidth
            sx={{ mr: 1 }}
          >
            Регистрация
          </Button>
        </MenuItem>
        <MenuItem sx={{ px: 2, py: 1 }}>
          <Button 
            variant="contained" 
            color="primary" 
            href="/auth/login"
            size="small"
            fullWidth
          >
            Войти
          </Button>
        </MenuItem>
      </Menu>
    </Box>
  );
});

MobileMenu.displayName = 'MobileMenu';

export default MobileMenu; 