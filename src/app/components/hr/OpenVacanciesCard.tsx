"use client";
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Pagination,
} from "@mui/material";
import { IconEye, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


interface Vacancy {
  id: number;
  title: string;
  finished: number;
  total: number;
}

interface OpenVacanciesCardProps {
  data: Vacancy[];
}

export default function OpenVacanciesCard({ data }: OpenVacanciesCardProps) {
  const { _ } = useLingui();

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "success";
    if (progress >= 50) return "warning";
    return "error";
  };

  const getActivityLabel = (progress: number) => {
    if (progress === 0) return "Отсутствует";
    if (progress >= 80) return "Высокая";
    if (progress >= 50) return "Нормальная";
    if (progress >= 20) return "Низкая";
    return "Низкая";
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5" fontWeight="600"><Trans>Открытые вакансии</Trans></Typography>
          <Tooltip title={_(msg`Добавить вакансию`)}>
            <IconButton size="small" color="primary">
              <IconPlus size={20} />
            </IconButton>
          </Tooltip>
        </Box>

        <TableContainer sx={{ flex: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}><Trans>Вакансия</Trans></TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center"><Trans>Активность</Trans></TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center"><Trans>Действия</Trans></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentData.map((vacancy) => {
                const progress = vacancy.total ? (vacancy.finished / vacancy.total) * 100 : 0;
                return (
                  <TableRow key={vacancy.id} hover>
                    <TableCell>
                      <Link href={`/hr/vacancies/${vacancy.id}`} style={{ textDecoration: 'none' }}>
                        <Typography 
                          variant="body2" 
                          fontWeight="500"
                          sx={{
                            cursor: 'pointer',
                            color: 'primary.main',
                            '&:hover': {
                              color: 'primary.dark',
                              textDecoration: 'underline'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {vacancy.title}
                        </Typography>
                      </Link>
                      <Typography variant="caption" color="textSecondary">
                        {vacancy.finished} из {vacancy.total} кандидатов
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ width: "100%", mb: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          color={getProgressColor(progress) as any}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Chip
                        label={getActivityLabel(progress)}
                        size="small"
                        color={getProgressColor(progress) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Link href={`/hr/vacancies/${vacancy.id}`} style={{ textDecoration: 'none' }}>
                        <Tooltip title={_(msg`Просмотреть детали`)}>
                          <IconButton 
                            size="small" 
                            color="primary"
                          >
                            <IconEye size={16} />
                          </IconButton>
                        </Tooltip>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {data.length === 0 && (
          <Box textAlign="center" py={3}>
            <Typography variant="body2" color="textSecondary"><Trans>Нет открытых вакансий</Trans></Typography>
          </Box>
        )}

        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={totalPages}
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