'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  Typography,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
} from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { apiFetch } from '@/utils/api';
import RegulationTestTabs from '../components/RegulationTestTabs';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';
const FRONTEND_BASE = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001';

interface Invitation {
  id: number;
  type: string;
  email: string | null;
  employeeName: string | null;
  token: string;
  expiresAt: string | null;
  usesCount: number;
  maxUses: number | null;
  createdAt: string;
}

interface TestDetails {
  id: number;
  title: string;
}

export default function InvitationsPage() {
  const { _ } = useLingui();

  const params = useParams();
  const router = useRouter();
  const testId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [testDetails, setTestDetails] = useState<TestDetails | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form data
  const [invitationType, setInvitationType] = useState<'named' | 'general'>('named');
  const [email, setEmail] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(30);

  useEffect(() => {
    loadData();
  }, [testId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Загружаем тест
      const testResponse = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}`);
      
      if (!testResponse.ok) {
        const errorData = await testResponse.json();
        alert(_(msg`Ошибка: ${errorData.error || _(msg`Тест не найден`)}. Возможно, вы выбрали неправильную компанию в хедере.`));
        router.push('/hr/regulation-tests');
        return;
      }
      
      const testData = await testResponse.json();
      setTestDetails(testData);

      // Загружаем приглашения
      const invitationsResponse = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}/invitations`);
      
      if (!invitationsResponse.ok) {
        console.error('Error loading invitations');
        setInvitations([]);
      } else {
        const invitationsData = await invitationsResponse.json();
        setInvitations(Array.isArray(invitationsData) ? invitationsData : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert(_(msg`Ошибка загрузки данных. Проверьте выбранную компанию в хедере.`));
      router.push('/hr/regulation-tests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}/invitations`, {
        method: 'POST',
        body: JSON.stringify({
          type: invitationType,
          email: invitationType === 'named' ? email : null,
          expiresInDays,
        }),
      });

      if (response.ok) {
        setDialogOpen(false);
        setEmail('');
        loadData();
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
    }
  };

  const handleDeleteInvitation = async (id: number) => {
    if (!confirm(_(msg`Удалить приглашение?`))) return;

    try {
      const response = await apiFetch(`${API_BASE}/api/regulation-tests/invitations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error deleting invitation:', error);
    }
  };

  const handleCopyLink = (token: string) => {
    const link = `${FRONTEND_BASE}/test/${token}`;
    navigator.clipboard.writeText(link);
    alert(_(msg`Ссылка скопирована в буфер обмена`));
  };

  const getInvitationStatus = (invitation: Invitation): { label: string; color: 'success' | 'warning' | 'default' } => {
    // Проверка истечения срока
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      return { label: _(msg`Истекло`), color: 'default' };
    }

    // Проверка лимита использований
    if (invitation.maxUses !== null && invitation.usesCount >= invitation.maxUses) {
      return { label: _(msg`Исчерпано`), color: 'success' };
    }

    // Проверка использования
    if (invitation.usesCount > 0) {
      return { label: `Использовано ${invitation.usesCount} раз`, color: 'warning' };
    }

    return { label: _(msg`Активно`), color: 'success' };
  };

  return (
    <PageContainer title={_(msg`Приглашения`)} description="Управление приглашениями на тест">
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link href="/hr" underline="hover" color="inherit">
          Главная
        </Link>
        <Link href="/hr/regulation-tests" underline="hover" color="inherit">
          Тесты
        </Link>
        <Typography color="text.primary"><Trans>Приглашения</Trans></Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4"><Trans>🔗 Приглашения на тест</Trans></Typography>
          {testDetails && (
            <Typography variant="body2" color="text.secondary">
              {testDetails.title}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => router.push('/hr/regulation-tests')}>
            Назад
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Создать приглашение
          </Button>
        </Box>
      </Box>

      {/* Tabs navigation */}
      <RegulationTestTabs testId={testId} />

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Trans>Тип</Trans></TableCell>
                <TableCell>Email</TableCell>
                <TableCell><Trans>Сотрудник</Trans></TableCell>
                <TableCell><Trans>Статус</Trans></TableCell>
                <TableCell><Trans>Срок действия</Trans></TableCell>
                <TableCell><Trans>Создано</Trans></TableCell>
                <TableCell align="right"><Trans>Действия</Trans></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary"><Trans>Загрузка...</Trans></Typography>
                  </TableCell>
                </TableRow>
              ) : invitations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary" gutterBottom><Trans>Приглашения не созданы</Trans></Typography>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                      Создать первое приглашение
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                invitations.map((invitation) => (
                  <TableRow key={invitation.id} hover>
                    <TableCell>
                      <Chip
                        label={invitation.type === 'named' ? _(msg`Именное`) : _(msg`Общее`)}
                        size="small"
                        color={invitation.type === 'named' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>{invitation.email || '—'}</TableCell>
                    <TableCell>{invitation.employeeName || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={getInvitationStatus(invitation).label}
                        size="small"
                        color={getInvitationStatus(invitation).color}
                      />
                    </TableCell>
                    <TableCell>
                      {invitation.expiresAt
                        ? new Date(invitation.expiresAt).toLocaleDateString('ru-RU')
                        : _(msg`Бессрочно`)}
                    </TableCell>
                    <TableCell>{new Date(invitation.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                    <TableCell align="right">
                      <Tooltip title={_(msg`Скопировать ссылку`)}>
                        <IconButton size="small" onClick={() => handleCopyLink(invitation.token)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={_(msg`Удалить`)}>
                        <IconButton size="small" onClick={() => handleDeleteInvitation(invitation.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog создания приглашения */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создать приглашение</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel><Trans>Тип приглашения</Trans></InputLabel>
              <Select
                value={invitationType}
                label={_(msg`Тип приглашения`)}
                onChange={(e) => setInvitationType(e.target.value as 'named' | 'general')}
              >
                <MenuItem value="named"><Trans>Именное (для конкретного сотрудника)</Trans></MenuItem>
                <MenuItem value="general"><Trans>Общее (для самостоятельной регистрации)</Trans></MenuItem>
              </Select>
            </FormControl>

            {invitationType === 'named' && (
              <TextField
                label={_(msg`Email сотрудника`)}
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="employee@company.com"
              />
            )}

            <TextField
              label={_(msg`Срок действия (дней)`)}
              type="number"
              fullWidth
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 1, max: 365 } }}
            />

            <Alert severity="info">
              {invitationType === 'named'
                ? _(msg`Именное приглашение будет отправлено на указанный email.`)
                : _(msg`Общее приглашение можно использовать для массовой рассылки. Каждый сотрудник введёт свои данные при старте теста.`)}
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleCreateInvitation}
            disabled={invitationType === 'named' && !email}
          ><Trans>Создать</Trans></Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

