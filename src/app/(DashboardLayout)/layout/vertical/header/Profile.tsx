import React, { useState, useEffect } from "react";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { Icon } from "@iconify/react";
import { Stack } from "@mui/system";
import { useUser } from '@/contexts/UserContext';
import { apiFetch } from '@/utils/api';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

const Profile = () => {
  const { _ } = useLingui();

  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const { user } = useUser();
  const [auth, setAuth] = useState<{name: string; phone: string; email?: string; position?: string}>({
    name: '',
    phone: '',
    email: '',
    position: ''
  });
  const [openProfile, setOpenProfile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = localStorage.getItem('recruitment_token');
    if (!t) return;
    try {
      const payload = JSON.parse(atob(t.split('.')[1] || ''));
      setAuth({
        name: payload.name || '',
        phone: payload.phone || '',
        email: payload.email || '',
        position: ''
      });
    } catch (e) {
      /* ignore */
    }
    // Обновляем из контекста
    if (user) {
      setAuth(a => ({
        ...a,
        name: user.name || a.name,
        email: user.email || a.email,
        position: user.position || ''
      }));
    }
  }, [user]);

  const initials = auth.name
    ? auth.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : auth.phone
    ? auth.phone.slice(-2)
    : 'U';

  const stringToColor = (s: string) => {
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
    const c = (hash >> 24) & 0xff ^ (hash >> 16) & 0xff ^ (hash >> 8) & 0xff;
    return `hsl(${c * 3.6}, 60%, 60%)`;
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recruitment_token');
      localStorage.removeItem('current_company');
      localStorage.removeItem('currentCompanyId');
      window.location.href = '/auth/login';
    }
  };

  return (
    <>
      <Button
        color="inherit"
        aria-label="user profile"
        aria-controls="profile-menu"
        aria-haspopup="true"
        sx={{
          ...(Boolean(anchorEl) && {
            color: "primary.main",
          }),
          display: "flex",
          gap: 1.5,
          borderRadius: '50px',
          px: lgUp ? 2 : 1,
          py: 1,
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
        onClick={handleClick}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: stringToColor(initials),
          }}
        >
          {initials}
        </Avatar>
        
        {lgUp && (
          <Box textAlign="left">
            <Typography variant="body2" color="textPrimary" fontWeight={600}>
              {auth.name || auth.phone}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {auth.position || 'HR'}
            </Typography>
          </Box>
        )}
      </Button>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 280,
            mt: 1.5,
            borderRadius: '12px',
          },
        }}
      >
        <Box sx={{ px: 2, py: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
              sx={{
                width: 50,
                height: 50,
                bgcolor: stringToColor(initials),
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                variant="subtitle1"
                      fontWeight={600}
                      sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                      }}
                    >
                {auth.name || auth.phone}
                    </Typography>
              {auth.email && (
                    <Typography
                  variant="caption"
                  color="text.secondary"
                      sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon icon="solar:letter-line-duotone" width="12" />
                  {auth.email}
                </Typography>
              )}
              {auth.position && (
                <Typography variant="caption" color="text.secondary">
                  {auth.position}
                    </Typography>
              )}
            </Box>
          </Stack>
        </Box>

        <Divider />

        <MenuItem
          onClick={() => {
            handleClose();
            setOpenProfile(true);
          }}
          sx={{ py: 1.5, px: 2 }}
        >
          <Icon icon="solar:user-bold-duotone" width={20} style={{ marginRight: 12 }} />
          <Typography variant="body2"><Trans>Мой профиль</Trans></Typography>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            px: 2,
            color: 'error.main',
          }}
        >
          <Icon icon="solar:logout-bold-duotone" width={20} style={{ marginRight: 12 }} />
          <Typography variant="body2"><Trans>Выйти</Trans></Typography>
        </MenuItem>
      </Menu>

      <ProfileDialog
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        onUpdated={(u) => setAuth(a => ({ ...a, ...u }))}
      />
    </>
  );
};

// Диалог редактирования профиля
function ProfileDialog({
  open,
  onClose,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  onUpdated: (u: any) => void;
}) {
  const [form, setForm] = useState({ name: '', email: '', position: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ name: '', email: '', position: '' });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (!open) return;
    apiFetch(`${API_BASE}/api/user/me`)
      .then(r => r.json())
      .then(setForm);
  }, [open]);

  const save = async () => {
    const newErrors = { name: '', email: '', position: '' };
    if (!(form.name && form.name.trim())) newErrors.name = 'Имя обязательно';
    if (form.email && !validateEmail(form.email)) newErrors.email = 'Введите корректный email адрес';

    if (newErrors.name || newErrors.email || newErrors.position) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    await apiFetch(`${API_BASE}/api/user/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    onUpdated(form);
    onClose();
  };

  const handleChange = (field: keyof typeof form) => (e: any) => {
    const value = e.target.value;
    setForm({ ...form, [field]: value });
    setErrors(prev => ({ ...prev, [field]: '' }));
    if (field === 'email' && value && !validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: 'Введите корректный email адрес' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Мой профиль</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <TextField
          label={_(msg`Имя *`)}
          value={form.name || ''}
          onChange={handleChange('name')}
          fullWidth
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField
          label="Email"
          value={form.email || ''}
          onChange={handleChange('email')}
          fullWidth
          error={!!errors.email}
          helperText={errors.email || _(msg`Например: example@mail.ru`)}
          placeholder="example@mail.ru"
        />
        <TextField
          label={_(msg`Должность`)}
          value={form.position || ''}
          onChange={handleChange('position')}
          fullWidth
          error={!!errors.position}
          helperText={errors.position}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}><Trans>Отмена</Trans></Button>
        <Button onClick={save} disabled={loading || !(form.name && form.name.trim())}><Trans>Сохранить</Trans></Button>
      </DialogActions>
    </Dialog>
  );
};

export default Profile;
