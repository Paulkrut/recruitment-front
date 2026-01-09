"use client";
import * as React from "react";
import { Box, Typography, Paper, IconButton, Tooltip, Snackbar, Alert } from "@mui/material";
import { Icon } from "@iconify/react";

interface ResultDisplayProps {
  title?: string;
  children: React.ReactNode;
  copyText?: string;
  downloadText?: string;
  downloadFilename?: string;
  onRegenerate?: () => void;
  regenerating?: boolean;
}

export default function ResultDisplay({
  title = "Результат",
  children,
  copyText,
  downloadText,
  downloadFilename = "result.txt",
  onRegenerate,
  regenerating = false,
}: ResultDisplayProps) {
  const [copied, setCopied] = React.useState(false);
  const [downloaded, setDownloaded] = React.useState(false);

  const handleCopy = async () => {
    if (!copyText) return;
    
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    if (!downloadText) return;
    
    const blob = new Blob([downloadText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          border: "1px solid #e0e0e0",
          bgcolor: "#fff",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
            pb: 2,
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Icon icon="mdi:check-circle" width={24} height={24} color="#4CAF50" />
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "#1a1a2e",
              }}
            >
              {title}
            </Typography>
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {copyText && (
              <Tooltip title="Копировать">
                <IconButton
                  onClick={handleCopy}
                  sx={{
                    bgcolor: "#f5f5f5",
                    "&:hover": { bgcolor: "#e0e0e0" },
                  }}
                >
                  <Icon
                    icon={copied ? "mdi:check" : "mdi:content-copy"}
                    width={20}
                    height={20}
                    color={copied ? "#4CAF50" : "#666"}
                  />
                </IconButton>
              </Tooltip>
            )}

            {downloadText && (
              <Tooltip title="Скачать TXT">
                <IconButton
                  onClick={handleDownload}
                  sx={{
                    bgcolor: "#f5f5f5",
                    "&:hover": { bgcolor: "#e0e0e0" },
                  }}
                >
                  <Icon
                    icon="mdi:download"
                    width={20}
                    height={20}
                    color="#666"
                  />
                </IconButton>
              </Tooltip>
            )}

            {onRegenerate && (
              <Tooltip title="Сгенерировать ещё">
                <IconButton
                  onClick={onRegenerate}
                  disabled={regenerating}
                  sx={{
                    bgcolor: "#f5f5f5",
                    "&:hover": { bgcolor: "#e0e0e0" },
                  }}
                >
                  <Icon
                    icon="mdi:refresh"
                    width={20}
                    height={20}
                    color="#666"
                    style={{
                      animation: regenerating ? "spin 1s linear infinite" : "none",
                    }}
                  />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box>{children}</Box>
      </Paper>

      {/* Snackbars */}
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Скопировано в буфер обмена
        </Alert>
      </Snackbar>

      <Snackbar
        open={downloaded}
        autoHideDuration={2000}
        onClose={() => setDownloaded(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Файл скачан
        </Alert>
      </Snackbar>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}

