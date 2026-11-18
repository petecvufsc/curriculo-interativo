// Auxiliares dos testes de interface (não é um arquivo de teste).
import { within } from '@testing-library/react';
import { vi } from 'vitest';
import { CHAVE_LOCAL_STORAGE, registroVazio, serializar, type RegistroAluno } from '../dominio/aluno';

export const cartao = (codigo: string): HTMLElement => {
  const li = document.querySelector(`[data-codigo="${codigo}"]`);
  if (!li) throw new Error(`cartão ${codigo} não encontrado`);
  return li as HTMLElement;
};
export const caixa = (codigo: string) => within(cartao(codigo)).getByRole('checkbox') as HTMLInputElement;
export const botaoNome = (codigo: string) => within(cartao(codigo)).getByRole('button');

export function registroCom(parcial: Partial<RegistroAluno>): RegistroAluno {
  return { ...registroVazio('ecv-2020-1', '2026-01-01T00:00:00.000Z'), ...parcial };
}

/** Grava um registro no localStorage antes de renderizar o App. */
export function semear(registro: RegistroAluno): void {
  localStorage.setItem(CHAVE_LOCAL_STORAGE, serializar(registro));
}

/** localStorage simulado em memória. */
export function armazenamentoFalso(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear: () => m.clear(),
    getItem: (k: string) => m.get(k) ?? null,
    key: (i: number) => [...m.keys()][i] ?? null,
    removeItem: (k: string) => void m.delete(k),
    setItem: (k: string, v: string) => void m.set(k, String(v)),
  };
}

/** Fixa "hoje" em 18/11/2026 (o próximo semestre do calendário é 2027.1). Só o Date: os temporizadores continuam reais. */
export const fixarHoje = () => vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-11-18T12:00:00') });
