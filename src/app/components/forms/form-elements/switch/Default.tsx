import React from 'react';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';

const DefaultSwitch = () => (
    <Box textAlign="center">
        <Switch defaultChecked />
        <Switch />
        <Switch disabled defaultChecked />
        <Switch disabled />
    </Box>
);
export default DefaultSwitch;
