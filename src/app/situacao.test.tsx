// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { botaoNome, caixa, cartao } from './testeAuxiliar';

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const painel = () => screen.getByRole('complementary', { name: 'Resumo e ações' });
const simular = (u: ReturnType<typeof userEvent.setup>) => u.click(within(painel()).getByRole('button', { name: 'Simular' }));
const radio = (nome: string) => screen.getByRole('radio', { name: nome }) as HTMLInputElement;

describe('situação no histórico', () => {
  it('o radiogroup troca o status e o cartão mostra o selo', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(botaoNome('MTM3110'));
    const grupo = screen.getByRole('radiogroup', { name: 'Situação no histórico' });
    expect(within(grupo).getAllByRole('radio').map((r) => (r as HTMLInputElement).value)).toEqual([
      'nao-cursada',
      'aprovada',
      'cursando',
      'reprovada',
    ]);
    expect(radio('Não cursada').checked).toBe(true);

    await u.click(radio('Cursando'));
    expect(within(cartao('MTM3110')).getByText('Cursando')).toBeTruthy();
    expect(caixa('MTM3110').checked).toBe(false);

    await u.click(radio('Reprovada'));
    expect(within(cartao('MTM3110')).getByText('Reprovada')).toBeTruthy();
    expect(within(cartao('MTM3110')).queryByText('Cursando')).toBeNull();

    await u.click(radio('Aprovada'));
    expect(caixa('MTM3110').checked).toBe(true);
    expect(within(cartao('MTM3110')).queryByText('Reprovada')).toBeNull();
  });

  it('o checkbox do cartão e o radio ficam sincronizados', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(caixa('MTM3110'));
    await u.click(botaoNome('MTM3110'));
    expect(radio('Aprovada').checked).toBe(true);
  });

  it('cursando + opção ligada/desligada muda a disponibilidade de MTM3120 na simulação', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(botaoNome('MTM3110'));
    await u.click(radio('Cursando'));
    const opcao = screen.getByLabelText('Considerar disciplinas em andamento como aprovadas') as HTMLInputElement;
    expect(opcao.checked).toBe(true);

    await simular(u);
    expect(within(cartao('MTM3120')).getByText('Disponível')).toBeTruthy();

    await u.click(opcao);
    expect(within(cartao('MTM3120')).queryByText('Disponível')).toBeNull();
    await u.click(opcao);
    expect(within(cartao('MTM3120')).getByText('Disponível')).toBeTruthy();
  });
});

describe('disciplinas de outro currículo', () => {
  const abrir = async (u: ReturnType<typeof userEvent.setup>) => {
    await u.click(screen.getByText(/Disciplinas do currículo anterior/));
    return screen.getByLabelText('Código (AAA9999)') as HTMLInputElement;
  };

  it('MTM3101 satisfaz o "ou" e libera MTM3120; Remover desfaz', async () => {
    const u = userEvent.setup();
    render(<App />);
    const campo = await abrir(u);
    await u.type(campo, 'mtm3101');
    expect(campo.value).toBe('MTM3101');
    await u.click(screen.getByRole('button', { name: 'Adicionar' }));
    const lista = screen.getByRole('list', { name: 'Disciplinas do currículo anterior adicionadas' });
    expect(within(lista).getByText('MTM3101')).toBeTruthy();

    await simular(u);
    expect(within(cartao('MTM3120')).getByText('Disponível')).toBeTruthy();

    await u.click(screen.getByRole('button', { name: 'Remover MTM3101' }));
    expect(screen.queryByRole('list', { name: 'Disciplinas do currículo anterior adicionadas' })).toBeNull();
    expect(within(cartao('MTM3120')).queryByText('Disponível')).toBeNull();
  });

  it('valida o formato e rejeita códigos do currículo atual', async () => {
    const u = userEvent.setup();
    render(<App />);
    const campo = await abrir(u);
    await u.type(campo, 'abc12');
    await u.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(screen.getByRole('alert').textContent).toMatch(/AAA9999/);
    await u.clear(campo);
    await u.type(campo, 'ECV2101');
    await u.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(screen.getByRole('alert').textContent).toMatch(/currículo atual/);
    expect(caixa('ECV2101').checked).toBe(false);
  });
});
