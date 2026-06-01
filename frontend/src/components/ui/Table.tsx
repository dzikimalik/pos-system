import React from 'react';
import Pagination from './Pagination';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import { Package } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (item: T) => void;
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyTitle = 'Tidak ada data',
  emptyDescription = 'Belum ada data yang tersedia.',
  pagination,
  onRowClick,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<Package className="w-12 h-12" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr
                key={item.id as number || index}
                className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm text-gray-700 ${col.className || ''}`}
                  >
                    {col.render
                      ? col.render(item)
                      : (item[col.key] as React.ReactNode) || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="px-4 py-3 border-t border-gray-200">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}
