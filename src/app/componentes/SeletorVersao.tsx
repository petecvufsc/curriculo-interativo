import { useId } from 'react';
import {
  ALTERACOES_2028_1,
  AVISO_FIM_VERSAO_2020_1,
  AVISO_VERSAO_UNICA,
  DESCRICAO_VERSAO,
  versao2020Disponivel,
  versaoRegrasValida,
  versoesDisponiveis,
} from '../../dominio/curriculos/versoes';
import { hojeIso, porCodigo } from '../estado/motorEcv';
import type { EstadoAluno } from '../estado/useEstadoAluno';

/** "A + B" (todas) e " ou " entre alternativas; vazio = sem pré-requisito. */
const textoRequisito = (grupos: string[][]) => (grupos.length === 0 ? 'nenhum' : grupos.map((g) => g.join(' + ')).join(' ou '));

/**
 * Escolha da versão das regras de pré-requisito (decisão D5): 2020.1, com os pré-requisitos atuais, ou 2028.1,
 * com os novos. A troca recalcula grade, simulação e planejamento; o histórico do aluno não muda.
 */
export function SeletorVersao({ e }: { e: EstadoAluno }) {
  const id = useId();
  // Versão aplicada hoje: depois da data de corte, a 2020.1 some e só resta a 2028.1 (mesmo que a 2020.1 esteja salva).
  const versao = e.versao;
  const disponiveis = versoesDisponiveis(hojeIso());
  const encerrada = !versao2020Disponivel(hojeIso());
  return (
    <section className="versao" aria-labelledby={`${id}-rotulo`}>
      <div className="versao-linha">
        <label id={`${id}-rotulo`} htmlFor={id}>
          Regras de pré-requisitos
        </label>
        <select
          id={id}
          className="campo"
          value={versao}
          onChange={(ev) => {
            if (versaoRegrasValida(ev.target.value)) e.dispatch({ tipo: 'opcoes', opcoes: { versaoRegras: ev.target.value } });
          }}
        >
          {disponiveis.map((v) => (
            <option key={v} value={v}>
              {DESCRICAO_VERSAO[v]}
            </option>
          ))}
        </select>
      </div>
      <p className="versao-aviso">
        {encerrada
          ? AVISO_VERSAO_UNICA
          : `${
              versao === '2028.1'
                ? 'Você está vendo os novos pré-requisitos, que só valem a partir de 2028.1.'
                : 'Valem os pré-requisitos atuais; quatro disciplinas mudam em 2028.1.'
            } ${AVISO_FIM_VERSAO_2020_1}`}
      </p>
      <details className="versao-mudancas">
        <summary>Ver o que muda em 2028.1</summary>
        <ul>
          {ALTERACOES_2028_1.map((a) => (
            <li key={a.codigo}>
              <strong>
                {a.codigo} {porCodigo.get(a.codigo)?.nome}
              </strong>
              : de {textoRequisito(a.antes)} para {textoRequisito(a.depois)}.
            </li>
          ))}
        </ul>
        <p className="muted">Fonte: comunicado da Coordenação do Curso, repassado pelo CALEC em 18/11/2026. Confirme sempre no CAGR.</p>
      </details>
    </section>
  );
}
