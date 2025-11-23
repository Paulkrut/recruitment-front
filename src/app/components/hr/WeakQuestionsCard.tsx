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
import Link from "next/link";
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


interface WeakQuestion {
  questionId: number;
  questionText: string;
  avgScore: number;
  answerCount: number;
  vacancyId: number;
  vacancyTitle: string;
}

interface WeakQuestionsCardProps {
  data: WeakQuestion[];
}

export default function WeakQuestionsCard({ data }: WeakQuestionsCardProps) {
  const { _ } = useLingui();

  const getScoreColor = (score: number) => {
    if (score >= 4) return "success";
    if (score >= 3) return "warning";
    return "error";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4) return _(msg`Хорошо`);
    if (score >= 3) return _(msg`Удовлетворительно`);
    return _(msg`Плохо`);
  };

  const handleViewClick = (questionId: number, vacancyId: number) => {
    // Переходим на страницу вакансии и открываем вкладку с вопросами
    const url = `/hr/vacancies/${vacancyId}?tab=3&scrollToQuestion=${questionId}`;
    window.location.href = url;
  };

  const handleEditClick = (questionId: number, vacancyId: number) => {
    // Переходим на страницу редактирования и скроллим к вопросу
    const url = `/hr/vacancy-edit/${vacancyId}?scrollToQuestion=${questionId}`;
    window.location.href = url;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconAlertTriangle size={24} color="#ff9800" />
            <Typography variant="h5" fontWeight="600"><Trans>Слабые вопросы</Trans></Typography>
          </Box>
          <Chip
            label={_(msg`${data.length} вопросов`)}
            size="small"
            color="warning"
            variant="outlined"
          />
        </Box>

        {data.length > 0 && (
          <Box mb={2} p={1.5} bgcolor="rgba(255, 152, 0, 0.08)" borderRadius={1} border="1px solid rgba(255, 152, 0, 0.2)">
            <Typography variant="body2" color="warning.main" fontWeight="500" sx={{ fontSize: '0.875rem' }}><Trans>💡 Рекомендация: Рассмотрите возможность пересмотра вопросов с низким средним баллом</Trans></Typography>
          </Box>
        )}

        <List sx={{ p: 0 }}>
          {data.map((question, index) => (
            <React.Fragment key={question.questionId}>
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
                    <Tooltip title={_(msg`Просмотреть в вакансии`)}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewClick(question.questionId, question.vacancyId)}
                      >
                        <IconEye size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={_(msg`Редактировать`)}>
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleEditClick(question.questionId, question.vacancyId)}
                      >
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
                        label={`${question.avgScore}/5`}
                        size="small"
                        color={getScoreColor(question.avgScore) as any}
                        variant="outlined"
                      />
                      <Typography variant="caption" color="textSecondary"><Trans>
                        {getScoreLabel(question.avgScore)} • {question.answerCount} ответов
                      </Trans></Typography>
                      <Typography variant="caption" color="primary.main" fontWeight="500">
                        {question.vacancyTitle}
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
            <Typography variant="body2" color="textSecondary"><Trans>Нет слабых вопросов</Trans></Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 