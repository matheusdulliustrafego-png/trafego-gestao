import { formatCurrency } from "@/lib/format";

export type MesSerie = { mes: string; label: string; receita: number; despesa: number };

// Par diverging validado (azul/vermelho, passos categóricos escuros da paleta de referência)
// contra a superfície escura do app — ver skill dataviz/scripts/validate_palette.js.
const COR_RECEITA = "#3987e5";
const COR_DESPESA = "#e66767";

function niceStep(max: number): number {
  if (max <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(max / 4));
  const candidates = [1, 2, 5, 10].map((n) => n * magnitude);
  return candidates.find((c) => c * 4 >= max) ?? candidates[candidates.length - 1];
}

function roundedTopRectPath(x: number, y: number, w: number, h: number, r: number): string {
  if (h <= 0) return "";
  const radius = Math.min(r, h, w / 2);
  return `M${x},${y + h} L${x},${y + radius} Q${x},${y} ${x + radius},${y} L${x + w - radius},${y} Q${x + w},${y} ${x + w},${y + radius} L${x + w},${y + h} Z`;
}

export function FluxoCaixaChart({ data }: { data: MesSerie[] }) {
  const maxValor = Math.max(1, ...data.flatMap((d) => [d.receita, d.despesa]));
  const step = niceStep(maxValor);
  const topValue = step * 4;

  const width = 920;
  const height = 260;
  const paddingLeft = 56;
  const paddingRight = 8;
  const paddingTop = 8;
  const paddingBottom = 26;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const baselineY = paddingTop + plotHeight;

  const groupWidth = plotWidth / data.length;
  const barWidth = Math.min(18, groupWidth * 0.3);
  const barGap = 2;

  const gridSteps = [0, 1, 2, 3, 4].map((i) => (topValue / 4) * i);

  return (
    <div>
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-2 font-sans text-xs text-white/55">
          <span className="size-2.5 rounded-full" style={{ background: COR_RECEITA }} />
          Receita
        </span>
        <span className="flex items-center gap-2 font-sans text-xs text-white/55">
          <span className="size-2.5 rounded-full" style={{ background: COR_DESPESA }} />
          Despesa
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 w-full" role="img" aria-label="Receita e despesa por mês">
        {gridSteps.map((value) => {
          const y = baselineY - (value / topValue) * plotHeight;
          return (
            <g key={value}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
              <text x={paddingLeft - 8} y={y + 3} textAnchor="end" className="fill-white/35" fontSize={10}>
                {value >= 1000 ? `${Math.round(value / 1000)}k` : Math.round(value)}
              </text>
            </g>
          );
        })}

        {data.map((mes, i) => {
          const groupX = paddingLeft + i * groupWidth;
          const centerX = groupX + groupWidth / 2 - barWidth - barGap / 2;
          const receitaH = (mes.receita / topValue) * plotHeight;
          const despesaH = (mes.despesa / topValue) * plotHeight;

          return (
            <g key={mes.mes}>
              <path d={roundedTopRectPath(centerX, baselineY - receitaH, barWidth, receitaH, 4)} fill={COR_RECEITA}>
                <title>{`${mes.label} — Receita: ${formatCurrency(mes.receita)}`}</title>
              </path>
              <path
                d={roundedTopRectPath(centerX + barWidth + barGap, baselineY - despesaH, barWidth, despesaH, 4)}
                fill={COR_DESPESA}
              >
                <title>{`${mes.label} — Despesa: ${formatCurrency(mes.despesa)}`}</title>
              </path>
              <text x={groupX + groupWidth / 2} y={baselineY + 16} textAnchor="middle" className="fill-white/40" fontSize={10}>
                {mes.label}
              </text>
            </g>
          );
        })}
      </svg>

      <table className="sr-only">
        <caption>Receita e despesa por mês</caption>
        <thead>
          <tr>
            <th scope="col">Mês</th>
            <th scope="col">Receita</th>
            <th scope="col">Despesa</th>
          </tr>
        </thead>
        <tbody>
          {data.map((mes) => (
            <tr key={mes.mes}>
              <td>{mes.label}</td>
              <td>{formatCurrency(mes.receita)}</td>
              <td>{formatCurrency(mes.despesa)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
