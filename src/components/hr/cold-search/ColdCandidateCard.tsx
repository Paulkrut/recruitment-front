'use client';
import React from 'react';
import { Box, Card, CardActionArea, CardContent, Typography, Chip, Tooltip, LinearProgress } from '@mui/material';
import ScoreBadge from './ScoreBadge';
import { ColdCandidate } from './types';

interface Props {
  candidate: ColdCandidate;
  onClick: () => void;
}

function FreshnessChip({ days }: { days: number | null }) {
  if (days === null) return null;
  const color = days <= 7 ? 'success' : days <= 30 ? 'warning' : 'error';
  const label = days === 0 ? 'сегодня' : days === 1 ? 'вчера' : `${days}д назад`;
  return (
    <Tooltip title="Резюме обновлено">
      <Chip size="small" label={label} color={color} variant="outlined" />
    </Tooltip>
  );
}

export default function ColdCandidateCard({ candidate, onClick }: Props) {
  const isFound     = candidate.status === 'found';
  const isPrescored = candidate.status === 'prescored';
  const isScored    = candidate.status === 'scored';

  // Показываем full score если есть, иначе pre_score
  const displayScore = candidate.score ?? candidate.pre_score;

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1.5,
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 3 },
        opacity: isFound ? 0.7 : 1,
      }}
    >
      {isPrescored && (
        <LinearProgress variant="indeterminate" sx={{ height: 2 }} />
      )}
      <CardActionArea onClick={onClick}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', p: 2, '&:last-child': { pb: 2 } }}>

          {/* Score badge */}
          <Box sx={{ pt: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 48 }}>
            <ScoreBadge score={isFound ? null : displayScore} />
            {isPrescored && (
              <Typography variant="caption" color="text.secondary" textAlign="center" mt={0.5} lineHeight={1.2}>
                детальная<br />оценка...
              </Typography>
            )}
            {isFound && (
              <Typography variant="caption" color="text.secondary" textAlign="center" mt={0.5}>
                поиск...
              </Typography>
            )}
          </Box>

          {/* Main info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

            {/* Name + badges */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 0.25 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {candidate.display_name}
              </Typography>
              {candidate.age && (
                <Typography variant="caption" color="text.secondary">{candidate.age} лет</Typography>
              )}
              {candidate.access_restricted && (
                <Chip size="small" label="огр. доступ" color="warning" />
              )}
            </Box>

            {/* Desired position */}
            {candidate.title && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }} noWrap>
                {candidate.title}
              </Typography>
            )}

            {/* Chips row */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.75 }}>
              {candidate.city && (
                <Chip size="small" label={candidate.city} variant="outlined" />
              )}
              {candidate.experience_years !== null && (
                <Chip
                  size="small"
                  label={`${candidate.experience_years} л. опыта`}
                  variant="outlined"
                />
              )}
              {candidate.salary_amount ? (
                <Chip
                  size="small"
                  label={`${candidate.salary_amount.toLocaleString()} ${candidate.salary_currency ?? 'RUB'}`}
                  variant="outlined"
                />
              ) : null}
              <FreshnessChip days={candidate.freshness_days} />
            </Box>

            {/* Skills — топ 5 */}
            {candidate.skills.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4, mb: 0.75 }}>
                {candidate.skills.slice(0, 6).map((s) => (
                  <Chip key={s} size="small" label={s} sx={{ fontSize: 11, height: 20 }} />
                ))}
                {candidate.skills.length > 6 && (
                  <Chip size="small" label={`+${candidate.skills.length - 6}`} sx={{ fontSize: 11, height: 20 }} variant="outlined" />
                )}
              </Box>
            )}

            {/* AI оценка — тезисы */}
            {isScored && candidate.score_why.length > 0 && (
              <Box sx={{ mt: 0.5 }}>
                {candidate.score_why.slice(0, 2).map((w, i) => (
                  <Typography key={i} variant="caption" color="success.dark" display="block" lineHeight={1.5}>
                    ✓ {w}
                  </Typography>
                ))}
                {candidate.score_risks.length > 0 && (
                  <Typography variant="caption" color="warning.dark" display="block" lineHeight={1.5}>
                    ⚠ {candidate.score_risks[0]}
                  </Typography>
                )}
              </Box>
            )}

            {/* Pre-score комментарий (нет full-score) */}
            {!isScored && candidate.pre_score_comment && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                {candidate.pre_score_comment}
              </Typography>
            )}

            {/* Источник поиска (debug) */}
            {candidate.source_query?.text && (
              <Tooltip
                title={
                  <Box sx={{ maxWidth: 320, fontSize: 12 }}>
                    <Box sx={{ fontWeight: 700, mb: 0.5 }}>Запрос #{(candidate.source_query.query_index ?? 0) + 1} к HH</Box>
                    <Box sx={{ fontFamily: 'monospace', mb: 0.5, wordBreak: 'break-word' }}>{candidate.source_query.text}</Box>
                    {candidate.source_query.tier != null && <Box>тир: <b>{candidate.source_query.tier}</b></Box>}
                    {candidate.source_query.domain_level > 0 && <Box>групп домена: <b>{candidate.source_query.domain_level}</b></Box>}
                    {candidate.source_query.strategy && <Box>стратегия: <b>{candidate.source_query.strategy}</b></Box>}
                    {candidate.source_query.search_field && <Box>поле: <b>{candidate.source_query.search_field}</b></Box>}
                  </Box>
                }
              >
                <Typography
                  variant="caption"
                  color="text.disabled"
                  display="block"
                  sx={{ mt: 0.5, cursor: 'help', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}
                >
                  🔍 #{(candidate.source_query.query_index ?? 0) + 1}: {candidate.source_query.text}
                </Typography>
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
