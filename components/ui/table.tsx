import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | 'actions';
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
}

export function Table<T extends object>({ columns, data }: TableProps<T>) {
  const safeData = Array.isArray(data) ? data : [];
  return (
    <table className="min-w-full border border-gray-200 rounded-md">
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th key={idx} className="px-4 py-2 border-b text-left bg-gray-50">{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {safeData.map((row, rowIdx) => (
          <tr key={rowIdx} className="hover:bg-gray-100">
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
      </tbody>
    </table>
  );
}
