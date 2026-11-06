import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";
import { spLocalities } from "../calendars/localities";

export const civilDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data no formato AAAA-MM-DD.")
  .refine((value) => {
    try {
      Temporal.PlainDate.from(value, { overflow: "reject" });
      return true;
    } catch {
      return false;
    }
  }, "Informe uma data válida.");

export const civilInputSchema = z
  .object({
    regime: z.literal("civil", {
      error: "Somente o procedimento civil comum está disponível.",
    }),
    court: z.literal("TJSP"),
    locality: z.enum(spLocalities, {
      error: "Selecione uma comarca de SP com calendário cadastrado.",
    }),
    medium: z.enum(["electronic", "physical"]),
    communication: z.enum(["publication", "availability"], {
      error: "Meio de comunicação ainda não suportado.",
    }),
    eventDate: civilDateSchema,
    days: z
      .number()
      .int("Use uma quantidade inteira.")
      .min(1, "Informe ao menos um dia.")
      .max(365, "O limite da demonstração é 365 dias."),
  })
  .strict();

const extendedInputSchema = z
  .object({
    regime: z.enum(["labor", "criminal"]),
    court: z.enum(["TJSP", "TRT2"]),
    locality: z.enum(spLocalities, {
      error: "Selecione uma comarca de SP com calendário cadastrado.",
    }),
    medium: z.enum(["electronic", "physical"]),
    communication: z.enum(["publication", "availability"]),
    eventDate: civilDateSchema,
    days: z.number().int().min(1).max(365),
    context: z.enum([
      "ordinary",
      "custody",
      "domestic_violence",
      "urgent",
      "special",
      "unknown",
    ]),
  })
  .strict()
  .refine(
    (value) => value.court === (value.regime === "labor" ? "TRT2" : "TJSP"),
    {
      path: ["court"],
      message: "Tribunal incompatível com o regime selecionado.",
    },
  )
  .refine(
    (value) => value.regime !== "labor" || value.locality === "São Paulo",
    {
      path: ["locality"],
      message: "O perfil trabalhista cobre somente TRT-2 — São Paulo Capital.",
    },
  );

export const baseCalculationInputSchema = z.union(
  [civilInputSchema, extendedInputSchema],
  {
    error:
      "Revise os dados e a combinação de regime, tribunal, localidade e contexto.",
  },
);

const actSelectionSchema = z
  .object({
    id: z.string().min(1).max(100),
    version: z.string().min(1).max(100),
    eligibility: z.enum(["unknown", "confirmed", "excluded"]),
  })
  .strict();

export const calculationInputSchema = z.union([
  civilInputSchema.extend({ act: actSelectionSchema.optional() }),
  extendedInputSchema.safeExtend({ act: actSelectionSchema.optional() }),
]);
