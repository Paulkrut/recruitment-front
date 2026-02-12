'use client';

import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography
} from '@mui/material';
import {
  Image as ImageIcon,
  PlayArrow as PlayIcon,
  VolumeUp as AudioIcon,
  Description as DocumentIcon,
  Close as CloseIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';

interface Attachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  filename: string;
  url: string;
  description?: string;
}

interface QuestionAttachmentsDisplayProps {
  attachments: Attachment[];
}

const QuestionAttachmentsDisplay: React.FC<QuestionAttachmentsDisplayProps> = ({
  attachments
}) => {
  const [selectedImage, setSelectedImage] = useState<Attachment | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

  if (!attachments || attachments.length === 0) {
    return null;
  }

  // Получаем полный URL (если URL относительный - добавляем API базу)
  const getFullUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${apiUrl}${url}`;
  };

  const renderAttachment = (attachment: Attachment) => {
    const fullUrl = getFullUrl(attachment.url);
    
    switch (attachment.type) {
      case 'image':
        return (
          <Box
            key={attachment.id}
            sx={{
              position: 'relative',
              cursor: 'pointer',
              borderRadius: 2,
              overflow: 'hidden',
              '&:hover': {
                opacity: 0.9
              }
            }}
            onClick={() => setSelectedImage(attachment)}
          >
            <img
              src={fullUrl}
              alt={attachment.filename}
              style={{
                width: '100%',
                maxWidth: '280px',
                borderRadius: '8px',
                display: 'block'
              }}
            />
            {attachment.description && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  color: 'text.secondary',
                  fontSize: '11px'
                }}
              >
                {attachment.description}
              </Typography>
            )}
          </Box>
        );

      case 'video':
        return (
          <Box key={attachment.id} sx={{ mb: 1 }}>
            <video
              controls
              width="100%"
              style={{
                maxWidth: '280px',
                borderRadius: '8px'
              }}
              src={fullUrl}
            />
            {attachment.description && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  color: 'text.secondary',
                  fontSize: '11px',
                  fontStyle: 'italic'
                }}
              >
                📝 {attachment.description}
              </Typography>
            )}
          </Box>
        );

      case 'audio':
        return (
          <Box key={attachment.id} sx={{ mb: 1 }}>
            <audio
              controls
              style={{
                width: '100%',
                maxWidth: '280px',
                borderRadius: '8px'
              }}
              src={fullUrl}
            />
            {attachment.description && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  color: 'text.secondary',
                  fontSize: '11px',
                  fontStyle: 'italic'
                }}
              >
                📝 {attachment.description}
              </Typography>
            )}
          </Box>
        );

      case 'document':
        return (
          <Box
            key={attachment.id}
            sx={{
              p: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1,
              maxWidth: '280px'
            }}
          >
            <DocumentIcon color="action" />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap>
                {attachment.filename}
              </Typography>
              {attachment.description && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    fontSize: '10px',
                    fontStyle: 'italic',
                    mt: 0.5
                  }}
                >
                  📝 {attachment.description.substring(0, 100)}...
                </Typography>
              )}
            </Box>
            <IconButton
              size="small"
              href={fullUrl}
              download={attachment.filename}
              target="_blank"
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Box sx={{ mt: 1, mb: 1 }}>
        {attachments.map((attachment) => renderAttachment(attachment))}
      </Box>

      {/* Modal для просмотра изображений */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none'
          }
        }}
      >
        <IconButton
          onClick={() => setSelectedImage(null)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.7)'
            },
            zIndex: 1
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: 0 }}>
          {selectedImage && (
            <Box>
              <img
                src={getFullUrl(selectedImage.url)}
                alt={selectedImage.filename}
                style={{
                  width: '100%',
                  maxHeight: '90vh',
                  objectFit: 'contain'
                }}
              />
              {selectedImage.description && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(0,0,0,0.7)',
                    p: 2,
                    textAlign: 'center'
                  }}
                >
                  {selectedImage.description}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuestionAttachmentsDisplay;
