import type { ExpressaoRequisito } from '../../dominio/tipos';
import { porCodigo, rotuloCodigo } from '../estado/motorEcv';
import { linhasFaltantes } from '../estado/textoFaltantes';
import { SituacaoHistorico } from './SituacaoHistorico';
import type { EstadoAluno } from '../estado/useEstadoAluno';

/** "A e B" / "ou" — mesma notação do PDF. */
function Expressao({ expr }: { expr: ExpressaoRequisito }) {
  if (expr.length === 0) return <>Nenhum</>;
  return (
    <ul className="expressao">
      {expr.map((grupo, i) => (
        <li key={i}>
          {i > 0 && <span className="ou">ou </span>}
          {grupo.map((c) => rotuloCodigo(c)).join(' e ')}
        </li>
      ))}
    </ul>
  );
}

function ListaRelacao({
  titulo,
  itens,
  onSelecionar,
}: {
  titulo: string;
  itens: [string, boolean][];
  onSelecionar: (c: string) => void;
}) {
  if (itens.length === 0) return null;
  return (
    <div className="relacao">
      <dt>{titulo}</dt>
      <dd>
        <ul>
          {itens.map(([c, alt]) => (
            <li key={c}>
              <button type="button" className="link" aria-label={`Selecionar ${porCodigo.get(c)?.nome ?? c}`} onClick={() => onSelecionar(c)}>
                {porCodigo.get(c)?.nome ?? c}
              </button>
              <span className="muted"> ({c}){alt ? ' (alternativa)' : ''}</span>
            </li>
          ))}
        </ul>
      </dd>
    </div>
  );
}

export function DetalheDisciplina({ e }: { e: EstadoAluno }) {
  const d = e.selecionada ? porCodigo.get(e.selecionada) : undefined;
  if (!d) {
    return (
      <section className="detalhe" aria-labelledby="titulo-detalhe">
        <h2 id="titulo-detalhe">Disciplina selecionada</h2>
        <p className="muted">Clique no nome de uma disciplina para ver os detalhes e as relações.</p>
      </section>
    );
  }
  const { motor } = e;
  const sit = motor.situacao(d.codigo, e.base);
  const sel = (codigo: string) => e.dispatch({ tipo: 'selecionar', codigo });
  const lista = (m: ReturnType<typeof motor.preRequisitos>, direto: boolean): [string, boolean][] =>
    [...m].filter(([, r]) => (r.distancia === 1) === direto).map(([c, r]) => [c, r.viaAlternativa]);
  return (
    <section className="detalhe" aria-labelledby="titulo-detalhe">
      <h2 id="titulo-detalhe">Disciplina selecionada</h2>
      <a className="link voltar" href="#conteudo">
        ↑ Voltar às disciplinas
      </a>
      <p className="detalhe-nome">
        <strong>{d.codigo}</strong> — {d.nome}
      </p>
      <SituacaoHistorico
        codigo={d.codigo}
        atual={e.registro.status[d.codigo] ?? 'nao-cursada'}
        onMudar={(status) => e.dispatch({ tipo: 'status', codigo: d.codigo, status })}
      />
      <dl className="ficha">
        <dt>Tipo</dt>
        <dd>{d.tipo === 'obrigatoria' ? 'Obrigatória' : 'Optativa'}</dd>
        {d.fase !== null && (
          <>
            <dt>Fase</dt>
            <dd>{d.fase}ª</dd>
          </>
        )}
        <dt>Horas-aula</dt>
        <dd>{d.horasAula} h-a</dd>
        <dt>Créditos</dt>
        <dd>{d.foraDoLimiteDeAulas ? `${d.aulasSemanais} (não contam no limite de créditos do semestre)` : d.aulasSemanais}</dd>
        <dt>Situação</dt>
        <dd data-testid="situacao">
          {e.registro.status[d.codigo] === 'cursando'
            ? 'Cursando'
            : sit.tipo === 'cumprida'
              ? 'Cumprida'
              : sit.tipo === 'disponivel'
                ? 'Disponível'
                : 'Bloqueada'}
        </dd>
      </dl>
      {sit.tipo === 'bloqueada' && (
        <p className="faltantes">
          {linhasFaltantes(sit.faltantes).map((linha) => (
            <span key={linha} className="faltante">
              {linha}
            </span>
          ))}
        </p>
      )}
      <h3>Pré-requisitos</h3>
      <Expressao expr={d.preRequisitos} />
      {d.equivalentes.length > 0 && (
        <>
          <h3>Equivalências</h3>
          <Expressao expr={d.equivalentes} />
        </>
      )}
      {d.alertas.map((a, i) => (
        <p key={i} className="alerta" role="note">
          <strong>Atenção:</strong> {a}
        </p>
      ))}
      {e.modo === 'relacoes' && (
        <dl className="relacoes">
          <ListaRelacao titulo="Pré-requisitos diretos" itens={lista(motor.preRequisitos(d.codigo), true)} onSelecionar={sel} />
          <ListaRelacao titulo="Pré-requisitos indiretos" itens={lista(motor.preRequisitos(d.codigo), false)} onSelecionar={sel} />
          <ListaRelacao titulo="Tranca diretamente" itens={lista(motor.dependentes(d.codigo), true)} onSelecionar={sel} />
          <ListaRelacao titulo="Tranca indiretamente" itens={lista(motor.dependentes(d.codigo), false)} onSelecionar={sel} />
        </dl>
      )}
    </section>
  );
}
