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
}

export default function DataTable<T = any>({
  columns,
  rows,
  rowsPerPageOptions = [10, 25, 50],
  defaultRowsPerPage = 10,
}: Props<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [orderBy, setOrderBy] = useState<keyof T | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("asc");

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
          {paginated.map((row, idx) => (
            <TableRow key={idx} hover>
              {columns.map((col) => (
                <TableCell key={String(col.field)}>
                  {col.render ? col.render(row) : (row as any)[col.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
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