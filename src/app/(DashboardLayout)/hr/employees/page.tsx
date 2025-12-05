"use client";
import { useEffect, useState } from "react";
import { Box, Paper, Typography, Stack, TextField, MenuItem, Button, Divider, Alert, IconButton, Avatar, Tooltip } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import DownloadIcon from "@mui/icons-material/Download";
import PageContainer from "@/app/components/container/PageContainer";
import { apiFetch } from "@/utils/api";
import { useUser } from "@/contexts/UserContext";
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';
import { getErrorMessage } from '@/utils/errorTranslator';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

function stringAvatar(name: string) {
  if (!name) return { children: "?" };
  const parts = name.split(" ");
  return {
    children: parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : name[0],
  };
}

export default function EmployeesPage() {
  const { currentCompany, refreshInvites } = useUser();
  const { _, i18n } = useLingui();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("HR");
  const [invites, setInvites] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>("HR");
  const [isLead, setIsLead] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Определяем роль пользователя в текущей компании
      if (currentCompany) {
        setUserRole(currentCompany.role);
        setIsLead(currentCompany.role === 'HR_LEAD');
      }

      // Загружаем приглашения через UserContext
      await refreshInvites();

      const res = await apiFetch(`${API_BASE}/api/company/${localStorage.getItem("current_company")}/invites`);
      if (!res.ok) {
        const data = await res.json();
        // Backend: {error: 'common.forbidden'} или другие коды
        if (res.status === 403) {
          const errorMessage = data.error ? i18n._(getErrorMessage(data.error)) : _(msg`Нет доступа к управлению сотрудниками. Требуются права HR-Лидера.`);
          setError(errorMessage);
          setInvites([]);
        } else {
          const errorMessage = data.error ? i18n._(getErrorMessage(data.error)) : _(msg`Ошибка загрузки приглашений`);
          setError(errorMessage);
          setInvites([]);
        }
      } else {
        const invitesData = await res.json();
        setInvites(Array.isArray(invitesData) ? invitesData : []);
      }

      const res2 = await apiFetch(`${API_BASE}/api/company/${localStorage.getItem("current_company")}/employees`);
      if (!res2.ok) {
        const data = await res2.json();
        // Backend: {error: 'common.forbidden'} или другие коды
        if (res2.status === 403) {
          const errorMessage = data.error ? i18n._(getErrorMessage(data.error)) : _(msg`Нет доступа к управлению сотрудниками. Требуются права HR-Лидера.`);
          setError(errorMessage);
          setEmployees([]);
        } else {
          const errorMessage = data.error ? i18n._(getErrorMessage(data.error)) : _(msg`Ошибка загрузки сотрудников`);
          setError(errorMessage);
          setEmployees([]);
        }
      } else {
        const employeesData = await res2.json();
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
      }
    } catch (err: any) {
      setError(_(msg`Ошибка загрузки данных`));
      setInvites([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const sendInvite = async () => {
    setError(null); setSuccess(null);
    const res = await apiFetch(`${API_BASE}/api/company/${localStorage.getItem("current_company")}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role })
    });
    const data = await res.json();
    if (data.ok) {
      if (data.emailSent) {
        setSuccess(_(msg`Приглашение отправлено! Email с приглашением отправлен на ${email}`));
      } else {
        setSuccess(_(msg`Приглашение создано, но email не отправлен. Проверьте настройки почты.`));
      }
      setEmail("");
      load();
    } else {
      // Backend: {error: 'company.valid_email_required'}, {error: 'company.already_invited'}
      const errorMessage = data.error ? i18n._(getErrorMessage(data.error)) : _(msg`Ошибка`);
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    const res = await apiFetch(`${API_BASE}/api/company/${localStorage.getItem("current_company")}/employee/${id}/remove`, { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      setSuccess(_(msg`Сотрудник удалён`));
      load();
    } else {
      // Backend: {error: 'common.forbidden'}, {error: 'company.cant_remove_self'}
      const errorMessage = data.error ? i18n._(getErrorMessage(data.error)) : _(msg`Ошибка`);
      setError(errorMessage);
    }
    setLoading(false);
  };
  const handleMakeLead = async (id: number) => {
    setLoading(true);
    const res = await apiFetch(`${API_BASE}/api/company/${localStorage.getItem("current_company")}/employee/${id}/make-lead`, { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      setSuccess(_(msg`Сотрудник повышен до HR-Лидера`));
      load();
    } else {
      // Backend: {error: 'common.forbidden'}
      const errorMessage = data.error ? i18n._(getErrorMessage(data.error)) : _(msg`Ошибка`);
      setError(errorMessage);
    }
    setLoading(false);
  };
  const handleRevokeInvite = async (id: number) => {
    setLoading(true);
    const res = await apiFetch(`${API_BASE}/api/company/${localStorage.getItem("current_company")}/invite/${id}/revoke`, { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      setSuccess(_(msg`Приглашение отозвано`));
      load();
    } else {
      // Backend: {error: 'common.forbidden'}, {error: 'company.invite_not_found'}
      const errorMessage = data.error ? i18n._(getErrorMessage(data.error)) : _(msg`Ошибка`);
      setError(errorMessage);
    }
    setLoading(false);
  };

  const exportCSV = () => {
    const rows = employees.map((e: any) => ({
      [_(msg`Имя`)]: e.name || e.phone,
      [_(msg`Телефон`)]: e.phone,
      Email: e.email || "",
      [_(msg`Роль`)]: e.role,
      [_(msg`Дата добавления`)]: e.createdAt || "-",
    }));
    const csv = [Object.keys(rows[0]).join(",")].concat(rows.map(r => Object.values(r).join(","))).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      renderCell: (params) => (
        <Avatar {...stringAvatar(params.row.name)} />
      ),
      sortable: false,
      filterable: false,
    },
    { field: "name", headerName: _(msg`Имя`), flex: 1 },
    { field: "phone", headerName: _(msg`Телефон`), flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: _(msg`Роль`), flex: 1 },
    { field: "createdAt", headerName: _(msg`Добавлен`), flex: 1 },
    {
      field: "actions",
      headerName: _(msg`Действия`),
      width: 180,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          {isLead && params.row.role === "HR" && (
            <Tooltip title={_(msg`Сделать лидером`)}><IconButton color="primary" onClick={() => handleMakeLead(params.row.id)}><StarIcon /></IconButton></Tooltip>
          )}
          {isLead && (
            <Tooltip title={_(msg`Удалить`)}><IconButton color="error" onClick={() => handleDelete(params.row.id)}><DeleteIcon /></IconButton></Tooltip>
          )}
        </Stack>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <PageContainer title={_(msg`Сотрудники компании`)}>
      <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" pt={6} gap={4}>
        {error && (
          <Alert severity="error" sx={{ width: "100%", maxWidth: 1100 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ width: "100%", maxWidth: 1100 }}>
            {success}
          </Alert>
        )}
        <Paper sx={{ p: 4, width: "100%", maxWidth: 1100 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5"><Trans>Сотрудники компании</Trans></Typography>
            {isLead && (
              <Button startIcon={<DownloadIcon />} onClick={exportCSV} variant="outlined"><Trans>Экспорт в CSV</Trans></Button>
            )}
          </Stack>
          <Box sx={{ height: 480, width: "100%" }}>
            <DataGrid
              rows={employees.map((e: any, idx: number) => ({
                id: e.id,
                name: e.name || e.phone,
                phone: e.phone,
                email: e.email || "",
                role: e.role,
                createdAt: e.createdAt || "-",
              }))}
              columns={columns}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
              }}
              pageSizeOptions={[10, 20, 50]}
              disableRowSelectionOnClick
              autoHeight
              loading={loading}
            />
          </Box>
        </Paper>

        {isLead && (
          <Paper sx={{ p: 4, width: "100%", maxWidth: 1100 }}>
            <Typography variant="h6" gutterBottom><Trans>Пригласить сотрудника</Trans></Typography>
            <Stack direction="row" spacing={1} mb={2}>
              <TextField value={email} onChange={e => setEmail(e.target.value)} size="small" label="Email" />
              <TextField select value={role} onChange={e => setRole(e.target.value)} size="small" label={_(msg`Роль`)} sx={{ width: 120 }}>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="HR_LEAD"><Trans>HR-Лидер</Trans></MenuItem>
              </TextField>
              <Button variant="contained" onClick={sendInvite} disabled={!email.trim()}><Trans>Отправить</Trans></Button>
            </Stack>
          </Paper>
        )}

        <Paper sx={{ p: 4, width: "100%", maxWidth: 1100 }}>
          <Typography variant="h6" gutterBottom><Trans>Отправленные приглашения</Trans></Typography>
          <Box sx={{ height: 300, width: "100%" }}>
            <DataGrid
              rows={(Array.isArray(invites) ? invites : []).map((inv: any, idx: number) => ({
                id: inv.id,
                email: inv.email,
                role: inv.role,
                createdAt: inv.createdAt,
                status: _(msg`Ожидает`), // можно доработать если появится статус
              }))}
              columns={[
                { field: "email", headerName: "Email", flex: 1 },
                { field: "role", headerName: _(msg`Роль`), flex: 1 },
                { field: "createdAt", headerName: _(msg`Дата`), flex: 1 },
                { field: "status", headerName: _(msg`Статус`), flex: 1 },
                {
                  field: "actions",
                  headerName: _(msg`Действия`),
                  width: 120,
                  renderCell: (params) => (
                    isLead ? (
                      <Button color="error" onClick={() => handleRevokeInvite(params.row.id)}><Trans>Отозвать</Trans></Button>
                    ) : null
                  ),
                  sortable: false,
                  filterable: false,
                },
              ]}
              initialState={{
                pagination: { paginationModel: { pageSize: 5, page: 0 } },
              }}
              pageSizeOptions={[5, 10]}
              disableRowSelectionOnClick
              autoHeight
              loading={loading}
            />
          </Box>
        </Paper>
      </Box>
    </PageContainer>
  );
} 