import { useRef, type KeyboardEvent } from 'react';
import type { Aba } from '../estado/useEstadoAluno';

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'grade', rotulo: 'Grade' },
  { id: 'planejamento', rotulo: 'Planejamento' },
];

/** Abas acessíveis (padrão WAI-ARIA): setas, Home e End movem o foco e a seleção. */
export function Abas({ aba, onMudar }: { aba: Aba; onMudar: (aba: Aba) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const teclado = (ev: KeyboardEvent, i: number) => {
    const n = ABAS.length;
    const destino =
      ev.key === 'ArrowRight' ? (i + 1) % n : ev.key === 'ArrowLeft' ? (i + n - 1) % n : ev.key === 'Home' ? 0 : ev.key === 'End' ? n - 1 : -1;
    if (destino < 0) return;
    ev.preventDefault();
    onMudar(ABAS[destino].id);
    refs.current[destino]?.focus();
  };

  return (
    <div className="abas" role="tablist" aria-label="Visões do currículo">
      {ABAS.map((a, i) => (
        <button
          key={a.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="tab"
          id={`aba-${a.id}`}
          className="aba"
          aria-selected={aba === a.id}
          aria-controls={`painel-${a.id}`}
          tabIndex={aba === a.id ? 0 : -1}
          onClick={() => onMudar(a.id)}
          onKeyDown={(ev) => teclado(ev, i)}
        >
          {a.rotulo}
        </button>
      ))}
    </div>
  );
}
