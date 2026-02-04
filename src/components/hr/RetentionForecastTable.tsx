'use client';

import { Box, Typography, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress } from '@mui/material';
import { Trans } from '@lingui/react/macro';
import { RetentionForecast } from '@/hooks/useCandidateEvaluation';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface RetentionForecastTableProps {
  forecast: RetentionForecast;
}

export default function RetentionForecastTable({ forecast }: RetentionForecastTableProps) {
  if (forecast?.insufficient_data) {
    return (
      <Alert severity="warning" icon={<WarningAmberIcon />}>
        <Typography variant="body2">
          {forecast.message || <Trans>Информации недостаточно для прогноза ухода</Trans>}
        </Typography>
      </Alert>
    );
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 50) return 'error';
    if (probability >= 30) return 'warning';
    return 'success';
  };

  const getTenureSeverity = (tenure: string): 'error' | 'warning' | 'success' | 'info' => {
    if (tenure.includes('2-4') || tenure.includes('месяца') || tenure.includes('months')) return 'error';
    if (tenure.includes('6-8')) return 'warning';
    if (tenure.includes('1+') || tenure.includes('год') || tenure.includes('year')) return 'success';
    return 'info';
  };

  return (
    <Box>
      {/* Итоговый прогноз */}
      <Alert 
        severity={getTenureSeverity(forecast.predicted_tenure)} 
        sx={{ mb: 3 }}
        icon={<CalendarTodayIcon />}
      >
        <Typography variant="h6" gutterBottom>
          <Trans>Прогноз удержания:</Trans> <strong>{forecast.predicted_tenure}</strong>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {forecast.reasoning}
        </Typography>
      </Alert>

      {/* Критические факторы риска */}
      {forecast.critical_risk_factors && forecast.critical_risk_factors.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <WarningAmberIcon color="error" />
            <Typography variant="h6" fontWeight={600}>
              <Trans>🔴 Критические факторы риска текучки</Trans>
            </Typography>
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell width="25%"><strong><Trans>Фактор риска</Trans></strong></TableCell>
                  <TableCell width="45%"><strong><Trans>Доказательство</Trans></strong></TableCell>
                  <TableCell width="30%"><strong><Trans>Влияние на удержание</Trans></strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forecast.critical_risk_factors.map((risk, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>
                      <Chip 
                        label={risk.factor} 
                        color="error" 
                        size="small" 
                        sx={{ height: 'auto', py: 0.5, '& .MuiChip-label': { whiteSpace: 'normal' } }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        {risk.evidence}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {risk.impact}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Вероятный сценарий ухода */}
      {forecast.retention_timeline && forecast.retention_timeline.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TrendingDownIcon color="warning" />
            <Typography variant="h6" fontWeight={600}>
              <Trans>📅 Вероятный сценарий ухода</Trans>
            </Typography>
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell width="15%"><strong><Trans>Период</Trans></strong></TableCell>
                  <TableCell width="30%"><strong><Trans>Ожидаемые события</Trans></strong></TableCell>
                  <TableCell width="15%"><strong><Trans>Вероятность ухода</Trans></strong></TableCell>
                  <TableCell width="40%"><strong><Trans>Триггер ухода</Trans></strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forecast.retention_timeline.map((item, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>
                      <Chip 
                        label={item.month} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.events}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={600} color={`${getProbabilityColor(item.probability)}.main`}>
                            {item.probability}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={item.probability} 
                          color={getProbabilityColor(item.probability)}
                          sx={{ height: 6, borderRadius: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        {item.trigger}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}

