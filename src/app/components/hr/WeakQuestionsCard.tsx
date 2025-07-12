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
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import { IconAlertTriangle, IconEdit, IconEye } from "@tabler/icons-react";

interface WeakQuestion {
  questionText: string;
  avgScore: number;
}

interface WeakQuestionsCardProps {
  data: WeakQuestion[];
}

export default function WeakQuestionsCard({ data }: WeakQuestionsCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "error";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Отлично";
    if (score >= 60) return "Хорошо";
    if (score >= 40) return "Удовлетворительно";
    return "Плохо";
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconAlertTriangle size={24} color="#ff9800" />
            <Typography variant="h5" fontWeight="600">
              Слабые вопросы
            </Typography>
          </Box>
          <Chip
            label={`${data.length} вопросов`}
            size="small"
            color="warning"
            variant="outlined"
          />
        </Box>

        <List sx={{ p: 0 }}>
          {data.map((question, index) => (
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
                    <Tooltip title="Просмотреть детали">
                      <IconButton size="small" color="primary">
                        <IconEye size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Редактировать вопрос">
                      <IconButton size="small" color="warning">
                        <IconEdit size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: getScoreColor(question.avgScore) === "error" 
                        ? "#f44336" 
                        : getScoreColor(question.avgScore) === "warning" 
                        ? "#ff9800" 
                        : "#4caf50",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      fontWeight="500"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {question.questionText}
                    </Typography>
                  }
                  secondary={
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <Chip
                        label={`${question.avgScore}%`}
                        size="small"
                        color={getScoreColor(question.avgScore) as any}
                        variant="outlined"
                      />
                      <Typography variant="caption" color="textSecondary">
                        {getScoreLabel(question.avgScore)}
                      </Typography>
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
              Нет слабых вопросов
            </Typography>
          </Box>
        )}

        {data.length > 0 && (
          <Box mt={2} p={2} bgcolor="rgba(255, 152, 0, 0.1)" borderRadius={1}>
            <Typography variant="body2" color="warning.main" fontWeight="500">
              💡 Рекомендация: Рассмотрите возможность пересмотра вопросов с низким средним баллом
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 