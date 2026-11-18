// Service worker do Currículo Interativo: permite usar o app sem internet depois da primeira visita.
// Estratégias:
//  - páginas (navegação): rede primeiro; sem rede, a última versão salva;
//  - /assets/* (arquivos com hash no nome, nunca mudam): cache primeiro;
//  - demais arquivos do próprio site: devolve o salvo e atualiza em segundo plano.
// Para forçar a limpeza dos caches antigos em todos os alunos, troque VERSAO.
const VERSAO = 'v1';
const CACHE = `curriculo-ecv-${VERSAO}`;
const escopo = new URL(self.registration.scope);
const PAGINA = new URL('./', escopo).href;
const PRECACHE = [PAGINA, new URL('manifest.webmanifest', escopo).href, new URL('icones/icone-192.png', escopo).href];

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith('curriculo-ecv-') && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

async function guardar(requisicao, resposta) {
  if (resposta && resposta.ok) {
    const c = await caches.open(CACHE);
    await c.put(requisicao, resposta.clone());
  }
  return resposta;
}

self.addEventListener('fetch', (evento) => {
  const req = evento.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== escopo.origin) return;

  if (req.mode === 'navigate') {
    evento.respondWith(
      fetch(req)
        .then((r) => guardar(PAGINA, r))
        .catch(() => caches.match(PAGINA)),
    );
    return;
  }

  if (url.pathname.includes('/assets/')) {
    evento.respondWith(caches.match(req).then((salvo) => salvo || fetch(req).then((r) => guardar(req, r))));
    return;
  }

  evento.respondWith(
    caches.match(req).then((salvo) => {
      const rede = fetch(req)
        .then((r) => guardar(req, r))
        .catch(() => salvo);
      return salvo || rede;
    }),
  );
});
