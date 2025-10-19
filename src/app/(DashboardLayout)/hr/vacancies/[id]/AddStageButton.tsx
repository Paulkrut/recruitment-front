"use client";
import React, { useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface AddStageButtonProps {
  position: number;
  onAdd: (position: number) => void;
}

export default function AddStageButton({ position, onAdd }: AddStageButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        width: '4px', // Фиксированная ширина - не расширяется
        display: 'flex',
        alignItems: 'flex-start', // Выравнивание по верху
        justifyContent: 'center',
        position: 'relative',
        minHeight: '600px',
        flexShrink: 0, // Не сжимается
        pt: 1, // Небольшой отступ сверху
      }}
    >
      {/* Вертикальная линия */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          width: '2px',
          height: '100%',
          bgcolor: 'divider',
          opacity: isHovered ? 0 : 0.3,
          transition: 'opacity 0.2s',
        }}
      />
      
      {/* Кнопка "+" поверх линии */}
      {isHovered && (
        <Tooltip title="Добавить кастомную стадию" arrow placement="top">
          <IconButton
            onClick={() => onAdd(position)}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              width: 40,
              height: 40,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              boxShadow: 3,
              zIndex: 10,
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

