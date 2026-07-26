/**
 * Параметры пагинации для репозиториев
 */
export type PaginationParams = {
  readonly page: number;
  readonly limit: number;
};

/**
 * Результат пагинированного запроса
 */
export type PaginatedResult<T> = {
  readonly data: T[];
  readonly total: number;
};

/**
 * Метаданные пагинации
 */
export type PaginationMeta = {
  readonly currentPage: number;
  readonly itemsPerPage: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
};

/**
 * Вычисляет метаданные пагинации
 */
export function calculatePaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    currentPage: page,
    itemsPerPage: limit,
    totalItems: total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}
