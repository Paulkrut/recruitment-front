import React from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';

const DefaultcolorsCheckbox = () => (
    <Box textAlign="center">
        <Checkbox
            defaultChecked
            color="primary"
            inputProps={{ 'aria-label': 'checkbox with default color' }}
        />
        <Checkbox
            defaultChecked
            color="secondary"
            inputProps={{ 'aria-label': 'checkbox with default color' }}
        />
        <Checkbox
            defaultChecked
            sx={{
                color: (theme) => theme.palette.success.main,
                '&.Mui-checked': {
                    color: (theme) => theme.palette.success.main,
                },
            }}
        />
        <Checkbox
            defaultChecked
            sx={{
                color: (theme) => theme.palette.error.main,
                '&.Mui-checked': {
                    color: (theme) => theme.palette.error.main,
                },
            }}
        />
        <Checkbox
            defaultChecked
            sx={{
                color: (theme) => theme.palette.warning.main,
                '&.Mui-checked': {
                    color: (theme) => theme.palette.warning.main,
                },
            }}
        />
    </Box>
);

export default DefaultcolorsCheckbox;
