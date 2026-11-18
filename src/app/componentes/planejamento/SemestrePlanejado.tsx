import { useMemo, useState, type DragEvent } from 'react';
import {
  baseDoSemestre,
  disponiveisNoSemestre,
  impactoDe,
  rotuloSemestre,
  sugerirSemestre,
  type SemestreAvaliado,
} from '../../../dominio/planejamento';
import { textoCreditos } from '../../estado/creditos';
import { versaoDoSemestre } from '../../../dominio/curriculos/versoes';
import type { Motor } from '../../../dominio/regras';
import { porCodigo } from '../../estado/motorEcv';
import type { EstadoAluno } from '../../estado/useEstadoAluno';
import { AdicionarDisciplina } from './AdicionarDisciplina';
import { MedidorCreditos } from './MedidorCreditos';
import { textosDoProblema } from './textosPlano';

/** Tipo do dado arrastado entre semestres (só o app reconhece; arrastar texto ou arquivos de fora não faz nada). */
const TIPO_ARRASTO = 'application/x-disciplina-plano';

interface Props {
  e: EstadoAluno;
  semestre: SemestreAvaliado;
  /** Id do texto que rotula as sugestões como automáticas. */
  idSugestao: string;
}

/** Quantas outras disciplinas do curso esta libera (direta ou indiretamente). */
function Impacto({ motor, codigo }: { motor: Motor; codigo: string }) {
  const n = impactoDe(motor, codigo);
  if (n === 0) return null;
  return (
    <span className="impacto" title="Quantas outras disciplinas do curso dependem desta, direta ou indiretamente">
      libera {n}
    </span>
  );
}

/** Um semestre do plano, como uma coluna: título, medidor de créditos, linhas enxutas e a busca. */
export function SemestrePlanejado({ e, semestre: s, idSugestao }: Props) {
  const { registro, dispatch, motorDoSemestre } = e;
  const totalSemestres = registro.plano.semestres.length;
  const k = s.numero;
  const indice = k - 1;
  // Regras do período deste semestre (até 2027.2 as atuais; de 2028.1 em diante as novas)
  const motor = motorDoSemestre(k);
  const disponiveis = useMemo(() => disponiveisNoSemestre(motorDoSemestre, registro, k), [motorDoSemestre, registro, k]);
  const rotulo = rotuloSemestre(e.inicioPlano, k);
  const proximo = k === 1 ? ' (próximo)' : '';
  const titulo = `${rotulo ?? `Semestre ${k}`}${proximo}`;
  // Nome usado nos nomes acessíveis e nas perguntas de confirmação: o número do semestre (o nome real está no título)
  const nome = `semestre ${k}`;
  const faixa = motor.curriculo.integralizacao?.aulasSemanais ?? null;
  // Primeiro semestre do plano em que passam a valer os novos pré-requisitos: avisa a virada
  const virada =
    versaoDoSemestre(rotulo) === '2028.1' && (k === 1 || versaoDoSemestre(rotuloSemestre(e.inicioPlano, k - 1)) !== '2028.1');

  const sugerir = () => {
    if (s.itens.length > 0 && !window.confirm(`Substituir as disciplinas do ${nome} pela sugestão automática?`)) return;
    const { limiteAulas, disciplinasPorSemestre } = registro.opcoes;
    const codigos = sugerirSemestre(motor, baseDoSemestre(motor, registro, k), limiteAulas, disciplinasPorSemestre);
    dispatch({ tipo: 'plano', op: { tipo: 'substituir', indice, codigos } });
  };

  const remover = () => {
    if (s.itens.length > 0 && !window.confirm(`Remover o ${nome} e as ${s.itens.length} disciplinas planejadas nele?`)) return;
    dispatch({ tipo: 'plano', op: { tipo: 'removerSemestre', indice } });
  };

  // Arrastar uma disciplina de outro semestre e soltar aqui (equivale a "Mover para…", que também serve a teclado e toque)
  const [alvo, setAlvo] = useState(false);
  const traz = (ev: DragEvent<HTMLElement>) => ev.dataTransfer.types.includes(TIPO_ARRASTO);
  const nomesDosSemestres = Array.from({ length: totalSemestres }, (_, i) => rotuloSemestre(e.inicioPlano, i + 1) ?? `Semestre ${i + 1}`);

  return (
    <li
      className={`semestre${alvo ? ' alvo-soltar' : ''}`}
      aria-labelledby={`semestre-${k}`}
      onDragOver={(ev) => {
        if (!traz(ev)) return;
        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'move';
        if (!alvo) setAlvo(true);
      }}
      onDragLeave={(ev) => {
        if (!ev.currentTarget.contains(ev.relatedTarget as Node | null)) setAlvo(false);
      }}
      onDrop={(ev) => {
        setAlvo(false);
        if (!traz(ev)) return;
        ev.preventDefault();
        try {
          const origem = JSON.parse(ev.dataTransfer.getData(TIPO_ARRASTO)) as { indice: number; posicao: number };
          if (origem.indice !== indice) dispatch({ tipo: 'plano', op: { tipo: 'mover', indice: origem.indice, posicao: origem.posicao, para: indice } });
        } catch {
          /* dado de arrasto inválido: ignora */
        }
      }}
    >
      <header className="semestre-topo">
        <h3 id={`semestre-${k}`}>{titulo}</h3>
        <div className="semestre-acoes">
          <button type="button" className="botao pequeno" aria-describedby={idSugestao} aria-label={`Sugerir disciplinas para o ${nome}`} onClick={sugerir}>
            Sugerir
          </button>
          <button type="button" className="botao pequeno perigo" aria-label={`Remover o ${nome}`} onClick={remover}>
            Remover semestre
          </button>
        </div>
      </header>

      {virada && (
        <p className="semestre-virada">A partir daqui valem os novos pré-requisitos (versão 2028.1).</p>
      )}
      <p className="semestre-total">
        <strong>
          {s.totalAulas} créditos · {s.totalHorasAula} h-a
        </strong>
      </p>
      <MedidorCreditos total={s.totalAulas} limites={faixa} avisos={s.avisos} />

      {s.itens.length === 0 ? (
        <p className="muted semestre-vazio">Nenhuma disciplina neste semestre.</p>
      ) : (
        <ul className="itens-plano">
          {s.itens.map((item, posicao) => {
            const d = porCodigo.get(item.codigo);
            return (
              <li
                key={`${item.codigo}-${posicao}`}
                className={`item-plano${item.problemas.length ? ' com-problema' : ''}`}
                draggable
                onDragStart={(ev) => {
                  ev.dataTransfer.setData(TIPO_ARRASTO, JSON.stringify({ indice, posicao }));
                  ev.dataTransfer.effectAllowed = 'move';
                }}
              >
                <div className="item-plano-linha">
                  <div className="item-plano-textos">
                    <span className="item-plano-nome">{d ? d.nome : item.codigo}</span>
                    <span className="item-plano-meta">
                      <span className="muted">{d ? `${item.codigo} · ${textoCreditos(d)}` : item.codigo}</span>
                      <Impacto motor={motor} codigo={item.codigo} />
                    </span>
                  </div>
                  <button
                    type="button"
                    className="botao-x"
                    title="Remover do semestre"
                    aria-label={`Remover ${d?.nome ?? item.codigo} do ${nome}`}
                    onClick={() => dispatch({ tipo: 'plano', op: { tipo: 'remover', indice, posicao } })}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                {totalSemestres > 1 && (
                  <select
                    className="mover-para"
                    value=""
                    aria-label={`Mover ${d?.nome ?? item.codigo} do ${nome} para outro semestre`}
                    onChange={(ev) => {
                      if (ev.target.value !== '')
                        dispatch({ tipo: 'plano', op: { tipo: 'mover', indice, posicao, para: Number(ev.target.value) } });
                    }}
                  >
                    <option value="">Mover para…</option>
                    {nomesDosSemestres.map((n, i) =>
                      i === indice ? null : (
                        <option key={i} value={i}>
                          {n}
                        </option>
                      ),
                    )}
                  </select>
                )}
                {item.problemas.map((p, i) => (
                  <p key={i} className="problema">
                    {textosDoProblema(p).map((linha, j) => (
                      <span key={j}>{linha}</span>
                    ))}
                  </p>
                ))}
              </li>
            );
          })}
        </ul>
      )}

      <AdicionarDisciplina
        motor={motor}
        nomeSemestre={nome}
        codigos={disponiveis}
        onAdicionar={(codigo) => dispatch({ tipo: 'plano', op: { tipo: 'adicionar', indice, codigo } })}
      />
    </li>
  );
}
