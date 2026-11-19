import { useEffect, useState } from 'react';

/** Larguras em que o painel deixa de ficar ao lado da grade e vira gaveta (ver base.css e painel.css). */
export const MIDIA_PAINEL_AO_LADO = '(min-width: 1620px)';
/** Notebook e tablet: a gaveta sai pela direita e abre sozinha ao escolher uma disciplina. No celular ela sobe de baixo. */
export const MIDIA_GAVETA_LATERAL = '(min-width: 768px)';

function consultar(midia: string, padrao: boolean): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return padrao;
  return window.matchMedia(midia).matches;
}

/**
 * Acompanha uma media query. Sem `matchMedia` (ambiente de testes antigo), devolve `padrao`: os testes existentes
 * enxergam a tela larga, com o painel sempre visível ao lado da grade.
 */
export function useMidia(midia: string, padrao: boolean): boolean {
  const [vale, setVale] = useState(() => consultar(midia, padrao));
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const lista = window.matchMedia(midia);
    const mudar = () => setVale(lista.matches);
    mudar();
    lista.addEventListener?.('change', mudar);
    return () => lista.removeEventListener?.('change', mudar);
  }, [midia]);
  return vale;
}
