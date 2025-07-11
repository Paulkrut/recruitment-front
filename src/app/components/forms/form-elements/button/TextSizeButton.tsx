import React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const TextSizeButton = () => (
  <Stack spacing={1} direction="row" alignItems="center" justifyContent="center">
    <Button size="small">Small</Button>
    <Button size="medium">Medium</Button>
    <Button size="large">Large</Button>
  </Stack>
);

export default TextSizeButton;
