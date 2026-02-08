import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | 'actions';
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  /** initial page number (1-based) */
  initialPage?: number;
  /** default page size */
  defaultPageSize?: number;
  /** available page size options for selector */
  pageSizeOptions?: number[];
  /** show or hide pagination controls */
  showPagination?: boolean;
  /** optional callback when page changes */
  onPageChange?: (page: number) => void;
}

export function Table<T extends object>({
  columns,
  data,
  initialPage = 1,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20],
  showPagination = true,
  onPageChange,
}: TableProps<T>) {
  const safeData = Array.isArray(data) ? data : [];

  const [page, setPage] = React.useState<number>(initialPage);
  const [pageSize, setPageSize] = React.useState<number>(defaultPageSize);

  const totalPages = Math.max(1, Math.ceil(safeData.length / pageSize));

  React.useEffect(() => {
    // clamp page when data or pageSize changes
    if (page > totalPages) {
      setPage(totalPages);
      onPageChange?.(totalPages);
    }
  }, [safeData.length, pageSize, totalPages]);

  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, safeData.length);
  const pagedData = showPagination ? safeData.slice(startIndex, endIndex) : safeData;

  function goTo(newPage: number) {
    const clamped = Math.max(1, Math.min(totalPages, newPage));
    setPage(clamped);
    onPageChange?.(clamped);
  }

  return (
    <div>
      <table className="min-w-full border border-gray-200 rounded-md">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-2 border-b text-left bg-gray-50">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pagedData.map((row, rowIdx) => (
            <tr key={startIndex + rowIdx} className="hover:bg-gray-100">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-4 py-2 border-b">
                  {col.render
                    ? col.render(row)
                    : col.accessor !== 'actions'
                      ? (row[col.accessor] as React.ReactNode)
                      : null}
                </td>
              ))}
            </tr>
          ))}
          {pagedData.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-gray-500">
                No records
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showPagination && (
        <div className="flex items-center justify-between mt-3 text-sm">
          <div className="text-gray-600">
            {safeData.length === 0 ? (
              'Showing 0 of 0'
            ) : (
              <>Showing {startIndex + 1}–{endIndex} of {safeData.length}</>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-gray-600">
              <span>Per page</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="border rounded px-2 py-1"
                aria-label="Rows per page"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goTo(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1 rounded border bg-white disabled:opacity-50"
              >
                Prev
              </button>

              <div className="px-3 py-1">
                Page {page} / {totalPages}
              </div>

              <button
                onClick={() => goTo(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded border bg-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
