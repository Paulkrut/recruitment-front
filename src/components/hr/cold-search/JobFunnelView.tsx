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
import { ColdSearchFiltersLog, ColdSearchJob } from './types';

interface Props {
  job: ColdSearchJob;
}

const strategyLabel: Record<string, string> = {
  title:    'по названию',
  synonym:  'по синониму',
  skills:   'по навыкам',
  fallback: 'запасной',
  unknown:  '',
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
            {log.length > 0 && (
              <Table size="small" sx={{ mt: 0.5 }}>
                <TableBody>
                  {log.map((q, i) => (
                    <TableRow key={i} sx={{ '& td': { py: 0.25, px: 0.5, border: 0, fontSize: '0.72rem' } }}>
                      <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                        {strategyLabel[q.strategy] || q.strategy}
                        {q.expanded && (
                          <Chip label="расширен" size="small" color="warning" sx={{ ml: 0.5, height: 14, fontSize: '0.6rem' }} />
                        )}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Tooltip title={q.text} placement="top">
                          <span>«{q.text}»</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {q.hh_found} резюме → +{q.new_added} новых
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
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
