import type { SpLocality } from "../calendars/localities";

export interface CivilInput {
  regime: "civil";
  court: "TJSP";
  locality: SpLocality;
  medium: "electronic" | "physical";
  communication: "publication" | "availability";
  eventDate: string;
  days: number;
  act?: ActSelection;
}

export interface ExtendedInput {
  regime: "labor" | "criminal";
  court: "TJSP" | "TRT2";
  locality: SpLocality;
  medium: "electronic" | "physical";
  communication: "publication" | "availability";
  eventDate: string;
  days: number;
  act?: ActSelection;
  context:
    | "ordinary"
    | "custody"
    | "domestic_violence"
    | "urgent"
    | "special"
    | "unknown";
}

export type CalculationInput = CivilInput | ExtendedInput;
export type ProceduralRegime = CalculationInput["regime"];
export interface ActSelection {
  id: string;
  version: string;
  eligibility: "unknown" | "confirmed" | "excluded";
}
export interface ActSnapshot {
  id: string;
  version: string;
  regime: ProceduralRegime;
  court: "TJSP" | "TRT2";
  label: string;
  days: number;
  countingMode: "business" | "continuous";
  supportFrom: string;
  consultedOn: string;
  scope: string;
  conditions: string[];
  exclusions: string[];
  sources: LegalSource[];
  legalReview: "pending";
}
export const regimeLabels: Record<ProceduralRegime, string> = {
  civil: "Civil comum",
  labor: "Trabalhista",
  criminal: "Penal / criminal",
};

export interface RuleSnapshot {
  id: string;
  version: string;
  regime: "labor" | "criminal";
  countingMode: "business" | "continuous";
  validFrom: string;
  scope: string;
  legalReview: "pending";
}

export interface LegalSource {
  id: string;
  title: string;
  provision: string;
  url: string;
}

export interface CalendarEvent {
  id: string;
  start: string;
  end: string;
  name: string;
  kind:
    | "holiday"
    | "suspension"
    | "interruption"
    | "unavailability"
    | "partial_closure"
    | "publication_restriction";
  source: LegalSource;
}

export interface JudicialCalendar {
  components?: readonly CalendarComponent[];
  profile?: "labor" | "criminal";
  id: string;
  version: string;
  court: "TJSP" | "TRT2";
  locality: SpLocality;
  from: string;
  to: string;
  completeness: "demonstration" | "reviewed";
  consultedOn: string;
  events: readonly CalendarEvent[];
}

export type CalendarComponent = Pick<
  JudicialCalendar,
  | "id"
  | "version"
  | "profile"
  | "court"
  | "locality"
  | "from"
  | "to"
  | "completeness"
  | "consultedOn"
>;

export interface TraceDay {
  date: string;
  counted: boolean;
  ordinal: number | null;
  reasons: string[];
  sourceIds: string[];
  phase: "event" | "communication" | "counting" | "extension";
}

export interface CalculationResult {
  status: "provisional" | "incomplete";
  input: CalculationInput | null;
  eventDate: string | null;
  publicationDate: string | null;
  legalStartDate: string | null;
  firstCountedDate: string | null;
  dueDate: string | null;
  nominalDueDate?: string | null;
  trace: TraceDay[];
  sources: LegalSource[];
  warnings: string[];
  snapshot: {
    calendar: JudicialCalendar;
    rule?: RuleSnapshot;
    act?: ActSnapshot;
  };
  metadata: {
    actId?: string;
    actVersion?: string;
    countingEngineVersion?: string;
    engineVersion: string;
    ruleVersion: string;
    calendarId: string;
    calendarVersion: string;
    calendarCompleteness: JudicialCalendar["completeness"];
    calendarConsultedOn: string;
    legalReview: "pending";
    timeZone: "America/Sao_Paulo";
  };
}
