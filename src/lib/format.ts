export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function mesReferenciaAtual(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMesReferencia(referencia: string): string {
  const [ano, mes] = referencia.split("-");
  const nomes = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const nome = nomes[Number(mes) - 1] ?? mes;
  return `${nome}/${ano}`;
}

const MESES_LONGOS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

// Datas "somente dia" (vencimento, reunião) são guardadas e lidas sempre em UTC,
// para não sofrer deslocamento de um dia por causa do fuso horário do servidor.
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
}

// Inverso de parseDateOnly: formata uma data "somente dia" (guardada em UTC) para
// o formato "AAAA-MM-DD" que um <input type="date"> espera como defaultValue.
export function toDateInputValue(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(date: Date): string {
  return `${MESES_LONGOS[date.getUTCMonth()]} de ${date.getUTCFullYear()}`;
}

export function formatWeekday(date: Date): string {
  return DIAS_SEMANA[date.getUTCDay()];
}

export function formatDayNumber(date: Date): string {
  return String(date.getUTCDate()).padStart(2, "0");
}
