'use client';

import React from 'react';
import { Box, Button, Typography } from '@mui/material';

import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';



interface MediaPermissionsProps {
  mediaPermissions: {
    status: 'unknown' | 'requesting' | 'granted' | 'denied';
    camera: boolean;
    microphone: boolean;
  };
  cameraEnabled: boolean;
  isMobile: boolean;
  onRequestPermissions: (includeVideo: boolean) => Promise<boolean>;
}

const MediaPermissions: React.FC<MediaPermissionsProps> = ({
  mediaPermissions,
  cameraEnabled,
  isMobile,
  onRequestPermissions
}) => {
  const { _ } = useLingui();

  // Показываем блок только если разрешения отклонены или не получены
  const shouldShow = mediaPermissions.status === 'denied' || 
    (mediaPermissions.status === 'granted' && 
     ((cameraEnabled && (!mediaPermissions.camera || !mediaPermissions.microphone)) || 
      (!cameraEnabled && !mediaPermissions.microphone)));

  if (!shouldShow) return null;

  return (
    <Box sx={{
      mb: 3, 
      p: 2, 
      bgcolor: 'warning.light', 
      borderRadius: 2, 
      border: '1px solid', 
      borderColor: 'warning.main'
    }}>
      <Typography variant="h6" color="warning.dark" gutterBottom>
        ⚠️ {cameraEnabled ? _(msg`Требуется доступ к камере и микрофону`) : _(msg`Требуется доступ к микрофону`)}
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 2 }}>
        {cameraEnabled
          ? _(msg`Для прохождения интервью необходимо разрешить доступ к камере и микрофону.`)
          : _(msg`Для прохождения интервью необходимо разрешить доступ к микрофону.`)}
        {mediaPermissions.status === 'denied' && _(msg` Пожалуйста, разрешите доступ в настройках браузера.`)}
      </Typography>
      
      {mediaPermissions.status === 'requesting' ? (
        <Button
          variant="contained"
          color="warning"
          disabled
          fullWidth={isMobile}
          size={isMobile ? 'large' : 'medium'}
        ><Trans>Запрашиваем разрешения...</Trans></Button>
      ) : (
        <Button
          variant="contained"
          color="warning"
          onClick={() => onRequestPermissions(cameraEnabled)}
          fullWidth={isMobile}
          size={isMobile ? 'large' : 'medium'}
        >
          {cameraEnabled ? _(msg`Разрешить камеру и микрофон`) : _(msg`Разрешить микрофон`)}
        </Button>
      )}
    </Box>
  );
};

export default MediaPermissions; 