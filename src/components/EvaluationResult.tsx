import { Card, CardHeader, CardContent, Chip, Typography, Grid } from '@mui/material';

export interface SkillMatch {
  skill: string;
  level: 'low' | 'medium' | 'high';
  proof: string;
}

interface Props {
  overallScore: number;
  skillMatches: SkillMatch[];
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

export default function EvaluationResult({ overallScore, skillMatches, strengths, weaknesses, summary }: Props) {
  return (
    <Card sx={{ mt: 3 }}>
      <CardHeader title={`AI-оценка: ${overallScore}/100`} />
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Резюме
        </Typography>
        <Typography paragraph>{summary}</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Сильные стороны</Typography>
            {strengths.map((s) => (
              <Chip key={s} label={s} sx={{ m: 0.5 }} color="success" />
            ))}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Слабые стороны</Typography>
            {weaknesses.map((w) => (
              <Chip key={w} label={w} sx={{ m: 0.5 }} color="error" />
            ))}
          </Grid>
        </Grid>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Навыки
        </Typography>
        {skillMatches.map((sm) => (
          <Chip
            key={sm.skill}
            label={`${sm.skill}: ${sm.level}`}
            color={sm.level === 'high' ? 'success' : sm.level === 'medium' ? 'warning' : 'default'}
            sx={{ m: 0.5 }}
          />
        ))}
      </CardContent>
    </Card>
  );
} 