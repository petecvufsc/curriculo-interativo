// Registra o service worker (public/sw.js) só no build de produção: no `npm run dev` ele
// atrapalharia o recarregamento automático.
export function registrarServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((erro) => {
      console.warn('Não foi possível ativar o uso offline:', erro);
    });
  });
}
