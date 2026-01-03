"use client";

import {
  Box,
  Chip,
  Tooltip,
  Typography,
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
  IconMail,
  IconBell,
  IconX,
  IconCheck,
} from '@tabler/icons-react';
import { Trans } from '@lingui/macro';
import { formatDateToLocal } from '@/utils/dateUtils';

interface CandidateAutoActions {
  invitationSentAt?: string;
  autoInvited?: boolean;
  reminderSentAt?: string;
  autoRejectedAt?: string;
}

interface Props {
  candidate: CandidateAutoActions;
  compact?: boolean; // Компактный вид для списков
}

/**
 * Компонент для отображения автоматических действий с кандидатом
 */
export default function CandidateAutoActionsDisplay({ candidate, compact = false }: Props) {
  const hasAutoActions = candidate.autoInvited || candidate.reminderSentAt || candidate.autoRejectedAt;

  if (!hasAutoActions) {
    return null;
  }

  // Компактный вид - просто иконка с тултипом
  if (compact) {
    return (
      <Tooltip
        title={
          <Box>
            <Typography variant="caption" display="block" fontWeight="bold">
              <Trans>Автоматические действия:</Trans>
            </Typography>
            {candidate.autoInvited && candidate.invitationSentAt && (
              <Typography variant="caption" display="block">
                ✉️ <Trans>Приглашение: {formatDateToLocal(candidate.invitationSentAt)}</Trans>
              </Typography>
            )}
            {candidate.reminderSentAt && (
              <Typography variant="caption" display="block">
                🔔 <Trans>Напоминание: {formatDateToLocal(candidate.reminderSentAt)}</Trans>
              </Typography>
            )}
            {candidate.autoRejectedAt && (
              <Typography variant="caption" display="block">
                ❌ <Trans>Автоотказ: {formatDateToLocal(candidate.autoRejectedAt)}</Trans>
              </Typography>
            )}
          </Box>
        }
      >
        <Chip
          icon={<IconRobot size={14} />}
          label={<Trans>Авто</Trans>}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      </Tooltip>
    );
  }

  // Полный вид - timeline
  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <IconRobot size={20} />
        <Typography variant="subtitle2">
          <Trans>История автоматических действий</Trans>
        </Typography>
      </Box>

      <Timeline sx={{ p: 0, m: 0 }}>
        {/* Автоприглашение */}
        {candidate.autoInvited && candidate.invitationSentAt && (
          <TimelineItem>
            <TimelineOppositeContent
              sx={{ maxWidth: '120px', px: 1 }}
              color="text.secondary"
              variant="caption"
            >
              {formatDateToLocal(candidate.invitationSentAt)}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="primary">
                <IconMail size={16} />
              </TimelineDot>
              {(candidate.reminderSentAt || candidate.autoRejectedAt) && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  icon={<IconRobot size={14} />}
                  label={<Trans>Автоприглашение</Trans>}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                <Trans>Автоматически отправлено приглашение на интервью</Trans>
              </Typography>
            </TimelineContent>
          </TimelineItem>
        )}

        {/* Напоминание */}
        {candidate.reminderSentAt && (
          <TimelineItem>
            <TimelineOppositeContent
              sx={{ maxWidth: '120px', px: 1 }}
              color="text.secondary"
              variant="caption"
            >
              {formatDateToLocal(candidate.reminderSentAt)}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="warning">
                <IconBell size={16} />
              </TimelineDot>
              {candidate.autoRejectedAt && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  icon={<IconRobot size={14} />}
                  label={<Trans>Напоминание</Trans>}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                <Trans>Отправлено напоминание о непройденном интервью</Trans>
              </Typography>
            </TimelineContent>
          </TimelineItem>
        )}

        {/* Автоотказ */}
        {candidate.autoRejectedAt && (
          <TimelineItem>
            <TimelineOppositeContent
              sx={{ maxWidth: '120px', px: 1 }}
              color="text.secondary"
              variant="caption"
            >
              {formatDateToLocal(candidate.autoRejectedAt)}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="error">
                <IconX size={16} />
              </TimelineDot>
            </TimelineSeparator>
            <TimelineContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  icon={<IconRobot size={14} />}
                  label={<Trans>Автоотказ</Trans>}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                <Trans>Автоматически отклонён из-за непрохождения интервью</Trans>
              </Typography>
            </TimelineContent>
          </TimelineItem>
        )}
      </Timeline>
    </Box>
  );
}

/**
 * Простая иконка для быстрой индикации авто-действий
 */
export function AutoActionBadge({ candidate }: { candidate: CandidateAutoActions }) {
  if (!candidate.autoInvited && !candidate.reminderSentAt && !candidate.autoRejectedAt) {
    return null;
  }

  return (
    <Tooltip title={<Trans>Автоматические действия выполнены</Trans>}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <IconRobot size={14} />
      </Box>
    </Tooltip>
  );
}

