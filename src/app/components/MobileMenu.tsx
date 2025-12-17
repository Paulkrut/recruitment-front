'use client';

import { Trans } from '@lingui/macro';
import React, { memo, useState, useCallback, useMemo } from 'react';
import { Box, IconButton, Menu, MenuItem, Typography, Divider, Button } from '@mui/material';
import { Icon } from '@iconify/react';


interface Page {
  id: string;
  label: string;
}

interface MobileMenuProps {
  pages: Page[];
  onScrollToSection: (pageId: string) => void;
}

const MobileMenu = memo(({ pages, onScrollToSection }: MobileMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleMenuItemClick = useCallback((pageId: string) => {
    onScrollToSection(pageId);
    handleCloseMenu();
  }, [onScrollToSection, handleCloseMenu]);

  // Мемоизируем элементы меню для предотвращения лишних перерисовок
  const menuItems = useMemo(() => 
    pages.map((page) => (
      <MenuItem 
        key={page.id} 
        onClick={() => handleMenuItemClick(page.id)}
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
          {page.label}
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
          ><Trans>Регистрация</Trans></Button>
        </MenuItem>
        <MenuItem sx={{ px: 2, py: 1 }}>
          <Button 
            variant="contained" 
            color="primary" 
            href="/auth/login"
            size="small"
            fullWidth
          ><Trans>Войти</Trans></Button>
        </MenuItem>
        <MenuItem sx={{ px: 2, py: 1 }}>
          <Button 
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test'}/api/auth/hh`;
            }}
            sx={{
              borderColor: '#D6001C',
              color: '#D6001C',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#B00017',
                backgroundColor: 'rgba(214, 0, 28, 0.08)',
                color: '#B00017',
              },
            }}
          >
            Войти через hh
          </Button>
        </MenuItem>
      </Menu>
    </Box>
  );
});

MobileMenu.displayName = 'MobileMenu';

export default MobileMenu; 