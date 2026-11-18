// Registra o service worker (public/sw.js) só no build de produção: no `npm run dev` ele
// atrapalharia o recarregamento automático.

/**
 * Arquivos do próprio site que a página já carregou (JS, CSS, fontes, ícones): o service worker os guarda para o uso
 * offline já na PRIMEIRA visita. Sem isto, só entram no cache a partir da segunda visita, porque esses arquivos são
 * baixados antes de o service worker assumir o controle da página. Pura (recebe os nomes das requisições e o endereço).
 */
export function urlsDoSite(recursos: readonly string[], escopo: string): string[] {
  const base = new URL(escopo);
  const unicas = new Set<string>();
  for (const r of recursos) {
    try {
      const u = new URL(r, base);
      if (u.origin === base.origin && u.pathname.startsWith(base.pathname)) {
        u.hash = '';
        unicas.add(u.href);
      }
    } catch {
      /* recurso com endereço inválido: ignora */
    }
  }
  return [...unicas].slice(0, 100);
}

export function registrarServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then(() => navigator.serviceWorker.ready)
      .then((registro) => {
        const recursos = performance.getEntriesByType('resource').map((e) => e.name);
        registro.active?.postMessage({ tipo: 'guardar', urls: urlsDoSite(recursos, registro.scope) });
      })
      .catch((erro) => {
        console.warn('Não foi possível ativar o uso offline:', erro);
      });
  });
}
