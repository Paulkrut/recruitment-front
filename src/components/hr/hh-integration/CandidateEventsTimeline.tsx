"use client";

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  IconRobot,
  IconBell,
  IconX,
  IconRefresh,
  IconEdit,
  IconMail,
  IconCheckbox,
  IconPlayerPlay,
  IconUserPlus,
  IconReload,
} from '@tabler/icons-react';
import { apiFetch } from '@/utils/api';
import { CandidateEvent, EventTypes } from '@/types/candidateEvent';
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';

// Добавляем стили для анимации
const styles = `
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .rotating {
    animation: rotate 1s linear infinite;
  }
`;

interface CandidateEventsTimelineProps {
  candidateId: number;
}

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

// Иконки для типов событий
const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case EventTypes.AUTO_INVITE:
      return <IconRobot size={20} />;
    case EventTypes.REMINDER:
      return <IconBell size={20} />;
    case EventTypes.AUTO_REJECT:
      return <IconX size={20} />;
    case EventTypes.HH_SYNC_AFTER_INTERVIEW:
    case EventTypes.HH_SYNC_ON_REJECT:
      return <IconRefresh size={20} />;
    case EventTypes.MANUAL_STATUS_CHANGE:
      return <IconEdit size={20} />;
    case EventTypes.HH_MESSAGE_SENT:
      return <IconMail size={20} />;
    case EventTypes.INTERVIEW_COMPLETED:
      return <IconCheckbox size={20} />;
    case EventTypes.INTERVIEW_STARTED:
      return <IconPlayerPlay size={20} />;
    case EventTypes.CANDIDATE_CREATED:
      return <IconUserPlus size={20} />;
    default:
      return <IconRobot size={20} />;
  }
};

// Цвета для типов событий
const getEventColor = (eventType: string): "primary" | "success" | "error" | "warning" | "info" | "grey" => {
  switch (eventType) {
    case EventTypes.AUTO_INVITE:
      return 'primary';
    case EventTypes.REMINDER:
      return 'warning';
    case EventTypes.AUTO_REJECT:
      return 'error';
    case EventTypes.HH_SYNC_AFTER_INTERVIEW:
      return 'success';
    case EventTypes.HH_SYNC_ON_REJECT:
      return 'error';
    case EventTypes.MANUAL_STATUS_CHANGE:
      return 'info';
    case EventTypes.HH_MESSAGE_SENT:
      return 'primary';
    case EventTypes.INTERVIEW_COMPLETED:
      return 'success';
    case EventTypes.INTERVIEW_STARTED:
      return 'info';
    case EventTypes.CANDIDATE_CREATED:
      return 'success';
    default:
      return 'grey';
  }
};

// Человекочитаемые названия событий
const getEventTitle = (event: CandidateEvent, _: any): string => {
  switch (event.eventType) {
    case EventTypes.AUTO_INVITE:
      return _(msg`Автоприглашение отправлено`);
    case EventTypes.REMINDER:
      return _(msg`Напоминание отправлено`);
    case EventTypes.AUTO_REJECT:
      return _(msg`Автоматический отказ`);
    case EventTypes.HH_SYNC_AFTER_INTERVIEW:
      return _(msg`Синхронизация после интервью`);
    case EventTypes.HH_SYNC_ON_REJECT:
      return _(msg`Синхронизация при отклонении`);
    case EventTypes.MANUAL_STATUS_CHANGE:
      return _(msg`Изменение статуса`);
    case EventTypes.HH_MESSAGE_SENT:
      return _(msg`Сообщение отправлено`);
    case EventTypes.INTERVIEW_COMPLETED:
      return _(msg`Интервью завершено`);
    case EventTypes.INTERVIEW_STARTED:
      return _(msg`Интервью начато`);
    case EventTypes.CANDIDATE_CREATED:
      return _(msg`Кандидат создан`);
    default:
      return event.eventType;
  }
};

// Описание события
const getEventDescription = (event: CandidateEvent, _: any): string | null => {
  switch (event.eventType) {
    case EventTypes.AUTO_INVITE:
      const invitationType = event.metadata?.invitation_type === 'ai' 
        ? _(msg`умное приглашение`) 
        : _(msg`обычное приглашение`);
      return `${_(msg`Тип`)}: ${invitationType}`;
    
    case EventTypes.MANUAL_STATUS_CHANGE:
      return `${event.oldValue} → ${event.newValue}`;
    
    case EventTypes.HH_SYNC_AFTER_INTERVIEW:
    case EventTypes.HH_SYNC_ON_REJECT:
      const success = event.metadata?.success;
      const hhStage = event.metadata?.hh_stage_id;
      if (success) {
        return `${_(msg`Статус изменён на`)}: ${hhStage}`;
      } else {
        return `${_(msg`Ошибка`)}: ${event.metadata?.error || 'Unknown'}`;
      }
    
    case EventTypes.INTERVIEW_STARTED:
      return _(msg`Кандидат начал проходить интервью`);
    
    case EventTypes.INTERVIEW_COMPLETED:
      return _(msg`Кандидат завершил интервью`);
    
    case EventTypes.CANDIDATE_CREATED:
      const source = event.metadata?.source;
      const initialStatus = event.metadata?.initial_status;
      const sourceText = source === 'hh' ? 'HeadHunter' : source;
      return `${_(msg`Источник`)}: ${sourceText}, ${_(msg`начальный статус`)}: ${initialStatus}`;
    
    default:
      return null;
  }
};

// Форматирование даты
const formatEventDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'только что';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} мин назад`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ч назад`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} дн назад`;
  } else {
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

export default function CandidateEventsTimeline({ candidateId }: CandidateEventsTimelineProps) {
  const { _ } = useLingui();
  const [events, setEvents] = useState<CandidateEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'automated' | 'manual'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [candidateId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFetch(`${API_BASE}/api/admin/candidates/${candidateId}/events`);
      
      if (!response.ok) {
        throw new Error('Failed to load events');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Error loading candidate events:', err);
      setError(_(msg`Ошибка загрузки истории событий`));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/candidates/${candidateId}/events`);
      
      if (!response.ok) {
        throw new Error('Failed to refresh events');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Error refreshing candidate events:', err);
      setError(_(msg`Ошибка обновления истории событий`));
    } finally {
      setRefreshing(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'automated') return event.isAutomated;
    if (filter === 'manual') return !event.isAutomated;
    return true;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (events.length === 0) {
    return (
      <Alert severity="info">
        <Trans>Пока нет событий для этого кандидата</Trans>
      </Alert>
    );
  }

  return (
    <Box>
      {/* CSS для анимации */}
      <style>{styles}</style>

      {/* Фильтры и кнопка обновления */}
      <Stack direction="row" spacing={2} mb={3} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            <Trans>Показать:</Trans>
          </Typography>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_, newFilter) => newFilter && setFilter(newFilter)}
            size="small"
          >
            <ToggleButton value="all">
              <Trans>Все</Trans> ({events.length})
            </ToggleButton>
            <ToggleButton value="automated">
              <Trans>Автоматические</Trans> ({events.filter(e => e.isAutomated).length})
            </ToggleButton>
            <ToggleButton value="manual">
              <Trans>Ручные</Trans> ({events.filter(e => !e.isAutomated).length})
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Tooltip title={_(msg`Обновить историю`)}>
          <IconButton 
            onClick={handleRefresh} 
            disabled={refreshing}
            color="primary"
            size="small"
          >
            <IconReload className={refreshing ? 'rotating' : ''} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Timeline */}
      <Timeline position="right">
        {filteredEvents.map((event, index) => (
          <TimelineItem key={event.id}>
            <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3, py: 2 }}>
              <Typography variant="caption">
                {formatEventDate(event.createdAt)}
              </Typography>
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot color={getEventColor(event.eventType)}>
                {getEventIcon(event.eventType)}
              </TimelineDot>
              {index < filteredEvents.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent sx={{ py: 1.5, px: 2 }}>
              <Card variant="outlined" sx={{ mb: 1 }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {getEventTitle(event, _)}
                    </Typography>
                    {event.isAutomated && (
                      <Chip label={_(msg`Авто`)} size="small" color="primary" sx={{ height: 20 }} />
                    )}
                  </Stack>

                  {getEventDescription(event, _) && (
                    <Typography variant="body2" color="text.secondary">
                      {getEventDescription(event, _)}
                    </Typography>
                  )}

                  {event.initiator !== 'system' && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      <Trans>Инициатор: User #{event.initiator}</Trans>
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
}

