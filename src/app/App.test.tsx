// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

const nome = (codigo: string) => {
  const li = document.querySelector(`[data-codigo="${codigo}"]`);
  if (!li) throw new Error(`cartão ${codigo} não encontrado`);
  return li as HTMLElement;
};
const caixa = (codigo: string) => within(nome(codigo)).getByRole('checkbox') as HTMLInputElement;
const botaoNome = (codigo: string) => within(nome(codigo)).getByRole('button');

describe('cascata pela interface', () => {
  it('marcar ECV2302 marca seus pré-requisitos; desmarcar FSC5101 desmarca ECV2302', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(caixa('ECV2302'));
    for (const c of ['ECV2302', 'ECV2201', 'FSC5101', 'MTM3110', 'MTM3120']) expect(caixa(c).checked).toBe(true);
    expect(caixa('ECV2401').checked).toBe(false);
    await u.click(caixa('FSC5101'));
    expect(caixa('FSC5101').checked).toBe(false);
    expect(caixa('ECV2302').checked).toBe(false);
  });

  it('rótulo acessível do checkbox', () => {
    render(<App />);
    expect(screen.getByLabelText('Marcar Estática para Engenharia Civil como cursada')).toBeTruthy();
  });
});

describe('modo relações', () => {
  it('clicar em ECV2401 destaca ECV2302 (pré-requisito direto) e ECV2505 (tranca diretamente)', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(botaoNome('ECV2401'));
    expect(botaoNome('ECV2401').getAttribute('aria-pressed')).toBe('true');
    expect(within(nome('ECV2302')).getByText('Pré-requisito direto')).toBeTruthy();
    expect(within(nome('ECV2505')).getByText('Tranca diretamente')).toBeTruthy();
    expect(within(nome('ECV2401')).getByText('Selecionada')).toBeTruthy();
    // Clicar de novo limpa
    await u.click(botaoNome('ECV2401'));
    expect(within(nome('ECV2302')).queryByText('Pré-requisito direto')).toBeNull();
  });

  it('Limpar destaques remove os selos', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(botaoNome('ECV2401'));
    await u.click(screen.getByRole('button', { name: 'Limpar destaques' }));
    expect(within(nome('ECV2302')).queryByText('Pré-requisito direto')).toBeNull();
  });

  it('mostra bloqueio e alerta no detalhe', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(botaoNome('ECV2932'));
    expect(screen.getByTestId('situacao').textContent).toBe('Bloqueada');
    expect(screen.getByText(/Falta:/)).toBeTruthy();
    expect(screen.getByRole('note').textContent).toMatch(/ECV 2405/);
  });
});

describe('simulação', () => {
  it('Simular sem nada marcado mostra ECV2101 como disponível e atualiza os totais', async () => {
    const u = userEvent.setup();
    render(<App />);
    expect(screen.getByText(/Clique em "Simular"/)).toBeTruthy();
    // Há dois "Simular": o do painel e o da barra de telas estreitas (jsdom não aplica CSS). Usa o do painel.
    const painel = screen.getByRole('complementary', { name: 'Resumo e ações' });
    await u.click(within(painel).getByRole('button', { name: 'Simular' }));
    expect(within(nome('ECV2101')).getByText('Disponível')).toBeTruthy();
    expect(within(nome('ECV2401')).queryByText('Disponível')).toBeNull();
    expect(screen.getByText(/Obrigatórias: \d+ h-a · \d+ créditos/)).toBeTruthy();
    // Selecionar uma disciplina sai da simulação, mas os totais permanecem
    await u.click(botaoNome('ECV2401'));
    expect(within(nome('ECV2101')).queryByText('Disponível')).toBeNull();
    expect(screen.getByText(/Obrigatórias: \d+ h-a · \d+ créditos/)).toBeTruthy();
  });
});

describe('caixa da fase', () => {
  it('marca/desmarca a fase e fica indeterminada com marcação parcial', async () => {
    const u = userEvent.setup();
    render(<App />);
    const fase1 = screen.getByLabelText('Marcar todas as disciplinas obrigatórias da 1ª Fase') as HTMLInputElement;
    expect(fase1.indeterminate).toBe(false);
    await u.click(caixa('ECV2101'));
    expect(fase1.indeterminate).toBe(true);
    expect(fase1.checked).toBe(false);
    await u.click(fase1);
    expect(fase1.checked).toBe(true);
    expect(fase1.indeterminate).toBe(false);
    expect(caixa('MTM3110').checked).toBe(true);
    await u.click(fase1);
    expect(caixa('MTM3110').checked).toBe(false);
    expect(fase1.checked).toBe(false);
  });
});

describe('Limpar seleção e diálogos', () => {
  it('Limpar seleção desmarca tudo', async () => {
    const u = userEvent.setup();
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<App />);
    await u.click(caixa('ECV2302'));
    await u.click(screen.getByRole('button', { name: 'Limpar seleção' }));
    expect(confirmar).toHaveBeenCalledTimes(1);
    expect(caixa('ECV2302').checked).toBe(false);
  });

  it('Limpar seleção cancelada mantém as marcações', async () => {
    const u = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<App />);
    await u.click(caixa('ECV2302'));
    await u.click(screen.getByRole('button', { name: 'Limpar seleção' }));
    expect(caixa('ECV2302').checked).toBe(true);
  });

  it('abre o Sobre com o texto institucional', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole('button', { name: 'Sobre' }));
    expect(screen.getByText(/petecv@contato\.ufsc\.br/, { exact: false })).toBeTruthy();
  });
});
