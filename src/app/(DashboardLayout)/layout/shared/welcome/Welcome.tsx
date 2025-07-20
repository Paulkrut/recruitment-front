import * as React from 'react';
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Snackbar from '@mui/material/Snackbar'
import { Theme } from '@mui/material/styles';
import { useTheme } from "@mui/material/styles";

const Welcome = () => {
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (reason:any) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };
  React.useEffect(() => {
    // Update the document title using the browser API
    const timer = setTimeout(() => {
      handleClick();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

   const theme = useTheme();

  return (
    <React.Fragment>
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity="info"
          variant="filled"
          sx={{ width: '100%', color: 'white' , background:(theme:any) => theme.palette.primary.main }}
        >
          <AlertTitle>Welcome To Spike</AlertTitle>
          Easy to customize the Template!!!
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
};

export default Welcome;
