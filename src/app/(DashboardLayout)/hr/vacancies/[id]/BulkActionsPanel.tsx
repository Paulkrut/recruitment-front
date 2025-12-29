"use client";
/**
 * Legacy wrapper для BulkActionsToolbar
 * Сохранен для обратной совместимости
 * TODO: Удалить после миграции всех использований на BulkActionsToolbar
 */
import React from 'react';
import BulkActionsToolbar from './BulkActionsToolbar';

interface BulkActionsPanelProps {
  selectedCount: number;
  selectedAllInColumns: { columnId: string; count: number }[];
  onCancel: () => void;
  onBulkMove: (newStatus: string) => Promise<void>;
  onBulkSendInvitations?: (candidateIds: (number | string)[]) => Promise<void>;
  statusTriggers: Record<string, string[]>;
  vacancySource?: string;
  selectedCandidates?: any[];
  hhLimits?: {
    left: { resumeView: number };
    limits: { resumeView: number };
    spend: { resumeView: number };
  } | null;
  resumeQueueCount?: number;
  sendingInProgress?: boolean;
  hhCandidatesInfo?: { isAll: boolean; count?: number };
}

export default function BulkActionsPanel({
  selectedCount,
  selectedAllInColumns,
  onCancel,
  onBulkMove,
  onBulkSendInvitations,
  vacancySource,
  selectedCandidates = [],
  sendingInProgress = false,
  hhCandidatesInfo,
}: BulkActionsPanelProps) {
  return (
    <BulkActionsToolbar
      selectedCount={selectedCount}
      selectedCandidates={selectedCandidates}
      onCancel={onCancel}
      onStatusChange={onBulkMove}
      onSendInvitations={onBulkSendInvitations}
      vacancySource={vacancySource}
      sendingInProgress={sendingInProgress}
      variant="floating"
      selectedAllInColumns={selectedAllInColumns}
      hhCandidatesInfo={hhCandidatesInfo}
    />
  );
}
