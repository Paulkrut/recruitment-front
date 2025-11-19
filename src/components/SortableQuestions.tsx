"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  IconButton,
  Checkbox,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteIcon from "@mui/icons-material/Delete";
import { Trans } from '@lingui/react';


export interface QuestionDraft {
  id?: number;
  position?: number;
  text: string;
  type: string;
  maxTime?: number;
  allowFollowups?: boolean;
  followupsMax?: number;
}

interface Props {
  questions: QuestionDraft[];
  onChange: (q: QuestionDraft[]) => void;
}

export default function SortableQuestions({ questions, onChange }: Props) {
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const current = itemsWithKey;
    const oldIndex = current.findIndex((q) => q.__key === active.id);
    const newIndex = current.findIndex((q) => q.__key === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newArr = arrayMove(questions, oldIndex, newIndex);
    onChange(newArr.map((q, i) => ({ ...q, position: i })));
  }

  const itemsWithKey = React.useMemo(() =>
    questions.map((q, idx) => ({ ...q, __key: (q.id ?? idx).toString() })), [questions]);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={itemsWithKey.map((q) => q.__key)} strategy={verticalListSortingStrategy}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>#</TableCell>
              <TableCell><Trans>Текст</Trans></TableCell>
              <TableCell><Trans>Время, сек</Trans></TableCell>
              <TableCell><Trans>Уточнения</Trans></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {itemsWithKey.map((q, idx) => (
              <SortableRow key={q.__key} id={q.__key} idx={idx} q={q} onChange={onChange} />
            ))}
          </TableBody>
        </Table>
      </SortableContext>
    </DndContext>
  );

  function SortableRow({ id, idx, q }: any) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    function update(field: string, value: any) {
      const newArr = [...questions];
      newArr[idx] = { ...newArr[idx], [field]: value };
      onChange(newArr);
    }

    function remove() {
      onChange(questions.filter((_, i) => i !== idx));
    }

    return (
      <TableRow ref={setNodeRef} style={style} {...attributes} data-question-id={q.id || idx}>
        <TableCell {...listeners} style={{ cursor: "grab", width: 40 }}>
          <DragIndicatorIcon />
        </TableCell>
        <TableCell>{idx + 1}</TableCell>
        <TableCell>
          <TextField
            fullWidth
            multiline
            minRows={2}
            value={q.text}
            onChange={(e) => update("text", e.target.value)}
          />
        </TableCell>
        <TableCell>
          <TextField
            type="number"
            value={q.maxTime}
            sx={{ width: 100 }}
            onChange={(e) => update("maxTime", Number(e.target.value))}
          />
        </TableCell>
        <TableCell>
          <Checkbox
            checked={q.allowFollowups || false}
            onChange={(e) => update("allowFollowups", e.target.checked)}
          />
          <TextField
            type="number"
            value={q.followupsMax || 0}
            sx={{ width: 80, ml: 1 }}
            disabled={!q.allowFollowups}
            onChange={(e) => update("followupsMax", Number(e.target.value))}
          />
        </TableCell>
        <TableCell>
          <IconButton onClick={remove}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  }
} 