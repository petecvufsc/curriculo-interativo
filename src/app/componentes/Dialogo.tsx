import { useEffect, useId, useRef, type ReactNode } from 'react';

interface Props {
  aberto: boolean;
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
}

/** Modal acessível sobre <dialog> nativo: Esc fecha e o foco volta ao elemento que abriu. */
export function Dialogo({ aberto, titulo, onFechar, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const origem = useRef<HTMLElement | null>(null);
  // Um id por diálogo: com id fixo, o "Sobre" seria anunciado com o título do "Ajuda".
  const idTitulo = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (aberto && !el.open) {
      origem.current = document.activeElement as HTMLElement | null;
      if (typeof el.showModal === 'function') el.showModal();
      else el.setAttribute('open', '');
    } else if (!aberto && el.open) {
      if (typeof el.close === 'function') el.close();
      else el.removeAttribute('open');
      origem.current?.focus();
    }
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      className="dialogo"
      aria-labelledby={idTitulo}
      onClose={() => {
        origem.current?.focus();
        onFechar();
      }}
      onCancel={(ev) => {
        ev.preventDefault();
        onFechar();
      }}
      onClick={(ev) => {
        if (ev.target === ref.current) onFechar();
      }}
    >
      <div className="dialogo-corpo">
        <h2 id={idTitulo}>{titulo}</h2>
        {aberto && children}
        <button type="button" className="botao" onClick={onFechar}>
          Fechar
        </button>
      </div>
    </dialog>
  );
}
