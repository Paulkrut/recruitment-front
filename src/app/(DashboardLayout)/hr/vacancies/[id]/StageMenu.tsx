"use client";
import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface StageMenuProps {
  customId: number;
  stageName: string;
  onEdit: (customId: number) => void;
  onDelete: (customId: number) => void;
}

export default function StageMenu({ customId, stageName, onEdit, onDelete }: StageMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleClose();
    onEdit(customId);
  };

  const handleDelete = () => {
    handleClose();
    onDelete(customId);
  };

  return (
    <>
      <Tooltip title="Управление стадией" arrow>
        <IconButton
          size="small"
          onClick={handleClick}
          sx={{
            opacity: 0,
            transition: 'opacity 0.2s',
            '.MuiCard-root:hover &': {
              opacity: 1,
            },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Удалить стадию</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

