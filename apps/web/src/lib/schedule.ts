export const WEEKDAY_LETTERS = ["D", "S", "T", "Q", "Q", "S", "S"];

/** Só a primeira letra — evita o CSS `capitalize` maiusculizar cada palavra ("Quinta-Feira, 30 De Julho"). */
export function capitalizeFirst(text: string): string {
  return text.length ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}
