// @vitest-environment jsdom
// Regressões da revisão de acessibilidade (docs/acessibilidade.md). O contraste e o tamanho dos
// alvos dependem de CSS, que o jsdom não aplica: foram medidos no navegador e estão no documento.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

describe('acessibilidade', () => {
  it('atalhos para pular a grade apontam para elementos que existem', () => {
    render(<App />);
    const atalhos = screen.getAllByRole('link').filter((a) => a.classList.contains('pular'));
    expect(atalhos.map((a) => a.textContent)).toEqual(['Pular para as disciplinas', 'Pular para o resumo e as ações']);
    for (const a of atalhos) {
      const alvo = document.querySelector(a.getAttribute('href')!);
      expect(alvo, a.getAttribute('href')!).not.toBeNull();
    }
  });

  it('nenhum id se repete na página (o "Sobre" era anunciado como "Ajuda")', () => {
    render(<App />);
    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it('cada diálogo é nomeado pelo próprio título', async () => {
    const u = userEvent.setup();
    render(<App />);
    const topo = screen.getByRole('banner');
    await u.click(within(topo).getByRole('button', { name: 'Sobre' }));
    expect(screen.getByRole('dialog', { name: 'Sobre' })).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: 'Ajuda' })).toBeNull();
  });

  it('todo botão, caixa e aba tem nome acessível', () => {
    render(<App />);
    const semNome = [...document.querySelectorAll('button, input:not([type=radio]), [role=tab]')].filter((e) => {
      const nome = e.getAttribute('aria-label') || (e as HTMLInputElement).labels?.[0]?.textContent || e.textContent;
      return !nome?.trim();
    });
    expect(semNome.map((e) => e.outerHTML)).toEqual([]);
  });

  it('a fase tem título com nome completo, mesmo com o círculo numerado decorativo', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: '1ª Fase' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '10ª Fase' })).toBeTruthy();
  });

  it('os destinos dos atalhos podem receber foco (senão o leitor de tela não anuncia o destino)', () => {
    render(<App />);
    const principal = screen.getByRole('main');
    expect(principal.id).toBe('conteudo');
    expect(principal.getAttribute('tabindex')).toBe('-1');
    const painel = screen.getByRole('complementary', { name: 'Resumo e ações' });
    expect(painel.id).toBe('painel');
    expect(painel.getAttribute('tabindex')).toBe('-1');
  });
});
