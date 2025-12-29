import { msg } from '@lingui/macro';

/**
 * Лейблы статусов кандидатов
 * Используется в обеих панелях массовых действий
 */
export const CANDIDATE_STATUS_LABELS = {
  'new': msg`📥 Новые`,
  'screening': msg`🤖 AI Скрининг`,
  'contacted': msg`📞 На связи`,
  'testing': msg`📝 Тестирование`,
  'finalist': msg`⭐ Финалист`,
  'offer': msg`💼 Оффер`,
  'hired': msg`✅ Нанят`,
  'deferred': msg`⏸️ Отложен`,
  'rejected': msg`❌ Отказ`,
} as const;

/**
 * Порядок статусов для селекта
 */
export const CANDIDATE_STATUS_ORDER = [
  'new',
  'screening',
  'contacted',
  'testing',
  'finalist',
  'offer',
  'hired',
  'deferred',
  'rejected',
] as const;

export type CandidateStatus = keyof typeof CANDIDATE_STATUS_LABELS;

