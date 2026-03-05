import { msg } from '@lingui/macro';
import type { MessageDescriptor } from '@lingui/core';

export interface CandidateStatusItem {
  value: string;
  label: MessageDescriptor;
  icon: string;
}

/**
 * Единственный источник истины для стадий кандидата.
 * Используется везде: список, фильтры, выпадающее меню смены стадии.
 */
export const CANDIDATE_STATUS_CONFIG: CandidateStatusItem[] = [
  { value: 'new',       label: msg`Новый`,        icon: '📥' },
  { value: 'screening', label: msg`AI Скрининг`,   icon: '🤖' },
  { value: 'contacted', label: msg`На связи`,       icon: '📞' },
  { value: 'testing',   label: msg`Тестирование`,   icon: '📝' },
  { value: 'finalist',  label: msg`Финалист`,       icon: '⭐' },
  { value: 'offer',     label: msg`Оффер`,          icon: '💼' },
  { value: 'hired',     label: msg`Нанят`,          icon: '✅' },
  { value: 'deferred',  label: msg`Отложен`,        icon: '⏸️' },
  { value: 'rejected',  label: msg`Отказ`,          icon: '❌' },
];

/** Лейблы с emoji — для BulkActionsToolbar (Select «Переместить в...») */
export const CANDIDATE_STATUS_LABELS = {
  'new':       msg`📥 Новый`,
  'screening': msg`🤖 AI Скрининг`,
  'contacted': msg`📞 На связи`,
  'testing':   msg`📝 Тестирование`,
  'finalist':  msg`⭐ Финалист`,
  'offer':     msg`💼 Оффер`,
  'hired':     msg`✅ Нанят`,
  'deferred':  msg`⏸️ Отложен`,
  'rejected':  msg`❌ Отказ`,
} as const;

export const CANDIDATE_STATUS_ORDER = [
  'new', 'screening', 'contacted', 'testing',
  'finalist', 'offer', 'hired', 'deferred', 'rejected',
] as const;

export type CandidateStatusValue = keyof typeof CANDIDATE_STATUS_LABELS;

/** Найти элемент конфига по значению */
export const getCandidateStatusItem = (value: string): CandidateStatusItem | undefined =>
  CANDIDATE_STATUS_CONFIG.find(s => s.value === value);
