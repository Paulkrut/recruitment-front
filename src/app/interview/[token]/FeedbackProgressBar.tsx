import { Box, LinearProgress, Typography } from "@mui/material";
import { Trans, msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";

interface FeedbackProgressBarProps {
  elapsedTime: number;
  estimatedTime: number;
}

export default function FeedbackProgressBar({ elapsedTime, estimatedTime }: FeedbackProgressBarProps) {
  const { _ } = useLingui();
  
  return (
    <Box sx={{ width: '100%', maxWidth: 400, mb: 3 }}>
      <LinearProgress
        variant="determinate"
        value={Math.min((elapsedTime / estimatedTime) * 100, 95)}
        sx={{ height: 8, borderRadius: 4 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <Trans>Прогресс</Trans>: {Math.min(Math.floor((elapsedTime / estimatedTime) * 100), 95)}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ~{Math.max(estimatedTime - elapsedTime, 5)}{' '}<Trans>сек осталось</Trans>
        </Typography>
      </Box>
      {/* Показываем дополнительную информацию о текущем этапе */}
      <Typography variant="caption" color="text.primary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
        {elapsedTime < 30 ? _(msg`Обрабатываем ваши ответы...`) : _(msg`Генерируем обратную связь...`)}
      </Typography>
    </Box>
  );
}

