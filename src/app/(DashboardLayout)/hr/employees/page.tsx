"use client";
import { useEffect, useState } from "react";
import { Box, Paper, Typography, Stack, TextField, MenuItem, Button, Divider, Alert, IconButton, Avatar, Tooltip } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import DownloadIcon from "@mui/icons-material/Download";
import PageContainer from "@/app/components/container/PageContainer";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

function stringAvatar(name: string) {
  if (!name) return { children: "?" };
  const parts = name.split(" ");
  return {
    children: parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : name[0],
  };
}

export default function EmployeesPage() {
  const [phone, setPhone] = useState("");
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
      const currentCompanyId = localStorage.getItem("current_company");
      if (currentCompanyId) {
        const userCompaniesRes = await apiFetch(`${API_BASE}/api/user/companies`);
        if (userCompaniesRes.ok) {
          const userCompanies = await userCompaniesRes.json();
          const currentCompany = userCompanies.find((c: any) => c.id == currentCompanyId);
          if (currentCompany) {
            setUserRole(currentCompany.role);
            setIsLead(currentCompany.role === 'HR_LEAD');
          }
        }
      }

      const res = await apiFetch(`${API_BASE}/api/company/${localStorage.getItem("current_company")}/invites`);
      if (!res.ok) {
        if (res.status === 403) {
          setError("Нет доступа к управлению сотрудниками. Требуются права HR-Лидера.");
          setInvites([]);
        } else {
          setError("Ошибка загрузки приглашений");
          setInvites([]);
        }
      } else {
        const invitesData = await res.json();
        setInvites(Array.isArray(invitesData) ? invitesData : []);
      }

      const res2 = await apiFetch(`${API_BASE}/api/company/${localStorage.getItem("current_company")}/employees`);
      if (!res2.ok) {
        if (res2.status === 403) {
          setError("Нет доступа к управлению сотрудниками. Требуются права HR-Лидера.");
          setEmployees([]);
        } else {
          setError("Ошибка загрузки сотрудников");
          setEmployees([]);
        }
      } else {
        const employeesData = await res2.json();
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
      }
    } catch (err: any) {
      setError("Ошибка загрузки данных");
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
      body: JSON.stringify({ phone, role })
    });
    const data = await res.json();
    if (data.ok) {
      setSuccess("Приглашение отправлено!");
      setPhone("");
      load();
    } else {
      setError(data.error || "Ошибка");
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    const res = await apiFetch(`${API_BASE}/api/company/${localStorage.getItem("current_company")}/employee/${id}/remove`, { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      setSuccess("Сотрудник удалён");
      load();
    } else {
      setError(data.error || "Ошибка");
    }
    setLoading(false);
  };
  const handleMakeLead = async (id: number) => {
    setLoading(true);
    const res = await apiFetch(`${API_BASE}/api/company/${localStorage.getItem("current_company")}/employee/${id}/make-lead`, { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      setSuccess("Сотрудник повышен до HR-Лидера");
      load();
    } else {
      setError(data.error || "Ошибка");
    }
    setLoading(false);
  };
  const handleRevokeInvite = async (id: number) => {
    setLoading(true);
    const res = await apiFetch(`${API_BASE}/api/company/${localStorage.getItem("current_company")}/invite/${id}/revoke`, { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      setSuccess("Приглашение отозвано");
      load();
    } else {
      setError(data.error || "Ошибка");
    }
    setLoading(false);
  };

  const exportCSV = () => {
    const rows = employees.map((e: any) => ({
      Имя: e.name || e.phone,
      Телефон: e.phone,
      Email: e.email || "",
      Роль: e.role,
      "Дата добавления": e.createdAt || "-",
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
    { field: "name", headerName: "Имя", flex: 1 },
    { field: "phone", headerName: "Телефон", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Роль", flex: 1 },
    { field: "createdAt", headerName: "Добавлен", flex: 1 },
    {
      field: "actions",
      headerName: "Действия",
      width: 180,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          {isLead && params.row.role === "HR" && (
            <Tooltip title="Сделать лидером"><IconButton color="primary" onClick={() => handleMakeLead(params.row.id)}><StarIcon /></IconButton></Tooltip>
          )}
          {isLead && (
            <Tooltip title="Удалить"><IconButton color="error" onClick={() => handleDelete(params.row.id)}><DeleteIcon /></IconButton></Tooltip>
          )}
        </Stack>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <PageContainer title="Сотрудники компании">
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
            <Typography variant="h5">Сотрудники компании</Typography>
            {isLead && (
              <Button startIcon={<DownloadIcon />} onClick={exportCSV} variant="outlined">Экспорт в CSV</Button>
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
            <Typography variant="h6" gutterBottom>Пригласить сотрудника</Typography>
            <Stack direction="row" spacing={1} mb={2}>
              <TextField value={phone} onChange={e => setPhone(e.target.value)} size="small" label="Телефон" />
              <TextField select value={role} onChange={e => setRole(e.target.value)} size="small" label="Роль" sx={{ width: 120 }}>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="HR_LEAD">HR-Лидер</MenuItem>
              </TextField>
              <Button variant="contained" onClick={sendInvite} disabled={!phone.trim()}>Отправить</Button>
            </Stack>
          </Paper>
        )}

        <Paper sx={{ p: 4, width: "100%", maxWidth: 1100 }}>
          <Typography variant="h6" gutterBottom>Отправленные приглашения</Typography>
          <Box sx={{ height: 300, width: "100%" }}>
            <DataGrid
              rows={(Array.isArray(invites) ? invites : []).map((inv: any, idx: number) => ({
                id: inv.id,
                phone: inv.phone,
                role: inv.role,
                createdAt: inv.createdAt,
                status: "Ожидает", // можно доработать если появится статус
              }))}
              columns={[
                { field: "phone", headerName: "Телефон", flex: 1 },
                { field: "role", headerName: "Роль", flex: 1 },
                { field: "createdAt", headerName: "Дата", flex: 1 },
                { field: "status", headerName: "Статус", flex: 1 },
                {
                  field: "actions",
                  headerName: "Действия",
                  width: 120,
                  renderCell: (params) => (
                    isLead ? (
                      <Button color="error" onClick={() => handleRevokeInvite(params.row.id)}>Отозвать</Button>
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