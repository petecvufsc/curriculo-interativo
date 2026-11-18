import { memo } from 'react';
import type { StatusDisciplina } from '../../dominio/aluno';
import type { Disciplina } from '../../dominio/tipos';
import { ROTULOS, type Destaque } from '../estado/destaques';

interface Props {
  disciplina: Disciplina;
  marcada: boolean;
  /** Status salvo (só cursando e reprovada ganham selo; aprovada = caixa marcada). */
  status?: StatusDisciplina;
  /** Número (a partir de 1) do semestre do plano em que a disciplina está. */
  semestrePlano?: number;
  selecionada: boolean;
  destaque?: Destaque;
  onMarcar: (codigo: string, marcada: boolean) => void;
  onSelecionar: (codigo: string) => void;
}

export const CartaoDisciplina = memo(function CartaoDisciplina({
  disciplina: d,
  marcada,
  status,
  semestrePlano,
  selecionada,
  destaque,
  onMarcar,
  onSelecionar,
}: Props) {
  const classes = ['cartao', destaque?.tipo, marcada && 'cursada', destaque?.alternativa && 'alternativa']
    .filter(Boolean)
    .join(' ');
  return (
    // O nome ocupa a largura toda do cartão; o checkbox fica na linha do código, logo abaixo.
    <li className={classes} data-codigo={d.codigo}>
      <button
        type="button"
        className="cartao-nome"
        aria-pressed={selecionada}
        onClick={() => onSelecionar(d.codigo)}
      >
        {d.nome}
      </button>
      <label className="cartao-linha">
        <input
          type="checkbox"
          className="cartao-check"
          aria-label={`Marcar ${d.nome} como cursada`}
          checked={marcada}
          onChange={(e) => onMarcar(d.codigo, e.target.checked)}
        />
        <span className="cartao-codigo">{d.codigo}</span>
        <span className="cartao-horas">· {d.horasAula} h-a</span>
      </label>
      {d.grupo === 'atividades-complementares' && <span className="tag-complementar">Atividades complementares</span>}
      {(status === 'cursando' || status === 'reprovada' || semestrePlano !== undefined) && (
        <span className="selos">
          {status === 'cursando' && <span className="selo selo-cursando">Cursando</span>}
          {status === 'reprovada' && <span className="selo selo-reprovada">Reprovada</span>}
          {semestrePlano !== undefined && <span className="selo selo-planejada">Planejada (S{semestrePlano})</span>}
        </span>
      )}
      {destaque && (
        <span className="selos">
          <span className={`selo selo-${destaque.tipo}`}>{ROTULOS[destaque.tipo]}</span>
          {destaque.alternativa && <span className="selo-alt">alternativa</span>}
        </span>
      )}
    </li>
  );
});
