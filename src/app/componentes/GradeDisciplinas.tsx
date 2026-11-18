import { useEffect, useRef } from 'react';
import type { Disciplina } from '../../dominio/tipos';
import { fases, optativas } from '../estado/motorEcv';
import type { EstadoAluno } from '../estado/useEstadoAluno';
import { CartaoDisciplina } from './CartaoDisciplina';

function ListaCartoes({ lista, e }: { lista: Disciplina[]; e: EstadoAluno }) {
  const { dispatch } = e;
  return (
    <ul className="lista-cartoes">
      {lista.map((d) => (
        <CartaoDisciplina
          key={d.codigo}
          disciplina={d}
          marcada={e.aprovadas.has(d.codigo)}
          status={e.registro.status[d.codigo]}
          semestrePlano={e.planejadas.get(d.codigo)}
          selecionada={e.selecionada === d.codigo}
          destaque={e.destaques.get(d.codigo)}
          onMarcar={(codigo, marcada) => dispatch({ tipo: 'alternar', codigo, marcada })}
          onSelecionar={(codigo) => dispatch({ tipo: 'selecionar', codigo })}
        />
      ))}
    </ul>
  );
}

function ColunaFase({ fase, lista, e }: { fase: number; lista: Disciplina[]; e: EstadoAluno }) {
  const ref = useRef<HTMLInputElement>(null);
  const n = lista.filter((d) => e.aprovadas.has(d.codigo)).length;
  const todas = lista.length > 0 && n === lista.length;
  const algumas = n > 0 && !todas;
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = algumas;
  }, [algumas]);
  return (
    <section className="fase" aria-labelledby={`fase-${fase}`}>
      <div className="fase-cabecalho">
        <label className="fase-todas" title={`Marcar todas as obrigatórias da ${fase}ª Fase`}>
          <input
            ref={ref}
            type="checkbox"
            aria-label={`Marcar todas as disciplinas obrigatórias da ${fase}ª Fase`}
            checked={todas}
            onChange={(ev) => e.dispatch({ tipo: 'fase', fase, marcada: ev.target.checked })}
          />
        </label>
        <h2 id={`fase-${fase}`}>{fase}ª Fase</h2>
      </div>
      <ListaCartoes lista={lista} e={e} />
    </section>
  );
}

export function GradeDisciplinas({ e }: { e: EstadoAluno }) {
  return (
    <div className="grade">
      <div className="fases">
        {fases.map((f) => (
          <ColunaFase key={f.fase} fase={f.fase} lista={f.disciplinas} e={e} />
        ))}
      </div>
      <section className="optativas" aria-labelledby="titulo-optativas">
        <h2 id="titulo-optativas">Optativas</h2>
        <div className="optativas-grade">
          <ListaCartoes lista={optativas} e={e} />
        </div>
      </section>
    </div>
  );
}
