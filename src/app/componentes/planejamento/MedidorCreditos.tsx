import { textoDoAviso } from './textosPlano';
import type { AvisoSemestre } from '../../../dominio/planejamento';

interface Props {
  total: number;
  /** Faixa de créditos por semestre do currículo (PDF: 16 a 30); null se o currículo não a define. */
  limites: { min: number; max: number } | null;
  avisos: AvisoSemestre[];
}

/**
 * Medidor de créditos do semestre, com marcas nos limites (16 e 30). O estado nunca depende só da cor:
 * há as marcas numeradas, o texto da faixa e o `role="meter"`.
 */
export function MedidorCreditos({ total, limites, avisos }: Props) {
  const escala = Math.max((limites?.max ?? 30) + 6, total);
  const pct = (v: number) => `${Math.min(100, (v / escala) * 100)}%`;
  const estado = total === 0 || !limites ? 'vazio' : total < limites.min ? 'abaixo' : total > limites.max ? 'acima' : 'ok';
  const legenda =
    avisos.length > 0
      ? avisos.map(textoDoAviso).join('. ')
      : estado === 'ok' && limites
        ? `Dentro da faixa de ${limites.min} a ${limites.max} créditos`
        : '';

  return (
    <div className={`medidor medidor-${estado}`}>
      <div
        className="medidor-trilho"
        role="meter"
        aria-label="Créditos do semestre"
        aria-valuemin={0}
        aria-valuemax={escala}
        aria-valuenow={total}
        aria-valuetext={legenda ? `${total} créditos. ${legenda}` : `${total} créditos`}
      >
        <div className="medidor-faixa" style={limites ? { left: pct(limites.min), width: `calc(${pct(limites.max)} - ${pct(limites.min)})` } : undefined} />
        <div className="medidor-nivel" style={{ width: pct(total) }} />
        {limites && (
          <>
            <span className="medidor-marca" style={{ left: pct(limites.min) }} aria-hidden="true" />
            <span className="medidor-marca" style={{ left: pct(limites.max) }} aria-hidden="true" />
          </>
        )}
      </div>
      {limites && (
        <div className="medidor-escala" aria-hidden="true">
          <span>0</span>
          <span style={{ left: pct(limites.min) }}>{limites.min}</span>
          <span style={{ left: pct(limites.max) }}>{limites.max}</span>
        </div>
      )}
      {avisos.map((a) => (
        <p key={a.tipo} className={`medidor-aviso medidor-aviso-${a.tipo}`} role="note">
          {textoDoAviso(a)}
        </p>
      ))}
      {avisos.length === 0 && legenda && <p className="medidor-aviso medidor-aviso-ok">{legenda}</p>}
    </div>
  );
}
