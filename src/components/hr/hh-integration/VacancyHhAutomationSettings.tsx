"use client";

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Chip,
} from '@mui/material';
import {
  IconRobot,
  IconDeviceFloppy,
  IconRefresh,
  IconMessageCircle,
} from '@tabler/icons-react';
import { apiFetch } from '@/utils/api';
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';
import type { VacancyHhSettings } from '@/components/hr/hh-integration/types';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

// Доступные HH стадии
const HH_STAGES = [
  { id: 'response', name: 'Отклик' },
  { id: 'invitation', name: 'Приглашение' },
  { id: 'interview', name: 'Интервью' },
  { id: 'offer', name: 'Предложение о работе' },
  { id: 'hired', name: 'Принят на работу' },
  { id: 'discard', name: 'Отказ' },
];

const TEMPLATE_VARIABLES = [
  { var: '{firstName}', desc: 'Имя кандидата' },
  { var: '{vacancyTitle}', desc: 'Название вакансии' },
  { var: '{companyName}', desc: 'Название компании' },
  { var: '{interviewLink}', desc: 'Ссылка на интервью' },
];

interface Props {
  vacancyId: number;
}

export default function VacancyHhAutomationSettings({ vacancyId }: Props) {
  const { _ } = useLingui();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [settings, setSettings] = useState<VacancyHhSettings | null>(null);
  const [effectiveSettings, setEffectiveSettings] = useState<any>(null);
  const [companyDefaults, setCompanyDefaults] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [vacancyId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch(`${API_BASE}/api/vacancies/${vacancyId}/hh-settings`);
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
        setEffectiveSettings(data.effectiveSettings);
        setCompanyDefaults(data.companyDefaults);
      } else {
        throw new Error(data.message || 'Ошибка загрузки настроек');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await apiFetch(`${API_BASE}/api/vacancies/${vacancyId}/hh-settings`, {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
        setEffectiveSettings(data.effectiveSettings);
        setSuccess(true);
        setHasChanges(false);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(data.message || 'Ошибка сохранения');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения настроек');
    } finally {
      setSaving(false);
    }
  };

  const handleUseDefaultsToggle = (useDefaults: boolean) => {
    const newSettings = { ...settings, useDefaults } as VacancyHhSettings;
    
    // Если переключаемся на индивидуальные - копируем глобальные как отправную точку
    if (!useDefaults && companyDefaults) {
      newSettings.autoInvite = { ...companyDefaults.autoInvite };
    }
    
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleChange = (field: string, value: any) => {
    setSettings((prev: any) => {
      const newSettings = { ...prev };
      const keys = field.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      setHasChanges(true);
      return newSettings;
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!settings) return null;

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconRobot size={28} />
            <Box>
              <Typography variant="h6">
                <Trans>🤖 Автоматизация HH для этой вакансии</Trans>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <Trans>Индивидуальные настройки или глобальные по умолчанию</Trans>
              </Typography>
            </Box>
          </Box>

          {hasChanges && (
            <Box display="flex" gap={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  loadSettings();
                  setHasChanges(false);
                }}
                startIcon={<IconRefresh size={16} />}
              >
                <Trans>Отменить</Trans>
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} /> : <IconDeviceFloppy size={16} />}
              >
                {saving ? <Trans>Сохранение...</Trans> : <Trans>Сохранить</Trans>}
              </Button>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Trans>✅ Настройки сохранены</Trans>
          </Alert>
        )}

        {/* Переключатель глобальные/индивидуальные */}
        <Box mb={3}>
          <FormControlLabel
            control={
              <Switch
                checked={!settings.useDefaults}
                onChange={(e) => handleUseDefaultsToggle(!e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {settings.useDefaults 
                    ? <Trans>Использовать глобальные настройки</Trans>
                    : <Trans>Индивидуальные настройки для этой вакансии</Trans>
                  }
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {settings.useDefaults
                    ? <Trans>Настройки из "Настройки → Интеграция с HH → Автоматизация"</Trans>
                    : <Trans>Переопределить настройки только для этой вакансии</Trans>
                  }
                </Typography>
              </Box>
            }
          />
        </Box>

        {/* Показываем текущие эффективные настройки */}
        {settings.useDefaults && effectiveSettings && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              <strong><Trans>Используются глобальные настройки:</Trans></strong>
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0 }}>
              <li>
                <Typography variant="caption">
                  <Trans>
                    Автоприглашение: {effectiveSettings.autoInvite?.enabled ? '✅ Включено' : '❌ Выключено'}
                  </Trans>
                </Typography>
              </li>
              {effectiveSettings.autoInvite?.enabled && (
                <>
                  <li>
                    <Typography variant="caption">
                      <Trans>
                        Из стадии: {HH_STAGES.find(s => s.id === effectiveSettings.autoInvite.fromHhStageId)?.name}
                      </Trans>
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="caption">
                      <Trans>
                        В стадию: {HH_STAGES.find(s => s.id === effectiveSettings.autoInvite.toHhStageId)?.name}
                      </Trans>
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="caption">
                      <Trans>
                        Тип: {effectiveSettings.autoInvite.invitationType === 'ai' ? '🤖 AI' : '📝 Шаблон'}
                      </Trans>
                    </Typography>
                  </li>
                </>
              )}
            </Box>
            <Button
              size="small"
              variant="text"
              sx={{ mt: 1 }}
              href="/hr/settings/hh-integration"
            >
              <Trans>Изменить глобальные настройки</Trans>
            </Button>
          </Alert>
        )}

        {/* Индивидуальные настройки */}
        {!settings.useDefaults && settings.autoInvite && (
          <Box>
            <Divider sx={{ mb: 3 }}>
              <Chip label={<Trans>Настройки автоприглашения</Trans>} />
            </Divider>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoInvite.enabled}
                      onChange={(e) => handleChange('autoInvite.enabled', e.target.checked)}
                    />
                  }
                  label={_(msg`Включить автоприглашение для этой вакансии`)}
                />
              </Grid>

              {settings.autoInvite.enabled && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel><Trans>Загружать из HH стадии</Trans></InputLabel>
                      <Select
                        value={settings.autoInvite.fromHhStageId}
                        label={_(msg`Загружать из HH стадии`)}
                        onChange={(e) => handleChange('autoInvite.fromHhStageId', e.target.value)}
                      >
                        {HH_STAGES.map((stage) => (
                          <MenuItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel><Trans>Переводить в стадию</Trans></InputLabel>
                      <Select
                        value={settings.autoInvite.toHhStageId}
                        label={_(msg`Переводить в стадию`)}
                        onChange={(e) => handleChange('autoInvite.toHhStageId', e.target.value)}
                      >
                        {HH_STAGES.map((stage) => (
                          <MenuItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      <Trans>Тип приглашения</Trans>
                    </Typography>
                    <ToggleButtonGroup
                      value={settings.autoInvite.invitationType}
                      exclusive
                      onChange={(e, value) => {
                        if (value) handleChange('autoInvite.invitationType', value);
                      }}
                      size="small"
                      fullWidth
                    >
                      <ToggleButton value="template">
                        <Box textAlign="left">
                          <Typography variant="body2"><Trans>📝 Обычное</Trans></Typography>
                        </Box>
                      </ToggleButton>
                      <ToggleButton value="ai">
                        <Box textAlign="left">
                          <Typography variant="body2"><Trans>🤖 AI</Trans></Typography>
                        </Box>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Grid>

                  {settings.autoInvite.invitationType === 'template' && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        <Trans>Текст приглашения</Trans>
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={5}
                        size="small"
                        value={settings.autoInvite.messageTemplate || ''}
                        onChange={(e) => handleChange('autoInvite.messageTemplate', e.target.value)}
                        placeholder={_(msg`Здравствуйте, {firstName}!...`)}
                      />
                      <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                        <Typography variant="caption" color="text.secondary" sx={{ width: '100%', mb: 0.5 }}>
                          <Trans>Переменные:</Trans>
                        </Typography>
                        {TEMPLATE_VARIABLES.map((v) => (
                          <Chip key={v.var} label={v.var} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Grid>
                  )}
                </>
              )}
            </Grid>

            {hasChanges && (
              <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    loadSettings();
                    setHasChanges(false);
                  }}
                  startIcon={<IconRefresh size={16} />}
                >
                  <Trans>Отменить</Trans>
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} /> : <IconDeviceFloppy size={16} />}
                >
                  {saving ? <Trans>Сохранение...</Trans> : <Trans>Сохранить</Trans>}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

