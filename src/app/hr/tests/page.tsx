"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
} from "@mui/material";
import DataTable from "@/components/DataTable";
import { apiFetch } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface TemplateRow {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  questionsCount: number;
  allowFollowups?: boolean; // сервер пока не отдаёт – вычислим позже при деталях
  followupsEnabled?: boolean;
}

export default function TestsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [rows, setRows] = useState<TemplateRow[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("recruitment_token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    apiFetch(`${API_BASE}/api/admin/templates?limit=1000`)
      .then((r) => r.json())
      .then((d) => {
        const items = Array.isArray(d) ? d : d.items || [];
        setRows(items);
      });
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
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}
      >
        <Typography variant="h4">Тесты</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            placeholder="Поиск..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="contained" href="/hr/template/new">
            Новый тест
          </Button>
        </Box>
      </Box>

      <DataTable
        columns={[
          {
            field: "id",
            header: "ID",
            render: (r: TemplateRow) => <a href={`/hr/template/${r.id}`}>{r.id}</a>,
          },
          { field: "title", header: "Название" },
          {
            field: "questionsCount",
            header: "Вопросов",
          },
          {
            field: "followupsEnabled",
            header: "Уточнения",
            render: (r:TemplateRow)=> r.followupsEnabled? <Chip size="small" color="success" label="да"/> : null,
          },
          { field:"createdAt", header:"Создан" },
        ]}
        rows={filtered}
      />
    </Box>
  );
} 