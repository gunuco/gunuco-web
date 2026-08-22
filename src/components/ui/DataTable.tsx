import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { type ReactNode } from 'react';
import { brand } from '@/theme/colors';

export interface Column<T> {
  id: string;
  label: string;
  minWidth?: number;
  width?: number | string;
  align?: 'left' | 'right' | 'center';
  noWrap?: boolean;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: number | boolean;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  connected?: boolean;
  bodyColor?: string;
  headerColor?: string;
  /** Size columns to each header; keep a fixed gap between names. */
  headerFit?: boolean;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  page = 0,
  pageSize = 10,
  total,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  emptyMessage = 'No records yet.',
  connected = false,
  bodyColor,
  headerColor,
  headerFit = false,
}: DataTableProps<T>) {
  const skeletonRows = typeof loading === 'number' ? loading : 5;
  const isLoading = Boolean(loading);
  const equalWidth = `${100 / Math.max(columns.length, 1)}%`;
  const colGap = 2;
  const displayColumns = columns;

  return (
    <Paper
      elevation={connected ? 0 : 1}
      sx={{
        overflow: 'hidden',
        borderRadius: connected ? '0 0 12px 12px' : 1.5,
        bgcolor: bodyColor ?? brand.creamPaper,
        width: '100%',
        boxShadow: connected ? 'none' : undefined,
        border: `1px solid ${brand.line}`,
        borderTop: connected ? 'none' : undefined,
      }}
    >
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table
          size="small"
          sx={{
            width: '100%',
            tableLayout: 'fixed',
            borderCollapse: 'separate',
            borderSpacing: 0,
            '& th, & td': {
              boxSizing: 'border-box',
              px: headerFit ? colGap : 1.5,
            },
          }}
        >
          <TableHead>
            <TableRow>
              {displayColumns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align ?? 'center'}
                  sx={{
                    fontWeight: 800,
                    color: brand.cream,
                    bgcolor: headerColor ?? brand.wine,
                    borderBottom: `2px solid ${brand.gold}`,
                    width: col.width ?? equalWidth,
                    minWidth: col.minWidth,
                    py: 1.35,
                    fontSize: 15,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    textAlign: col.align ?? 'center',
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: skeletonRows }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    {displayColumns.map((col) => (
                      <TableCell
                        key={col.id}
                        align={col.align ?? 'center'}
                        sx={{ py: 1.5, width: col.width ?? equalWidth }}
                      >
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}
            {!isLoading &&
              rows.map((row) => (
                <TableRow
                  hover
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': { bgcolor: brand.wash },
                  }}
                >
                  {displayColumns.map((col) => (
                    <TableCell
                      key={col.id}
                      align={col.align ?? 'center'}
                      sx={{
                        py: 1.5,
                        width: col.width ?? equalWidth,
                        borderColor: brand.line,
                        whiteSpace: 'normal',
                        textAlign: col.align ?? 'center',
                        verticalAlign: 'middle',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent:
                            col.align === 'left' ? 'flex-start' : col.align === 'right' ? 'flex-end' : 'center',
                          alignItems: 'center',
                          width: '100%',
                          textAlign: col.align ?? 'center',
                          minWidth: 0,
                        }}
                      >
                        {col.render(row)}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!isLoading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={displayColumns.length} sx={{ py: 8, textAlign: 'center' }}>
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
      {onPageChange ? (
        <TablePagination
          component="div"
          count={total ?? rows.length}
          page={page}
          rowsPerPage={pageSize}
          onPageChange={(_e, next) => onPageChange(next)}
          onRowsPerPageChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          rowsPerPageOptions={[5, 10, 25]}
        />
      ) : null}
    </Paper>
  );
}
