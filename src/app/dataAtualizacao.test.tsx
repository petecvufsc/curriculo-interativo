// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { App } from './App';
import { formatarDataIso } from './estado/formato';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('formatarDataIso', () => {
  it('troca AAAA-MM-DD por DD/MM/AAAA', () => {
    expect(formatarDataIso('2026-11-18')).toBe('18/11/2026');
    expect(formatarDataIso('2027-01-05')).toBe('05/01/2027');
  });
  it('texto em outro formato volta como veio', () => {
    expect(formatarDataIso('18/11/2026')).toBe('18/11/2026');
    expect(formatarDataIso('')).toBe('');
  });
});

describe('cabeçalho', () => {
  it('mostra a data da última atualização (a do build), no formato brasileiro', () => {
    render(<App />);
    const topo = within(screen.getByRole('banner'));
    expect(topo.getByText(/^Última atualização: \d{2}\/\d{2}\/\d{4} · PET Engenharia Civil UFSC$/)).toBeTruthy();
    expect(__ATUALIZADO_EM__).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(topo.getByText(new RegExp(formatarDataIso(__ATUALIZADO_EM__)))).toBeTruthy();
  });

  it('o currículo usado continua dito no rodapé', () => {
    render(<App />);
    expect(within(screen.getByRole('contentinfo')).getByText(/Baseado no currículo oficial 2020\.1/)).toBeTruthy();
  });
});
