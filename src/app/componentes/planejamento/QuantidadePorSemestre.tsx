import { useEffect, useId, useState } from 'react';
import { DISCIPLINAS_POR_SEMESTRE_MAX, DISCIPLINAS_POR_SEMESTRE_MIN } from '../../../dominio/aluno';

interface Props {
  quantidade: number;
  onMudar: (quantidade: number) => void;
}

/** Quantas disciplinas o "Sugerir" escolhe por semestre (`opcoes.disciplinasPorSemestre`, 1 a 12). */
export function QuantidadePorSemestre({ quantidade, onMudar }: Props) {
  const id = useId();
  const [texto, setTexto] = useState(String(quantidade));
  useEffect(() => setTexto(String(quantidade)), [quantidade]);
  return (
    <div className="quantidade">
      <label htmlFor={id}>Quantas disciplinas por semestre?</label>
      <input
        id={id}
        className="campo campo-numero"
        type="number"
        min={DISCIPLINAS_POR_SEMESTRE_MIN}
        max={DISCIPLINAS_POR_SEMESTRE_MAX}
        step={1}
        inputMode="numeric"
        value={texto}
        aria-describedby={`${id}-ajuda`}
        onChange={(ev) => {
          setTexto(ev.target.value);
          const n = Number(ev.target.value);
          if (ev.target.value !== '' && Number.isInteger(n) && n >= DISCIPLINAS_POR_SEMESTRE_MIN && n <= DISCIPLINAS_POR_SEMESTRE_MAX) onMudar(n);
        }}
        onBlur={() => setTexto(String(quantidade))}
      />
      <span id={`${id}-ajuda`} className="muted quantidade-ajuda">
        O botão Sugerir escolhe esse número, começando pelas que mais liberam outras disciplinas do curso.
      </span>
    </div>
  );
}
