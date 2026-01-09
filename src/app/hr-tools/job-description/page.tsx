"use client";
import * as React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Icon } from "@iconify/react";
import ToolLayout from "../components/ToolLayout";
import ResultDisplay from "../components/ResultDisplay";
import { useJobDescription, JobDescriptionResponse } from "../hooks/useHrTool";

const levels = [
  { id: "junior", label: "Junior (начинающий)" },
  { id: "middle", label: "Middle (опытный)" },
  { id: "senior", label: "Senior (эксперт)" },
  { id: "lead", label: "Lead (руководитель)" },
];

export default function JobDescriptionPage() {
  const [position, setPosition] = React.useState("");
  const [level, setLevel] = React.useState("middle");
  const [additionalInfo, setAdditionalInfo] = React.useState("");

  const { data, loading, error, execute } = useJobDescription();

  const handleSubmit = async () => {
    if (!position.trim()) return;
    await execute({
      position,
      level,
      additionalInfo: additionalInfo.trim() || undefined,
    });
  };

  const handleRegenerate = async () => {
    if (!position.trim()) return;
    await execute({
      position,
      level,
      additionalInfo: additionalInfo.trim() || undefined,
    });
  };

  return (
    <ToolLayout
      title="Генератор описания вакансии"
      description="Сгенерируйте полное описание вакансии за минуту. Укажите должность — получите готовый текст для публикации."
      icon="mdi:file-document-edit"
      iconColor="#4CAF50"
    >
      {/* Input form */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          border: "1px solid #e0e0e0",
          bgcolor: "#fff",
          mb: 4,
        }}
      >
        {/* Position */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#1a1a2e",
              mb: 1,
            }}
          >
            Название должности *
          </Typography>
          <TextField
            fullWidth
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Например: Frontend-разработчик, Product Manager, HR-менеджер"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <Typography
            sx={{
              mt: 0.5,
              fontSize: "0.8rem",
              color: position.length > 100 ? "#f44336" : "#999",
            }}
          >
            {position.length} / 100 символов
          </Typography>
        </Box>

        {/* Level */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#1a1a2e",
              mb: 1,
            }}
          >
            Уровень
          </Typography>
          <FormControl fullWidth>
            <Select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              {levels.map((l) => (
                <MenuItem key={l.id} value={l.id}>
                  {l.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Additional info */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#1a1a2e",
              mb: 1,
            }}
          >
            Дополнительная информация (опционально)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Стек технологий, особенности проекта, преимущества компании, специфические требования..."
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <Typography
            sx={{
              mt: 0.5,
              fontSize: "0.8rem",
              color: additionalInfo.length > 1000 ? "#f44336" : "#999",
            }}
          >
            {additionalInfo.length} / 1000 символов
          </Typography>
        </Box>

        {/* Submit button */}
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading || !position.trim() || position.length > 100}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Icon icon="mdi:auto-fix" />
            )
          }
          sx={{
            bgcolor: "#4CAF50",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            borderRadius: 2,
            "&:hover": { bgcolor: "#388E3C" },
            "&:disabled": { bgcolor: "#ccc" },
          }}
        >
          {loading ? "Генерация..." : "Сгенерировать описание"}
        </Button>
      </Paper>

      {/* Error */}
      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      </Collapse>

      {/* Result */}
      {data && (
        <ResultDisplay
          title={data.title || "Описание вакансии"}
          copyText={data.fullText}
          downloadText={data.fullText}
          downloadFilename="job-description.txt"
          onRegenerate={handleRegenerate}
          regenerating={loading}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Responsibilities */}
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#1a1a2e",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Icon icon="mdi:clipboard-list" width={20} height={20} color="#4CAF50" />
                Обязанности
              </Typography>
              <List dense disablePadding>
                {data.responsibilities?.map((item, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Icon icon="mdi:check" width={18} height={18} color="#4CAF50" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{ fontSize: "0.95rem", color: "#333" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Requirements */}
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#1a1a2e",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Icon icon="mdi:account-check" width={20} height={20} color="#2196F3" />
                Требования
              </Typography>
              <List dense disablePadding>
                {data.requirements?.map((item, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Icon icon="mdi:circle-small" width={24} height={24} color="#2196F3" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{ fontSize: "0.95rem", color: "#333" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Nice to have */}
            {data.niceToHave && data.niceToHave.length > 0 && (
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "#1a1a2e",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Icon icon="mdi:star" width={20} height={20} color="#FF9800" />
                  Будет плюсом
                </Typography>
                <List dense disablePadding>
                  {data.niceToHave.map((item, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <Icon icon="mdi:plus" width={18} height={18} color="#FF9800" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{ fontSize: "0.95rem", color: "#333" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Offers */}
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#1a1a2e",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Icon icon="mdi:gift" width={20} height={20} color="#9C27B0" />
                Мы предлагаем
              </Typography>
              <List dense disablePadding>
                {data.offers?.map((item, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Icon icon="mdi:check-circle" width={18} height={18} color="#9C27B0" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{ fontSize: "0.95rem", color: "#333" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </ResultDisplay>
      )}
    </ToolLayout>
  );
}

