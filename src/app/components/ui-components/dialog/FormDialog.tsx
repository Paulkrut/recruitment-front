import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import CustomTextField from "../../forms/theme-elements/CustomTextField";
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const FormDialog = () => {
  const { _ } = useLingui();

    const [open, setOpen] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [error, setError] = React.useState('');

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEmail('');
        setError('');
    };
    
    // Валидация email
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        setError('');
        
        if (value && !validateEmail(value)) {
            setError(_(msg`Введите корректный email адрес`));
        }
    };
    
    const handleSubmit = () => {
        if (!email.trim()) {
            setError(_(msg`Email обязателен`));
            return;
        }
        if (!validateEmail(email)) {
            setError(_(msg`Введите корректный email адрес`));
            return;
        }
        // Здесь можно добавить логику подписки
        handleClose();
    };

    return (
        <>
            <Button variant="contained" color="warning" fullWidth onClick={handleClickOpen}>
                Open Form Dialog
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Subscribe</DialogTitle>
                <DialogContent sx={{ pt: '16px !important' }}>
                    <DialogContentText>
                        To subscribe to this website, please enter your email address here. We
                        will send updates occasionally.
                    </DialogContentText>
                    <Box mt={2}>
                        <CustomTextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Email Address *"
                            type="email"
                            fullWidth
                            value={email}
                            onChange={handleEmailChange}
                            error={!!error}
                            helperText={error || 'Например: example@mail.ru'}
                            placeholder="example@mail.ru"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button color="error" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!email.trim() || !!error}>Subscribe</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default FormDialog;
