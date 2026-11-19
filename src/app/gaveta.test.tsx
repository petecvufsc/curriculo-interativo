// @vitest-environment jsdom
// Painel em gaveta abaixo de 1620 px: notebook/tablet (gaveta à direita, abre ao escolher disciplina) e celular
// (gaveta de baixo, só pelo botão). A tela larga continua com o painel ao lado (coberta pelos demais testes).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { fixarHoje } from './testeAuxiliar';

/** Simula uma tela de `largura` px para as media queries `(min-width: N px)`. */
function simularLargura(largura: number) {
  vi.stubGlobal('matchMedia', (q: string) => {
    const n = Number(/min-width:\s*(\d+)/.exec(q)?.[1] ?? 0);
    return { matches: largura >= n, media: q, addEventListener: () => {}, removeEventListener: () => {} };
  });
}

beforeEach(() => {
  localStorage.clear();
  fixarHoje();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  cleanup();
  localStorage.clear();
});

const painel = () => document.getElementById('painel') as HTMLElement;
const botaoPainel = () => screen.getByRole('button', { name: /^(Resumo e ações|Detalhes: )/ });

describe('notebook (1366 px)', () => {
  beforeEach(() => simularLargura(1366));

  it('a gaveta começa fechada, fora do teclado, e o botão "Resumo e ações" a abre com o foco nela', async () => {
    const u = userEvent.setup();
    render(<App />);
    expect(painel().className).toMatch(/gaveta/);
    expect(painel().className).not.toMatch(/aberta/);
    expect(painel().hasAttribute('inert')).toBe(true);
    expect(botaoPainel().getAttribute('aria-expanded')).toBe('false');

    await u.click(botaoPainel());
    expect(painel().className).toMatch(/aberta/);
    expect(painel().hasAttribute('inert')).toBe(false);
    expect(botaoPainel().getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(painel());
    expect(within(painel()).getByRole('button', { name: 'Simular' })).toBeTruthy();
  });

  it('"Fechar" fecha a gaveta e devolve o foco ao botão', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(botaoPainel());
    await u.click(within(painel()).getByRole('button', { name: /Fechar/ }));
    expect(painel().className).not.toMatch(/aberta/);
    expect(document.activeElement).toBe(botaoPainel());
  });

  it('Esc fecha a gaveta, com o foco dentro dela ou na grade', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(botaoPainel());
    await u.keyboard('{Escape}');
    expect(painel().className).not.toMatch(/aberta/);
    expect(document.activeElement).toBe(botaoPainel());

    await u.click(botaoPainel());
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(painel().className).not.toMatch(/aberta/);
  });

  it('clicar no nome de uma disciplina abre a gaveta no detalhe, sem tirar o foco da grade', async () => {
    const u = userEvent.setup();
    render(<App />);
    const nome = screen.getAllByRole('button', { name: /Cálculo 1/ })[0];
    await u.click(nome);
    expect(painel().className).toMatch(/aberta/);
    expect(within(painel()).getAllByText(/Cálculo 1/).length).toBeGreaterThan(0);
    expect(botaoPainel().textContent).toMatch(/Detalhes: Cálculo 1/);
    expect(painel().contains(document.activeElement)).toBe(false);
  });

  it('o atalho "Pular para o resumo e as ações" abre a gaveta', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole('link', { name: 'Pular para o resumo e as ações' }));
    expect(painel().className).toMatch(/aberta/);
    expect(document.activeElement).toBe(painel());
  });

  it('na aba Planejamento a barra continua dando acesso ao painel (sem "Simular")', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole('tab', { name: 'Planejamento' }));
    const barra = screen.getByRole('navigation', { name: 'Ações rápidas' });
    expect(within(barra).queryByRole('button', { name: 'Simular' })).toBeNull();
    await u.click(within(barra).getByRole('button', { name: 'Resumo e ações' }));
    expect(painel().className).toMatch(/aberta/);
  });
});

describe('celular (375 px)', () => {
  beforeEach(() => simularLargura(375));

  it('escolher uma disciplina não abre a gaveta (cobriria a grade); o botão passa a dizer "Detalhes: <nome>"', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getAllByRole('button', { name: /Cálculo 1/ })[0]);
    expect(painel().className).not.toMatch(/aberta/);
    await u.click(botaoPainel());
    expect(painel().className).toMatch(/aberta/);
  });
});

describe('tela larga (1920 px)', () => {
  beforeEach(() => simularLargura(1920));

  it('o painel fica ao lado, sem gaveta nem botão Fechar', () => {
    render(<App />);
    expect(painel().className).not.toMatch(/gaveta/);
    expect(painel().hasAttribute('inert')).toBe(false);
    expect(within(painel()).queryByRole('button', { name: /Fechar/ })).toBeNull();
  });
});
