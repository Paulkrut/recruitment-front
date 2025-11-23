"use client";
import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import { 
  IconClock, 
  IconUser 
} from "@tabler/icons-react";
import Link from "next/link";
import { OverdueCandidate, PaginationState } from "@/app/(DashboardLayout)/types/dashboard";
import { Trans } from '@lingui/react';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';



interface OverdueCandidatesCardProps {
  data: OverdueCandidate[];
}

export default function OverdueCandidatesCard({ data }: OverdueCandidatesCardProps) {
  const { _ } = useLingui();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Вычисляем пагинацию
  const paginationData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / pageSize);

    return {
      data: paginatedData,
      totalPages,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, data.length),
      total: data.length
    };
  }, [data, page, pageSize]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newPageSize = Number(event.target.value);
    setPageSize(newPageSize);
    setPage(1); // Сбрасываем на первую страницу при изменении размера
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return _(msg`1 день назад`);
    if (diffDays < 7) return _(msg`${diffDays} дней назад`);
    if (diffDays < 30) return _(msg`${Math.floor(diffDays / 7)} недель назад`);
    return _(msg`${Math.floor(diffDays / 30)} месяцев назад`);
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
    
    if (diffDays > 30) return _(msg`Критично`);
    if (diffDays > 14) return _(msg`Срочно`);
    return _(msg`Внимание`);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconClock size={24} color="#f44336" />
            <Typography variant="h5" fontWeight="600"><Trans>Просроченные кандидаты</Trans></Typography>
          </Box>
          <Chip
            label={_(msg`${data.length} кандидатов`)}
            size="small"
            color="error"
            variant="outlined"
          />
        </Box>

        {/* Настройки пагинации */}
        {data.length > 0 && (
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="body2" color="textSecondary"><Trans>
              Показано {paginationData.startIndex}-{paginationData.endIndex} из {paginationData.total}
            </Trans></Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={pageSize}
                onChange={handlePageSizeChange}
                displayEmpty
                variant="outlined"
              >
                <MenuItem value={3}><Trans>3 на странице</Trans></MenuItem>
                <MenuItem value={5}><Trans>5 на странице</Trans></MenuItem>
                <MenuItem value={10}><Trans>10 на странице</Trans></MenuItem>
                <MenuItem value={20}><Trans>20 на странице</Trans></MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        <List sx={{ p: 0, flex: 1 }}>
          {paginationData.data.map((candidate, index) => (
            <React.Fragment key={candidate.sessionId || index}>
              <ListItem
                sx={{
                  px: 0,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                    borderRadius: 1,
                  },
                }}
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
                        {candidate.sessionId ? (
                          <Link 
                            href={`/hr/sessions/${candidate.sessionId}`} 
                            style={{ 
                              textDecoration: 'none', 
                              color: 'inherit',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLElement).style.color = '#1976d2';
                              (e.target as HTMLElement).style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLElement).style.color = 'inherit';
                              (e.target as HTMLElement).style.textDecoration = 'none';
                            }}
                          >
                        {candidate.name}
                          </Link>
                        ) : (
                          candidate.name
                        )}
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
                      <Typography variant="caption" color="textSecondary"><Trans>
                        Создан: {formatDate(candidate.created_at)}
                      </Trans></Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < paginationData.data.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {data.length === 0 && (
          <Box textAlign="center" py={3}>
            <Typography variant="body2" color="textSecondary"><Trans>Нет просроченных кандидатов</Trans></Typography>
          </Box>
        )}

        {/* Пагинация */}
        {paginationData.totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={paginationData.totalPages}
              page={page}
              onChange={handlePageChange}
              size="small"
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 