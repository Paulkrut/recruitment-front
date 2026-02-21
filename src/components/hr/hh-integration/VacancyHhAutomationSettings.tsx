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

// Доступные HH стадии (соответствуют реальному HH API)
const HH_STAGES = [
  { id: 'response', name: 'Отклик' },
  { id: 'phone_interview', name: 'Первичный контакт' },
  { id: 'assessment', name: 'Тестовое задание' },
  { id: 'interview', name: 'Собеседование' },
  { id: 'offer', name: 'Предложение о работе' },
  { id: 'hired', name: 'Выход на работу' },
  { id: 'consider', name: 'Подумать' },
];

// Внутренние статусы кандидатов
const INTERNAL_STATUSES = [
  { id: 'new', name: '📥 Новые' },
  { id: 'screening', name: '🤖 AI Скрининг' },
  { id: 'contacted', name: '📞 На связи' },
  { id: 'testing', name: '📝 Тестирование' },
  { id: 'finalist', name: '⭐ Финалист' },
  { id: 'offer', name: '💼 Оффер' },
  { id: 'hired', name: '✅ Нанят' },
  { id: 'deferred', name: '⏸️ Отложен' },
  { id: 'rejected', name: '❌ Отказ' },
];

const TEMPLATE_VARIABLES = [
  { var: '{firstName}', desc: 'Имя кандидата' },
  { var: '{vacancyTitle}', desc: 'Название вакансии' },
  { var: '{companyName}', desc: 'Название компании' },
  { var: '{interviewLink}', desc: 'Ссылка на интервью' },
];

interface Props {
  vacancyId: number;
  onSettingsLoad?: (autoInviteEnabled: boolean) => void;
}

export default function VacancyHhAutomationSettings({ vacancyId, onSettingsLoad }: Props) {
  const { _ } = useLingui();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [settings, setSettings] = useState<VacancyHhSettings | null>(null);
  const [isFromHh, setIsFromHh] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [dynamicHhStages, setDynamicHhStages] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadSettings();
  }, [vacancyId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/hh-settings`);
      const data = await response.json();

      if (data.success) {
        // Инициализируем дефолтные настройки если пришел null
        const defaultSettings = {
          autoInvite: {
            enabled: false,
            fromInternalStages: ['new'],
            toInternalStage: 'contacted',
            toHhStageId: 'interview',
            invitationType: 'ai',
            messageTemplate: "Здравствуйте, {firstName}!\n\nСпасибо за отклик на вакансию \"{vacancyTitle}\".\nПриглашаем вас пройти видео-интервью: {interviewLink}\n\nС уважением, {companyName}",
          },
          reminders: {
            enabled: false,
            daysAfter: 7,
            messageTemplate: "Здравствуйте, {firstName}!\n\nНапоминаем, что вы были приглашены на интервью по вакансии \"{vacancyTitle}\".\nЕсли ещё не прошли интервью, сделайте это по ссылке:\n{interviewLink}\n\nС уважением, {companyName}",
          },
          autoReject: {
            enabled: false,
            daysAfter: 14,
            hhStageId: 'discard',
            messageTemplate: "Здравствуйте, {firstName}!\n\nК сожалению, мы не получили от вас результаты интервью в установленные сроки.\nСпасибо за интерес к нашей вакансии!\n\nС уважением, {companyName}",
          },
        };
        const resolvedSettings = data.settings || defaultSettings;
        setSettings(resolvedSettings);
        setIsFromHh(data.isFromHh || false);
        if (Array.isArray(data.availableHhStages) && data.availableHhStages.length > 0) {
          setDynamicHhStages(data.availableHhStages);
        }
        onSettingsLoad?.(resolvedSettings.autoInvite?.enabled || false);
      } else {
        throw new Error(data.message || 'Ошибка загрузки настроек');
      }
    } catch (err: any) {
      console.error('Failed to load HH settings:', err);
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

      const response = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/hh-settings`, {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
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

  // Если вакансия не из HH - не показываем блок
  if (!isFromHh) {
    return null;
  }

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

        {/* Настройки автоприглашения */}
        <Box>
          <Divider sx={{ mb: 3 }}>
            <Chip label={<Trans>Настройки автоприглашения</Trans>} />
          </Divider>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoInvite?.enabled || false}
                    onChange={(e) => handleChange('autoInvite.enabled', e.target.checked)}
                  />
                }
                label={_(msg`Включить автоприглашение для этой вакансии`)}
              />
            </Grid>

            {settings.autoInvite?.enabled && (
              <>
              {/* Внутренние статусы */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom color="primary">
                  <Trans>Настройки внутренних статусов</Trans>
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel><Trans>Приглашать из внутренних статусов</Trans></InputLabel>
                  <Select
                    multiple
                    value={settings.autoInvite?.fromInternalStages || ['new']}
                    label={_(msg`Приглашать из внутренних статусов`)}
                    onChange={(e) => handleChange('autoInvite.fromInternalStages', e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip 
                            key={value} 
                            label={INTERNAL_STATUSES.find(s => s.id === value)?.name || value}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {INTERNAL_STATUSES.map((status) => (
                      <MenuItem key={status.id} value={status.id}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel><Trans>Переводить во внутренний статус</Trans></InputLabel>
                  <Select
                    value={settings.autoInvite?.toInternalStage || 'contacted'}
                    label={_(msg`Переводить во внутренний статус`)}
                    onChange={(e) => handleChange('autoInvite.toInternalStage', e.target.value)}
                  >
                    {INTERNAL_STATUSES.map((status) => (
                      <MenuItem key={status.id} value={status.id}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Настройки HH стадии */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom color="primary">
                  <Trans>Синхронизация с HeadHunter</Trans>
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel><Trans>Переводить в стадию HH</Trans></InputLabel>
                  <Select
                    value={settings.autoInvite?.toHhStageId || 'interview'}
                    label={_(msg`Переводить в стадию HH`)}
                    onChange={(e) => handleChange('autoInvite.toHhStageId', e.target.value)}
                  >
                    {(dynamicHhStages.length > 0 ? dynamicHhStages : HH_STAGES).map((stage) => (
                      <MenuItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {dynamicHhStages.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    <Trans>Стадии из ваших реальных кандидатов в HH</Trans>
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                {/* Пустая ячейка для симметрии */}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  <Trans>Тип приглашения</Trans>
                </Typography>
                <ToggleButtonGroup
                  value={settings.autoInvite?.invitationType || 'ai'}
                  exclusive
                  onChange={(e, value) => {
                    if (value) handleChange('autoInvite.invitationType', value);
                  }}
                  size="small"
                  fullWidth
                >

                  <ToggleButton value="ai">
                    <Box textAlign="left">
                      <Typography variant="body2"><Trans>🤖 Умное</Trans></Typography>
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="template">
                  <Box textAlign="left">
                    <Typography variant="body2"><Trans>📝 Обычное</Trans></Typography>
                  </Box>
                </ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              {settings.autoInvite?.invitationType === 'template' && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        <Trans>Текст приглашения</Trans>
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={5}
                        size="small"
                    value={settings.autoInvite?.messageTemplate || ''}
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

            {/* Дополнительные разделы: Напоминания и Автоотказы */}
            <Divider sx={{ my: 4 }} />

            {/* Напоминания (Reminders) */}
            <Box mb={4}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconMessageCircle size={24} />
                <Trans>Повторные приглашения</Trans>
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                <Trans>Автоматическая отправка напоминаний кандидатам, которые еще не прошли интервью</Trans>
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.reminders?.enabled || false}
                        onChange={(e) => handleChange('reminders.enabled', e.target.checked)}
                      />
                    }
                    label={_(msg`Включить повторные приглашения`)}
                  />
                </Grid>

                {settings.reminders?.enabled && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label={_(msg`Отправить через (дней)`)}
                        value={settings.reminders?.daysAfter || 7}
                        onChange={(e) => handleChange('reminders.daysAfter', parseInt(e.target.value))}
                        InputProps={{ inputProps: { min: 1, max: 30 } }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        <Trans>Текст напоминания</Trans>
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        size="small"
                        value={settings.reminders?.messageTemplate || ''}
                        onChange={(e) => handleChange('reminders.messageTemplate', e.target.value)}
                        placeholder={_(msg`Здравствуйте, {firstName}!...`)}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>

            {/* Автоотказы (Auto Reject) */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                ⛔
                <Trans>Автоматические отказы</Trans>
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                <Trans>Автоматический отказ кандидатам, которые не прошли интервью в установленные сроки</Trans>
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoReject?.enabled || false}
                        onChange={(e) => handleChange('autoReject.enabled', e.target.checked)}
                      />
                    }
                    label={_(msg`Включить автоматические отказы`)}
                  />
                </Grid>

                {settings.autoReject?.enabled && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label={_(msg`Отказать через (дней)`)}
                        value={settings.autoReject?.daysAfter || 14}
                        onChange={(e) => handleChange('autoReject.daysAfter', parseInt(e.target.value))}
                        InputProps={{ inputProps: { min: 1, max: 60 } }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel><Trans>Переводить в стадию HH</Trans></InputLabel>
                        <Select
                          value={settings.autoReject?.hhStageId || 'discard'}
                          label={_(msg`Переводить в стадию HH`)}
                          onChange={(e) => handleChange('autoReject.hhStageId', e.target.value)}
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
                        <Trans>Текст отказа</Trans>
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        size="small"
                        value={settings.autoReject?.messageTemplate || ''}
                        onChange={(e) => handleChange('autoReject.messageTemplate', e.target.value)}
                        placeholder={_(msg`Здравствуйте, {firstName}!...`)}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>

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
      </CardContent>
    </Card>
  );
}

