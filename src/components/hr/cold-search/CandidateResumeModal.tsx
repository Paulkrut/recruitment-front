'use client';
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Chip, Button, Divider, Alert,
  IconButton, Tooltip,
} from '@mui/material';
import { IconX, IconExternalLink, IconCopy, IconCheck, IconBriefcase, IconSchool, IconLanguage, IconStar } from '@tabler/icons-react';
import ScoreBadge from './ScoreBadge';
import { ColdCandidate } from './types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface Props {
  candidate: ColdCandidate | null;
  onClose: () => void;
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1, mt: 0.5 }}>
      <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
      <Typography variant="subtitle2" fontWeight={700}>{children}</Typography>
    </Box>
  );
}

export default function CandidateResumeModal({ candidate, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!candidate) return null;

  const handleCopyDraft = () => {
    if (candidate.first_contact_draft) {
      navigator.clipboard.writeText(candidate.first_contact_draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const freshnessLabel = (() => {
    const d = candidate.freshness_days;
    if (d === null) return null;
    if (d === 0) return { label: 'сегодня', color: 'success' as const };
    if (d === 1) return { label: 'вчера', color: 'success' as const };
    if (d <= 7)  return { label: `${d}д назад`, color: 'success' as const };
    if (d <= 30) return { label: `${d}д назад`, color: 'warning' as const };
    return { label: `${d}д назад`, color: 'error' as const };
  })();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = candidate.resume_data as any;
  const hasFullResume = !!r;
  const experience: any[] = r?.experience ?? [];
  const education: any[] = r?.education?.primary ?? [];
  const languages: any[] = r?.language ?? [];
  const about: string = r?.skills ?? '';

  return (
    <Dialog open maxWidth="md" fullWidth onClose={onClose} scroll="paper">

      {/* Header */}
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <ScoreBadge score={candidate.score ?? candidate.pre_score} size="lg" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
            {candidate.display_name}
            {candidate.age ? <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>{candidate.age} лет</Typography> : null}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {candidate.title}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {candidate.city && <Chip size="small" label={candidate.city} />}
            {candidate.experience_years !== null && (
              <Chip size="small" label={`${candidate.experience_years} лет опыта`} />
            )}
            {candidate.salary_amount && (
              <Chip size="small" label={`${candidate.salary_amount.toLocaleString()} ${candidate.salary_currency ?? 'RUB'}`} />
            )}
            {freshnessLabel && (
              <Chip size="small" label={`Обновлено: ${freshnessLabel.label}`} color={freshnessLabel.color} />
            )}
            {candidate.access_restricted && (
              <Chip size="small" label="Ограниченный доступ" color="warning" />
            )}
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ mt: -0.5 }}>
          <IconX size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2.5 }}>

        {/* AI оценка */}
        {candidate.score !== null && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 3, mb: 1.5 }}>
              {/* Почему подходит */}
              {candidate.score_why.length > 0 && (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" fontWeight={700} color="success.dark" display="block" mb={0.5}>
                    ПОЧЕМУ ПОДХОДИТ
                  </Typography>
                  {candidate.score_why.map((item, i) => (
                    <Typography key={i} variant="body2" color="success.dark" display="block" lineHeight={1.6}>
                      ✓ {item}
                    </Typography>
                  ))}
                </Box>
              )}
              {/* Риски */}
              {candidate.score_risks.length > 0 && (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" fontWeight={700} color="warning.dark" display="block" mb={0.5}>
                    РИСКИ / ПРОВЕРИТЬ
                  </Typography>
                  {candidate.score_risks.map((item, i) => (
                    <Typography key={i} variant="body2" color="warning.dark" display="block" lineHeight={1.6}>
                      ⚠ {item}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
            {candidate.score_comment && (
              <Alert severity="info" sx={{ py: 0.5, fontSize: 13 }}>
                {candidate.score_comment}
              </Alert>
            )}
          </Box>
        )}

        {/* Pre-score если нет full score */}
        {candidate.score === null && candidate.pre_score !== null && (
          <Alert severity={candidate.status === 'prescored' ? 'warning' : 'info'} sx={{ mb: 2, py: 0.5 }}>
            {candidate.status === 'prescored'
              ? `Pre-score: ${candidate.pre_score}/100 — детальная оценка в процессе...`
              : `Pre-score: ${candidate.pre_score}/100 — ${candidate.pre_score_comment}`
            }
          </Alert>
        )}

        {/* ── ПУБЛИЧНЫЕ ДАННЫЕ — всегда доступны ── */}
        <Divider sx={{ my: 1.5 }} />

        {/* Суммарный опыт + зарплата */}
        <Box sx={{ display: 'flex', gap: 3, mb: 1.5, flexWrap: 'wrap' }}>
          {candidate.experience_years !== null && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">Опыт</Typography>
              <Typography variant="body2" fontWeight={600}>{candidate.experience_years} лет</Typography>
            </Box>
          )}
          {candidate.salary_amount && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">Зарплата</Typography>
              <Typography variant="body2" fontWeight={600}>
                {candidate.salary_amount.toLocaleString()} {candidate.salary_currency ?? 'RUB'}
              </Typography>
            </Box>
          )}
          {candidate.city && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">Город</Typography>
              <Typography variant="body2" fontWeight={600}>{candidate.city}</Typography>
            </Box>
          )}
          {candidate.resume_updated_at && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">Резюме обновлено</Typography>
              <Typography variant="body2" fontWeight={600}>{candidate.resume_updated_at}</Typography>
            </Box>
          )}
        </Box>

        {/* Навыки из публичных данных */}
        {candidate.skills.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <SectionTitle icon={<IconStar size={16} />}>Навыки</SectionTitle>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {candidate.skills.map((s) => (
                <Chip key={s} size="small" label={s} variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        {/* ── ПОЛНОЕ РЕЗЮМЕ — только после full-score ── */}
        {hasFullResume ? (
          <>
            {/* О себе */}
            {about && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <SectionTitle icon={<IconBriefcase size={16} />}>О себе</SectionTitle>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {about}
                </Typography>
              </>
            )}

            {/* Опыт работы */}
            {experience.length > 0 && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <SectionTitle icon={<IconBriefcase size={16} />}>Опыт работы</SectionTitle>
                {experience.map((exp, i) => (
                  <Box key={i} sx={{ mb: 2, pl: 1.5, borderLeft: '3px solid #e0e0e0' }}>
                    <Typography variant="body2" fontWeight={600}>{exp.position}</Typography>
                    <Typography variant="body2" color="primary.main">
                      {exp.company}{exp.area?.name ? `, ${exp.area.name}` : ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      {formatHhDate(exp.start)} — {exp.end ? formatHhDate(exp.end) : 'по н.в.'}
                      {exp.start && <> &nbsp;·&nbsp; {calcDuration(exp.start, exp.end)}</>}
                    </Typography>
                    {exp.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        {stripHtml(exp.description).slice(0, 500)}
                        {stripHtml(exp.description).length > 500 ? '...' : ''}
                      </Typography>
                    )}
                  </Box>
                ))}
              </>
            )}

            {/* Образование */}
            {education.length > 0 && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <SectionTitle icon={<IconSchool size={16} />}>Образование</SectionTitle>
                {education.map((edu, i) => (
                  <Box key={i} sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{edu.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {edu.organization}{edu.year ? `, ${edu.year}` : ''}
                      {edu.result ? ` — ${edu.result}` : ''}
                    </Typography>
                  </Box>
                ))}
              </>
            )}

            {/* Языки */}
            {languages.length > 0 && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <SectionTitle icon={<IconLanguage size={16} />}>Языки</SectionTitle>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {languages.map((l, i) => (
                    <Chip key={i} size="small" label={`${l.name?.name ?? l.name} — ${l.level?.name ?? l.level}`} variant="outlined" />
                  ))}
                </Box>
              </>
            )}
          </>
        ) : (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Alert severity={candidate.status === 'prescored' ? 'warning' : 'info'} sx={{ py: 0.5 }}>
              {candidate.status === 'prescored'
                ? 'Полное резюме загружается — кандидат в очереди на детальную оценку.'
                : 'Полное резюме не загружено. Откройте профиль на HH.ru для просмотра.'}
            </Alert>
          </>
        )}

        {/* Черновик первого касания */}
        {candidate.first_contact_draft && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <Typography variant="subtitle2" fontWeight={700}>Черновик первого сообщения</Typography>
                <Tooltip title={copied ? 'Скопировано!' : 'Копировать'}>
                  <IconButton size="small" onClick={handleCopyDraft}>
                    {copied ? <IconCheck size={16} color="green" /> : <IconCopy size={16} />}
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ p: 1.5, background: '#f9f9f9', borderRadius: 1, border: '1px solid #e0e0e0', whiteSpace: 'pre-wrap' }}>
                <Typography variant="body2">{candidate.first_contact_draft}</Typography>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<IconExternalLink size={16} />}
          href={candidate.hh_resume_url}
          target="_blank"
          rel="noopener noreferrer"
          component="a"
        >
          Открыть на HH.ru
        </Button>
        <Button variant="outlined" onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatHhDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${months[parseInt(month, 10) - 1] ?? ''} ${year}`;
}

function calcDuration(start: string, end: string | null): string {
  const startDate = new Date(start);
  const endDate   = end ? new Date(end) : new Date();
  const months    = (endDate.getFullYear() - startDate.getFullYear()) * 12
                  + (endDate.getMonth() - startDate.getMonth());
  const years = Math.floor(months / 12);
  const rem   = months % 12;
  const parts = [];
  if (years > 0)  parts.push(`${years} г.`);
  if (rem > 0)    parts.push(`${rem} мес.`);
  return parts.join(' ') || '< 1 мес.';
}
