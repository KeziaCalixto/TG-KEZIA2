import { z } from "zod";
import {
  calculationInputSchema,
  civilDateSchema,
} from "@/domain/deadlines/schema";
import { spLocalities } from "@/domain/calendars/localities";

const text = z.string().max(2000);
const version = z.string().min(1).max(100);
const source = z.object({
  id: version,
  title: text,
  provision: text,
  url: z
    .url()
    .max(2048)
    .refine((value) => {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password;
    }),
});
const calendar = z.object({
  components: z
    .array(
      z.object({
        id: version,
        version,
        profile: z.enum(["labor", "criminal"]).optional(),
        court: z.enum(["TJSP", "TRT2"]),
        locality: z.enum(spLocalities),
        from: civilDateSchema,
        to: civilDateSchema,
        completeness: z.enum(["demonstration", "reviewed"]),
        consultedOn: civilDateSchema,
      }),
    )
    .min(1)
    .max(10)
    .optional(),
  id: version,
  version,
  court: z.enum(["TJSP", "TRT2"]),
  profile: z.enum(["labor", "criminal"]).optional(),
  locality: z.enum(spLocalities),
  from: civilDateSchema,
  to: civilDateSchema,
  completeness: z.enum(["demonstration", "reviewed"]),
  consultedOn: civilDateSchema,
  events: z
    .array(
      z.object({
        id: version,
        start: civilDateSchema,
        end: civilDateSchema,
        name: text,
        kind: z.enum([
          "holiday",
          "suspension",
          "interruption",
          "unavailability",
          "partial_closure",
          "publication_restriction",
        ]),
        source,
      }),
    )
    .max(2000),
});

// Validation permits readable rendering, not a claim of authenticity or legal review.
export const historySnapshotSchema = z
  .object({
    status: z.enum(["provisional", "incomplete"]),
    input: calculationInputSchema.nullable(),
    eventDate: civilDateSchema.nullable(),
    publicationDate: civilDateSchema.nullable(),
    legalStartDate: civilDateSchema.nullable(),
    firstCountedDate: civilDateSchema.nullable(),
    dueDate: civilDateSchema.nullable(),
    nominalDueDate: civilDateSchema.nullable().optional(),
    trace: z
      .array(
        z.object({
          date: civilDateSchema,
          counted: z.boolean(),
          ordinal: z.number().int().min(1).max(365).nullable(),
          reasons: z.array(text).max(100),
          sourceIds: z.array(version).max(100),
          phase: z.enum(["event", "communication", "counting", "extension"]),
        }),
      )
      .max(1600),
    sources: z.array(source).max(2000),
    warnings: z.array(text).max(100),
    snapshot: z.object({
      calendar,
      act: z
        .object({
          id: version,
          version,
          regime: z.enum(["civil", "labor", "criminal"]),
          court: z.enum(["TJSP", "TRT2"]),
          label: text,
          days: z.number().int().min(1).max(365),
          countingMode: z.enum(["business", "continuous"]),
          supportFrom: civilDateSchema,
          consultedOn: civilDateSchema,
          scope: text,
          conditions: z.array(text).min(1).max(30),
          exclusions: z.array(text).max(30),
          sources: z.array(source).min(1).max(30),
          legalReview: z.literal("pending"),
        })
        .optional(),
      rule: z
        .object({
          id: version,
          version,
          regime: z.enum(["labor", "criminal"]),
          countingMode: z.enum(["business", "continuous"]),
          validFrom: civilDateSchema,
          scope: text,
          legalReview: z.literal("pending"),
        })
        .optional(),
    }),
    metadata: z.object({
      actId: version.optional(),
      actVersion: version.optional(),
      countingEngineVersion: version.optional(),
      engineVersion: version,
      ruleVersion: version,
      calendarId: version,
      calendarVersion: version,
      calendarCompleteness: z.enum(["demonstration", "reviewed"]),
      calendarConsultedOn: civilDateSchema,
      legalReview: z.literal("pending"),
      timeZone: z.literal("America/Sao_Paulo"),
    }),
  })
  .refine(
    (value) =>
      value.status === "incomplete"
        ? value.dueDate === null
        : value.dueDate !== null && value.input !== null,
    "Estado e vencimento incompatíveis.",
  );
