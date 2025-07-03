"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { apiFetch } from "@/utils/api";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import DataTable from "@/components/DataTable";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface Vacancy {
  id: number;
  title: string;
  description?: string;
  templateId?: number | null;
}

interface TemplateRow {
  id: number;
  title: string;
  questionsCount?: number;
  actions?: any;
}

export default function VacancyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [vac, setVac] = useState<Vacancy | null>(null);
  const [copyOpen, setCopyOpen] = useState(false);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [tplSearch, setTplSearch] = useState("");
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const t = localStorage.getItem("recruitment_token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    apiFetch(`${API_BASE}/api/admin/vacancies/${id}`)
      .then((r) => r.json())
      .then(setVac);
  }, [token, id]);

  useEffect(() => {
    if (!token || !copyOpen) return;
    apiFetch(`${API_BASE}/api/admin/templates?limit=1000`)
      .then((r) => r.json())
      .then((d) => setTemplates(Array.isArray(d) ? d : d.items || []));
  }, [token, copyOpen]);

  if (!token) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Нет доступа</Typography>
      </Box>
    );
  }

  if (!vac) return null;

  const { title, description, templateId } = vac;

  async function onSelectTemplate(tid: number) {
    if (templateId) {
      if (!confirm('Новый шаблон заменит текущий. Продолжить?')) return;
    }
    await apiFetch(`${API_BASE}/api/admin/vacancies/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: tid })
    });
    setCopyOpen(false);
    // reload vacancy
    apiFetch(`${API_BASE}/api/admin/vacancies/${id}`)
      .then(r => r.json())
      .then(setVac);
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography sx={{ mb: 2 }} whiteSpace="pre-line">
          {description}
        </Typography>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{display:'flex',alignItems:'center',justifyContent:'space-between',mb:1}}>
          <Typography variant="h6">Тест</Typography>
          <IconButton onClick={(e)=>setMenuAnchor(e.currentTarget)} size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>
        <Box>
          {templateId && (
            <Typography sx={{ mb: 1 }}>
              Шаблон: <a href={`/hr/template/${templateId}`}>{templateId}</a>
            </Typography>
          )}

          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={()=>setMenuAnchor(null)}>
            {templateId && (
              <MenuItem onClick={()=>{setMenuAnchor(null);router.push(`/hr/template/${templateId}/edit`);}}>
                <EditIcon fontSize="small" sx={{mr:1}}/> Редактировать текущий тест
              </MenuItem>
            )}
            <MenuItem onClick={()=>{setMenuAnchor(null);router.push(`/hr/template/new?vacancy=${id}`);}}>
              <AddIcon fontSize="small" sx={{mr:1}}/> Новый тест
            </MenuItem>
            <MenuItem onClick={()=>{setMenuAnchor(null);setCopyOpen(true);}}>
              <ContentCopyIcon fontSize="small" sx={{mr:1}}/> Заменить (копировать…)
            </MenuItem>
          </Menu>
        </Box>
      </Paper>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          href={`/hr/vacancies/${id}/edit`}
          size="small"
        >
          Редактировать вакансию
        </Button>
        <Button
          variant="outlined"
          href={`/hr/vacancies/${id}/candidates`}
          size="small"
        >
          Кандидаты
        </Button>
      </Box>

      {/* Copy template dialog */}
      <Dialog open={copyOpen} onClose={() => setCopyOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Выберите шаблон для копирования</DialogTitle>
        <DialogContent>
          <TextField
            placeholder="Поиск..."
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            value={tplSearch}
            onChange={(e) => setTplSearch(e.target.value)}
          />
          <DataTable
            columns={[
              { field: "id", header: "ID", render: (r: TemplateRow) => r.id },
              { field: "title", header: "Название" },
              { field: "questionsCount", header: "Вопросов" },
              { field: "actions", header: "", render: (r: TemplateRow) => (<Button size="small" onClick={() => onSelectTemplate(r.id)}>Выбрать</Button>) }
            ]}
            rows={templates.filter((t) => t.title.toLowerCase().includes(tplSearch.toLowerCase()))}
            defaultRowsPerPage={5}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyOpen(false)}>Отмена</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 