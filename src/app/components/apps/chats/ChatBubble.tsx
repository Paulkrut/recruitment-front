import React from 'react';
import { Box, Typography, Avatar, useTheme, Grow } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

interface Props {
  role: 'bot' | 'user';
  children?: React.ReactNode;
  text?: string;
  time?: string; // HH:mm
}

const ChatBubble: React.FC<Props> = ({ role, children, text, time }) => {
  const content = children ?? text;
  const theme = useTheme();

  const bgColor = role==='user'
    ? theme.palette.primary.main
    : theme.palette.mode==='light' ? theme.palette.grey[100] : theme.palette.grey[800];
  const textColor = role==='user' ? theme.palette.primary.contrastText : theme.palette.text.primary;

  return (
    <Grow in timeout={200}>
      <Box display="flex" justifyContent={role==='user'?'flex-end':'flex-start'} alignItems="flex-end" gap={1}>
        {role==='bot' && (
          <Avatar sx={{ width: 26, height: 26, bgcolor: 'info.main' }}>
            <SmartToyIcon fontSize="small" />
          </Avatar>
        )}
        <Box sx={{
          position:'relative',
          px:2, py:1,
          bgcolor: bgColor,
          color: textColor,
          borderRadius: role==='user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
          maxWidth:'80%',
          whiteSpace:'pre-wrap',
          boxShadow: role==='user' ? 1 : 0,
          '&::after': {
            content:'""', position:'absolute', bottom:0,
            right: role==='user'? -6 : 'auto', left: role==='user'? 'auto' : -6,
            width:0, height:0,
            border: '6px solid transparent',
            borderTop:0,
            [role==='user'? 'borderLeft':'borderRight']:0,
            borderBottomColor: bgColor,
          },
        }}>
          {typeof content==='string'? (<Typography sx={{whiteSpace:'pre-wrap'}}>{content}</Typography>): content}
        </Box>
        {role==='user' && (
          <Avatar sx={{ width: 26, height: 26, bgcolor: 'primary.main' }}>
            <PersonIcon fontSize="small" />
          </Avatar>
        )}
        {time && (
          <Typography variant="caption" color="text.secondary" sx={{ ml:0.5 }}>
            {time}
          </Typography>
        )}
      </Box>
    </Grow>
  );
};

export default ChatBubble; 