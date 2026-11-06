export const spLocalities = [
  "São Paulo",
  "Campinas",
  "Guarulhos",
  "Osasco",
  "Ribeirão Preto",
  "Santo André",
  "Santos",
  "São Bernardo do Campo",
  "São José dos Campos",
  "Sorocaba",
] as const;

export type SpLocality = (typeof spLocalities)[number];
