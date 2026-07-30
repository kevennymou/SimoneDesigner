/** "5583998559075" -> "(83) 99855-9075" */
export function formatPhoneBR(digits: string): string {
  const d = digits.replace(/\D/g, "");
  const local = d.startsWith("55") && d.length === 13 ? d.slice(2) : d;

  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }
  return digits;
}
