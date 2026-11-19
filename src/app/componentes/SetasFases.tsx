import { useEffect, useState } from 'react';

/** Largura de uma coluna de fase (125 px) mais o vão entre colunas (6 px). Ver grade.css. */
const COLUNA = 131;
/** Rolar três colunas por clique. */
const PASSO = 3 * COLUNA;

interface Estado {
  rola: boolean;
  primeira: number;
  ultima: number;
  total: number;
  esquerda: boolean;
  direita: boolean;
}

const PARADO: Estado = { rola: false, primeira: 1, ultima: 1, total: 0, esquerda: false, direita: false };

/**
 * Com a gaveta aberta em notebook (1362 a 1619 px), a grade de 10 fases rola na horizontal dentro do próprio espaço
 * (ver base.css). A barra de rolagem nativa fica no fim da grade, fora da tela; estas setas, na barra fixa, rolam
 * três fases por vez e dizem quais estão à vista. Também: o Tab até uma disciplina meio escondida a traz inteira à
 * vista (o navegador não rola sozinho quando a coluna está só parcialmente visível) e as bordas esmaecem quando há
 * mais fases daquele lado. Fora dessa situação (grade cabe inteira) não aparece nada.
 */
export function SetasFases() {
  const [estado, setEstado] = useState<Estado>(PARADO);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>('#painel-grade .fases');
    if (!el) return;
    const medir = () => {
      const total = el.children.length;
      const rola = el.scrollWidth > el.clientWidth + 1;
      const esquerda = rola && el.scrollLeft > 1;
      const direita = rola && el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
      el.classList.toggle('rola-esq', esquerda);
      el.classList.toggle('rola-dir', direita);
      const primeira = Math.min(total, Math.ceil((el.scrollLeft - 2) / COLUNA) + 1);
      const ultima = Math.max(primeira, Math.min(total, Math.floor((el.scrollLeft + el.clientWidth + 8) / COLUNA)));
      setEstado({ rola, primeira, ultima, total, esquerda, direita });
    };
    const aoFocar = (ev: FocusEvent) => {
      const alvo = (ev.target as HTMLElement).getBoundingClientRect();
      const caixa = el.getBoundingClientRect();
      if (alvo.left < caixa.left) el.scrollLeft -= caixa.left - alvo.left + 8;
      else if (alvo.right > caixa.right) el.scrollLeft += alvo.right - caixa.right + 8;
    };
    medir();
    el.addEventListener('scroll', medir, { passive: true });
    el.addEventListener('focusin', aoFocar);
    window.addEventListener('resize', medir);
    const observador = typeof ResizeObserver === 'function' ? new ResizeObserver(medir) : null;
    observador?.observe(el);
    return () => {
      el.removeEventListener('scroll', medir);
      el.removeEventListener('focusin', aoFocar);
      window.removeEventListener('resize', medir);
      observador?.disconnect();
      el.classList.remove('rola-esq', 'rola-dir');
    };
  }, []);

  if (!estado.rola) return null;
  const rolar = (sentido: 1 | -1) =>
    document.querySelector<HTMLElement>('#painel-grade .fases')?.scrollBy({ left: sentido * PASSO, behavior: 'smooth' });
  return (
    <div className="setas-fases" role="group" aria-label="Rolar as fases da grade">
      <button type="button" className="botao seta-fases" aria-label="Fases anteriores" disabled={!estado.esquerda} onClick={() => rolar(-1)}>
        <span aria-hidden="true">◀</span>
      </button>
      <span className="setas-fases-texto" aria-live="polite">
        Fases {estado.primeira} a {estado.ultima} de {estado.total}
      </span>
      <button type="button" className="botao seta-fases" aria-label="Próximas fases" disabled={!estado.direita} onClick={() => rolar(1)}>
        <span aria-hidden="true">▶</span>
      </button>
    </div>
  );
}
