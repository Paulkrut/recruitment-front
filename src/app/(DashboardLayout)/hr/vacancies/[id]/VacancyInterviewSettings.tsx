"use client";
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
  Paper,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { Trans, msg } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { apiFetch } from '@/utils/api';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';

interface Message {
  text: string;
  order: number;
}

interface Props {
  vacancyId: number;
}

export default function VacancyInterviewSettings({ vacancyId }: Props) {
  const { _ } = useLingui();
  const [messages, setMessages] = useState<Message[]>([]);
  const [descriptionExpandedByDefault, setDescriptionExpandedByDefault] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showExample, setShowExample] = useState(false);
  const [showDescriptionExample, setShowDescriptionExample] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

  useEffect(() => {
    loadMessages();
  }, [vacancyId]);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch(
        `${API_BASE}/api/admin/vacancies/${vacancyId}/initial-messages`
      );

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);
      setDescriptionExpandedByDefault(data.descriptionExpandedByDefault ?? true);
    } catch (err) {
      setError(_(msg`Ошибка загрузки сообщений`));
      console.error('Error loading initial messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveMessages = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiFetch(
        `${API_BASE}/api/admin/vacancies/${vacancyId}/initial-messages`,
        {
          method: 'PUT',
          body: JSON.stringify({ 
            messages,
            descriptionExpandedByDefault 
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save messages');
      }

      setSuccess(_(msg`Сообщения успешно сохранены!`));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(_(msg`Ошибка сохранения сообщений`));
      console.error('Error saving initial messages:', err);
    } finally {
      setSaving(false);
    }
  };

  const addMessage = () => {
    const newMessage: Message = {
      text: '',
      order: messages.length,
    };
    setMessages([...messages, newMessage]);
  };

  const deleteMessage = (index: number) => {
    const updated = messages.filter((_, i) => i !== index);
    // Пересчитываем order
    updated.forEach((msg, i) => {
      msg.order = i;
    });
    setMessages(updated);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;

    const updated = [...messages];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    
    // Обновляем order
    updated.forEach((msg, i) => {
      msg.order = i;
    });
    
    setMessages(updated);
  };

  const moveDown = (index: number) => {
    if (index === messages.length - 1) return;

    const updated = [...messages];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    
    // Обновляем order
    updated.forEach((msg, i) => {
      msg.order = i;
    });
    
    setMessages(updated);
  };

  const updateMessageText = (index: number, text: string) => {
    const updated = [...messages];
    updated[index].text = text;
    setMessages(updated);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              <Trans>Загрузка...</Trans>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Настройка отображения описания вакансии */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h5" fontWeight="600">
              <Trans>Отображение описания вакансии</Trans>
            </Typography>
            <IconButton
              size="small"
              color="primary"
              onClick={() => setShowDescriptionExample(true)}
              title={_(msg`Показать пример`)}
            >
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Trans>
              На странице самозаписи на интервью описание вакансии можно сворачивать/разворачивать.
              Эта настройка управляет начальным состоянием.
            </Trans>
          </Alert>

          <FormControlLabel
            control={
              <Checkbox
                checked={descriptionExpandedByDefault}
                onChange={(e) => setDescriptionExpandedByDefault(e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography variant="body1">
                  <Trans>Показывать описание вакансии развернутым по умолчанию</Trans>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <Trans>
                    Если галочка снята, кандидаты увидят только краткое описание (первые 200 символов),
                    и смогут развернуть полный текст при необходимости.
                  </Trans>
                </Typography>
              </Box>
            }
          />
        </CardContent>
      </Card>

      {/* Начальные сообщения интервью */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="h5" fontWeight="600">
              <Trans>Начальные сообщения интервью</Trans>
            </Typography>
            <IconButton
              size="small"
              color="primary"
              onClick={() => setShowExample(true)}
              title={_(msg`Показать пример`)}
            >
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Trans>
              Эти сообщения появляются в начале интервью перед первым вопросом. Вы можете
              изменить стандартные приветствия или добавить дополнительные инструкции для
              кандидатов. При первом открытии показываются сообщения по умолчанию.
            </Trans>
          </Alert>

          <Stack spacing={2} sx={{ mb: 3 }}>
          {messages.map((message, index) => (
            <Paper
              key={index}
              elevation={1}
              sx={{
                p: 2,
                border: '1px solid #e0e0e0',
                position: 'relative',
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                  <Trans>Сообщение {index + 1}:</Trans>
                </Typography>

                <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    title={_(msg`Переместить вверх`)}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => moveDown(index)}
                    disabled={index === messages.length - 1}
                    title={_(msg`Переместить вниз`)}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => deleteMessage(index)}
                    title={_(msg`Удалить`)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={2}
                value={message.text}
                onChange={(e) => updateMessageText(index, e.target.value)}
                placeholder={_(msg`Введите текст сообщения...`)}
                variant="outlined"
              />
            </Paper>
          ))}
        </Stack>


        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addMessage}
          fullWidth
        >
          <Trans>Добавить сообщение</Trans>
        </Button>

        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
            <Trans>💡 Подсказка</Trans>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Trans>
              Используйте стрелки ↑↓ для изменения порядка сообщений. Сообщения будут
              показаны кандидату в том же порядке перед началом интервью.
            </Trans>
          </Typography>
        </Box>
        </CardContent>
      </Card>

      {/* Алерты и кнопка сохранения */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SaveIcon />}
          onClick={saveMessages}
          disabled={saving}
        >
          {saving ? <Trans>Сохранение...</Trans> : <Trans>Сохранить все настройки</Trans>}
        </Button>
      </Box>

      {/* Диалог с примером описания вакансии */}
      <Dialog
        open={showDescriptionExample}
        onClose={() => setShowDescriptionExample(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              <Trans>Пример сворачивания описания вакансии</Trans>
            </Typography>
            <IconButton onClick={() => setShowDescriptionExample(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Trans>
              На странице самозаписи кандидаты могут свернуть/развернуть описание вакансии (выделено красной стрелкой).
              Настройка позволяет выбрать начальное состояние: развернуто или свернуто.
            </Trans>
          </Alert>
          <Box
            component="img"
            src="/images/vacancy-description-collapse-example.png"
            alt="Пример сворачивания описания"
            sx={{
              width: '100%',
              height: 'auto',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDescriptionExample(false)} variant="contained">
            <Trans>Закрыть</Trans>
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог с примером начальных сообщений */}
      <Dialog
        open={showExample}
        onClose={() => setShowExample(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              <Trans>Пример начальных сообщений в интервью</Trans>
            </Typography>
            <IconButton onClick={() => setShowExample(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Trans>
              Эти сообщения (выделены красной рамкой) отображаются кандидату в самом начале
              интервью перед первым вопросом.
            </Trans>
          </Alert>
          <Box
            component="img"
            src="/images/interview-initial-messages-example.png"
            alt="Пример начальных сообщений"
            sx={{
              width: '100%',
              height: 'auto',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExample(false)} variant="contained">
            <Trans>Закрыть</Trans>
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
