'use client';
import React, { useState } from 'react';
import {
  Box, Typography, Collapse, IconButton, Chip, Divider,
  Table, TableBody, TableCell, TableRow, Tooltip,
} from '@mui/material';
import {
  IconChevronDown, IconChevronUp, IconSearch,
  IconFilter, IconBrain, IconStar, IconInfoCircle,
} from '@tabler/icons-react';
import { ColdSearchFiltersLog, ColdSearchJob, ColdSearchQueryLog } from './types';

interface Props {
  job: ColdSearchJob;
}

const strategyLabel: Record<string, string> = {
  // tier-1 (идеальный: must-have + домен)
  ideal_skills:       'навыки: must-have + домен',
  ideal_title:        'заголовок: must-have + домен',
  ideal_experience:   'опыт: must-have + домен',
  ideal_broad:        'все поля: must-have + домен',
  // tier-2 (строгий: только must-have)
  must_have_skills:      'навыки: must-have',
  must_have_title:       'заголовок: must-have',
  must_have_experience:  'опыт: must-have',
  must_have_broad:       'все поля: must-have',
  // tier-3 (косвенные синонимы)
  relaxed_skills:     'навыки: синонимы',
  relaxed_experience: 'опыт: синонимы',
  relaxed_synonyms:   'все поля: синонимы + роль',
  relaxed_broad:      'все поля: синонимы',
  // tier-4 (fallback)
  fallback_role:      'заголовок: только роль',
  fallback_domain:    'все поля: роль + домен',
  fallback_broad:     'все поля: роль + контекст',
  // legacy
  title:      'заголовок',
  skills:     'навыки',
  experience: 'опыт',
  broad:      'широкий',
  synonym:    'синоним',
  fallback:   'запасной',
  unknown:    '',
};

const tierLabel: Record<number, string> = {
  1: 'идеальный (must-have + домен)',
  2: 'строгий (must-have без домена)',
  3: 'синонимы must-have',
  4: 'запасной (без must-have)',
};

const tierColor: Record<number, string> = {
  1: '#1976d2',
  2: '#7b1fa2',
  3: '#e65100',
  4: '#757575',
};

const searchFieldLabel: Record<string, string> = {
  name:       'в должности',
  skills:     'в навыках',
  experience: 'в опыте',
};

export default function JobFunnelView({ job }: Props) {
  const [open, setOpen] = useState(false);

  const p          = job.progress;
  const log        = job.queries_log ?? [];
  const filtersLog = job.filters_log ?? [];

  const totalHhFound    = log.reduce((s, q) => s + q.hh_found, 0);
  const totalAdded      = log.reduce((s, q) => s + q.new_added, 0);
  const prescored       = p.prescored ?? 0;
  const skippedAfterPre = (p.skipped ?? 0) - Math.max(0, (p.total ?? 0) - prescored);
  const sentToFull      = Math.max(0, (p.total ?? 0) - Math.max(0, (p.skipped ?? 0) - (p.total ?? 0 - prescored)));
  const scored          = p.scored ?? 0;
  const found           = p.found ?? p.total ?? 0;

  // Расчёт топ-N отобранных для full-score
  const topN = Math.min(scored + (p.total ?? 0) - (p.skipped ?? 0), 20);

  return (
    <Box sx={{ mt: 1.5, mb: 1 }}>
      <Box
        sx={{
          display: 'flex', alignItems: 'center', cursor: 'pointer',
          color: 'text.secondary', userSelect: 'none',
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <IconButton size="small" sx={{ mr: 0.5 }}>
          {open ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </IconButton>
        <Typography variant="caption">Как шёл поиск</Typography>
      </Box>

      <Collapse in={open}>
        <Box sx={{ mt: 1.5, pl: 1, borderLeft: '2px solid', borderColor: 'divider' }}>

          {/* Фильтры HH */}
          {filtersLog.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              {filtersLog.map((fl, i) => (
                <FiltersBlock key={i} fl={fl} />
              ))}
            </Box>
          )}

          {/* Шаг 1: Поиск в HH */}
          <FunnelStep
            icon={<IconSearch size={16} />}
            color="#1976d2"
            title="Поиск в HH.ru"
            count={found}
            unit="кандидатов найдено"
            detail={log.length > 0 ? `${log.length} запросов, ${totalHhFound} резюме получено от HH` : undefined}
          >
            <TieredQueryLog log={log} />
            {job.params_expanded && (
              <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                ⚠ Параметры расширены — строгие фильтры сняты из-за нехватки кандидатов
              </Typography>
            )}
          </FunnelStep>

          <FunnelArrow from={found} />

          {/* Шаг 2: Прескоринг */}
          <FunnelStep
            icon={<IconBrain size={16} />}
            color="#7b1fa2"
            title="Предварительный отбор (AI)"
            count={p.prescored ?? 0}
            unit="прескорено"
            detail="Оценка по публичным данным резюме, без открытия — квота не тратится"
          >
            <Typography variant="caption" color="text.secondary">
              Из {found} кандидатов оценено {p.prescored ?? 0},
              пропущено {p.skipped ?? 0} · в топ-20 отобраны лучшие для детального скоринга
            </Typography>
          </FunnelStep>

          <FunnelArrow from={Math.min(p.prescored ?? 0, 20)} />

          {/* Шаг 3: Полный скоринг */}
          <FunnelStep
            icon={<IconFilter size={16} />}
            color="#e65100"
            title="Детальный скоринг (с открытием резюме)"
            count={scored}
            unit="полностью оценено"
            detail="Открывается полное резюме через HH — тратится квота на просмотр"
          >
            <Typography variant="caption" color="text.secondary">
              Взято топ-{Math.min(p.prescored ?? 0, 20)} из прескоринга · открыто {scored} резюме
            </Typography>
          </FunnelStep>

          {scored > 0 && (
            <>
              <FunnelArrow from={scored} />
              <FunnelStep
                icon={<IconStar size={16} />}
                color="#2e7d32"
                title="Результат"
                count={scored}
                unit="кандидатов с оценкой"
                detail="Отсортированы по AI-оценке (0–100)"
              />
            </>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

const filterLabels: Record<string, string> = {
  experience:        'Опыт',
  schedule:          'График',
  salary:            'Зарплата от',
  period:            'Период резюме (дн)',
  age_from:          'Возраст от',
  age_to:            'Возраст до',
  area:              'Регион (ID)',
  job_search_status: 'Статус поиска',
};

const experienceLabels: Record<string, string> = {
  noExperience:  'без опыта',
  between1And3:  '1–3 года',
  between3And6:  '3–6 лет',
  moreThan6:     '6+ лет',
};

function formatFilterValue(key: string, value: unknown): string {
  if (key === 'experience') return experienceLabels[value as string] ?? String(value);
  if (key === 'salary') return `${Number(value).toLocaleString('ru')} ₽`;
  if (key === 'period') return `${value} дней`;
  if (key === 'job_search_status') return (value as string[]).join(', ');
  if (key === 'area') return (value as number[]).join(', ');
  return String(value);
}

function TieredQueryLog({ log }: { log: ColdSearchQueryLog[] }) {
  // Группируем по тирам; поддерживаем старые записи без tier (tier=1)
  const groups: Record<number, ColdSearchQueryLog[]> = {};
  for (const q of log) {
    const t = q.tier ?? 1;
    if (!groups[t]) groups[t] = [];
    groups[t].push(q);
  }
  const tiers = Object.keys(groups).map(Number).sort();
  const usedTiers = tiers.filter(t => (groups[t] ?? []).some(q => q.new_added > 0));

  return (
    <Box>
      {tiers.map((tier) => {
        const queries  = groups[tier] ?? [];
        const wasUsed  = queries.some(q => q.new_added > 0);
        const color    = tierColor[tier] ?? '#757575';
        const label    = tierLabel[tier] ?? `tier ${tier}`;
        return (
          <Box key={tier} sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              <Chip
                label={`Tier ${tier}: ${label}`}
                size="small"
                sx={{ height: 18, fontSize: '0.62rem', bgcolor: color, color: '#fff', fontWeight: 700 }}
              />
              {!wasUsed && (
                <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                  не выполнялся (предыдущий tier дал достаточно кандидатов)
                </Typography>
              )}
              {wasUsed && usedTiers.length > 1 && tier > Math.min(...usedTiers) && (
                <Typography variant="caption" color="warning.main" sx={{ fontStyle: 'italic' }}>
                  ⚠ tier-{tier} запущен — строгих запросов не хватило
                </Typography>
              )}
            </Box>
            {wasUsed && queries.map((q, i) => <QueryLogRow key={i} q={q} />)}
          </Box>
        );
      })}
    </Box>
  );
}

function QueryLogRow({ q }: { q: ColdSearchQueryLog }) {
  const [open, setOpen] = useState(false);
  const f = q.filters ?? {};

  const filterChips: string[] = [];
  if (f.experience) filterChips.push(`опыт: ${experienceLabels[f.experience as string] ?? f.experience}`);
  if (f.salary)     filterChips.push(`зп от ${Number(f.salary).toLocaleString('ru')} ₽`);
  if (f.period)     filterChips.push(`период: ${f.period} дн`);
  if (f.age_from)   filterChips.push(`возраст от ${f.age_from}`);
  if (f.age_to)     filterChips.push(`до ${f.age_to}`);
  if (f.schedule)   filterChips.push(`график: ${f.schedule}`);

  const areaLabels = f.area_labels as string[] | undefined;
  const areaIds    = f.area as number[] | undefined;
  if (areaLabels?.length)                                        filterChips.push(`город: ${areaLabels.join(', ')}`);
  else if (areaIds?.length && !(areaIds.length === 1 && areaIds[0] === 113)) filterChips.push(`area: ${areaIds.join(', ')}`);

  const statusArr = f.job_search_status as string[] | undefined;
  if (statusArr?.length) filterChips.push(`статус: ${statusArr.join(', ')}`);

  const roles = f.professional_role as number[] | undefined;
  if (roles?.length) filterChips.push(`роль: ${roles.join(', ')}`);

  return (
    <Box sx={{ mb: 0.75, pl: 0.5, borderLeft: '2px solid', borderColor: q.expanded ? 'warning.main' : 'primary.light' }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', flexWrap: 'wrap' }}
        onClick={() => setOpen(v => !v)}
      >
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 70 }}>
          {strategyLabel[q.strategy] || q.strategy}
        </Typography>
        {q.search_field && (
          <Chip label={searchFieldLabel[q.search_field] ?? q.search_field} size="small" variant="outlined"
            sx={{ height: 14, fontSize: '0.6rem', borderColor: 'primary.light', color: 'primary.main' }} />
        )}
        {q.domain_level > 0 && (
          <Chip
            label={`домен ×${q.domain_level}`}
            size="small" variant="outlined"
            sx={{ height: 14, fontSize: '0.6rem', borderColor: '#7b1fa2', color: '#7b1fa2' }}
          />
        )}
        {q.expanded && <Chip label="расширен" size="small" color="warning" sx={{ height: 14, fontSize: '0.6rem' }} />}
        {!q.expanded && q.new_added === 0 && (
          <Chip label="0 новых" size="small" variant="outlined" sx={{ height: 14, fontSize: '0.6rem', color: 'text.disabled', borderColor: 'divider' }} />
        )}
        <Tooltip title={q.text} placement="top">
          <Typography variant="caption" sx={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            «{q.text}»
          </Typography>
        </Tooltip>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', whiteSpace: 'nowrap' }}>
          {q.hh_found} из HH → +{q.new_added} новых
        </Typography>
        <IconButton size="small" sx={{ p: 0 }}>
          {open ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
        </IconButton>
      </Box>
      <Collapse in={open}>
        <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Chip label={`text: «${q.text}»`} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.62rem', maxWidth: 300 }} />
          {filterChips.map((chip, i) => (
            <Chip key={i} label={chip} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.62rem' }} />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

function FiltersBlock({ fl }: { fl: ColdSearchFiltersLog }) {
  const activeKeys = Object.keys(fl.active_filters);
  const removedKeys = Object.keys(fl.removed_filters);

  return (
    <Box sx={{ mb: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
        {fl.expanded && (
          <Chip label="расширенный поиск" size="small" color="warning" sx={{ height: 18, fontSize: '0.65rem' }} />
        )}
        {activeKeys.map((key) => (
          <Chip
            key={key}
            label={`${filterLabels[key] ?? key}: ${formatFilterValue(key, fl.active_filters[key])}`}
            size="small"
            variant="outlined"
            sx={{ height: 18, fontSize: '0.65rem' }}
          />
        ))}
        {removedKeys.map((key) => (
          <Chip
            key={key}
            label={`${filterLabels[key] ?? key} снят`}
            size="small"
            color="warning"
            variant="outlined"
            sx={{ height: 18, fontSize: '0.65rem', textDecoration: 'line-through' }}
          />
        ))}
        {activeKeys.length === 0 && !fl.expanded && (
          <Typography variant="caption" color="text.secondary">без фильтров</Typography>
        )}
      </Box>
    </Box>
  );
}

function FunnelStep({
  icon, color, title, count, unit, detail, children,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  count: number;
  unit: string;
  detail?: string;
  children?: React.ReactNode;
}) {
  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ color, display: 'flex', alignItems: 'center' }}>{icon}</Box>
        <Typography variant="body2" fontWeight={600}>{title}</Typography>
        <Chip
          label={`${count} ${unit}`}
          size="small"
          sx={{ bgcolor: color, color: '#fff', height: 20, fontSize: '0.7rem' }}
        />
        {detail && (
          <Tooltip title={detail} placement="top">
            <Box sx={{ color: 'text.secondary', display: 'flex', cursor: 'help' }}>
              <IconInfoCircle size={14} />
            </Box>
          </Tooltip>
        )}
      </Box>
      {children && (
        <Box sx={{ ml: 3, mt: 0.5 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

function FunnelArrow({ from }: { from: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1.5, mb: 0.5, color: 'text.disabled' }}>
      <Box sx={{ width: 1, height: 16, borderLeft: '1px dashed', borderColor: 'divider', ml: 0.5 }} />
      <Typography variant="caption" sx={{ ml: 1 }}>↓ {from}</Typography>
    </Box>
  );
}
