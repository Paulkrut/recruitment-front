import { Card, CardHeader, CardContent, Chip, Typography, Grid, Box } from '@mui/material';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


export interface Metrics { [key:string]:number; }

interface Props {
  summary:string;
  strengths:string[];
  weaknesses:string[];
  metrics:Metrics;
}

export default function EvaluationResult({ summary,strengths,weaknesses,metrics }: Props){
  const { _ } = useLingui();

  const getColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getIcon = (metric: string) => {
    const metricLower = metric.toLowerCase();
    if (metricLower.includes('communication') || metricLower.includes(_(msg`общение`))) return '💬';
    if (metricLower.includes('problem') || metricLower.includes(_(msg`решение`))) return '🧩';
    if (metricLower.includes('leadership') || metricLower.includes(_(msg`лидерство`))) return '👑';
    if (metricLower.includes('technical') || metricLower.includes(_(msg`технический`))) return '⚙️';
    if (metricLower.includes('teamwork') || metricLower.includes(_(msg`команда`))) return '🤝';
    if (metricLower.includes('motivation') || metricLower.includes(_(msg`мотивация`))) return '🚀';
    if (metricLower.includes(_(msg`стресс`)) || metricLower.includes('stress')) return '🛡️';
    return '📊';
  };

  const getLabel = (metric: string) => {
    const labels: { [key: string]: string } = {
      'COMMUNICATION': _(msg`Коммуникация`),
      'PROBLEM_SOLVING': _(msg`Решение проблем`),
      'LEADERSHIP': _(msg`Лидерство`),
      'TECHNICAL': _(msg`Технические навыки`),
      'TEAMWORK': _(msg`Работа в команде`),
      'MOTIVATION': _(msg`Мотивация`),
      'Стрессоустойчивость': _(msg`Стрессоустойчивость`)
    };
    return labels[metric] || metric;
  };

  return (
    <Card sx={{mt:3}}>
      <CardHeader title={_(msg`AI-оценка`)}/>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom><Trans>Резюме</Trans></Typography>
        <Typography paragraph>{summary}</Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom><Trans>Сильные стороны</Trans></Typography>
            {strengths?.map(s=>(<Chip key={s} label={s} sx={{m:0.5}} color="success" />))}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom><Trans>Слабые стороны</Trans></Typography>
            {weaknesses?.map(w=>(<Chip key={w} label={w} sx={{m:0.5}} color="error" />))}
          </Grid>
        </Grid>
        
        <Typography variant="subtitle1" gutterBottom><Trans>Метрики оценки</Trans></Typography>
        <Grid container spacing={2}>
          {Object.entries(metrics||{}).map(([metric, value]) => {
            const score = typeof value === 'number' ? value : 0;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={metric}>
                <Card 
                  sx={{ 
                    p: 2, 
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 1,
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                      {getIcon(metric)}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ flexGrow: 1 }}>
                      {getLabel(metric)}
                    </Typography>
                    <Chip 
                      label={`${score}/100`} 
                      size="small" 
                      color={getColor(score) as any}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  
                  <Box sx={{ width: '100%', mb: 1 }}>
                    <Box 
                      sx={{ 
                        width: `${score}%`, 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: score >= 80 ? 'success.main' : score >= 60 ? 'warning.main' : 'error.main',
                        transition: 'width 0.3s ease'
                      }} 
                    />
                  </Box>
                  
                  <Typography variant="caption" color="textSecondary">
                    {score >= 80 ? _(msg`Отлично`) : score >= 60 ? _(msg`Хорошо`) : score >= 40 ? _(msg`Средне`) : _(msg`Требует улучшения`)}
                  </Typography>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
} 