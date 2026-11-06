import { z } from "zod";

const positiveInteger = (max: number) =>
  z
    .string()
    .regex(/^[1-9]\d*$/)
    .transform(Number)
    .pipe(z.number().int().max(max));
const querySchema = z
  .object({
    page: positiveInteger(1000).default(1),
    pageSize: positiveInteger(50).default(10),
    regime: z.enum(["civil", "labor", "criminal"]).optional(),
    calculationId: z.uuid().optional(),
  })
  .strict();

export function parseHistoryQuery(params: URLSearchParams) {
  if (new Set(params.keys()).size !== [...params.keys()].length) return null;
  const parsed = querySchema.safeParse(Object.fromEntries(params));
  return parsed.success ? parsed.data : null;
}

export interface HistoryPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
export type HistoryDueStatus = "future" | "today" | "past" | "undetermined";
export const historyDueLabels: Record<HistoryDueStatus, string> = {
  future: "Futuro · estimativa",
  today: "Vence hoje · estimativa",
  past: "Vencido · estimativa",
  undetermined: "Sem vencimento definido",
};
