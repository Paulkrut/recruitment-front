import React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const ColorButtons = () => (
  <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
    <Button variant="contained" color="primary">
      Primary
    </Button>
    <Button variant="contained" color="secondary">
      Secondary
    </Button>
    <Button variant="contained" color="error">
      Error
    </Button>
    <Button variant="contained" color="warning">
      Warning
    </Button>
    <Button variant="contained" color="success">
      Success
    </Button>
  </Stack>
);

export default ColorButtons;
