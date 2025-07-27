"use client";
import React, { memo, useCallback, useMemo } from 'react';
import { Box, Button } from '@mui/material';

interface DesktopMenuProps {
  pages: string[];
  onScrollToSection: (sectionName: string) => void;
}

const DesktopMenu = memo(({ pages, onScrollToSection }: DesktopMenuProps) => {
  const handleClick = useCallback((page: string) => {
    onScrollToSection(page);
  }, [onScrollToSection]);

  // Мемоизируем кнопки меню
  const menuButtons = useMemo(() => 
    pages.map((page) => (
      <Button 
        key={page} 
        onClick={() => handleClick(page)} 
        sx={{ 
          color: "text.primary", 
          display: "flex", 
          alignItems: "center", 
          gap: 1,
          fontWeight: 500,
          '&:hover': {
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {page}
      </Button>
    )), [pages, handleClick]);

  return (
    <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent: "center", gap: 2 }}>
      {menuButtons}
    </Box>
  );
});

DesktopMenu.displayName = 'DesktopMenu';

export default DesktopMenu; 