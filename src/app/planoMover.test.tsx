// @vitest-environment jsdom
// Mover disciplina entre semestres (botão "Mover para…" e arrasto) e montagem pela grade oficial.
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
  cleanup();
  localStorage.clear();
});

type U = ReturnType<typeof userEvent.setup>;
const abrirPlanejamento = (u: U) => u.click(screen.getByRole('tab', { name: 'Planejamento' }));
const semestre = (rotulo: string) => screen.getByRole('listitem', { name: new RegExp(`^${rotulo.replace('.', '\\.')}`) });
const itemDe = (nome: string, rotulo: string) => within(semestre(rotulo)).getByText(nome).closest('li') as HTMLElement;

function semearPlano(...semestres: string[][]) {
  semear(registroCom({ plano: { semestres: semestres.map((codigos) => ({ codigos })) } }));
}

/** DataTransfer mínimo para os eventos de arrasto do jsdom. */
function criarDataTransfer() {
  const dados: Record<string, string> = {};
  const dt = {
    types: [] as string[],
    effectAllowed: '',
    dropEffect: '',
    setData: (tipo: string, valor: string) => {
      dados[tipo] = valor;
      dt.types = Object.keys(dados);
    },
    getData: (tipo: string) => dados[tipo] ?? '',
  };
  return dt;
}

describe('Mover para… (alternativa ao arrasto, serve a teclado e toque)', () => {
  it('move a disciplina para outro semestre, avisa e permite desfazer', async () => {
    const u = userEvent.setup();
    semearPlano(['MTM3110'], ['MTM3120']);
    render(<App />);
    await abrirPlanejamento(u);
    // Cálculo 2 exige Cálculo 1: com o 1 no semestre anterior, o plano está sem problemas
    expect(screen.queryByText(/pré-requisito faltando/)).toBeNull();

    await u.selectOptions(screen.getByRole('combobox', { name: 'Mover Cálculo 1 do semestre 1 para outro semestre' }), '1');
    expect(within(semestre('2027.2')).getByText('Cálculo 1')).toBeTruthy();
    expect(within(semestre('2027.1')).queryByText('Cálculo 1')).toBeNull();
    expect(screen.getByText('Cálculo 1: movida de 2027.1 para 2027.2.')).toBeTruthy();
    // agora Cálculo 2 ficou no mesmo semestre do seu pré-requisito
    expect(screen.getByText(/1 disciplina com pré-requisito faltando/)).toBeTruthy();

    await u.click(screen.getByRole('button', { name: 'Desfazer' }));
    expect(within(semestre('2027.1')).getByText('Cálculo 1')).toBeTruthy();
    expect(screen.queryByText(/pré-requisito faltando/)).toBeNull();
  });

  it('o seletor lista os outros semestres pelo nome real, sem o próprio', async () => {
    const u = userEvent.setup();
    semearPlano(['MTM3110'], [], []);
    render(<App />);
    await abrirPlanejamento(u);
    const seletor = screen.getByRole('combobox', { name: 'Mover Cálculo 1 do semestre 1 para outro semestre' });
    const opcoes = within(seletor).getAllByRole('option').map((o) => o.textContent);
    expect(opcoes).toEqual(['Mover para…', '2027.2', '2028.1']);
  });

  it('com um só semestre não há para onde mover: o seletor não aparece', async () => {
    const u = userEvent.setup();
    semearPlano(['MTM3110']);
    render(<App />);
    await abrirPlanejamento(u);
    expect(screen.queryByRole('combobox', { name: /Mover Cálculo 1/ })).toBeNull();
  });
});

describe('arrastar entre semestres', () => {
  it('soltar uma disciplina em outro semestre a move; soltar no mesmo não muda nada', async () => {
    const u = userEvent.setup();
    semearPlano(['MTM3110'], []);
    render(<App />);
    await abrirPlanejamento(u);
    const dt = criarDataTransfer();
    const cartao = itemDe('Cálculo 1', '2027.1');
    expect(cartao.getAttribute('draggable')).toBe('true');

    fireEvent.dragStart(cartao, { dataTransfer: dt });
    expect(dt.types).toContain('application/x-disciplina-plano');
    // soltar no próprio semestre: nada
    fireEvent.drop(semestre('2027.1'), { dataTransfer: dt });
    expect(within(semestre('2027.1')).getByText('Cálculo 1')).toBeTruthy();

    // soltar no outro: move
    fireEvent.dragOver(semestre('2027.2'), { dataTransfer: dt });
    expect(semestre('2027.2').className).toMatch(/alvo-soltar/);
    fireEvent.drop(semestre('2027.2'), { dataTransfer: dt });
    expect(within(semestre('2027.2')).getByText('Cálculo 1')).toBeTruthy();
    expect(within(semestre('2027.1')).queryByText('Cálculo 1')).toBeNull();
    expect(semestre('2027.2').className).not.toMatch(/alvo-soltar/);
    expect(screen.getByText('Cálculo 1: movida de 2027.1 para 2027.2.')).toBeTruthy();
  });

  it('ignora o que não é uma disciplina do plano (texto ou arquivo arrastado de fora)', async () => {
    const u = userEvent.setup();
    semearPlano(['MTM3110'], []);
    render(<App />);
    await abrirPlanejamento(u);
    const dt = criarDataTransfer();
    dt.setData('text/plain', 'qualquer coisa');
    fireEvent.dragOver(semestre('2027.2'), { dataTransfer: dt });
    expect(semestre('2027.2').className).not.toMatch(/alvo-soltar/);
    fireEvent.drop(semestre('2027.2'), { dataTransfer: dt });
    expect(within(semestre('2027.1')).getByText('Cálculo 1')).toBeTruthy();
  });
});

describe('Montar pela grade oficial', () => {
  it('calouro: começa na 1ª fase, um semestre por fase, e diz de onde partiu', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    await u.click(screen.getByRole('button', { name: 'Montar pela grade oficial' }));
    expect(screen.getByText(/Grade oficial a partir da 1ª fase/)).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent).slice(0, 3)).toEqual(['2027.1 (próximo)', '2027.2', '2028.1']);
    expect(within(semestre('2027.1')).getByText('Cálculo 1')).toBeTruthy();
    expect(screen.queryByText(/pré-requisito faltando/)).toBeNull();
  });

  it('quem já fez as três primeiras fases começa na 4ª', async () => {
    const u = userEvent.setup();
    const feitas = curriculo.disciplinas.filter((d) => d.tipo === 'obrigatoria' && (d.fase ?? 99) <= 3).map((d) => d.codigo);
    semear(registroCom({ status: Object.fromEntries(feitas.map((c) => [c, 'aprovada' as const])) }));
    render(<App />);
    await abrirPlanejamento(u);
    await u.click(screen.getByRole('button', { name: 'Montar pela grade oficial' }));
    expect(screen.getByText(/Grade oficial a partir da 4ª fase/)).toBeTruthy();
    expect(within(semestre('2027.1')).getByText('Análise Estrutural I')).toBeTruthy();
    expect(screen.queryByText(/pré-requisito faltando/)).toBeNull();
  });

  it('com plano existente pede confirmação; cancelar mantém o plano', async () => {
    const u = userEvent.setup();
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false);
    semearPlano(['MTM3110']);
    render(<App />);
    await abrirPlanejamento(u);
    await u.click(screen.getByRole('button', { name: 'Montar pela grade oficial' }));
    expect(confirmar).toHaveBeenCalledTimes(1);
    expect(screen.queryAllByRole('listitem', { name: /^\d{4}\.[12]/ })).toHaveLength(1);
    confirmar.mockRestore();
  });

  it('o plano otimizado é rotulado como sugestão da ferramenta que não considera a oferta de turmas', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    await u.click(screen.getByRole('button', { name: 'Montar plano otimizado' }));
    const nota = screen.getByText(/^Plano otimizado, com 5 disciplinas por semestre: sugestão da ferramenta, não considera a oferta de turmas/);
    expect(nota.textContent).toMatch(/Com mais disciplinas por semestre, o curso termina antes/);
  });

  it('se não falta nenhuma obrigatória, avisa que não há o que planejar', async () => {
    const u = userEvent.setup();
    const todas = curriculo.disciplinas.filter((d) => d.tipo === 'obrigatoria').map((d) => d.codigo);
    semear(registroCom({ status: Object.fromEntries(todas.map((c) => [c, 'aprovada' as const])), plano: { semestres: [{ codigos: [] }] } }));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<App />);
    await abrirPlanejamento(u);
    await u.click(screen.getByRole('button', { name: 'Montar pela grade oficial' }));
    // (achado B-06) explica e MANTÉM o plano do aluno, em vez de apagá-lo em silêncio
    expect(screen.getByText(/Você já cumpriu todas as obrigatórias: não há o que planejar pela grade oficial\. Seu plano foi mantido\./)).toBeTruthy();
    expect(screen.queryAllByRole('listitem', { name: /^\d{4}\.[12]/ })).toHaveLength(1);
  });
});
