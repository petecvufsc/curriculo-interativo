import { describe, expect, it } from 'vitest';
import { urlsDoSite } from './registrarServiceWorker';

const escopo = 'https://petecvufsc.github.io/curriculo-interativo/';

describe('urlsDoSite (arquivos para o uso offline na 1ª visita, achado B-04)', () => {
  it('guarda os arquivos do próprio site dentro do escopo, sem repetir', () => {
    const r = urlsDoSite(
      [
        'https://petecvufsc.github.io/curriculo-interativo/assets/index-abc.js',
        'https://petecvufsc.github.io/curriculo-interativo/assets/index-abc.js',
        'https://petecvufsc.github.io/curriculo-interativo/assets/fonte.woff2?v=1#x',
      ],
      escopo,
    );
    expect(r).toEqual([
      'https://petecvufsc.github.io/curriculo-interativo/assets/index-abc.js',
      'https://petecvufsc.github.io/curriculo-interativo/assets/fonte.woff2?v=1',
    ]);
  });

  it('ignora outros domínios, outros caminhos e endereços inválidos', () => {
    const r = urlsDoSite(
      [
        'https://cdn.exemplo.com/x.js',
        'https://petecvufsc.github.io/outro-projeto/a.js',
        'http://',
        'https://petecvufsc.github.io/curriculo-interativo/assets/ok.css',
      ],
      escopo,
    );
    expect(r).toEqual(['https://petecvufsc.github.io/curriculo-interativo/assets/ok.css']);
  });

  it('no máximo 100 arquivos', () => {
    const muitos = Array.from({ length: 500 }, (_, i) => `${escopo}assets/a${i}.js`);
    expect(urlsDoSite(muitos, escopo)).toHaveLength(100);
  });
});
