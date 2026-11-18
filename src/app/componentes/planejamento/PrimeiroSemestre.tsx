import { useEffect, useId, useState } from 'react';
import { proximoSemestreSugerido, semestreValido } from '../../../dominio/planejamento';

interface Props {
  inicial: string | null;
  onMudar: (inicial: string | null) => void;
}

/** Nome do primeiro semestre do plano ("2027.1"). Vazio = semestres sem nome real. */
export function PrimeiroSemestre({ inicial, onMudar }: Props) {
  const id = useId();
  const [texto, setTexto] = useState(inicial ?? '');
  useEffect(() => setTexto(inicial ?? ''), [inicial]);
  const invalido = texto.trim() !== '' && !semestreValido(texto.trim());
  const exemplo = proximoSemestreSugerido(new Date());
  return (
    <div className="quantidade">
      <label htmlFor={id}>Primeiro semestre do plano (opcional)</label>
      <input
        id={id}
        className="campo campo-numero"
        type="text"
        inputMode="decimal"
        placeholder={`Ex.: ${exemplo}`}
        maxLength={6}
        value={texto}
        aria-invalid={invalido}
        aria-describedby={`${id}-ajuda`}
        onChange={(ev) => {
          const v = ev.target.value.trim();
          setTexto(ev.target.value);
          if (v === '') onMudar(null);
          else if (semestreValido(v)) onMudar(v);
        }}
        onBlur={() => setTexto(inicial ?? '')}
      />
      <span id={`${id}-ajuda`} className={invalido ? 'erro-texto' : 'muted quantidade-ajuda'}>
        {invalido ? 'Use o formato AAAA.1 ou AAAA.2, por exemplo 2027.1.' : `Dá nome aos semestres do plano (${exemplo}, depois o seguinte…).`}
      </span>
    </div>
  );
}
