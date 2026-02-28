'use client';
import React from 'react';
import { Box, Tooltip } from '@mui/material';

interface Props {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
}

function getColor(score: number): string {
  if (score >= 75) return '#2e7d32';
  if (score >= 50) return '#f57c00';
  return '#c62828';
}

function getBg(score: number): string {
  if (score >= 75) return '#e8f5e9';
  if (score >= 50) return '#fff3e0';
  return '#ffebee';
}

export default function ScoreBadge({ score, size = 'md' }: Props) {
  if (score === null) {
    return (
      <Box sx={{
        width: size === 'lg' ? 56 : size === 'md' ? 48 : 36,
        height: size === 'lg' ? 56 : size === 'md' ? 48 : 36,
        borderRadius: '50%',
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size === 'sm' ? 11 : 13,
        color: '#999',
        fontWeight: 600,
        border: '2px solid #e0e0e0',
      }}>
        ?
      </Box>
    );
  }

  const fontSize = size === 'lg' ? 18 : size === 'md' ? 15 : 12;
  const boxSize  = size === 'lg' ? 56 : size === 'md' ? 48 : 36;

  return (
    <Tooltip title={`Score: ${score}/100`}>
      <Box sx={{
        width: boxSize,
        height: boxSize,
        borderRadius: '50%',
        background: getBg(score),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        color: getColor(score),
        fontWeight: 700,
        border: `2px solid ${getColor(score)}`,
        flexShrink: 0,
        cursor: 'default',
      }}>
        {score}
      </Box>
    </Tooltip>
  );
}
