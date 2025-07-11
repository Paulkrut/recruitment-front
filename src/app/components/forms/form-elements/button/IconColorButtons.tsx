import React from 'react';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { IconBell } from '@tabler/icons-react';

const IconColorButtons = () => (
  <Stack spacing={1} direction="row" justifyContent="center">
    <Tooltip title="Bell">
      <IconButton color="primary" aria-label="primary-bell">
        <IconBell width={18} />
      </IconButton>
    </Tooltip>
    <Tooltip title="Bell">
      <IconButton color="secondary" aria-label="secondary-bell">
        <IconBell width={18} />
      </IconButton>
    </Tooltip>
    <Tooltip title="Bell">
      <IconButton color="error" aria-label="error-bell">
        <IconBell width={18} />
      </IconButton>
    </Tooltip>
    <Tooltip title="Bell">
      <IconButton color="warning" aria-label="warning-bell">
        <IconBell width={18} />
      </IconButton>
    </Tooltip>
    <Tooltip title="Bell">
      <IconButton color="success" aria-label="success-bell">
        <IconBell width={18} />
      </IconButton>
    </Tooltip>
  </Stack>
);

export default IconColorButtons;
