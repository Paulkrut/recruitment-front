'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  LinearProgress,
  Paper,
  Grid,
  Divider,
  Alert,
  TextField,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Snackbar,
  Tab,
  Tabs,
} from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EmailIcon from '@mui/icons-material/Email';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LinkIcon from '@mui/icons-material/Link';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { apiFetch } from '@/utils/api';
import RegulationTestTabs from '../components/RegulationTestTabs';
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';
import { exportRegulationTestResults } from '@/services/export/reports/regulationTest/exportRegulationTestResults';
import * as XLSX from 'xlsx';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';
const FRONTEND_BASE = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001';

// ---- Types ----

interface TestDetails {
  id: number;
  title: string;
  description: string;
}

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

interface ParsedEmployee {
  name: string;
  email: string;
  valid: boolean;
  error?: string;
}

interface TestResult {
  sessionId: number;
  employeeName: string | null;
  employeeEmail: string | null;
  employeeDepartment: string | null;
  status: string;
  score: number | null;
  startedAt: string;
  finishedAt: string | null;
}

interface SessionDetail {
  sessionId: number;
  test: { title: string };
  employee: { name: string | null; email: string | null; department: string | null };
  status: string;
  score: number | null;
  startedAt: string;
  finishedAt: string | null;
  answers: Array<{
    questionText: string;
    answerText: string;
    videoFilename: string | null;
    audioFilename: string | null;
    transcription: string | null;
    processingStatus: string;
    score: number;
    aiComment: string;
    regulation: { title: string };
  }>;
}

interface MergedRow {
  key: string;
  name: string | null;
  email: string | null;
  department: string | null;
  invitation: Invitation | null;
  result: TestResult | null;
}

// ---- Helpers ----

function parseTextList(text: string): ParsedEmployee[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[;\t,]/).map((p) => p.trim());
      if (parts.length >= 2) {
        const email = parts.find((p) => p.includes('@')) || parts[1];
        const name = parts.find((p) => !p.includes('@')) || parts[0];
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        return { name, email, valid, error: valid ? undefined : 'Некорректный email' };
      }
      if (parts.length === 1 && parts[0].includes('@')) {
        const email = parts[0];
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        return { name: email.split('@')[0], email, valid, error: valid ? undefined : 'Некорректный email' };
      }
      return { name: line, email: '', valid: false, error: 'Не удалось определить email' };
    });
}

function parseExcelFile(file: File): Promise<ParsedEmployee[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (rows.length === 0) { resolve([]); return; }
        const headers = Object.keys(rows[0]).map((h) => h.toLowerCase());
        const emailCol = headers.find((h) => h.includes('email') || h.includes('почт') || h.includes('e-mail'));
        const nameCol = headers.find((h) => h.includes('имя') || h.includes('name') || h.includes('фио') || h.includes('сотрудник'));
        const emailKey = emailCol ? Object.keys(rows[0])[headers.indexOf(emailCol)] : null;
        const nameKey = nameCol ? Object.keys(rows[0])[headers.indexOf(nameCol)] : null;
        if (!emailKey) { reject(new Error('Не найден столбец с email')); return; }
        const result: ParsedEmployee[] = rows.map((row) => {
          const email = String(row[emailKey] || '').trim();
          const name = nameKey ? String(row[nameKey] || '').trim() : email.split('@')[0];
          const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
          return { name: name || email, email, valid, error: valid ? undefined : 'Некорректный email' };
        }).filter((r) => r.email);
        resolve(result);
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function mergeData(invitations: Invitation[], results: TestResult[]): { rows: MergedRow[]; generalInvitations: Invitation[] } {
  const generalInvitations = invitations.filter((inv) => inv.type === 'general');
  const namedInvitations = invitations.filter((inv) => inv.type === 'named');

  const resultsByEmail = new Map<string, TestResult[]>();
  for (const r of results) {
    const key = (r.employeeEmail || '').toLowerCase();
    if (!resultsByEmail.has(key)) resultsByEmail.set(key, []);
    resultsByEmail.get(key)!.push(r);
  }

  const matchedResultIds = new Set<number>();
  const rows: MergedRow[] = [];

  for (const inv of namedInvitations) {
    const emailKey = (inv.email || '').toLowerCase();
    const matched = resultsByEmail.get(emailKey) || [];

    if (matched.length === 0) {
      rows.push({
        key: `inv-${inv.id}`,
        name: inv.employeeName,
        email: inv.email,
        department: null,
        invitation: inv,
        result: null,
      });
    } else {
      for (const r of matched) {
        matchedResultIds.add(r.sessionId);
        rows.push({
          key: `inv-${inv.id}-res-${r.sessionId}`,
          name: r.employeeName || inv.employeeName,
          email: r.employeeEmail || inv.email,
          department: r.employeeDepartment,
          invitation: inv,
          result: r,
        });
      }
    }
  }

  for (const r of results) {
    if (!matchedResultIds.has(r.sessionId)) {
      rows.push({
        key: `res-${r.sessionId}`,
        name: r.employeeName,
        email: r.employeeEmail,
        department: r.employeeDepartment,
        invitation: null,
        result: r,
      });
    }
  }

  rows.sort((a, b) => {
    const dateA = a.result?.startedAt || a.invitation?.createdAt || '';
    const dateB = b.result?.startedAt || b.invitation?.createdAt || '';
    return dateB.localeCompare(dateA);
  });

  return { rows, generalInvitations };
}

// ---- Component ----

export default function TestOverviewPage() {
  const { _ } = useLingui();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = parseInt(params.id as string);
  const isNewlyCreated = searchParams.get('new') === '1';

  const [loading, setLoading] = useState(true);
  const [newBannerVisible, setNewBannerVisible] = useState(isNewlyCreated);
  const [testDetails, setTestDetails] = useState<TestDetails | null>(null);

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);

  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [invName, setInvName] = useState('');
  const [invEmail, setInvEmail] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [creatingGeneralLink, setCreatingGeneralLink] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkTab, setBulkTab] = useState(0);
  const [pasteText, setPasteText] = useState('');
  const [parsedEmployees, setParsedEmployees] = useState<ParsedEmployee[]>([]);
  const [sendEmailOnCreate, setSendEmailOnCreate] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ created: number; emailsSent: number; errors: any[] } | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // ---- Merged data ----
  const { rows, generalInvitations } = useMemo(
    () => mergeData(invitations, results),
    [invitations, results],
  );

  // ---- Load ----
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const testRes = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}`);
      if (!testRes.ok) {
        alert(_(msg`Ошибка загрузки теста`));
        router.push('/hr/regulation-tests');
        return;
      }
      setTestDetails(await testRes.json());

      const [invRes, resultsRes] = await Promise.all([
        apiFetch(`${API_BASE}/api/regulation-tests/${testId}/invitations`),
        apiFetch(`${API_BASE}/api/regulation-tests/${testId}/results`),
      ]);

      if (invRes.ok) { const d = await invRes.json(); setInvitations(Array.isArray(d) ? d : []); }
      if (resultsRes.ok) { const d = await resultsRes.json(); setResults(Array.isArray(d) ? d : []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [testId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ---- Invitation actions ----
  const handleCreateNamedInvitation = async () => {
    if (!invEmail) return;
    try {
      const res = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}/invitations`, {
        method: 'POST',
        body: JSON.stringify({ type: 'named', email: invEmail, name: invName || null, expiresInDays }),
      });
      if (res.ok) {
        setDialogOpen(false); setInvEmail(''); setInvName(''); loadData();
        setSnackbar({ open: true, message: 'Приглашение создано', severity: 'success' });
      } else {
        const err = await res.json();
        setSnackbar({ open: true, message: `Ошибка: ${err.error || 'Неизвестно'}`, severity: 'error' });
      }
    } catch { setSnackbar({ open: true, message: 'Ошибка создания', severity: 'error' }); }
  };

  const handleGeneralLinkClick = async () => {
    const existing = invitations.find((i) => i.type === 'general');
    if (existing) {
      handleCopyLink(existing.token);
      return;
    }
    setCreatingGeneralLink(true);
    try {
      const res = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}/invitations`, {
        method: 'POST',
        body: JSON.stringify({ type: 'general', email: null, expiresInDays: 30 }),
      });
      if (res.ok) {
        const data = await res.json();
        const token = data.token;
        const link = token ? getTestLink(token) : '';
        let copied = false;
        if (link) {
          try { await navigator.clipboard.writeText(link); copied = true; } catch { /* clipboard unavailable */ }
        }
        setSnackbar({ open: true, message: copied ? 'Ссылка создана и скопирована' : 'Ссылка создана', severity: 'success' });
        loadData();
      } else {
        const err = await res.json();
        setSnackbar({ open: true, message: `Ошибка: ${err.error || 'Неизвестно'}`, severity: 'error' });
      }
    } catch { setSnackbar({ open: true, message: 'Ошибка создания ссылки', severity: 'error' }); }
    finally { setCreatingGeneralLink(false); }
  };

  const handleDeleteInvitation = async (id: number) => {
    if (!confirm(_(msg`Удалить приглашение?`))) return;
    try {
      const res = await apiFetch(`${API_BASE}/api/regulation-tests/invitations/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch { /* ignore */ }
  };

  const getTestLink = (token: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : FRONTEND_BASE;
    return `${origin}/test/${token}`;
  };

  const handleCopyLink = async (token: string) => {
    const link = getTestLink(token);
    try {
      await navigator.clipboard.writeText(link);
      setSnackbar({ open: true, message: 'Ссылка скопирована', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: link, severity: 'info' });
    }
  };

  const handleSendEmail = async (invitationId: number) => {
    try {
      const res = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}/invitations/${invitationId}/send-email`, {
        method: 'POST',
        body: JSON.stringify({ frontendBaseUrl: FRONTEND_BASE }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: 'Email отправлен', severity: 'success' });
      } else {
        const err = await res.json();
        setSnackbar({ open: true, message: `Ошибка: ${err.error || 'Неизвестно'}`, severity: 'error' });
      }
    } catch { setSnackbar({ open: true, message: 'Ошибка отправки email', severity: 'error' }); }
  };

  // ---- Bulk ----
  const handlePasteChange = (text: string) => {
    setPasteText(text);
    setParsedEmployees(text.trim() ? parseTextList(text) : []);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const employees = await parseExcelFile(file);
      setParsedEmployees(employees);
      setBulkTab(0);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Ошибка чтения файла', severity: 'error' });
    }
  };

  const handleBulkCreate = async () => {
    const valid = parsedEmployees.filter((e) => e.valid);
    if (valid.length === 0) return;
    setBulkLoading(true); setBulkResult(null);
    try {
      const res = await apiFetch(`${API_BASE}/api/regulation-tests/${testId}/invitations/bulk`, {
        method: 'POST',
        body: JSON.stringify({ invitations: valid.map((e) => ({ name: e.name, email: e.email })), sendEmail: sendEmailOnCreate, frontendBaseUrl: FRONTEND_BASE }),
      });
      if (res.ok) { setBulkResult(await res.json()); loadData(); }
      else { const err = await res.json(); setSnackbar({ open: true, message: `Ошибка: ${err.error || 'Неизвестно'}`, severity: 'error' }); }
    } catch { setSnackbar({ open: true, message: 'Ошибка создания', severity: 'error' }); }
    finally { setBulkLoading(false); }
  };

  const closeBulkDialog = () => {
    setBulkDialogOpen(false); setPasteText(''); setParsedEmployees([]); setBulkResult(null); setBulkTab(0);
  };

  // ---- Results ----
  const handleViewDetails = async (sessionId: number) => {
    try {
      const res = await apiFetch(`${API_BASE}/api/regulation-tests/results/${sessionId}`);
      if (res.ok) { setSelectedSession(await res.json()); setDetailsDialogOpen(true); }
    } catch { /* ignore */ }
  };

  const handleExportExcel = async () => {
    if (!testDetails || results.length === 0) return;
    setExporting(true);
    try {
      const sessionDetails: SessionDetail[] = [];
      for (const r of results.filter((r) => r.status === 'finished')) {
        try {
          const res = await apiFetch(`${API_BASE}/api/regulation-tests/results/${r.sessionId}`);
          if (res.ok) sessionDetails.push(await res.json());
        } catch { /* skip */ }
      }
      await exportRegulationTestResults({ testTitle: testDetails.title, results, sessionDetails });
    } catch { alert(_(msg`Ошибка экспорта`)); }
    finally { setExporting(false); }
  };

  // ---- Status helpers ----
  const getRowStatus = (row: MergedRow): { label: string; color: 'success' | 'warning' | 'default' | 'info' | 'error' } => {
    if (!row.result) {
      if (row.invitation?.expiresAt && new Date(row.invitation.expiresAt) < new Date()) {
        return { label: _(msg`Ссылка истекла`), color: 'error' };
      }
      return { label: _(msg`Ожидает`), color: 'default' };
    }
    if (row.result.status === 'finished') return { label: _(msg`Завершён`), color: 'success' };
    if (row.result.status === 'started') return { label: _(msg`В процессе`), color: 'warning' };
    return { label: _(msg`Новый`), color: 'info' };
  };

  // ---- Filtered rows ----
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter((r) =>
      (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.department || '').toLowerCase().includes(q)
    );
  }, [rows, searchQuery]);

  // ---- Stats ----
  const finishedResults = results.filter((r) => r.status === 'finished');
  const avgScore = finishedResults.length > 0
    ? Math.round(finishedResults.reduce((sum, r) => sum + (r.score || 0), 0) / finishedResults.length) : 0;
  const validCount = parsedEmployees.filter((e) => e.valid).length;
  const invalidCount = parsedEmployees.filter((e) => !e.valid).length;
  const namedInvitations = invitations.filter((i) => i.type === 'named');
  const waitingCount = rows.filter((r) => !r.result).length;

  return (
    <PageContainer title={_(msg`Участники теста`)} description="Участники и результаты тестирования">
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link href="/hr" underline="hover" color="inherit"><Trans>Главная</Trans></Link>
        <Link href="/hr/regulation-tests" underline="hover" color="inherit"><Trans>Тесты</Trans></Link>
        <Typography color="text.primary">{testDetails?.title || '...'}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4">{testDetails?.title || '...'}</Typography>
          {testDetails?.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{testDetails.description}</Typography>
          )}
        </Box>
        <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={handleExportExcel} disabled={exporting || results.length === 0}>
          {exporting ? _(msg`Экспорт...`) : _(msg`Excel`)}
        </Button>
      </Box>

      <RegulationTestTabs testId={testId} />

      {/* New test banner */}
      {newBannerVisible && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNewBannerVisible(false)}>
          <Typography variant="subtitle2" gutterBottom><Trans>Тест создан!</Trans></Typography>
          <Typography variant="body2"><Trans>Пригласите сотрудников — импортируйте список или создайте общую ссылку.</Trans></Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button size="small" variant="outlined" startIcon={<GroupAddIcon />} onClick={() => { setNewBannerVisible(false); setBulkDialogOpen(true); }}>
              <Trans>Импорт списка</Trans>
            </Button>
            <Button size="small" variant="outlined" startIcon={<LinkIcon />} disabled={creatingGeneralLink} onClick={() => { setNewBannerVisible(false); handleGeneralLinkClick(); }}>
              <Trans>Общая ссылка</Trans>
            </Button>
          </Box>
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="h5">{namedInvitations.length}</Typography>
            <Typography variant="caption" color="text.secondary"><Trans>Приглашено</Trans></Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="h5" color={waitingCount > 0 ? 'warning.main' : undefined}>{waitingCount}</Typography>
            <Typography variant="caption" color="text.secondary"><Trans>Ожидают</Trans></Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="h5" color="success.main">{finishedResults.length}</Typography>
            <Typography variant="caption" color="text.secondary"><Trans>Завершено</Trans></Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="h5" color="primary.main">{avgScore > 0 ? `${avgScore}%` : '—'}</Typography>
            <Typography variant="caption" color="text.secondary"><Trans>Средний балл</Trans></Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Actions row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder={_(msg`Поиск по имени или email...`)}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 220, maxWidth: 300 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>,
          }}
        />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button size="small" variant="outlined" startIcon={<GroupAddIcon />} onClick={() => setBulkDialogOpen(true)}>
          <Trans>Массовый импорт</Trans>
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={generalInvitations.length > 0 ? <ContentCopyIcon /> : <LinkIcon />}
            onClick={handleGeneralLinkClick}
            disabled={creatingGeneralLink}
            sx={{}}
          >
            {creatingGeneralLink
              ? <Trans>Создаём...</Trans>
              : generalInvitations.length > 0
                ? <Trans>Скопировать ссылку</Trans>
                : <Trans>Общая ссылка</Trans>}
          </Button>
          {generalInvitations.length > 0 && (
            <Tooltip title={_(msg`Удалить общую ссылку`)}>
              <IconButton
                size="small"
                onClick={() => handleDeleteInvitation(generalInvitations[0].id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          <Trans>Пригласить</Trans>
        </Button>
      </Box>
      </Box>

      {/* ---- UNIFIED TABLE ---- */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><Trans>Сотрудник</Trans></TableCell>
                <TableCell>Email</TableCell>
                <TableCell><Trans>Статус</Trans></TableCell>
                <TableCell><Trans>Балл</Trans></TableCell>
                <TableCell><Trans>Дата</Trans></TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell></TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    {searchQuery ? (
                      <>
                        <SearchIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary"><Trans>Ничего не найдено</Trans></Typography>
                      </>
                    ) : (
                      <>
                        <HourglassEmptyIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary" gutterBottom><Trans>Нет участников</Trans></Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          <Trans>Пригласите сотрудников для прохождения теста</Trans>
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button size="small" variant="outlined" startIcon={<GroupAddIcon />} onClick={() => setBulkDialogOpen(true)}>
                            <Trans>Импорт</Trans>
                          </Button>
                          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                            <Trans>Пригласить</Trans>
                          </Button>
                        </Box>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ) : filteredRows.map((row) => {
                const status = getRowStatus(row);
                const hasResult = !!row.result;
                const isFinished = row.result?.status === 'finished';

                return (
                  <TableRow
                    key={row.key}
                    hover
                    onClick={() => isFinished && handleViewDetails(row.result!.sessionId)}
                    sx={{
                      opacity: !hasResult ? 0.7 : 1,
                      cursor: isFinished ? 'pointer' : 'default',
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    {/* Сотрудник */}
                    <TableCell>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          lineHeight: 1.3,
                          color: isFinished ? 'primary.main' : 'text.primary',
                          fontWeight: isFinished ? 600 : 400,
                          '&:hover': isFinished ? { textDecoration: 'underline' } : {},
                        }}
                      >
                        {row.name || '—'}
                      </Typography>
                      {row.department && (
                        <Typography variant="caption" color="text.secondary">{row.department}</Typography>
                      )}
                    </TableCell>

                    {/* Email */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{row.email || '—'}</Typography>
                    </TableCell>

                    {/* Статус */}
                    <TableCell>
                      <Chip label={status.label} size="small" color={status.color} />
                    </TableCell>

                    {/* Балл */}
                    <TableCell>
                      {row.result?.score != null ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="subtitle2"
                            color={row.result.score >= 70 ? 'success.main' : row.result.score >= 40 ? 'warning.main' : 'error.main'}
                            sx={{ fontWeight: 700, minWidth: 36 }}
                          >
                            {row.result.score}%
                          </Typography>
                          {isFinished && (
                            <Box sx={{ width: 60 }}>
                              <LinearProgress
                                variant="determinate"
                                value={row.result.score}
                                color={row.result.score >= 70 ? 'success' : row.result.score >= 40 ? 'warning' : 'error'}
                                sx={{ height: 5, borderRadius: 1 }}
                              />
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.disabled">—</Typography>
                      )}
                    </TableCell>

                    {/* Дата */}
                    <TableCell>
                      {hasResult ? (
                        <Box>
                          <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.4 }}>
                            {new Date(row.result!.startedAt).toLocaleDateString('ru-RU')}
                          </Typography>
                          {row.result!.finishedAt && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                              {new Date(row.result!.finishedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          )}
                        </Box>
                      ) : row.invitation ? (
                        <Typography variant="caption" color="text.secondary">
                          <Trans>Приглашён</Trans> {new Date(row.invitation.createdAt).toLocaleDateString('ru-RU')}
                        </Typography>
                      ) : '—'}
                    </TableCell>

                    {/* Действия */}
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                      {hasResult && (
                        <Tooltip title={_(msg`Посмотреть ответы`)}>
                          <IconButton size="small" onClick={() => handleViewDetails(row.result!.sessionId)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {row.invitation && !isFinished && (
                        <>
                          <Tooltip title={_(msg`Скопировать персональную ссылку для прохождения теста. Отправьте её сотруднику.`)}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
                              onClick={() => handleCopyLink(row.invitation!.token)}
                              sx={{ fontSize: '0.7rem', py: 0.3, px: 1, minWidth: 0, textTransform: 'none' }}
                            >
                              <Trans>Ссылка на тест</Trans>
                            </Button>
                          </Tooltip>
                          {row.invitation.email && !hasResult && (
                            <Tooltip title={_(msg`Отправить приглашение на email`)}>
                              <IconButton size="small" onClick={() => handleSendEmail(row.invitation!.id)}>
                                <EmailIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {!hasResult && (
                            <Tooltip title={_(msg`Удалить приглашение`)}>
                              <IconButton size="small" onClick={() => handleDeleteInvitation(row.invitation!.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ---- Dialog: named invitation ---- */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle><Trans>Пригласить сотрудника</Trans></DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label={_(msg`Email сотрудника`)}
              type="email"
              fullWidth
              required
              autoFocus
              value={invEmail}
              onChange={(e) => setInvEmail(e.target.value)}
              placeholder="employee@company.com"
              error={!!invEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invEmail)}
              helperText={invEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invEmail) ? _(msg`Некорректный email`) : ''}
            />
            <TextField
              label={_(msg`Имя / ФИО`)}
              fullWidth
              value={invName}
              onChange={(e) => setInvName(e.target.value)}
              placeholder={_(msg`Иванов Иван`)}
            />
            <TextField
              label={_(msg`Срок действия (дней)`)}
              type="number"
              fullWidth
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 1, max: 365 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}><Trans>Отмена</Trans></Button>
          <Button variant="contained" onClick={handleCreateNamedInvitation} disabled={!invEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invEmail)}><Trans>Пригласить</Trans></Button>
        </DialogActions>
      </Dialog>

      {/* ---- Dialog: bulk import ---- */}
      <Dialog open={bulkDialogOpen} onClose={closeBulkDialog} maxWidth="md" fullWidth>
        <DialogTitle><Trans>Массовый импорт</Trans></DialogTitle>
        <DialogContent>
          {bulkResult ? (
            <Box sx={{ py: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                <Trans>Создано: <strong>{bulkResult.created}</strong></Trans>
                {sendEmailOnCreate && <Box component="span"> | <Trans>Email: <strong>{bulkResult.emailsSent}</strong></Trans></Box>}
              </Alert>
              {bulkResult.errors.length > 0 && (
                <Alert severity="warning">
                  <Trans>Ошибки ({bulkResult.errors.length}):</Trans>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                    {bulkResult.errors.map((e: any, i: number) => <li key={i}>{e.email}: {e.error}</li>)}
                  </ul>
                </Alert>
              )}
            </Box>
          ) : (
            <Box sx={{ pt: 1 }}>
              <Tabs value={bulkTab} onChange={(_, v) => setBulkTab(v)} sx={{ mb: 2 }}>
                <Tab label={_(msg`Вставить список`)} />
                <Tab label={_(msg`Загрузить Excel`)} />
              </Tabs>
              {bulkTab === 0 && (
                <TextField multiline rows={8} fullWidth placeholder={`Иванов Иван;ivan@company.com\nПетрова Мария;maria@company.com\nили просто email@company.com`} value={pasteText} onChange={(e) => handlePasteChange(e.target.value)} helperText={_(msg`Формат: Имя;Email — по одному на строку`)} />
              )}
              {bulkTab === 1 && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                    <Trans>Выбрать .xlsx</Trans>
                    <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                  </Button>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <Trans>Столбцы &quot;Имя&quot; и &quot;Email&quot;</Trans>
                  </Typography>
                </Box>
              )}
              {parsedEmployees.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom><Trans>Предпросмотр: {validCount} ОК, {invalidCount} ошибок</Trans></Typography>
                  <TableContainer sx={{ maxHeight: 250 }}>
                    <Table size="small" stickyHeader>
                      <TableHead><TableRow><TableCell><Trans>Имя</Trans></TableCell><TableCell>Email</TableCell><TableCell></TableCell></TableRow></TableHead>
                      <TableBody>
                        {parsedEmployees.map((emp, i) => (
                          <TableRow key={i} sx={{ bgcolor: emp.valid ? undefined : 'error.lighter' }}>
                            <TableCell>{emp.name}</TableCell>
                            <TableCell>{emp.email}</TableCell>
                            <TableCell>{emp.valid ? <Chip label="OK" size="small" color="success" /> : <Chip label={emp.error || 'Ошибка'} size="small" color="error" />}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
              <FormControlLabel control={<Checkbox checked={sendEmailOnCreate} onChange={(e) => setSendEmailOnCreate(e.target.checked)} />} label={_(msg`Отправить email-приглашения`)} sx={{ mt: 2 }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBulkDialog}>{bulkResult ? _(msg`Закрыть`) : _(msg`Отмена`)}</Button>
          {!bulkResult && (
            <Button variant="contained" onClick={handleBulkCreate} disabled={validCount === 0 || bulkLoading} startIcon={bulkLoading ? <CircularProgress size={18} /> : <GroupAddIcon />}>
              {bulkLoading ? _(msg`Создаём...`) : _(msg`Создать ${validCount} приглашений`)}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ---- Dialog: session details ---- */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle><Trans>Детали результата</Trans></DialogTitle>
        <DialogContent>
          {selectedSession && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary"><Trans>Сотрудник</Trans></Typography>
                <Typography variant="body1">{selectedSession.employee.name} ({selectedSession.employee.email})</Typography>
                {selectedSession.employee.department && (
                  <Typography variant="body2" color="text.secondary"><Trans>Отдел: {selectedSession.employee.department}</Trans></Typography>
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary"><Trans>Итоговый балл</Trans></Typography>
                <Typography variant="h4" color={
                  (selectedSession.score ?? 0) >= 70 ? 'success.main' : (selectedSession.score ?? 0) >= 40 ? 'warning.main' : 'error.main'
                }>{selectedSession.score}%</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom><Trans>Ответы:</Trans></Typography>
              {selectedSession.answers.map((answer, index) => (
                <Card key={index} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip label={answer.regulation.title} size="small" variant="outlined" />
                    <Chip label={`${answer.score}%`} size="small" color={answer.score >= 70 ? 'success' : 'error'} />
                  </Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}><Trans>Вопрос:</Trans></Typography>
                  <Typography variant="body2">{answer.questionText}</Typography>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}><Trans>Ответ:</Trans></Typography>
                  {(answer.videoFilename || answer.audioFilename) && (
                    <Box sx={{ mb: 2 }}>
                      {answer.videoFilename ? (
                        <video controls style={{ width: '100%', maxHeight: '400px', borderRadius: '8px' }} src={`${API_BASE}/uploads/${answer.videoFilename}`} />
                      ) : answer.audioFilename ? (
                        <audio controls style={{ width: '100%' }} src={`${API_BASE}/uploads/${answer.audioFilename}`} />
                      ) : null}
                      {answer.processingStatus === 'transcribing' && <Alert severity="info" sx={{ mt: 1 }}><Trans>Распознавание речи...</Trans></Alert>}
                      {answer.processingStatus === 'pending' && <Alert severity="info" sx={{ mt: 1 }}><Trans>Ожидает обработки...</Trans></Alert>}
                      {answer.processingStatus === 'evaluating' && <Alert severity="info" sx={{ mt: 1 }}><Trans>Идёт оценка...</Trans></Alert>}
                    </Box>
                  )}
                  {answer.transcription && (
                    <Paper sx={{ p: 2, bgcolor: 'background.paper', mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block"><Trans>Транскрипция:</Trans></Typography>
                      <Typography variant="body2">{answer.transcription}</Typography>
                    </Paper>
                  )}
                  {answer.answerText && !answer.transcription && !answer.videoFilename && !answer.audioFilename && (
                    <Paper sx={{ p: 2, bgcolor: 'background.paper' }}><Typography variant="body2">{answer.answerText}</Typography></Paper>
                  )}
                  {answer.aiComment && (
                    <Paper sx={{ p: 1.5, mt: 2, bgcolor: answer.score >= 70 ? 'success.lighter' : answer.score >= 40 ? 'warning.lighter' : 'error.lighter', border: '1px solid', borderColor: answer.score >= 70 ? 'success.light' : answer.score >= 40 ? 'warning.light' : 'error.light' }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}><Trans>Оценка AI</Trans></Typography>
                      <Typography variant="body2" color="text.primary">{answer.aiComment}</Typography>
                    </Paper>
                  )}
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}><Trans>Закрыть</Trans></Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </PageContainer>
  );
}
