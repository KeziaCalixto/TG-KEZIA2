export function historyResponse<T>(
  calculations: T[],
  options: { page?: number; pageSize?: number; total?: number } = {},
) {
  const { page = 1, pageSize = 10, total = calculations.length } = options;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    calculations,
    asOfDate: "2026-10-22",
    timeZone: "America/Sao_Paulo",
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasPrevious: page > 1,
      hasNext: page < totalPages,
    },
  };
}
