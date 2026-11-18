import { useId, useMemo } from 'react';
import { opcoesDeInicio, semestreValido, somarSemestres } from '../../../dominio/planejamento';

interface Props {
  /** Primeiro semestre do plano (sempre existe: sem escolha, o próximo do calendário). */
  inicio: string;
  onMudar: (inicio: string) => void;
}

/**
 * Primeiro semestre do plano, obrigatório e no formato AAAA.1 ou AAAA.2. O nome não é digitado: escolhe-se numa
 * lista, e os semestres seguintes são nomeados em sequência (2027.2, 2028.1…). O nome importa: define quais
 * pré-requisitos valem em cada semestre (decisão D5).
 */
export function PrimeiroSemestre({ inicio, onMudar }: Props) {
  const id = useId();
  const opcoes = useMemo(() => opcoesDeInicio(new Date(), inicio), [inicio]);
  const segundo = somarSemestres(inicio, 1);
  return (
    <div className="quantidade">
      <label htmlFor={id}>Primeiro semestre do plano</label>
      <select
        id={id}
        className="campo"
        value={inicio}
        aria-describedby={`${id}-ajuda`}
        onChange={(ev) => {
          if (semestreValido(ev.target.value)) onMudar(ev.target.value);
        }}
      >
        {opcoes.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span id={`${id}-ajuda`} className="muted quantidade-ajuda">
        Os semestres seguintes são nomeados em sequência ({inicio}, {segundo}…). Cada um usa os pré-requisitos do seu período.
      </span>
    </div>
  );
}
