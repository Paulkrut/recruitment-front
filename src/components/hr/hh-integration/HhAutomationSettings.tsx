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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from '@mui/material';
import {
  IconChevronDown,
  IconRobot,
  IconBell,
  IconX,
  IconMessageCircle,
  IconRefresh,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import { useHhAutomation } from '@/hooks/useHhAutomation';
import type { HhAutomationSettings, HhCandidateStatus } from './types';
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';

interface Props {
  isConnected: boolean;
  hasValidToken: boolean;
  hhStages?: HhCandidateStatus[];
}

// Доступные HH стадии (для синхронизации обратно в HH)
// Если не переданы - используем фоллбэк
const DEFAULT_HH_STAGES: HhCandidateStatus[] = [
  { id: 'response', name: 'Отклик' },
  { id: 'invitation', name: 'Приглашение' },
  { id: 'interview', name: 'Интервью' },
  { id: 'offer', name: 'Предложение о работе' },
  { id: 'hired', name: 'Принят на работу' },
  { id: 'discard', name: 'Отказ' },
];

// Внутренние стадии кандидатов в системе
const INTERNAL_STAGES = [
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
  { var: '{lastName}', desc: 'Фамилия кандидата' },
  { var: '{fullName}', desc: 'Полное имя кандидата' },
  { var: '{vacancyTitle}', desc: 'Название вакансии' },
  { var: '{companyName}', desc: 'Название компании' },
  { var: '{interviewLink}', desc: 'Ссылка на интервью' },
];

// Дефолтные настройки (вынесены наружу для доступности)
const DEFAULT_SETTINGS: HhAutomationSettings = {
  defaults: {
    autoInvite: {
      enabled: false,
      fromInternalStages: ['new'],  // По умолчанию только новые
      toInternalStage: 'contacted',  // Переводим в "На связи"
      toHhStageId: 'assessment',     // В HH переводим в "Тестовое задание" (fallback: phone_interview)
      invitationType: 'ai' as const, // По умолчанию AI (умное приглашение)
      messageTemplate: 'Здравствуйте, {candidateName}!\n\nМы рассмотрели ваш отклик на вакансию "{vacancyTitle}" и хотели бы пригласить вас на интервью.\n\nПройдите по ссылке: {interviewLink}\n\nС уважением,\n{companyName}',
    },
    reminders: {
      enabled: false,
      daysAfter: 7,
      messageTemplate: 'Здравствуйте, {candidateName}!\n\nНапоминаем вам о приглашении на интервью по вакансии "{vacancyTitle}".\n\nСсылка на интервью: {interviewLink}\n\nБудем рады вашему участию!',
    },
    autoReject: {
      enabled: false,
      daysAfter: 14,
      hhStageId: 'discard',
      messageTemplate: 'Здравствуйте, {candidateName}!\n\nК сожалению, мы приняли решение не продолжать рассмотрение вашей кандидатуры на вакансию "{vacancyTitle}".\n\nБлагодарим за интерес к нашей компании!',
    },
    statusSync: {
      afterInterview: {
        enabled: false,
        hhStageId: 'interview',
      },
      onReject: {
        enabled: false,
        hhStageId: 'discard',
        messageTemplate: 'К сожалению, мы приняли решение не продолжать рассмотрение вашей кандидатуры.',
      },
    },
  },
};

export default function HhAutomationSettings({ isConnected, hasValidToken, hhStages }: Props) {
  const { _ } = useLingui();
  const { settings, loading, saving, error, loadSettings, updateSettings } = useHhAutomation();

  // Используем переданные HH стадии или дефолтные
  const HH_STAGES = hhStages && hhStages.length > 0 ? hhStages : DEFAULT_HH_STAGES;

  // Используем функцию для ленивой инициализации
  const [localSettings, setLocalSettings] = useState<HhAutomationSettings>(() => {
    console.log('🎬 useState initialization, DEFAULT_SETTINGS:', DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isConnected && hasValidToken) {
      loadSettings();
    }
  }, [isConnected, hasValidToken]);

  useEffect(() => {
    // Игнорируем если settings это массив или пустой объект
    if (settings && !Array.isArray(settings) && typeof settings === 'object' && settings.defaults) {
      console.log('📥 Settings loaded from API:', settings);
      setLocalSettings(settings);
    } else {
      console.log('ℹ️ Invalid or empty settings from API, keeping DEFAULT_SETTINGS. Got:', settings);
    }
  }, [settings]);

  // Проверяем и устанавливаем правильную HH стадию по умолчанию
  useEffect(() => {
    if (HH_STAGES.length > 0) {
      const hasAssessment = HH_STAGES.some(stage => stage.id === 'assessment');
      const hasPhoneInterview = HH_STAGES.some(stage => stage.id === 'phone_interview');
      
      // Если дефолт 'invitation' или не существует в списке, меняем на assessment/phone_interview
      setLocalSettings((prev: any) => {
        if (!prev || !prev.defaults || !prev.defaults.autoInvite) return prev;
        
        const currentStageId = prev.defaults.autoInvite.toHhStageId;
        const stageExists = HH_STAGES.some(stage => stage.id === currentStageId);
        
        // Если текущая стадия существует - оставляем как есть
        if (stageExists) return prev;
        
        // Иначе выбираем assessment или phone_interview
        const newStageId = hasAssessment ? 'assessment' : (hasPhoneInterview ? 'phone_interview' : HH_STAGES[0]?.id || 'invitation');
        
        console.log(`🔄 Устанавливаем HH стадию по умолчанию: ${newStageId}`);
        
        const newSettings = JSON.parse(JSON.stringify(prev));
        newSettings.defaults.autoInvite.toHhStageId = newStageId;
        return newSettings;
      });
    }
  }, [HH_STAGES]);

  const handleChange = (path: string[], value: any) => {
    setLocalSettings((prev: any) => {
      // Если prev не объект или массив - используем DEFAULT_SETTINGS
      let base = prev;
      if (!prev || Array.isArray(prev) || typeof prev !== 'object' || !prev.defaults) {
        console.warn('⚠️ prev is invalid, using DEFAULT_SETTINGS:', prev);
        base = DEFAULT_SETTINGS;
      }
      
      const newSettings = JSON.parse(JSON.stringify(base));
      let current = newSettings;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      setHasChanges(true);
      
      console.log('✅ handleChange result:', { path, value, newSettings });
      return newSettings;
    });
  };

  const handleSave = async () => {
    setSaveSuccess(false);
    const success = await updateSettings(localSettings!);
    if (success) {
      setSaveSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Безопасное получение defaults с фоллбэком и логированием
  const defaults = localSettings?.defaults || DEFAULT_SETTINGS.defaults;
  
  // Debug: проверяем что все на месте
  console.log('🔍 HhAutomationSettings render:', {
    localSettings,
    defaults,
    hasReminders: !!defaults?.reminders,
    hasAutoInvite: !!defaults?.autoInvite,
  });

  // Если defaults все еще undefined - что-то пошло не так, показываем лоадер
  if (!defaults || !defaults.autoInvite || !defaults.reminders) {
    console.error('❌ defaults is broken:', defaults);
    return (
      <Card>
        <CardContent>
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Инициализация настроек...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconRobot size={32} />
            <Box>
              <Typography variant="h5">
                <Trans>🤖 Автоматизация работы с кандидатами</Trans>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <Trans>Настройте автоматические приглашения, напоминания и синхронизацию статусов</Trans>
              </Typography>
            </Box>
          </Box>
          
          {hasChanges && (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleReset}
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
            {error}
          </Alert>
        )}

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Trans>✅ Настройки успешно сохранены</Trans>
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            <strong><Trans>Как это работает:</Trans></strong>
          </Typography>
          <Typography variant="body2" component="div">
            <Trans>
              1. Кандидат на выбранной стадии → автоматически получает приглашение через HH.ru<br/>
              2. Через 7 дней → напоминание если не прошёл интервью<br/>
              3. Через 14 дней → автоматический отказ если так и не прошёл<br/>
              4. После прохождения интервью → автообновление статуса в HH
            </Trans>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            <Trans>💬 Все приглашения отправляются через HH.ru</Trans>
          </Typography>
        </Alert>

        {/* 1. АВТОПРИГЛАШЕНИЕ */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<IconChevronDown />}>
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <IconMessageCircle />
              <Box flex={1}>
                <Typography variant="h6"><Trans>📨 Автоприглашение на интервью</Trans></Typography>
                <Typography variant="caption" color="text.secondary">
                  <Trans>Автоматически отправлять приглашения новым кандидатам из HH</Trans>
                </Typography>
              </Box>
              <Chip
                label={defaults.autoInvite.enabled ? _(msg`Включено`) : _(msg`Выключено`)}
                color={defaults.autoInvite.enabled ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={defaults.autoInvite.enabled}
                      onChange={(e) => handleChange(['defaults', 'autoInvite', 'enabled'], e.target.checked)}
                    />
                  }
                  label={_(msg`Включить автоприглашение`)}
                />
              </Grid>

              {defaults.autoInvite.enabled && (
                <>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel><Trans>Отправлять приглашение кандидатам на стадиях</Trans></InputLabel>
                      <Select
                        multiple
                        value={defaults.autoInvite.fromInternalStages || []}
                        label={_(msg`Отправлять приглашение кандидатам на стадиях`)}
                        onChange={(e) => handleChange(['defaults', 'autoInvite', 'fromInternalStages'], e.target.value)}
                        input={<OutlinedInput label={_(msg`Отправлять приглашение кандидатам на стадиях`)} />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as string[]).map((value) => {
                              const stage = INTERNAL_STAGES.find(s => s.id === value);
                              return <Chip key={value} label={stage?.name || value} size="small" />;
                            })}
                          </Box>
                        )}
                      >
                        {INTERNAL_STAGES.map((stage) => (
                          <MenuItem key={stage.id} value={stage.id}>
                            <Checkbox checked={(defaults.autoInvite.fromInternalStages || []).indexOf(stage.id) > -1} />
                            <ListItemText primary={stage.name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      <Trans>💡 Приглашения отправляются через HH.ru только кандидатам с этих стадий</Trans>
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel><Trans>После приглашения → на стадию</Trans></InputLabel>
                      <Select
                        value={defaults.autoInvite.toInternalStage}
                        label={_(msg`После приглашения → на стадию`)}
                        onChange={(e) => handleChange(['defaults', 'autoInvite', 'toInternalStage'], e.target.value)}
                      >
                        {INTERNAL_STAGES.map((stage) => (
                          <MenuItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel><Trans>Синхронизировать в HH стадию</Trans></InputLabel>
                      <Select
                        value={defaults.autoInvite.toHhStageId}
                        label={_(msg`Синхронизировать в HH стадию`)}
                        onChange={(e) => handleChange(['defaults', 'autoInvite', 'toHhStageId'], e.target.value)}
                      >
                        {HH_STAGES.map((stage) => (
                          <MenuItem key={stage.id} value={stage.id}>
                            {stage.name}
                            {stage.total_count !== undefined && (
                              <Typography variant="caption" color="text.secondary" ml={1}>
                                ({stage.total_count})
                              </Typography>
                            )}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      <Trans>🔄 Список стадий загружен из HH.ru</Trans>
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      <Trans>Тип приглашения</Trans>
                    </Typography>
                    <ToggleButtonGroup
                      value={defaults.autoInvite.invitationType}
                      exclusive
                      onChange={(e, value) => {
                        if (value) handleChange(['defaults', 'autoInvite', 'invitationType'], value);
                      }}
                      fullWidth
                    >
                      <ToggleButton value="ai">
                        <Box textAlign="left" width="100%">
                          <Typography variant="body2" fontWeight="bold">
                            <Trans>🤖 Умное приглашение (AI)</Trans>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            <Trans>Персонализация под каждого кандидата</Trans>
                          </Typography>
                        </Box>
                      </ToggleButton>
                      <ToggleButton value="template">
                        <Box textAlign="left" width="100%">
                          <Typography variant="body2" fontWeight="bold">
                            <Trans>📝 Обычное (шаблон)</Trans>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            <Trans>Единый текст с переменными</Trans>
                          </Typography>
                        </Box>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Grid>

                  {defaults.autoInvite.invitationType === 'ai' && (
                    <Grid item xs={12}>
                      <Alert severity="info" icon={<Box component="span">✨</Box>}>
                        <Typography variant="body2">
                          <Trans>
                            <strong>Умное приглашение</strong> анализирует резюме каждого кандидата и формирует персональное сообщение, 
                            которое подчёркивает его ключевые компетенции, релевантные для вашей компании, и мотивирует пройти интервью. 
                            Алгоритм основан на статистике успешных откликов и постоянно совершенствуется, 
                            чтобы помочь вам подобрать лучших специалистов.
                          </Trans>
                        </Typography>
                      </Alert>
                    </Grid>
                  )}

                  {defaults.autoInvite.invitationType === 'template' && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        <Trans>Текст приглашения</Trans>
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={6}
                        value={defaults.autoInvite.messageTemplate || ''}
                        onChange={(e) => handleChange(['defaults', 'autoInvite', 'messageTemplate'], e.target.value)}
                        placeholder={_(msg`Здравствуйте, {firstName}!...`)}
                      />
                      <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                        <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>
                          <Trans>Доступные переменные:</Trans>
                        </Typography>
                        {TEMPLATE_VARIABLES.map((v) => (
                          <Chip
                            key={v.var}
                            label={`${v.var} — ${v.desc}`}
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              const textarea = document.querySelector('textarea');
                              if (textarea) {
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const text = textarea.value;
                                const newText = text.substring(0, start) + v.var + text.substring(end);
                                handleChange(['defaults', 'autoInvite', 'messageTemplate'], newText);
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}
                </>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* 2. НАПОМИНАНИЯ И АВТООТКАЗ */}
        <Accordion>
          <AccordionSummary expandIcon={<IconChevronDown />}>
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <IconBell />
              <Box flex={1}>
                <Typography variant="h6"><Trans>⏰ Напоминания и автоотказ</Trans></Typography>
                <Typography variant="caption" color="text.secondary">
                  <Trans>Напоминать кандидатам о непройденном интервью</Trans>
                </Typography>
              </Box>
              <Chip
                label={defaults.reminders.enabled ? _(msg`Включено`) : _(msg`Выключено`)}
                color={defaults.reminders.enabled ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Напоминания */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={defaults.reminders.enabled}
                      onChange={(e) => handleChange(['defaults', 'reminders', 'enabled'], e.target.checked)}
                    />
                  }
                  label={_(msg`Отправлять напоминание о непройденном интервью`)}
                />
              </Grid>

              {defaults.reminders.enabled && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label={_(msg`Через сколько дней напомнить`)}
                      value={defaults.reminders.daysAfter}
                      onChange={(e) => handleChange(['defaults', 'reminders', 'daysAfter'], parseInt(e.target.value))}
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
                      value={defaults.reminders.messageTemplate}
                      onChange={(e) => handleChange(['defaults', 'reminders', 'messageTemplate'], e.target.value)}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Автоотказ */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={defaults.autoReject.enabled}
                      onChange={(e) => handleChange(['defaults', 'autoReject', 'enabled'], e.target.checked)}
                    />
                  }
                  label={_(msg`Автоматически отклонять без прохождения интервью`)}
                />
              </Grid>

              {defaults.autoReject.enabled && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label={_(msg`Через сколько дней отклонить`)}
                      value={defaults.autoReject.daysAfter}
                      onChange={(e) => handleChange(['defaults', 'autoReject', 'daysAfter'], parseInt(e.target.value))}
                      InputProps={{ inputProps: { min: 1, max: 60 } }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel><Trans>Перевести в HH стадию</Trans></InputLabel>
                      <Select
                        value={defaults.autoReject.hhStageId}
                        label={_(msg`Перевести в HH стадию`)}
                        onChange={(e) => handleChange(['defaults', 'autoReject', 'hhStageId'], e.target.value)}
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
                      value={defaults.autoReject.messageTemplate}
                      onChange={(e) => handleChange(['defaults', 'autoReject', 'messageTemplate'], e.target.value)}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* 3. СИНХРОНИЗАЦИЯ СТАТУСОВ */}
        <Accordion>
          <AccordionSummary expandIcon={<IconChevronDown />}>
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <IconRefresh />
              <Box flex={1}>
                <Typography variant="h6"><Trans>🔄 Синхронизация статусов с HH</Trans></Typography>
                <Typography variant="caption" color="text.secondary">
                  <Trans>Автоматически обновлять статусы кандидатов в HH</Trans>
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* После прохождения интервью */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={defaults.statusSync.afterInterview.enabled}
                      onChange={(e) => handleChange(['defaults', 'statusSync', 'afterInterview', 'enabled'], e.target.checked)}
                    />
                  }
                  label={_(msg`После прохождения интервью → обновить статус в HH`)}
                />
              </Grid>

              {defaults.statusSync.afterInterview.enabled && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel><Trans>В HH стадию</Trans></InputLabel>
                    <Select
                      value={defaults.statusSync.afterInterview.hhStageId}
                      label={_(msg`В HH стадию`)}
                      onChange={(e) => handleChange(['defaults', 'statusSync', 'afterInterview', 'hhStageId'], e.target.value)}
                    >
                      {HH_STAGES.map((stage) => (
                        <MenuItem key={stage.id} value={stage.id}>
                          {stage.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* При отклонении */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={defaults.statusSync.onReject.enabled}
                      onChange={(e) => handleChange(['defaults', 'statusSync', 'onReject', 'enabled'], e.target.checked)}
                    />
                  }
                  label={_(msg`При отклонении кандидата → отправить отказ в HH`)}
                />
              </Grid>

              {defaults.statusSync.onReject.enabled && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel><Trans>В HH стадию</Trans></InputLabel>
                      <Select
                        value={defaults.statusSync.onReject.hhStageId}
                        label={_(msg`В HH стадию`)}
                        onChange={(e) => handleChange(['defaults', 'statusSync', 'onReject', 'hhStageId'], e.target.value)}
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
                      value={defaults.statusSync.onReject.messageTemplate}
                      onChange={(e) => handleChange(['defaults', 'statusSync', 'onReject', 'messageTemplate'], e.target.value)}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Кнопки внизу */}
        {hasChanges && (
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<IconRefresh />}
            >
              <Trans>Отменить изменения</Trans>
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <IconDeviceFloppy />}
            >
              {saving ? <Trans>Сохранение...</Trans> : <Trans>Сохранить настройки</Trans>}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

