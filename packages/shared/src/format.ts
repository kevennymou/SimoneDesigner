/** null = serviço "sob consulta", sem preço fixo. */
export function formatPriceBRL(price: number | null): string {
  if (price === null) return "sob consulta";
  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Monta o link wa.me com a mensagem já codificada (substitui a concatenação manual de %0A do protótipo). */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Normaliza um número de WhatsApp para dígitos com DDI 55, do jeito que o backend armazena. */
export function normalizeWhatsApp(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}
