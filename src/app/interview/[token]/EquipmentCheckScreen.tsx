"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import { Trans, msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import MicIcon from "@mui/icons-material/Mic";
import ProductionWebcamComponent from "./ProductionWebcamComponent";
import ForgetMeAuto from "@/app/components/ForgetMeAuto";

interface EquipmentCheckScreenProps {
  token: string;
  isMobile: boolean;
  prepared: any;
  stepperComp?: React.ReactNode;
  cameraEnabled: boolean;
  pdnConsent: boolean;
  onCameraToggle: (enabled: boolean) => void;
  onPdnConsentChange: (checked: boolean) => void;
  onStartInterview: () => void;
  onStreamReady?: (stream: MediaStream) => void;
}

export default function EquipmentCheckScreen({
  token,
  isMobile,
  prepared,
  stepperComp,
  cameraEnabled,
  pdnConsent,
  onCameraToggle,
  onPdnConsentChange,
  onStartInterview,
  onStreamReady,
}: EquipmentCheckScreenProps) {
  const { _ } = useLingui();
  const [micLevel, setMicLevel] = useState(0);
  const [micReady, setMicReady] = useState(false);
  const [debugError, setDebugError] = useState<string>("");
  const [testStream, setTestStream] = useState<MediaStream | null>(null);

  const handleToggleCameraClick = () => {
    onCameraToggle(!cameraEnabled);
  };

  const handleStreamReady = (stream: MediaStream) => {
    setTestStream(stream);
    onStreamReady?.(stream);
  };

  const min = Math.ceil(prepared.durationSec / 60);

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'visible',
      position: 'relative',
      maxWidth: '1200px',
      mx: 'auto',
      width: '100%',
      px: { xs: 0, sm: 2, md: 4 }
    }}>
      {/* Fixed Header */}
      <Box sx={{
        p: isMobile ? 2 : 4,
        pb: isMobile ? 1 : 4,
        bgcolor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexShrink: 0
      }}>
        {stepperComp}
        <Typography variant="h4" gutterBottom>
          <Trans>Подготовка к интервью</Trans>
        </Typography>
        <Typography sx={{ mb: 2 }}>
          <Trans>Интервью займёт примерно {min} минут — {prepared.total} основных вопросов, плюс могут появиться уточняющие (для них время выделится автоматически).</Trans>
        </Typography>
        <Typography sx={{ mb: 2 }}>
          <Trans>Формат простой: отвечайте последовательно, один вопрос за другим. Поставить на паузу, вернуться назад или пропустить вопрос не получится — так устроена система, чтобы сохранить естественный ход беседы.</Trans>
        </Typography>
        <Typography sx={{ mb: 2 }}>
          <Trans>Совет: не перегружайте страницу во время прохождения. Если что-то пошло не так — просто напишите нам, и мы всё решим.</Trans>
        </Typography>
        <Typography sx={{ mb: 2 }}>
          <strong><Trans>Готовы? Начинайте, когда будете в комфортной обстановке.</Trans></strong>
        </Typography>
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={pdnConsent}
                onChange={(e) => onPdnConsentChange(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                <Trans>Соглашаюсь на обработку моих персональных данных для прохождения интервью и оценки соответствия вакансии</Trans>. <a href="/privacy-policy" target="_blank"><Trans>Политика ПДн</Trans></a>.{' '}<Trans>Медиа хранятся до 60 дней</Trans>.
              </Typography>
            }
            sx={{ alignItems: 'center', mb: 1 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={cameraEnabled}
                onChange={(e) => onCameraToggle(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                <Trans>Согласие на запись видео. Запись с камерой может повысить доверие работодателя и помочь ему лучше оценить ваши коммуникативные навыки.</Trans>
                <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.85em', display: 'block', mt: 0.5 }}>
                  <Trans>(Снимите галочку — будет только аудио)</Trans>
                </Typography>
              </Typography>
            }
            sx={{ alignItems: 'flex-start', mb: 1 }}
          />
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{
        flex: 1,
        overflow: 'visible',
        p: isMobile ? 2 : 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Webcam Component */}
        <ProductionWebcamComponent
          cameraEnabled={cameraEnabled}
          onCameraToggle={handleToggleCameraClick}
          onStreamReady={handleStreamReady}
          onMicLevelChange={setMicLevel}
          onMicReady={setMicReady}
          onError={setDebugError}
        />

        {/* Mic Level Indicator */}
        {micReady && (
          <Box sx={{
            mt: 3,
            p: 2,
            bgcolor: micLevel > 5 ? '#e8f5e9' : '#fff3e0',
            borderRadius: 2,
            border: '2px solid',
            borderColor: micLevel > 5 ? '#4caf50' : '#ff9800',
            maxWidth: '500px',
            width: '100%'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MicIcon sx={{ color: micLevel > 5 ? '#4caf50' : '#ff9800' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {micLevel > 5 ? <Trans>🎤 Микрофон работает</Trans> : <Trans>⚠️ Говорите в микрофон для проверки</Trans>}
              </Typography>
            </Box>

            {/* Visual Level Indicator */}
            <Box sx={{
              height: '8px',
              bgcolor: 'rgba(0,0,0,0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative',
              mb: 1
            }}>
              <Box
                style={{ width: `${Math.max(micLevel * 2, 2)}%` }}
                sx={{
                  height: '100%',
                  bgcolor: micLevel > 5 ? '#4caf50' : '#ff9800',
                  borderRadius: '4px',
                  transition: 'width 0.1s linear, background-color 0.3s'
                }}
              />
            </Box>

            <Typography variant="caption" sx={{
              color: 'text.secondary',
              fontSize: '11px',
              display: 'block'
            }}>
              {micLevel > 5
                ? <Trans>✓ Звук обнаружен. Можете начинать интервью.</Trans>
                : <Trans>Скажите что-нибудь, чтобы убедиться что микрофон работает</Trans>
              }
            </Typography>
          </Box>
        )}

        {/* Legal Info */}
        <Box sx={{ mt: 4, maxWidth: '600px', width: '100%' }}>
          <ForgetMeAuto candidateToken={token} />
        </Box>
      </Box>

      {/* Sticky Bottom Button */}
      <Box sx={{
        position: 'sticky',
        bottom: 0,
        p: 2,
        bgcolor: 'background.paper',
        borderTop: '2px solid',
        borderColor: 'divider',
        flexShrink: 0,
        zIndex: 100,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
      }}>
        {/* Debug Block */}
        {(debugError || !pdnConsent) && (
          <Box sx={{
            mb: 1.5,
            p: 1.5,
            bgcolor: debugError ? (debugError.includes('❌') || debugError.includes('💀') ? '#ffebee' : '#e8f5e8') : '#fff3e0',
            borderRadius: 1,
            border: '1px solid',
            borderColor: debugError ? (debugError.includes('❌') || debugError.includes('💀') ? '#f44336' : '#4caf50') : '#ff9800'
          }}>
            <Typography variant="caption" sx={{
              fontFamily: 'monospace',
              fontSize: '11px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              display: 'block'
            }}>
              {!pdnConsent ? <Trans>⚠️ Примите соглашение на обработку ПДн</Trans> : debugError}
            </Typography>

            {/* Camera Diagnostics Button */}
            {debugError && debugError.includes(_(msg`Видео: нет`)) && (
              <Button
                size="small"
                variant="outlined"
                onClick={async () => {
                  setDebugError(_(msg`🔍 Ищем доступные камеры...`));
                  try {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const cameras = devices.filter(d => d.kind === 'videoinput');
                    setDebugError(`📷 Камер найдено: ${cameras.length}\n${cameras.map((c, i) => `${i + 1}. ${c.label || _(msg`Неизвестная камера`)}`).join('\n')}`);
                  } catch (e: any) {
                    setDebugError(_(msg`❌ Ошибка поиска камер: ${e.message}`));
                  }
                }}
                sx={{ mt: 0.5, fontSize: '11px', py: 0.5 }}
              >
                🔍 <Trans>Найти камеры</Trans>
              </Button>
            )}
          </Box>
        )}

        {/* Mic Check Status */}
        {pdnConsent && !micReady && !debugError && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 1,
              color: 'text.secondary',
              fontSize: '12px',
              textAlign: 'center'
            }}
          >
            <Trans>⏳ Проверяем микрофон...</Trans>
          </Typography>
        )}

        {/* Silent Mic Warning */}
        {micReady && micLevel < 1 && pdnConsent && !debugError && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 1,
              color: 'warning.main',
              fontSize: '12px',
              textAlign: 'center',
              fontWeight: 500
            }}
          >
            <Trans>⚠️ Микрофон не ловит звук. Проверьте громкость или физическую кнопку отключения</Trans>
          </Typography>
        )}

        <Button
          variant="contained"
          onClick={onStartInterview}
          disabled={!micReady || !pdnConsent}
          fullWidth
          size="large"
          sx={{
            minHeight: '48px',
            fontSize: '16px',
            fontWeight: 600,
            boxShadow: 2,
            '&:not(:disabled):hover': {
              boxShadow: 4,
            },
          }}
        >
          {micReady && pdnConsent
            ? <Trans>Начать интервью</Trans>
            : <Trans>Подготовка...</Trans>
          }
        </Button>
      </Box>
    </Box>
  );
}

