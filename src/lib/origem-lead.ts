export const ORIGEM_LEAD_LABELS = {
  INSTAGRAM: "Instagram",
  WHATSAPP: "WhatsApp",
  INDICACAO: "Indicação",
  GOOGLE: "Google",
  SITE: "Site",
  ANUNCIO_PAGO: "Anúncio pago",
  OUTRO: "Outro",
} as const;

export type OrigemLead = keyof typeof ORIGEM_LEAD_LABELS;

export const ORIGENS_LEAD = Object.keys(ORIGEM_LEAD_LABELS) as OrigemLead[];

export function origemLeadLabel(origem: string): string {
  return (ORIGEM_LEAD_LABELS as Record<string, string>)[origem] ?? origem;
}
