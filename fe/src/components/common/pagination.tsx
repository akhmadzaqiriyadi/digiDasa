import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
  showAlways?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = '',
  showAlways = true,
}: PaginationProps) {
  if (totalItems === 0) return null;
  if (!showAlways && totalPages <= 1) return null;

  const validTotalPages = Math.max(1, totalPages);
  const start = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const end = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers array (up to max 5 around current page)
  const getPageNumbers = () => {
    if (validTotalPages <= 5) {
      return Array.from({ length: validTotalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }
    if (currentPage >= validTotalPages - 2) {
      return [
        validTotalPages - 4,
        validTotalPages - 3,
        validTotalPages - 2,
        validTotalPages - 1,
        validTotalPages
      ];
    }
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  const pages = getPageNumbers();

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border/60 text-xs text-muted-foreground ${className}`}>
      <div className="flex items-center gap-1.5">
        <span>Menampilkan</span>
        <strong className="text-foreground font-semibold">{start}–{end}</strong>
        <span>dari</span>
        <strong className="text-foreground font-semibold">{totalItems}</strong>
        <span>data</span>
        <span className="text-[11px] text-muted-foreground/80 ml-1">
          (Halaman {currentPage} dari {validTotalPages})
        </span>
      </div>

      <div className="flex items-center gap-1 self-end sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 px-2.5 text-xs gap-1 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((p) => (
            <Button
              key={p}
              variant={p === currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(p)}
              className={`h-8 w-8 p-0 text-xs font-semibold ${
                p === currentPage
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-xs'
                  : 'text-foreground'
              }`}
            >
              {p}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= validTotalPages}
          className="h-8 px-2.5 text-xs gap-1 cursor-pointer disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
