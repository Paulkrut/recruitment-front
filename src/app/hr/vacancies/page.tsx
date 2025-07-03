"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  TextField,
} from "@mui/material";
import { apiFetch } from "@/utils/api";
import DataTable from "@/components/DataTable";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface VacancyRow {
  id: number;
  title: string;
  description?: string;
  templateId?: number | null;
  candidatesTotal?: number;
  candidatesFinished?: number;
  candidatesInProgress?: number;
}

export default function VacanciesPage() {
  const [token, setToken] = useState<string | null>(null);
  const [rows, setRows] = useState<VacancyRow[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("recruitment_token");
    if (t) setToken(t);
  }, []);
  useEffect(() => {
    if (!token) return;
    apiFetch(`${API_BASE}/api/admin/vacancies`)
      .then((r) => r.json())
      .then(setRows);
  }, [token]);

  if (!token) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Нет доступа</Typography>
      </Box>
    );
  }

  const filtered = rows.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Вакансии</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="contained" href="/hr/vacancies/new" size="small">
            Новая
          </Button>
        </Box>
      </Box>

      <DataTable
        columns={[
          {
            field: "id",
            header: "ID",
            render: (row: VacancyRow) => (
              <a href={`/hr/vacancies/${row.id}`}>{row.id}</a>
            ),
          },
          { field: "title", header: "Название" },
          {
            field: "templateId",
            header: "Тест",
            render: (r: VacancyRow) =>
              r.templateId ? (
                <a href={`/hr/template/${r.templateId}`}>{r.templateId}</a>
              ) : (
                "-"
              ),
          },
          {
            field: "candidatesTotal",
            header: "Прогресс",
            render: (r: VacancyRow) => {
              if (!r.candidatesTotal) return "-";
              const done = r.candidatesFinished || 0;
              const percent = Math.round((done / r.candidatesTotal) * 100);
              return (
                <Box sx={{ minWidth: 120 }}>
                  <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption">
                    {done}/{r.candidatesTotal}
                  </Typography>
                </Box>
              );
            },
          },
        ]}
        rows={filtered}
      />
    </Box>
  );
} 