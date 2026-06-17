import { type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  currentPage?: number;
  lastPage?: number;
  onPageChange?: (page: number) => void;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  loading?: boolean;
  actions?: (item: T) => ReactNode;
}

function DataTable<T extends { id: number }>({
  columns,
  data,
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  currentPage = 1,
  lastPage = 1,
  onPageChange,
  sortBy,
  sortDir,
  onSort,
  loading,
  actions,
}: Props<T>) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {onSearchChange && (
        <div className="border-b border-gray-200 p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-semibold text-[#111827] ${col.sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''}`}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortBy === col.key && (
                      <span className="text-[#EAB308]">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
              {actions && <th className="px-4 py-3 font-semibold text-[#111827]">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700">
                      {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key]?.toString()}
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3">{actions(item)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {onPageChange && lastPage > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <span className="text-sm text-gray-500">
            Page {currentPage} of {lastPage}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= lastPage}
              className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
