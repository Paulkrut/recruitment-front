import React from 'react';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';

const DefaultLabelSwitch = () => (
    <Box textAlign="center">
        <FormGroup>
            <FormControlLabel control={<Switch defaultChecked />} label="Label" />
            <FormControlLabel disabled control={<Switch />} label="Disabled" />
        </FormGroup>
    </Box>
);
export default DefaultLabelSwitch;
