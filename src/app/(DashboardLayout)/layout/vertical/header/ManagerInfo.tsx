'use client';
import React, { useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { Trans } from '@lingui/react/macro';

const ManagerInfo = () => {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const managerName = 'Artem';
  const managerPhone = '+79629407473';
  const managerPhoneDisplay = '+7 (962) 940-74-73';
  const managerTelegram = 'artem_soro';
  const isOnline = true;

  // Ссылки для связи
  const phoneLink = `tel:${managerPhone}`;
  const whatsappLink = `https://wa.me/${managerPhone.replace(/\+/g, '')}`;
  const telegramLink = `https://t.me/${managerTelegram}`;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // На маленьких экранах (mobile) - только иконка-кнопка с выпадающим меню
  if (!smUp) {
    return (
      <>
        <Tooltip title={<Trans>Ваш менеджер</Trans>} arrow>
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{
              color: 'primary.main',
              bgcolor: 'primary.light',
              border: '1px solid',
              borderColor: 'primary.main',
              width: 40,
              height: 40,
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white',
              },
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                isOnline ? (
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      bgcolor: 'success.main',
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: 'background.paper',
                    }}
                  />
                ) : null
              }
            >
              <Icon icon="solar:user-id-bold-duotone" width={20} height={20} />
            </Badge>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              boxShadow: theme.shadows[8],
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5, minWidth: 220 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              <Trans>Ваш менеджер</Trans>
            </Typography>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {managerName}
            </Typography>
            {isOnline && (
              <Chip
                label={<Trans>Онлайн</Trans>}
                size="small"
                color="success"
                icon={<Box sx={{ width: 8, height: 8, bgcolor: 'white', borderRadius: '50%', ml: 1 }} />}
                sx={{ mt: 1, height: 22, fontSize: '0.75rem', fontWeight: 600 }}
              />
            )}
          </Box>
          <Divider />
          <MenuItem
            component="a"
            href={phoneLink}
            onClick={handleClose}
            sx={{
              py: 1.5,
              '&:hover': {
                bgcolor: 'primary.lighter',
              },
            }}
          >
            <ListItemIcon>
              <Icon icon="solar:phone-calling-bold" width={22} style={{ color: theme.palette.primary.main }} />
            </ListItemIcon>
            <ListItemText
              primary={managerPhoneDisplay}
              secondary={<Trans>Позвонить</Trans>}
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </MenuItem>
          <MenuItem
            component="a"
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            sx={{
              py: 1.5,
              '&:hover': {
                bgcolor: 'success.lighter',
              },
            }}
          >
            <ListItemIcon>
              <Icon icon="ic:baseline-whatsapp" width={22} style={{ color: '#25D366' }} />
            </ListItemIcon>
            <ListItemText
              primary="WhatsApp"
              secondary={<Trans>Написать</Trans>}
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </MenuItem>
          <MenuItem
            component="a"
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            sx={{
              py: 1.5,
              '&:hover': {
                bgcolor: 'info.lighter',
              },
            }}
          >
            <ListItemIcon>
              <Icon icon="ic:baseline-telegram" width={22} style={{ color: '#0088cc' }} />
            </ListItemIcon>
            <ListItemText
              primary="Telegram"
              secondary={`@${managerTelegram}`}
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </MenuItem>
        </Menu>
      </>
    );
  }

  // На tablet (sm+) - компактная версия без текста "Ваш менеджер"
  if (!mdUp) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.5,
          borderRadius: 2,
          bgcolor: 'primary.light',
          border: '1px solid',
          borderColor: 'primary.main',
        }}
      >
        {/* Иконка с онлайн индикатором */}
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Icon
            icon="solar:user-id-bold-duotone"
            width={24}
            height={24}
            style={{ color: theme.palette.primary.main }}
          />
          {isOnline && (
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 9,
                height: 9,
                bgcolor: 'success.main',
                borderRadius: '50%',
                border: '2px solid',
                borderColor: 'background.paper',
              }}
            />
          )}
        </Box>

        {/* Кнопки связи */}
        <Stack direction="row" spacing={0.25} alignItems="center">
          <Tooltip title={managerPhoneDisplay} arrow>
            <IconButton
              size="small"
              href={phoneLink}
              sx={{
                color: 'primary.main',
                bgcolor: 'background.paper',
                width: 28,
                height: 28,
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white',
                },
              }}
            >
              <Icon icon="solar:phone-calling-bold" width={16} height={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title="WhatsApp" arrow>
            <IconButton
              size="small"
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#25D366',
                bgcolor: 'background.paper',
                width: 28,
                height: 28,
                '&:hover': {
                  bgcolor: '#25D366',
                  color: 'white',
                },
              }}
            >
              <Icon icon="ic:baseline-whatsapp" width={16} height={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title={`@${managerTelegram}`} arrow>
            <IconButton
              size="small"
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#0088cc',
                bgcolor: 'background.paper',
                width: 28,
                height: 28,
                '&:hover': {
                  bgcolor: '#0088cc',
                  color: 'white',
                },
              }}
            >
              <Icon icon="ic:baseline-telegram" width={16} height={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    );
  }

  // На больших экранах (md+) - полная версия
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: mdUp ? 1.5 : 0.75,
        px: mdUp ? 2 : 1,
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
            width={28}
            height={28}
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

        <Stack spacing={0}>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
            <Trans>Ваш менеджер</Trans>
          </Typography>
          <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
            {managerName}
          </Typography>
        </Stack>
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
