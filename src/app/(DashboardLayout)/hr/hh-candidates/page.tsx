'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Chip,
  Avatar,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Checkbox,
  IconButton,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import {
  IconSearch,
  IconStar,
  IconCheck,
  IconX,
  IconClock,
  IconUser,
  IconMail,
  IconPhone,
  IconBriefcase,
} from '@tabler/icons-react';
import { apiFetch } from '@/utils/api';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface HhCandidate {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  experienceYears: number;
  skills: string[];
  aiScore: string;
  aiComment: string;
  ourStage: string;
  hhState: string;
  hhStateName: string;
  hhCollectionId: string;
  hhCollectionName: string;
  responseDate: string;
  isImported: boolean;
}

const HhCandidatesPage = () => {
  const [candidates, setCandidates] = useState<HhCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [minScore, setMinScore] = useState<number>(0);
  const [stage, setStage] = useState<string>('all');
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  
  // Selected candidate for detailed view
  const [selectedCandidate, setSelectedCandidate] = useState<HhCandidate | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Action dialogs
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'convert' | 'defer' | 'reject' | null;
    notes: string;
  }>({ open: false, action: null, notes: '' });

  useEffect(() => {
    fetchCandidates();
  }, [minScore, stage]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        limit: 50,
        offset: 0,
      };
      
      if (minScore > 0) {
        params.min_score = minScore;
      }
      
      if (stage !== 'all') {
        params.stage = stage;
      }

      // Строим query string
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE}/api/hh-integration/hh-candidates?${queryString}`;

      const response = await apiFetch(url, {
        method: 'GET',
      });
      
      const data = await response.json();
      setCandidates(data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки кандидатов');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCandidate = (id: number) => {
    setSelectedCandidates(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map(c => c.id));
    }
  };

  const openActionDialog = (action: 'convert' | 'defer' | 'reject') => {
    setActionDialog({ open: true, action, notes: '' });
  };

  const handleAction = async () => {
    if (!actionDialog.action) return;
    
    try {
      setError(null);
      
      if (selectedCandidates.length > 1) {
        // Bulk action
        const response = await apiFetch(`${API_BASE}/api/hh-integration/bulk-action`, {
          method: 'POST',
          body: JSON.stringify({
            action: actionDialog.action,
            candidate_ids: selectedCandidates,
            notes: actionDialog.notes,
          }),
        });
        
        const data = await response.json();
        setSuccess(data.message || `${selectedCandidates.length} кандидатов обработано`);
      } else if (selectedCandidates.length === 1) {
        // Single action
        const endpoint = `${API_BASE}/api/hh-integration/${actionDialog.action}-candidate`;
        const response = await apiFetch(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            hh_candidate_id: selectedCandidates[0],
            notes: actionDialog.notes,
            reason: actionDialog.notes,
          }),
        });
        
        const data = await response.json();
        setSuccess(data.message || 'Кандидат обработан');
      }
      
      setActionDialog({ open: false, action: null, notes: '' });
      setSelectedCandidates([]);
      fetchCandidates();
    } catch (err: any) {
      setError(err.message || 'Ошибка выполнения действия');
    }
  };

  const getScoreColor = (score: string) => {
    const numScore = parseFloat(score);
    if (numScore >= 85) return 'success';
    if (numScore >= 70) return 'warning';
    return 'error';
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      new_from_hh: 'Новый',
      analyzed: 'Проанализирован',
      pending_review: 'Отложен',
      rejected_at_screening: 'Отклонён',
      converted: 'Импортирован',
    };
    return labels[stage] || stage;
  };

  return (
    <PageContainer title="Кандидаты из HH.ru" description="Пул кандидатов из HeadHunter">
      <Box>
        {/* Header with filters */}
        <DashboardCard title="Кандидаты из HH.ru">
          <>
            {/* Alerts */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Минимальный AI Score"
                  type="number"
                  value={minScore}
                  onChange={(e) => setMinScore(parseInt(e.target.value) || 0)}
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Стадия</InputLabel>
                  <Select value={stage} onChange={(e) => setStage(e.target.value)} label="Стадия">
                    <MenuItem value="all">Все</MenuItem>
                    <MenuItem value="new_from_hh">Новые</MenuItem>
                    <MenuItem value="analyzed">Проанализированные</MenuItem>
                    <MenuItem value="pending_review">Отложенные</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={fetchCandidates}
                  startIcon={<IconSearch />}
                  sx={{ height: '56px' }}
                >
                  Применить фильтры
                </Button>
              </Grid>
            </Grid>

            {/* Bulk actions */}
            {selectedCandidates.length > 0 && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2">
                    Выбрано: {selectedCandidates.length}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<IconCheck />}
                    onClick={() => openActionDialog('convert')}
                  >
                    Импортировать
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<IconClock />}
                    onClick={() => openActionDialog('defer')}
                  >
                    Отложить
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<IconX />}
                    onClick={() => openActionDialog('reject')}
                  >
                    Отклонить
                  </Button>
                  <Button size="small" onClick={() => setSelectedCandidates([])}>
                    Снять выделение
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Select all checkbox */}
            {candidates.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Checkbox
                  checked={selectedCandidates.length === candidates.length}
                  indeterminate={
                    selectedCandidates.length > 0 && selectedCandidates.length < candidates.length
                  }
                  onChange={handleSelectAll}
                />
                <Typography variant="body2" component="span">
                  Выбрать все ({candidates.length})
                </Typography>
              </Box>
            )}

            {/* Loading state */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Candidates list */}
            {!loading && candidates.length === 0 && (
              <Alert severity="info">Кандидатов не найдено. Попробуйте изменить фильтры.</Alert>
            )}

            <Grid container spacing={2}>
              {!loading &&
                candidates.map((candidate) => (
                  <Grid item xs={12} key={candidate.id}>
                    <Card
                      sx={{
                        border: selectedCandidates.includes(candidate.id)
                          ? '2px solid'
                          : '1px solid',
                        borderColor: selectedCandidates.includes(candidate.id)
                          ? 'primary.main'
                          : 'divider',
                      }}
                    >
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          {/* Checkbox */}
                          <Grid item xs="auto">
                            <Checkbox
                              checked={selectedCandidates.includes(candidate.id)}
                              onChange={() => handleSelectCandidate(candidate.id)}
                            />
                          </Grid>

                          {/* Avatar */}
                          <Grid item xs="auto">
                            <Avatar
                              src={candidate.photoUrl || undefined}
                              sx={{ width: 56, height: 56 }}
                            >
                              <IconUser />
                            </Avatar>
                          </Grid>

                          {/* Info */}
                          <Grid item xs>
                            <Typography variant="h6">{candidate.name}</Typography>
                            
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5, mb: 1 }}>
                              {candidate.email && (
                                <Chip
                                  size="small"
                                  icon={<IconMail size={16} />}
                                  label={candidate.email}
                                  variant="outlined"
                                />
                              )}
                              {candidate.phone && (
                                <Chip
                                  size="small"
                                  icon={<IconPhone size={16} />}
                                  label={candidate.phone}
                                  variant="outlined"
                                />
                              )}
                              {candidate.experienceYears > 0 && (
                                <Chip
                                  size="small"
                                  icon={<IconBriefcase size={16} />}
                                  label={`${candidate.experienceYears} лет`}
                                  variant="outlined"
                                />
                              )}
                            </Stack>

                            {candidate.skills && candidate.skills.length > 0 && (
                              <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                                {candidate.skills.slice(0, 5).map((skill, idx) => (
                                  <Chip key={idx} size="small" label={skill} />
                                ))}
                                {candidate.skills.length > 5 && (
                                  <Chip size="small" label={`+${candidate.skills.length - 5}`} />
                                )}
                              </Stack>
                            )}
                          </Grid>

                          {/* AI Score */}
                          <Grid item xs="auto">
                            <Box sx={{ textAlign: 'center' }}>
                              <Chip
                                icon={<IconStar />}
                                label={`${candidate.aiScore} / 100`}
                                color={getScoreColor(candidate.aiScore)}
                                sx={{ mb: 1 }}
                              />
                              <Typography variant="caption" display="block">
                                AI Score
                              </Typography>
                            </Box>
                          </Grid>

                          {/* Stage */}
                          <Grid item xs="auto">
                            <Chip label={getStageLabel(candidate.ourStage)} variant="outlined" />
                          </Grid>

                          {/* Actions */}
                          <Grid item xs="auto">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setSelectedCandidate(candidate);
                                setDetailsOpen(true);
                              }}
                            >
                              Подробнее
                            </Button>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </>
        </DashboardCard>

        {/* Action Dialog */}
        <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, action: null, notes: '' })} maxWidth="sm" fullWidth>
          <DialogTitle>
            {actionDialog.action === 'convert' && 'Импортировать кандидатов'}
            {actionDialog.action === 'defer' && 'Отложить кандидатов'}
            {actionDialog.action === 'reject' && 'Отклонить кандидатов'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Комментарий"
              value={actionDialog.notes}
              onChange={(e) => setActionDialog({ ...actionDialog, notes: e.target.value })}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialog({ open: false, action: null, notes: '' })}>
              Отмена
            </Button>
            <Button onClick={handleAction} variant="contained">
              Подтвердить
            </Button>
          </DialogActions>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
          {selectedCandidate && (
            <>
              <DialogTitle>{selectedCandidate.name}</DialogTitle>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      AI Комментарий:
                    </Typography>
                    <Typography variant="body2" sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                      {selectedCandidate.aiComment}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Контакты:</Typography>
                    <Typography variant="body2">Email: {selectedCandidate.email || 'Не указан'}</Typography>
                    <Typography variant="body2">Телефон: {selectedCandidate.phone || 'Не указан'}</Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Информация HH:</Typography>
                    <Typography variant="body2">Статус: {selectedCandidate.hhStateName}</Typography>
                    <Typography variant="body2">Коллекция: {selectedCandidate.hhCollectionName}</Typography>
                    <Typography variant="body2">Дата отклика: {new Date(selectedCandidate.responseDate).toLocaleDateString('ru-RU')}</Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDetailsOpen(false)}>Закрыть</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default HhCandidatesPage;

