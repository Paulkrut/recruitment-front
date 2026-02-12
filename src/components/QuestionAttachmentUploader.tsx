'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  LinearProgress,
  Alert,
  Stack,
  Chip,
  TextField,
  IconButton
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  AttachFile as AttachIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  Description as DocumentIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { compressMultipleFiles } from '@/utils/fileCompression';
import { apiFetch } from '@/utils/api';

interface Attachment {
  id: string;
  type: string;
  filename: string;
  url: string;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  description?: string;
  error?: string;
  size: number;
}

interface QuestionAttachmentUploaderProps {
  questionId: number;
  existingAttachments?: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  maxFiles?: number;
}

// Разрешенные типы файлов (синхронизировано с backend)
const ALLOWED_EXTENSIONS = {
  video: ['mp4', 'webm', 'mov', 'avi'],
  audio: ['mp3', 'wav', 'ogg', 'm4a'],
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  document: ['pdf', 'docx', 'doc', 'txt']
};

// Все разрешенные расширения в одном массиве
const ALL_ALLOWED_EXTENSIONS = [
  ...ALLOWED_EXTENSIONS.video,
  ...ALLOWED_EXTENSIONS.audio,
  ...ALLOWED_EXTENSIONS.image,
  ...ALLOWED_EXTENSIONS.document
];

// Accept строка для input type="file"
const ACCEPT_STRING = [
  // Video
  ...ALLOWED_EXTENSIONS.video.map(ext => `.${ext}`),
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
  // Audio
  ...ALLOWED_EXTENSIONS.audio.map(ext => `.${ext}`),
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4',
  // Image
  ...ALLOWED_EXTENSIONS.image.map(ext => `.${ext}`),
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  // Document
  ...ALLOWED_EXTENSIONS.document.map(ext => `.${ext}`),
  'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
  'application/msword', 'text/plain'
].join(',');

const QuestionAttachmentUploader: React.FC<QuestionAttachmentUploaderProps> = ({
  questionId,
  existingAttachments = [],
  onAttachmentsChange,
  maxFiles = 5
}) => {
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, file: '' });
  const [error, setError] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState<{ [key: string]: string }>({});
  const [savingDescription, setSavingDescription] = useState<{ [key: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentsRef = useRef<Attachment[]>(existingAttachments);
  const updateLockRef = useRef<boolean>(false); // Защита от одновременных обновлений

  // Синхронизируем ref с props
  useEffect(() => {
    attachmentsRef.current = existingAttachments;
  }, [existingAttachments]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Проверка лимита
    if (existingAttachments.length + files.length > maxFiles) {
      setError(`Максимум ${maxFiles} файлов`);
      return;
    }

    // Валидация типов файлов
    const invalidFiles: string[] = [];
    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      if (!ALL_ALLOWED_EXTENSIONS.includes(extension)) {
        invalidFiles.push(file.name);
      }
    }

    if (invalidFiles.length > 0) {
      setError(
        `Неподдерживаемые файлы: ${invalidFiles.join(', ')}.\n\n` +
        `Разрешены:\n` +
        `🎬 Видео: ${ALLOWED_EXTENSIONS.video.join(', ')}\n` +
        `🎵 Аудио: ${ALLOWED_EXTENSIONS.audio.join(', ')}\n` +
        `🖼️ Изображения: ${ALLOWED_EXTENSIONS.image.join(', ')}\n` +
        `📄 Документы: ${ALLOWED_EXTENSIONS.document.join(', ')}`
      );
      return;
    }

    setError(null);
    setCompressing(true);

    try {
      // Шаг 1: Подготовка файлов (умное сжатие через FFmpeg.wasm)
      const compressed = await compressMultipleFiles(
        files,
        (index, total, fileName, fileProgress) => {
          const fileType = fileName.split('.').pop()?.toLowerCase();
          const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType || '');
          const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(fileType || '');
          const isAudio = ['mp3', 'wav', 'ogg', 'm4a'].includes(fileType || '');
          
          let action = 'Подготовка';
          if (isImage) action = 'Сжатие';
          if (isVideo || isAudio) {
            action = fileProgress !== undefined && fileProgress > 0 
              ? `Сжатие (${fileProgress}%)`
              : 'Сжатие';
          }
          
          setProgress({ current: index, total, file: `${action}: ${fileName}` });
        }
      );

      setCompressing(false);
      setUploading(true);

      // Шаг 2: Загрузка файлов
      const newAttachments: Attachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const blob = compressed[i];

        setProgress({
          current: i,
          total: files.length,
          file: `Загрузка: ${file.name}`
        });

        const formData = new FormData();
        formData.append('file', blob, file.name);

        const response = await apiFetch(
          `${process.env.NEXT_PUBLIC_RECRUITMENT_API}/api/admin/questions/${questionId}/attachments`,
          {
            method: 'POST',
            body: formData
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка загрузки');
        }

        const { attachment } = await response.json();
        newAttachments.push(attachment);

        console.log('📤 File uploaded:', {
          index: i,
          filename: attachment.filename,
          id: attachment.id,
          type: attachment.type,
          status: attachment.status
        });
      }

      // Обновляем список вложений ОДИН РАЗ после загрузки всех файлов
      const updatedAttachments = [...existingAttachments, ...newAttachments];
      attachmentsRef.current = updatedAttachments;
      onAttachmentsChange(updatedAttachments);

      // Шаг 3: Запускаем polling для аудио/видео/документов
      // С задержкой между файлами для избежания race condition
      newAttachments.forEach((attachment, index) => {
        if (['audio', 'video', 'document'].includes(attachment.type)) {
          // Задержка: 0ms, 1000ms, 2000ms и т.д. для каждого файла
          const delay = index * 1000;
          console.log(`⏱️ Scheduling polling for ${attachment.filename} in ${delay}ms`);
          
          setTimeout(() => {
            pollAttachmentStatus(questionId, attachment.id, () => attachmentsRef.current);
          }, delay);
        }
      });

      setProgress({ current: files.length, total: files.length, file: 'Готово!' });
      
      // Очищаем через 2 секунды
      setTimeout(() => {
        setUploading(false);
        setProgress({ current: 0, total: 0, file: '' });
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки файлов');
      setCompressing(false);
      setUploading(false);
    }

    // Сбрасываем input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const pollAttachmentStatus = async (
    questionId: number, 
    attachmentId: string,
    getCurrentAttachments: () => Attachment[]
  ) => {
    const maxAttempts = 60; // 5 минут (60 * 5 секунд)
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await apiFetch(
          `${process.env.NEXT_PUBLIC_RECRUITMENT_API}/api/admin/questions/${questionId}/attachments/${attachmentId}`
        );

        if (!response.ok) return;

        const { attachment } = await response.json();

        console.log('📥 Polling update received:', {
          attachmentId: attachment.id,
          filename: attachment.filename,
          status: attachment.status,
          hasDescription: !!attachment.description,
          descriptionPreview: attachment.description?.substring(0, 50)
        });

        // 🔒 Ждем освобождения lock (защита от race condition)
        let waitAttempts = 0;
        while (updateLockRef.current && waitAttempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 50)); // Ждем 50ms
          waitAttempts++;
        }

        if (waitAttempts >= 50) {
          console.warn('Update lock timeout for:', attachmentId);
        }

        // Устанавливаем lock
        updateLockRef.current = true;

        try {
          // 🔒 КРИТИЧНО: Используем функцию для получения актуального состояния
          // Это защищает от race condition при параллельном polling нескольких файлов
          const currentAttachments = getCurrentAttachments();
          
          // Проверяем что attachment еще существует в списке
          const existingIndex = currentAttachments.findIndex(att => att.id === attachmentId);
          if (existingIndex === -1) {
            console.warn('Attachment not found in current list, stopping polling:', attachmentId);
            return;
          }

          const updatedAttachments = currentAttachments.map(att =>
            att.id === attachmentId ? { ...att, ...attachment } : att
          );
          
          // Обновляем ref и вызываем callback
          attachmentsRef.current = updatedAttachments;
          onAttachmentsChange(updatedAttachments);

          console.log('✅ State updated for:', attachment.filename, 'status:', attachment.status);
        } finally {
          // Освобождаем lock
          updateLockRef.current = false;
        }

        // Если обработка завершена или ошибка - останавливаем polling
        if (attachment.status === 'processed' || attachment.status === 'error') {
          console.log('🏁 Polling completed for:', attachment.filename);
          return;
        }

        // Продолжаем polling
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Каждые 5 секунд
        } else {
          console.warn('⏰ Polling timeout for:', attachment.filename);
        }
      } catch (error) {
        console.error('Polling error for', attachmentId, ':', error);
      }
    };

    // Начинаем через 3 секунды (даем время на первую обработку)
    setTimeout(poll, 3000);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'Загружено';
      case 'processing':
        return 'Обработка...';
      case 'processed':
        return 'Готово';
      case 'error':
        return 'Ошибка';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' => {
    switch (status) {
      case 'uploaded':
        return 'default';
      case 'processing':
        return 'primary';
      case 'processed':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleDelete = async (attachmentId: string) => {
    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_RECRUITMENT_API}/api/admin/questions/${questionId}/attachments/${attachmentId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Ошибка удаления');
      }

      const updatedAttachments = existingAttachments.filter(att => att.id !== attachmentId);
      onAttachmentsChange(updatedAttachments);
    } catch (err: any) {
      setError(err.message || 'Ошибка удаления файла');
    }
  };

  const handleSaveDescription = async (attachmentId: string) => {
    const newDescription = editingDescription[attachmentId];
    
    if (newDescription === undefined) return;

    setSavingDescription(prev => ({ ...prev, [attachmentId]: true }));
    setError(null);

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_RECRUITMENT_API}/api/admin/questions/${questionId}/attachments/${attachmentId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: newDescription })
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка сохранения описания');
      }

      // Обновляем attachment в списке
      const updatedAttachments = existingAttachments.map(att =>
        att.id === attachmentId ? { ...att, description: newDescription } : att
      );
      onAttachmentsChange(updatedAttachments);

      // Очищаем состояние редактирования
      setEditingDescription(prev => {
        const newState = { ...prev };
        delete newState[attachmentId];
        return newState;
      });
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения описания');
    } finally {
      setSavingDescription(prev => ({ ...prev, [attachmentId]: false }));
    }
  };

  const renderAttachmentPreview = (attachment: Attachment) => {
    const apiUrl = process.env.NEXT_PUBLIC_RECRUITMENT_API || '';
    const fullUrl = `${apiUrl}${attachment.url}`;

    switch (attachment.type) {
      case 'image':
        return (
          <Box
            component="img"
            src={fullUrl}
            alt={attachment.filename}
            sx={{
              width: 120,
              height: 80,
              objectFit: 'cover',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
          />
        );
      
      case 'video':
        return (
          <Box
            component="video"
            controls
            sx={{
              width: 200,
              height: 120,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'black'
            }}
          >
            <source src={fullUrl} type="video/mp4" />
            Ваш браузер не поддерживает видео
          </Box>
        );
      
      case 'audio':
        return (
          <Box sx={{ width: '100%', maxWidth: 300 }}>
            <Box
              component="audio"
              controls
              sx={{
                width: '100%',
                height: 40
              }}
            >
              <source src={fullUrl} />
              Ваш браузер не поддерживает аудио
            </Box>
          </Box>
        );
      
      case 'document':
        return (
          <Box
            sx={{
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'action.hover',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <DocumentIcon sx={{ fontSize: 40, color: 'action.active' }} />
          </Box>
        );
      
      default:
        return (
          <Box
            sx={{
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'action.hover',
              borderRadius: 1
            }}
          >
            <AttachIcon sx={{ fontSize: 40, color: 'action.active' }} />
          </Box>
        );
    }
  };

  const canUploadMore = existingAttachments.length < maxFiles;

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        multiple
        accept={ACCEPT_STRING}
      />

      <Button
        variant="outlined"
        startIcon={<UploadIcon />}
        onClick={() => fileInputRef.current?.click()}
        disabled={!canUploadMore || uploading || compressing}
        fullWidth
      >
        {canUploadMore 
          ? `Прикрепить файлы (${existingAttachments.length}/${maxFiles})`
          : `Достигнут лимит (${maxFiles})`
        }
      </Button>

      {/* Подсказка о разрешенных форматах */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Разрешены: 🎬 {ALLOWED_EXTENSIONS.video.join(', ')} • 
        🎵 {ALLOWED_EXTENSIONS.audio.join(', ')} • 
        🖼️ {ALLOWED_EXTENSIONS.image.join(', ')} • 
        📄 {ALLOWED_EXTENSIONS.document.join(', ')}
      </Typography>

      {(compressing || uploading) && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {progress.file}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {progress.current} / {progress.total}
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {existingAttachments.length > 0 && (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {existingAttachments.map((attachment) => (
            <Box
              key={attachment.id}
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                display: 'flex',
                gap: 2,
                alignItems: 'flex-start'
              }}
            >
              {/* Превью */}
              {renderAttachmentPreview(attachment)}

              {/* Информация */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  {/* Иконка типа файла */}
                  {attachment.type === 'image' && <ImageIcon fontSize="small" color="action" />}
                  {attachment.type === 'video' && <VideoIcon fontSize="small" color="action" />}
                  {attachment.type === 'audio' && <AudioIcon fontSize="small" color="action" />}
                  {attachment.type === 'document' && <DocumentIcon fontSize="small" color="action" />}
                  
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {attachment.filename}
                  </Typography>
                  <Chip
                    label={getStatusLabel(attachment.status)}
                    color={getStatusColor(attachment.status)}
                    size="small"
                    icon={attachment.status === 'processing' ? <CircularProgress size={12} /> : undefined}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Размер: {(attachment.size / 1024).toFixed(1)} KB • Тип: {attachment.type}
                </Typography>

                {/* Описание/Транскрипция */}
                {attachment.type === 'image' ? (
                  // Для изображений - редактируемое описание
                  <Box sx={{ mt: 1 }}>
                    {editingDescription[attachment.id] !== undefined ? (
                      // Режим редактирования
                      <Box>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          value={editingDescription[attachment.id]}
                          onChange={(e) => setEditingDescription(prev => ({ 
                            ...prev, 
                            [attachment.id]: e.target.value 
                          }))}
                          placeholder="Опишите что изображено на картинке..."
                          variant="outlined"
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={savingDescription[attachment.id] ? <CircularProgress size={16} /> : <SaveIcon />}
                            onClick={() => handleSaveDescription(attachment.id)}
                            disabled={savingDescription[attachment.id]}
                          >
                            Сохранить
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CloseIcon />}
                            onClick={() => setEditingDescription(prev => {
                              const newState = { ...prev };
                              delete newState[attachment.id];
                              return newState;
                            })}
                            disabled={savingDescription[attachment.id]}
                          >
                            Отмена
                          </Button>
                        </Stack>
                      </Box>
                    ) : (
                      // Режим просмотра
                      <Box>
                        {attachment.description ? (
                          <Box
                            sx={{
                              p: 1,
                              backgroundColor: 'action.hover',
                              borderRadius: 1,
                              position: 'relative',
                              '&:hover .edit-button': {
                                opacity: 1
                              }
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{
                                fontSize: '0.875rem',
                                lineHeight: 1.5,
                                maxHeight: 100,
                                overflow: 'auto',
                                pr: 4
                              }}
                            >
                              {attachment.description}
                            </Typography>
                            <IconButton
                              className="edit-button"
                              size="small"
                              onClick={() => setEditingDescription(prev => ({ 
                                ...prev, 
                                [attachment.id]: attachment.description || '' 
                              }))}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                opacity: 0,
                                transition: 'opacity 0.2s'
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => setEditingDescription(prev => ({ 
                              ...prev, 
                              [attachment.id]: '' 
                            }))}
                            fullWidth
                          >
                            Добавить описание картинки
                          </Button>
                        )}
                      </Box>
                    )}
                  </Box>
                ) : (
                  // Для аудио/видео/документов - автоматическая транскрипция (только чтение)
                  attachment.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        p: 1,
                        backgroundColor: 'action.hover',
                        borderRadius: 1,
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                        maxHeight: 100,
                        overflow: 'auto'
                      }}
                    >
                      {attachment.description}
                    </Typography>
                  )
                )}

                {attachment.error && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {attachment.error}
                  </Alert>
                )}
              </Box>

              {/* Кнопка удаления */}
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => handleDelete(attachment.id)}
                sx={{ flexShrink: 0 }}
              >
                Удалить
              </Button>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default QuestionAttachmentUploader;
