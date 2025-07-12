import { Card, CardHeader, CardContent, Chip, Typography, Grid } from '@mui/material';

export interface Metrics { [key:string]:number; }

interface Props {
  summary:string;
  strengths:string[];
  weaknesses:string[];
  metrics:Metrics;
}

export default function EvaluationResult({ summary,strengths,weaknesses,metrics }: Props){
  return (
    <Card sx={{mt:3}}>
      <CardHeader title="AI-оценка"/>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>Резюме</Typography>
        <Typography paragraph>{summary}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}><Typography variant="subtitle1">Сильные стороны</Typography>{strengths?.map(s=>(<Chip key={s} label={s} sx={{m:0.5}} color="success" />))}</Grid>
          <Grid item xs={12} md={6}><Typography variant="subtitle1">Слабые стороны</Typography>{weaknesses?.map(w=>(<Chip key={w} label={w} sx={{m:0.5}} color="error" />))}</Grid>
        </Grid>
        <Typography variant="subtitle1" sx={{mt:2}}>Метрики</Typography>
        {Object.entries(metrics||{}).map(([k,v])=>(<Chip key={k} label={`${k}: ${v}`} sx={{m:0.5}}/>))}
      </CardContent>
    </Card>
  );
} 