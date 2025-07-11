import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const SizeButton = () => (
  <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="center">
    <Button variant="contained" size="small">
      Small
    </Button>
    <Button variant="contained" size="medium">
      Medium
    </Button>
    <Button variant="contained" size="large">
      Large
    </Button>
  </Stack>
);

export default SizeButton;
