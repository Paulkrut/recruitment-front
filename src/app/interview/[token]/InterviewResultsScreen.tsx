"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  CircularProgress,
  TextField,
  Divider,
  Chip,
  Rating,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { Trans, msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import ForgetMeAuto from "@/app/components/ForgetMeAuto";

interface InterviewResultsScreenProps {
  feedbackData: any;
  token: string;
  isMobile: boolean;
  stepperComp?: React.ReactNode;
  onSendEmailClick?: (email: string) => Promise<void>;
}

export default function InterviewResultsScreen({
  feedbackData,
  token,
  isMobile,
  stepperComp,
  onSendEmailClick,
}: InterviewResultsScreenProps) {
  const { _ } = useLingui();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const handleSendEmail = async () => {
    if (!onSendEmailClick || !feedbackEmail.trim()) return;
    
    setSendingFeedback(true);
    try {
      await onSendEmailClick(feedbackEmail);
      setShowEmailForm(false);
      setFeedbackEmail("");
    } catch (error) {
      console.error("Error sending email:", error);
    } finally {
      setSendingFeedback(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      p: isMobile ? 2 : 4,
      maxWidth: '1200px',
      mx: 'auto',
      width: '100%',
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      {stepperComp}

      <Box sx={{ flex: 1, mt: 3, display: 'flex', flexDirection: 'column' }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom align="center" color="primary">
              <Trans>🎯 Ваши результаты интервью</Trans>
            </Typography>

            {/* Дисклеймер наверху */}
            <Box sx={{ bgcolor: 'warning.light', p: 2, borderRadius: 1, mb: 3 }}>
              <Typography variant="body2" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                ⚠️ {feedbackData.feedback.disclaimer}
              </Typography>
            </Box>

            {/* Компонент для автоматического удаления данных */}
            <ForgetMeAuto candidateToken={token} />

            {feedbackData.feedback.average_score > 0 && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                  <Trans>Общая оценка</Trans>: {feedbackData.feedback.average_score}/10
                </Typography>
                <Rating value={feedbackData.feedback.average_score / 2} readOnly size="large" />
              </Box>
            )}

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              <Trans>📝 Краткий итог</Trans>
            </Typography>
            <Typography paragraph>
              {feedbackData.feedback.summary}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              <Trans>💡 Развивающая обратная связь</Trans>
            </Typography>
            <Typography paragraph>
              {feedbackData.feedback.feedback}
            </Typography>

            {feedbackData.feedback.scores_table && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  <Trans>📊 Таблица оценок</Trans>
                </Typography>
                {Array.isArray(feedbackData.feedback.scores_table) && feedbackData.feedback.scores_table.length > 0 ? (
                  <TableContainer component={Paper} sx={{ bgcolor: 'grey.50' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong><Trans>Вопрос</Trans></strong></TableCell>
                          <TableCell align="center"><strong><Trans>Оценка</Trans></strong></TableCell>
                          <TableCell><strong><Trans>Комментарий</Trans></strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {feedbackData.feedback.scores_table.map((row: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{row.question}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${row.score}/10`}
                                color={row.score >= 8 ? 'success' : row.score >= 6 ? 'warning' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{row.comment}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                    <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {feedbackData.feedback.scores_table}
                    </Typography>
                  </Box>
                )}
              </>
            )}

            {feedbackData.feedback.strengths && feedbackData.feedback.strengths.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom color="success.main">
                  <Trans>✅ Ваши сильные стороны</Trans>
                </Typography>
                <Stack spacing={1}>
                  {feedbackData.feedback.strengths.map((strength: string, index: number) => (
                    <Chip
                      key={index}
                      label={strength}
                      color="success"
                      variant="filled"
                      sx={{
                        backgroundColor: '#2e7d32',
                        color: 'white',
                        fontWeight: 500,
                        height: 'auto',
                        minHeight: '32px',
                        '& .MuiChip-label': {
                          color: 'white',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          padding: '8px 12px',
                          lineHeight: 1.4
                        }
                      }}
                    />
                  ))}
                </Stack>
              </>
            )}

            {feedbackData.feedback.weaknesses && feedbackData.feedback.weaknesses.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom color="warning.main">
                  <Trans>🎯 Области для развития</Trans>
                </Typography>
                <Stack spacing={1}>
                  {feedbackData.feedback.weaknesses.map((weakness: string, index: number) => (
                    <Chip
                      key={index}
                      label={weakness}
                      color="warning"
                      variant="filled"
                      sx={{
                        backgroundColor: '#f57c00',
                        color: 'white',
                        fontWeight: 500,
                        height: 'auto',
                        minHeight: '32px',
                        '& .MuiChip-label': {
                          color: 'white',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          padding: '8px 12px',
                          lineHeight: 1.4
                        }
                      }}
                    />
                  ))}
                </Stack>
              </>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              <Trans>💡 Рекомендации для развития</Trans>
            </Typography>
            <Typography paragraph>
              {feedbackData.feedback.recommendations || feedbackData.feedback.next_level}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="caption" color="text.secondary" align="center" display="block">
              {feedbackData.feedback.disclaimer}
            </Typography>
          </CardContent>
        </Card>

        {/* Форма отправки на email */}
        {onSendEmailClick && (
          showEmailForm ? (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Trans>📧 Отправить результаты на email</Trans>
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  label={_(msg`Ваш email`)}
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={handleSendEmail}
                    disabled={sendingFeedback || !feedbackEmail.trim()}
                  >
                    {sendingFeedback ? <CircularProgress size={20} /> : _(msg`Отправить`)}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setShowEmailForm(false)}
                  >
                    <Trans>Отмена</Trans>
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setShowEmailForm(true)}
                  sx={{ mb: 2 }}
                >
                  <Trans>📧 Отправить результаты на email</Trans>
                </Button>
              </CardContent>
            </Card>
          )
        )}
      </Box>
    </Box>
  );
}

