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
const botaoPainel = () => document.getElementById('botao-painel') as HTMLElement;
const alca = () => document.getElementById('alca-painel') as HTMLElement;

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

  it('"Fechar" fecha a gaveta e devolve o foco à aba da borda (o controle visível no computador)', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(botaoPainel());
    await u.click(within(painel()).getByRole('button', { name: /Fechar/ }));
    expect(painel().className).not.toMatch(/aberta/);
    expect(document.activeElement).toBe(alca());
  });

  it('Esc fecha a gaveta, com o foco dentro dela ou na grade', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(botaoPainel());
    await u.keyboard('{Escape}');
    expect(painel().className).not.toMatch(/aberta/);
    expect(document.activeElement).toBe(alca());

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
    // Rótulo estável: o botão não muda de nome (a gaveta já abriu sozinha no detalhe)
    expect(botaoPainel().textContent).toBe('Resumo e ações');
    expect(painel().contains(document.activeElement)).toBe(false);
    expect(document.activeElement).toBe(nome);
    // A gaveta abriu sozinha: a dica de primeira visita não volta depois de fechar
    await u.keyboard('{Escape}');
    expect(screen.queryByRole('note')).toBeNull();
  });

  it('a aba da borda é um botão de verdade (teclado e leitor de tela), abre a gaveta e some enquanto ela está aberta', async () => {
    const u = userEvent.setup();
    render(<App />);
    expect(alca().getAttribute('aria-hidden')).toBeNull();
    expect(alca().tabIndex).toBe(0);
    expect(alca().getAttribute('aria-expanded')).toBe('false');
    expect(alca().getAttribute('aria-controls')).toBe('painel');
    expect(screen.getAllByRole('button', { name: 'Resumo e ações' }).length).toBeGreaterThan(0);
    alca().focus();
    await u.keyboard('{Enter}');
    expect(painel().className).toMatch(/aberta/);
    expect(document.activeElement).toBe(painel());
    expect(document.getElementById('alca-painel')).toBeNull();
  });

  it('Esc com o foco na aba recolhe o rótulo expandido, sem abrir nada', async () => {
    const u = userEvent.setup();
    render(<App />);
    alca().focus();
    await u.keyboard('{Escape}');
    expect(alca().classList.contains('recolhida')).toBe(true);
    expect(painel().className).not.toMatch(/aberta/);
  });

  it('gaveta aberta: a página ganha a classe que reserva o espaço dela e a barra troca "Simular" pelas setas', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(alca());
    expect(document.querySelector('.app')?.classList.contains('painel-aberto')).toBe(true);
    const barra = screen.getByRole('navigation', { name: 'Ações rápidas' });
    expect(within(barra).queryByRole('button', { name: 'Simular' })).toBeNull();
    expect(within(painel()).getByRole('button', { name: 'Simular' })).toBeTruthy();
  });

  it('setas das fases: com a grade rolando, dizem quais fases estão à vista e rolam três por vez', async () => {
    const u = userEvent.setup();
    const ehFases = (el: HTMLElement) => el.classList.contains('fases');
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return ehFases(this) ? 1310 : 0;
    });
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return ehFases(this) ? 917 : 0;
    });
    const rolar = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollBy', { value: rolar, configurable: true, writable: true });
    try {
      render(<App />);
      await u.click(alca());
      const barra = screen.getByRole('navigation', { name: 'Ações rápidas' });
      expect(within(barra).getByText('Fases 1 a 7 de 10')).toBeTruthy();
      expect((within(barra).getByRole('button', { name: 'Fases anteriores' }) as HTMLButtonElement).disabled).toBe(true);
      expect(document.querySelector('#painel-grade .fases')?.classList.contains('rola-dir')).toBe(true);
      await u.click(within(barra).getByRole('button', { name: 'Próximas fases' }));
      expect(rolar).toHaveBeenCalledWith({ left: 393, behavior: 'smooth' });
    } finally {
      delete (HTMLElement.prototype as unknown as Record<string, unknown>).scrollBy;
    }
  });

  it('sem rolagem (grade cabe inteira), as setas não aparecem', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(alca());
    expect(screen.queryByRole('group', { name: 'Rolar as fases da grade' })).toBeNull();
  });

  it('o detalhe na gaveta oferece "Ver o resumo", que leva ao topo da gaveta', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getAllByRole('button', { name: /Cálculo 1/ })[0]);
    painel().scrollTop = 500;
    await u.click(within(painel()).getByRole('button', { name: '↑ Ver o resumo' }));
    expect(painel().scrollTop).toBe(0);
    expect(within(painel()).queryByRole('link', { name: /Voltar às disciplinas/ })).toBeNull();
  });

  it('dica de primeira visita: aparece, "Entendi" a dispensa e ela não volta ao recarregar', async () => {
    const u = userEvent.setup();
    const { unmount } = render(<App />);
    const dica = () => screen.queryByRole('note');
    expect(dica()?.textContent).toMatch(/Exportar.*Importar.*Resumo e ações/);
    await u.click(screen.getByRole('button', { name: 'Entendi' }));
    expect(dica()).toBeNull();
    unmount();
    render(<App />);
    expect(dica()).toBeNull();
  });

  it('abrir a gaveta também dispensa a dica', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(botaoPainel());
    await u.click(within(painel()).getByRole('button', { name: /Fechar/ }));
    expect(screen.queryByRole('note')).toBeNull();
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

describe('tablet (900 px)', () => {
  beforeEach(() => simularLargura(900));

  it('sem alça; escolher uma disciplina abre a gaveta e rola a página para a disciplina ficar acima dela', async () => {
    const u = userEvent.setup();
    const rolar = vi.fn();
    vi.stubGlobal('scrollBy', rolar);
    render(<App />);
    expect(document.querySelector('.alca-painel')).toBeNull();
    const nome = screen.getAllByRole('button', { name: /Cálculo 1/ })[0];
    const cartao = nome.closest('[data-codigo]') as HTMLElement;
    vi.spyOn(cartao, 'getBoundingClientRect').mockReturnValue({ top: 700, bottom: 780 } as DOMRect);
    await u.click(nome);
    expect(painel().className).toMatch(/aberta/);
    expect(rolar).toHaveBeenCalledWith({ top: 610 });
  });
});

describe('celular (375 px)', () => {
  beforeEach(() => simularLargura(375));

  it('escolher uma disciplina não abre a gaveta (cobriria a grade); o botão passa a dizer "Ver detalhe da disciplina"', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getAllByRole('button', { name: /Cálculo 1/ })[0]);
    expect(painel().className).not.toMatch(/aberta/);
    const botao = screen.getByRole('button', { name: 'Ver detalhe da disciplina' });
    await u.click(botao);
    expect(painel().className).toMatch(/aberta/);
  });

  it('a barra mantém a porcentagem', () => {
    render(<App />);
    expect(within(screen.getByRole('navigation', { name: 'Ações rápidas' })).getByText(/^\d+,\d%/)).toBeTruthy();
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
