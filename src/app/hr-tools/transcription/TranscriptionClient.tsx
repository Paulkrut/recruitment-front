"use client";

import * as React from "react";
import {
  Alert, Box, Button, CircularProgress, Collapse, Paper,
  Snackbar, Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";
import ToolLayout from "../components/ToolLayout";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

const ALLOWED_EXTENSIONS = ["mp3", "wav", "ogg", "m4a", "aac", "mp4", "webm", "mov"];
const MAX_SIZE_MB = 60;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " Б";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " КБ";
  return (bytes / (1024 * 1024)).toFixed(1) + " МБ";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface TranscriptionResult {
  rawText: string;
  text: string;
  language: string;
  filename: string;
}

export default function TranscriptionClient() {
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<TranscriptionResult | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [docxDownloaded, setDocxDownloaded] = React.useState(false);
  const [docxError, setDocxError] = React.useState("");
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = (f: File): string | null => {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Неподдерживаемый формат .${ext}. Допустимы: ${ALLOWED_EXTENSIONS.join(", ")}`;
    }
    if (f.size > MAX_SIZE_BYTES) {
      return `Файл слишком большой (${formatFileSize(f.size)}). Максимум ${MAX_SIZE_MB} МБ.`;
    }
    return null;
  };

  const handleFileSelect = (f: File) => {
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      return;
    }
    setFile(f);
    setError(null);
    setData(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFileSelect(selected);
  };

  const autoDownloadDocx = React.useCallback(async (result: TranscriptionResult) => {
    try {
      const response = await fetch(`${API_BASE}/api/public/hr-tools/export/transcription-docx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: result.text, filename: result.filename }),
      });
      if (!response.ok) throw new Error("DOCX generation failed");
      const blob = await response.blob();
      const safeName = result.filename.replace(/\.[^.]+$/, "").replace(/[^a-zA-Zа-яА-Я0-9]/gu, "-").slice(0, 40) || "transcription";
      downloadBlob(blob, `transcription-${safeName}-${new Date().toISOString().slice(0, 10)}.docx`);
      setDocxDownloaded(true);
    } catch {
      setDocxError("Не удалось автоматически скачать Word-файл.");
    }
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/api/public/hr-tools/transcribe`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Ошибка транскрибации");
      }

      setData(result.data);
      autoDownloadDocx(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.text);
      setCopied(true);
    } catch {
      /* fallback ignored */
    }
  };

  const handleDownloadDocxManual = async () => {
    if (!data) return;
    await autoDownloadDocx(data);
  };

  const isAudio = file && ["mp3", "wav", "ogg", "m4a", "aac"].includes(file.name.split(".").pop()?.toLowerCase() ?? "");

  return (
    <ToolLayout
      title="Транскрибация аудио и видео онлайн"
      description="Загрузите файл — получите текст и Word-документ."
      icon="mdi:microphone-message"
      iconColor="#1565C0"
      ctaLabel="Нужна транскрибация интервью?"
      ctaTitle="В SofiHR транскрибация встроена в AI-интервью"
      ctaDescription="Ответы кандидатов на видео-интервью распознаются автоматически, AI оценивает их и выставляет баллы. Всё в одной системе."
      ctaButtonText="Попробовать AI-интервью →"
      ctaFeatures={[
        { icon: "mdi:video-outline", text: "Видео-интервью с записью" },
        { icon: "mdi:text-recognition", text: "Автоматическая транскрибация" },
        { icon: "mdi:robot-outline", text: "AI-оценка ответов" },
        { icon: "mdi:chart-line", text: "Рейтинг кандидатов" },
      ]}
    >
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid #b8cfe8", bgcolor: "#fff", mb: 4 }}>
        {/* Drop zone */}
        <Box
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 3,
            border: dragOver ? "2px solid #1565C0" : "2px dashed #b8cfe8",
            bgcolor: dragOver ? "#e3f2fd" : "#fafcff",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": { borderColor: "#1565C0", bgcolor: "#f0f7ff" },
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.map(e => `.${e}`).join(",")}
            onChange={handleInputChange}
            style={{ display: "none" }}
          />
          <Box sx={{ mb: 2 }}>
            <Icon icon={file ? (isAudio ? "mdi:file-music-outline" : "mdi:file-video-outline") : "mdi:cloud-upload-outline"} width={48} height={48} color={file ? "#1565C0" : "#94a3b8"} />
          </Box>
          {file ? (
            <>
              <Typography sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: "1.05rem" }}>
                {file.name}
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.9rem", mt: 0.5 }}>
                {formatFileSize(file.size)} — нажмите, чтобы заменить
              </Typography>
            </>
          ) : (
            <>
              <Typography sx={{ fontWeight: 600, color: "#1a1a2e", fontSize: "1.05rem", mb: 0.5 }}>
                Перетащите файл сюда или нажмите для выбора
              </Typography>
              <Typography sx={{ color: "#94a3b8", fontSize: "0.88rem" }}>
                MP3, WAV, OGG, M4A, MP4, WEBM, MOV — до {MAX_SIZE_MB} МБ
              </Typography>
            </>
          )}
        </Box>

        <Button
          variant="contained" size="large" onClick={handleSubmit}
          disabled={loading || !file}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Icon icon="mdi:text-recognition" />}
          sx={{
            mt: 3, bgcolor: "#1565C0", color: "#fff", textTransform: "none",
            fontWeight: 600, px: 4, py: 1.5, fontSize: "1rem", borderRadius: 2,
            "&:hover": { bgcolor: "#0D47A1" }, "&:disabled": { bgcolor: "#cbd5e1" },
          }}
        >
          {loading ? "Транскрибируем..." : "Транскрибировать"}
        </Button>

        {loading && (
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <CircularProgress size={16} />
            <Typography sx={{ fontSize: "0.88rem", color: "#64748b" }}>
              Распознаём речь и улучшаем текст — это может занять до 2 минут...
            </Typography>
          </Box>
        )}
      </Paper>

      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>
      </Collapse>

      {data && (
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid #b7e4dd", bgcolor: "#fff", mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon icon="mdi:text-box-check-outline" width={24} height={24} color="#1565C0" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: "1.05rem" }}>Транскрибация готова</Typography>
                <Typography sx={{ fontSize: "0.84rem", color: "#64748b" }}>{data.filename}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                size="small" variant="outlined" onClick={handleCopy}
                startIcon={<Icon icon={copied ? "mdi:check" : "mdi:content-copy"} />}
                sx={{ textTransform: "none", borderRadius: 2, borderColor: "#b8cfe8", color: "#1565C0" }}
              >
                {copied ? "Скопировано" : "Копировать"}
              </Button>
              <Button
                size="small" variant="outlined" onClick={handleDownloadDocxManual}
                startIcon={<Icon icon="mdi:file-word-outline" />}
                sx={{ textTransform: "none", borderRadius: 2, borderColor: "#b8cfe8", color: "#1565C0" }}
              >
                Скачать Word
              </Button>
            </Box>
          </Box>

          <Box sx={{
            p: { xs: 2, md: 3 }, borderRadius: 2, border: "1px solid #dbe6f3",
            bgcolor: "#fafcff", whiteSpace: "pre-wrap", fontSize: "0.95rem",
            lineHeight: 1.8, color: "#334155", maxHeight: "600px", overflow: "auto",
          }}>
            {data.text}
          </Box>

          {data.rawText !== data.text && (
            <Box sx={{ mt: 3 }}>
              <details>
                <summary style={{ cursor: "pointer", color: "#94a3b8", fontSize: "0.85rem", marginBottom: "8px" }}>
                  Показать исходную транскрибацию (до улучшения AI)
                </summary>
                <Box sx={{
                  p: 2, borderRadius: 2, border: "1px dashed #e0e0e0",
                  bgcolor: "#fafafa", whiteSpace: "pre-wrap", fontSize: "0.88rem",
                  lineHeight: 1.7, color: "#64748b", maxHeight: "400px", overflow: "auto",
                }}>
                  {data.rawText}
                </Box>
              </details>
            </Box>
          )}
        </Paper>
      )}

      <Snackbar open={docxDownloaded} autoHideDuration={3000} onClose={() => setDocxDownloaded(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" sx={{ width: "100%" }}>Word-файл скачан автоматически</Alert>
      </Snackbar>
      <Snackbar open={!!docxError} autoHideDuration={4000} onClose={() => setDocxError("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="error" sx={{ width: "100%" }}>{docxError}</Alert>
      </Snackbar>
      <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" sx={{ width: "100%" }}>Текст скопирован</Alert>
      </Snackbar>
    </ToolLayout>
  );
}
