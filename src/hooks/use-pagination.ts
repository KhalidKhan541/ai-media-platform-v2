import * as React from "react";

interface UsePaginationProps {
  totalItems: number;
  pageSize: number;
  initialPage?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
}

function usePagination({ totalItems, pageSize, initialPage = 1 }: UsePaginationProps): UsePaginationReturn {
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const goToPage = React.useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = React.useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
  const prevPage = React.useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);
  const firstPage = React.useCallback(() => goToPage(1), [goToPage]);
  const lastPage = React.useCallback(() => goToPage(totalPages), [totalPages, goToPage]);

  return {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
  };
}

export { usePagination };
