import React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const OutlinedColorButtons = () => (
  <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
    <Button variant="outlined" color="primary">
      Primary
    </Button>
    <Button variant="outlined" color="secondary">
      Secondary
    </Button>
    <Button variant="outlined" color="error">
      Error
    </Button>
    <Button variant="outlined" color="warning">
      Warning
    </Button>
    <Button variant="outlined" color="success">
      Success
    </Button>
  </Stack>
);

export default OutlinedColorButtons;
