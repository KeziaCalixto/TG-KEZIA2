import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | null) {
  if (!value) return "Não determinado";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}
