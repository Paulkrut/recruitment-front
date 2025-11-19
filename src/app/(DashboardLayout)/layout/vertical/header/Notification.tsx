import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Scrollbar from "@/app/components/custom-scroll/Scrollbar";
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';

import { Icon } from "@iconify/react";
import { Stack } from "@mui/system";
import Link from "next/link";
import { apiFetch } from '@/utils/api';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  icon: string;
  color: string;
  priority: string;
  count: number;
  is_read: boolean;
  created_at: string;
  last_updated_at: string;
}

const Notifications = () => {
  const { _ } = useLingui();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (notifications.length === 0) {
      loadNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`${API_BASE}/api/notifications?limit=10`);
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      }
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await apiFetch(`${API_BASE}/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Ошибка при отметке уведомления:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch(`${API_BASE}/api/notifications/read-all`, { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Ошибка при отметке всех уведомлений:', error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await apiFetch(`${API_BASE}/api/notifications/${id}`, { method: 'DELETE' });
      const wasUnread = notifications.find(n => n.id === id)?.is_read === false;
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Ошибка при удалении уведомления:', error);
    }
  };

  const getTimeAgo = (notification: Notification): string => {
    // Используем last_updated_at для групповых уведомлений
    const dateString = notification.count > 1 ? notification.last_updated_at : notification.created_at;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    return date.toLocaleDateString('ru-RU');
  };

  // Функция загрузки счётчика непрочитанных
  const loadUnreadCount = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/notifications?unread_only=true&limit=1`);
      const data = await response.json();
      if (data.success) {
        const newCount = data.unread_count;
        
        // Если появились новые уведомления - показываем анимацию
        if (newCount > unreadCount && unreadCount > 0) {
          setHasNewNotification(true);
          // Убираем анимацию через 3 секунды
          setTimeout(() => setHasNewNotification(false), 3000);
        }
        
        setUnreadCount(newCount);
      }
    } catch (error) {
      console.error('Ошибка загрузки счетчика:', error);
    }
  };

  // Загружаем счетчик при монтировании
  useEffect(() => {
    loadUnreadCount();
  }, []);

  // Polling: проверяем новые уведомления каждые 2 минуты
  useEffect(() => {
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 120000); // 2 минуты = 120000 мс

    return () => clearInterval(interval);
  }, []);

  const getColorMapping = (color: string) => {
    const colorMap: Record<string, string> = {
      'success': '#4caf50',
      'info': '#2196f3',
      'warning': '#ff9800',
      'error': '#f44336',
      'primary': '#5d87ff',
    };
    return colorMap[color] || colorMap.primary;
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label={_(msg`уведомления`)}
        aria-controls="notifications-menu"
        aria-haspopup="true"
        color="inherit"
        onClick={handleClick}
        sx={{
          ...(Boolean(anchorEl) && {
            color: "primary.main",
          }),
          ...(hasNewNotification && {
            animation: 'pulse 1s ease-in-out 3',
          }),
          '@keyframes pulse': {
            '0%, 100%': {
              transform: 'scale(1)',
            },
            '50%': {
              transform: 'scale(1.1)',
            },
          },
        }}
      >
        <Box sx={{ position: "relative" }}>
          <Icon icon="solar:bell-bing-line-duotone" width="24" height="24" />
          {unreadCount > 0 && (
            <Chip
              label={unreadCount > 99 ? '99+' : unreadCount}
              color="error"
              size="small"
              sx={{
                position: "absolute",
                top: -8,
                right: -8,
                height: 18,
                minWidth: 18,
                fontSize: '0.65rem',
                fontWeight: 600,
                '& .MuiChip-label': {
                  px: 0.5,
                },
                ...(hasNewNotification && {
                  animation: 'glow 1s ease-in-out 3',
                }),
                '@keyframes glow': {
                  '0%, 100%': {
                    boxShadow: '0 0 0 rgba(244, 67, 54, 0)',
                  },
                  '50%': {
                    boxShadow: '0 0 10px rgba(244, 67, 54, 0.8)',
                  },
                },
              }}
            />
          )}
        </Box>
      </IconButton>

      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 380,
            maxHeight: 500,
            mt: 1.5,
            borderRadius: '12px',
          },
        }}
      >
        <Stack
          direction="row"
          py={2}
          px={3}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6"><Trans>Уведомления</Trans></Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}><Trans>Прочитать все</Trans></Button>
          )}
        </Stack>
        <Divider />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ py: 4, px: 3, textAlign: 'center' }}>
            <Icon icon="solar:bell-off-bold-duotone" width="48" height="48" style={{ opacity: 0.3, marginBottom: 8 }} />
            <Typography variant="body2" color="text.secondary"><Trans>Нет уведомлений</Trans></Typography>
          </Box>
        ) : (
          <Scrollbar sx={{ maxHeight: 350 }}>
            {notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                sx={{
                  py: 1.5,
                  px: 3,
                  backgroundColor: !notification.is_read ? 'action.hover' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'action.selected',
                  },
                }}
                onClick={() => {
                  if (!notification.is_read) {
                    markAsRead(notification.id);
                  }
                  if (notification.link) {
                    window.location.href = notification.link;
                  }
                  handleClose();
                }}
              >
                <Stack direction="row" spacing={2} width="100%">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      backgroundColor: `${getColorMapping(notification.color)}20`,
                    }}
                  >
                    <Icon
                      icon={notification.icon}
                      width={22}
                      style={{ color: getColorMapping(notification.color) }}
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                          fontWeight={notification.is_read ? 400 : 600}
                      sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {notification.title}
                    </Typography>
                        {notification.count > 1 && (
                          <Chip
                            label={`×${notification.count}`}
                            size="small"
                            color={notification.priority === 'high' ? 'error' : 'default'}
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                            }}
                          />
                        )}
                        {notification.priority === 'high' && (
                          <Icon icon="solar:danger-bold" width={14} style={{ color: '#f44336' }} />
                        )}
                      </Stack>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        sx={{ ml: 1, flexShrink: 0 }}
                      >
                        <Icon icon="solar:trash-bin-minimalistic-line-duotone" width={16} />
                      </IconButton>
                    </Stack>
                    {notification.message && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                      sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {notification.message}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                      {getTimeAgo(notification)}
                      {notification.count > 1 && ' (обновлено)'}
                    </Typography>
                  </Box>
                </Stack>
              </MenuItem>
          ))}
        </Scrollbar>
        )}
      </Menu>
    </Box>
  );
};

export default Notifications;
