import type { ProgressoCategoria } from '../../dominio/regras';

interface Props {
  /** Prefixo único dos ids (a mesma barra pode aparecer no painel e no planejamento). */
  id: string;
  rotulo: string;
  p: ProgressoCategoria;
}

export function BarraProgresso({ id, rotulo, p }: Props) {
  const total = p.totalHA ?? 0;
  const pct = total > 0 ? Math.min(100, Math.round((p.cumpridasHA / total) * 100)) : 0;
  return (
    <div className="progresso-item">
      <div id={`${id}-${rotulo}`}>
        {rotulo}: {p.cumpridasHA}/{p.totalHA ?? '—'} h-a
      </div>
      <div
        className="barra"
        role="progressbar"
        aria-labelledby={`${id}-${rotulo}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={`${pct}%`}
      >
        <div className="barra-preenchimento" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
