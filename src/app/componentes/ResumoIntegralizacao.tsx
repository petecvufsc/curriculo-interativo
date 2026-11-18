import { useMemo } from 'react';
import { avaliarPlano } from '../../dominio/planejamento';
import { formatarHoras, formatarPercentual } from '../estado/formato';
import type { EstadoAluno } from '../estado/useEstadoAluno';

/**
 * Quanto do curso o aluno já integralizou, sempre à vista no topo (regras-de-negocio.md §8).
 * Na aba Planejamento, mostra também quanto terá ao fim do plano (a parte clara da barra).
 */
export function ResumoIntegralizacao({ e }: { e: EstadoAluno }) {
  const { motorDoSemestre } = e;
  const hoje = e.progresso.geral;
  const noPlano = e.aba === 'planejamento';
  const temPlano = e.registro.plano.semestres.length > 0;
  const projetado = useMemo(
    () => (noPlano && temPlano ? avaliarPlano(motorDoSemestre, e.registro).progressoProjetado.geral : null),
    [motorDoSemestre, noPlano, temPlano, e.registro],
  );
  if (hoje.percentual === null || hoje.totalHA === null) return null;

  const pctHoje = hoje.percentual;
  const pctFim = projetado?.percentual ?? pctHoje;
  const ganho = pctFim - pctHoje;
  const texto =
    `${formatarPercentual(pctHoje)}% do curso integralizado` +
    (projetado ? `, ${formatarPercentual(pctFim)}% ao fim do plano` : '');

  return (
    <section className="resumo-integralizacao" aria-labelledby="titulo-resumo">
      <div className="resumo-linha">
        <h2 id="titulo-resumo">Integralização do curso</h2>
        <p className="resumo-percentual">
          <strong>{formatarPercentual(pctHoje)}%</strong> integralizado
        </p>
        <p className="muted resumo-horas">
          {formatarHoras(hoje.cumpridasHA)} de {formatarHoras(hoje.totalHA)} h-a
        </p>
      </div>
      <div
        className="barra-geral"
        role="progressbar"
        aria-labelledby="titulo-resumo"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pctHoje)}
        aria-valuetext={texto}
      >
        {/* A parte clara é o que o plano acrescenta; a sólida é o que já foi integralizado */}
        <div className="barra-geral-plano" style={{ width: `${pctFim}%` }} />
        <div className="barra-geral-hoje" style={{ width: `${pctHoje}%` }} />
      </div>
      {projetado ? (
        <p className="resumo-plano">
          Ao fim do plano: <strong>{formatarPercentual(pctFim)}%</strong>
          {ganho > 0.04 && <span className="muted"> (+{formatarPercentual(ganho)} pontos)</span>}
        </p>
      ) : (
        noPlano && <p className="muted resumo-plano">Monte um plano abaixo para ver quanto do curso você terá integralizado ao fim dele.</p>
      )}
    </section>
  );
}
