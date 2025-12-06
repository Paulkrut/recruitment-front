'use client';
import React from 'react';
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { Trans } from '@lingui/react/macro';

const ManagerInfo = () => {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const managerName = 'Artem';
  const managerPhone = '+79629407473';
  const managerPhoneDisplay = '+7 (962) 940-74-73';
  const managerTelegram = 'artem_soro';
  const isOnline = true;

  // Ссылки для связи
  const phoneLink = `tel:${managerPhone}`;
  const whatsappLink = `https://wa.me/${managerPhone.replace(/\+/g, '')}`;
  const telegramLink = `https://t.me/${managerTelegram}`;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: lgUp ? 2 : 1,
        py: 0.5,
        borderRadius: 2,
        bgcolor: 'primary.light',
        border: '1px solid',
        borderColor: 'primary.main',
        transition: 'all 0.3s ease',
        '&:hover': {
          bgcolor: 'primary.lighter',
          boxShadow: theme.shadows[2],
        },
      }}
    >
      {/* Иконка и текст */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            icon="solar:user-id-bold-duotone"
            width={mdUp ? 28 : 24}
            height={mdUp ? 28 : 24}
            style={{ color: theme.palette.primary.main }}
          />
          {/* Индикатор онлайн */}
          {isOnline && (
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 10,
                height: 10,
                bgcolor: 'success.main',
                borderRadius: '50%',
                border: '2px solid',
                borderColor: 'background.paper',
              }}
            />
          )}
        </Box>

        {/* Текст - скрываем на маленьких экранах */}
        {mdUp && (
          <Stack spacing={0}>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
              <Trans>Ваш менеджер</Trans>
            </Typography>
            <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
              {managerName}
            </Typography>
          </Stack>
        )}
      </Stack>

      {/* Кнопки связи */}
      <Stack direction="row" spacing={0.5} alignItems="center">
        {/* Телефон */}
        <Tooltip title={`${managerPhoneDisplay}`} arrow>
          <IconButton
            size="small"
            href={phoneLink}
            sx={{
              color: 'primary.main',
              bgcolor: 'background.paper',
              width: 32,
              height: 32,
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white',
              },
            }}
          >
            <Icon icon="solar:phone-calling-bold" width={18} height={18} />
          </IconButton>
        </Tooltip>

        {/* WhatsApp */}
        <Tooltip title="WhatsApp" arrow>
          <IconButton
            size="small"
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: '#25D366',
              bgcolor: 'background.paper',
              width: 32,
              height: 32,
              '&:hover': {
                bgcolor: '#25D366',
                color: 'white',
              },
            }}
          >
            <Icon icon="ic:baseline-whatsapp" width={18} height={18} />
          </IconButton>
        </Tooltip>

        {/* Telegram */}
        <Tooltip title={`@${managerTelegram}`} arrow>
          <IconButton
            size="small"
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: '#0088cc',
              bgcolor: 'background.paper',
              width: 32,
              height: 32,
              '&:hover': {
                bgcolor: '#0088cc',
                color: 'white',
              },
            }}
          >
            <Icon icon="ic:baseline-telegram" width={18} height={18} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Статус онлайн - показываем только на больших экранах */}
      {lgUp && isOnline && (
        <Chip
          label={<Trans>Онлайн</Trans>}
          size="small"
          color="success"
          sx={{
            height: 20,
            fontSize: '0.7rem',
            fontWeight: 600,
            '& .MuiChip-label': {
              px: 1,
            },
          }}
        />
      )}
    </Box>
  );
};

export default ManagerInfo;

