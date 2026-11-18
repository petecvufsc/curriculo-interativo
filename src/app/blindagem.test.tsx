// @vitest-environment jsdom
// Testes dos achados do caçador de bugs (docs/relatorio-cacador-de-bugs.md): limites do plano, dado de arrasto
// fabricado, foco do teclado, mensagens quando não há o que montar e textos.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { curriculo } from './estado/motorEcv';
import { fixarHoje, registroCom, semear } from './testeAuxiliar';

beforeEach(() => {
  localStorage.clear();
  fixarHoje();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  cleanup();
  localStorage.clear();
});

type U = ReturnType<typeof userEvent.setup>;
const abrirPlanejamento = (u: U) => u.click(screen.getByRole('tab', { name: 'Planejamento' }));
const semestre = (rotulo: string) => screen.getByRole('listitem', { name: new RegExp(`^${rotulo.replace('.', '\\.')}`) });

describe('limite de 15 semestres no plano (B-01)', () => {
  it('"+ Adicionar semestre" para no limite, com o botão desativado e o motivo', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    const botao = () => screen.getByRole('button', { name: '+ Adicionar semestre' }) as HTMLButtonElement;
    for (let i = 0; i < 15; i++) await u.click(botao());
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(15);
    expect(botao().disabled).toBe(true);
    expect(botao().title).toMatch(/no máximo 15 semestres/);
  });

  it('um plano salvo com 1500 semestres abre cortado em 15 (a aba não trava)', async () => {
    const u = userEvent.setup();
    const semestres = Array.from({ length: 1500 }, () => ({ codigos: ['ECV2302'] }));
    semear(registroCom({ plano: { semestres } }));
    render(<App />);
    await abrirPlanejamento(u);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(15);
  });
});

describe('dado de arrasto fabricado (B-08)', () => {
  it('índices em texto não duplicam a disciplina', async () => {
    const u = userEvent.setup();
    semear(registroCom({ plano: { semestres: [{ codigos: ['MTM3110', 'FSC5101'] }, { codigos: ['MTM3120'] }] } }));
    render(<App />);
    await abrirPlanejamento(u);
    const dados: Record<string, string> = { 'application/x-disciplina-plano': JSON.stringify({ indice: '0', posicao: 0 }) };
    const dt = { types: Object.keys(dados), getData: (t: string) => dados[t] ?? '', dropEffect: '' };
    fireEvent.drop(semestre('2027.2'), { dataTransfer: dt });
    expect(within(semestre('2027.2')).queryByText('Cálculo 1')).toBeNull();
    expect(within(semestre('2027.1')).getByText('Cálculo 1')).toBeTruthy();
  });
});

describe('foco do teclado (B-09)', () => {
  it('depois de remover uma disciplina, o foco vai para o título do semestre, não para o <body>', async () => {
    const u = userEvent.setup();
    semear(registroCom({ plano: { semestres: [{ codigos: ['MTM3110'] }] } }));
    render(<App />);
    await abrirPlanejamento(u);
    await u.click(screen.getByRole('button', { name: 'Remover Cálculo 1 do semestre 1' }));
    expect(document.activeElement?.tagName).toBe('H3');
    expect(document.activeElement?.textContent).toMatch(/2027\.1/);
  });

  it('depois de mover com "Mover para…" e de desfazer, o foco não cai no <body>', async () => {
    const u = userEvent.setup();
    semear(registroCom({ plano: { semestres: [{ codigos: ['MTM3110'] }, { codigos: [] }] } }));
    render(<App />);
    await abrirPlanejamento(u);
    await u.selectOptions(screen.getByRole('combobox', { name: /Mover Cálculo 1/ }), '1');
    expect(document.activeElement?.tagName).toBe('H3');
    await u.click(screen.getByRole('button', { name: 'Desfazer' }));
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement?.id).toBe('conteudo');
  });
});

describe('montar sem resultado mantém o plano e explica (B-06)', () => {
  it('"Montar plano otimizado" com tudo cumprido não apaga o plano', async () => {
    const u = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const todas = curriculo.disciplinas.filter((d) => d.tipo === 'obrigatoria').map((d) => d.codigo);
    semear(registroCom({ status: Object.fromEntries(todas.map((c) => [c, 'aprovada' as const])), plano: { semestres: [{ codigos: [] }] } }));
    render(<App />);
    await abrirPlanejamento(u);
    await u.click(screen.getByRole('button', { name: 'Montar plano otimizado' }));
    expect(screen.getByText(/Você já cumpriu todas as obrigatórias: não há o que planejar\. Seu plano foi mantido\./)).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1);
  });
});

describe('textos (B-12 e B-14)', () => {
  it('"1 disciplina" no singular na nota do plano otimizado', async () => {
    const u = userEvent.setup();
    semear(registroCom({ opcoes: { ...registroCom({}).opcoes, disciplinasPorSemestre: 1 } }));
    render(<App />);
    await abrirPlanejamento(u);
    await u.click(screen.getByRole('button', { name: 'Montar plano otimizado' }));
    expect(screen.getByText(/Plano otimizado, com 1 disciplina por semestre/)).toBeTruthy();
    expect(screen.queryByText(/com 1 disciplinas/)).toBeNull();
  });

  it('optativas acima do teto: a tela diz que o excedente não conta', () => {
    const optativas = curriculo.disciplinas.filter((d) => d.tipo === 'optativa' && d.grupo === 'optativas');
    semear(registroCom({ status: Object.fromEntries(optativas.map((d) => [d.codigo, 'aprovada' as const])) }));
    render(<App />);
    expect(screen.getAllByText('(o excedente não conta)').length).toBeGreaterThan(0);
  });
});
