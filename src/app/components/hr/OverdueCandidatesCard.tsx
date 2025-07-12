"use client";
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Button,
} from "@mui/material";
import { 
  IconClock, 
  IconMail, 
  IconPhone, 
  IconMessage, 
  IconUser 
} from "@tabler/icons-react";

interface OverdueCandidate {
  name: string;
  created_at: string;
  email?: string;
  phone?: string;
}

interface OverdueCandidatesCardProps {
  data: OverdueCandidate[];
}

export default function OverdueCandidatesCard({ data }: OverdueCandidatesCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 день назад";
    if (diffDays < 7) return `${diffDays} дней назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} недель назад`;
    return `${Math.floor(diffDays / 30)} месяцев назад`;
  };

  const getUrgencyColor = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) return "error";
    if (diffDays > 14) return "warning";
    return "info";
  };

  const getUrgencyLabel = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) return "Критично";
    if (diffDays > 14) return "Срочно";
    return "Внимание";
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconClock size={24} color="#f44336" />
            <Typography variant="h5" fontWeight="600">
              Просроченные кандидаты
            </Typography>
          </Box>
          <Chip
            label={`${data.length} кандидатов`}
            size="small"
            color="error"
            variant="outlined"
          />
        </Box>

        <List sx={{ p: 0 }}>
          {data.map((candidate, index) => (
            <React.Fragment key={index}>
              <ListItem
                sx={{
                  px: 0,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                    borderRadius: 1,
                  },
                }}
                secondaryAction={
                  <Box display="flex" gap={1}>
                    {candidate.email && (
                      <Tooltip title="Отправить email">
                        <IconButton size="small" color="primary">
                          <IconMail size={16} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {candidate.phone && (
                      <Tooltip title="Позвонить">
                        <IconButton size="small" color="success">
                          <IconPhone size={16} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Отправить сообщение">
                      <IconButton size="small" color="info">
                        <IconMessage size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
                    <IconUser size={20} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="500">
                        {candidate.name}
                      </Typography>
                      <Chip
                        label={getUrgencyLabel(candidate.created_at)}
                        size="small"
                        color={getUrgencyColor(candidate.created_at) as any}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box mt={0.5}>
                      <Typography variant="caption" color="textSecondary">
                        Создан: {formatDate(candidate.created_at)}
                      </Typography>
                      {candidate.email && (
                        <Typography variant="caption" display="block" color="textSecondary">
                          {candidate.email}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < data.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {data.length === 0 && (
          <Box textAlign="center" py={3}>
            <Typography variant="body2" color="textSecondary">
              Нет просроченных кандидатов
            </Typography>
          </Box>
        )}

        {data.length > 0 && (
          <Box mt={2} display="flex" gap={1}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<IconMail size={16} />}
              fullWidth
            >
              Массовая рассылка
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<IconMessage size={16} />}
              fullWidth
            >
              Напомнить всем
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 