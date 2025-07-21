"use client";

import React, { useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
} from "@mui/material";

export interface Column<T = any> {
  field: keyof T;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface Props<T = any> {
  columns: Column<T>[];
  rows: T[];
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  selectable?: boolean;
  onSelectionChange?: (ids:(number|string)[])=>void;
  getRowId?: (row:T)=>number|string;
  onRowClick?: (row:T)=>void;
}

export default function DataTable<T = any>({
  columns,
  rows,
  rowsPerPageOptions = [10, 25, 50],
  defaultRowsPerPage = 10,
  selectable = false,
  onSelectionChange,
  getRowId = (r:any)=> (r.id ?? r.ID ?? r.key ?? Math.random()),
  onRowClick,
}: Props<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [orderBy, setOrderBy] = useState<keyof T | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [selected,setSelected] = useState<(number|string)[]>([]);

  const handleRequestSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedRows = React.useMemo(() => {
    if (!orderBy) return rows;
    return [...rows].sort((a: any, b: any) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];
      if (aVal === bVal) return 0;
      if (order === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
  }, [rows, order, orderBy]);

  const paginated = React.useMemo(
    () =>
      sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedRows, page, rowsPerPage]
  );

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper sx={{ width: "100%", overflow: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {selectable && (
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length>0 && selected.length<rows.length}
                  checked={rows.length>0 && selected.length===rows.length}
                  onChange={(_,checked)=>{
                    const allIds = rows.map(getRowId);
                    const newSel = checked?allIds:[];
                    setSelected(newSel);
                    onSelectionChange?.(newSel);
                  }}
                  inputProps={{"aria-label":"select all"}}
                  size="small"
                />
              </TableCell>
            )}
            {columns.map((col) => (
              <TableCell key={String(col.field)}>
                <TableSortLabel
                  active={orderBy === col.field}
                  direction={orderBy === col.field ? order : "asc"}
                  onClick={() => handleRequestSort(col.field)}
                >
                  {col.header}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginated.map((row, idx) => {
            const idVal = getRowId(row);
            const isSel = selected.includes(idVal);
            return (
              <TableRow key={idx} hover selected={isSel} onClick={()=>{
                if(onRowClick){ onRowClick(row); return; }
                if(!selectable) return;
                const newSel = isSel? selected.filter(i=>i!==idVal): [...selected,idVal];
                setSelected(newSel);
                onSelectionChange?.(newSel);
              }}>
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSel}
                      size="small"
                      onChange={()=>{}}
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell key={String(col.field)}>
                    {col.render ? col.render(row) : (row as any)[col.field]}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
      />
    </Paper>
  );
} 