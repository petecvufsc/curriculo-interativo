// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { sugerirSemestre } from '../dominio/planejamento';
import { curriculo, motor, porCodigo } from './estado/motorEcv';
import { cartao, registroCom, semear } from './testeAuxiliar';

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

type U = ReturnType<typeof userEvent.setup>;
const abrirPlanejamento = (u: U) => u.click(screen.getByRole('tab', { name: 'Planejamento' }));
const semestre = (n: number) => screen.getByRole('listitem', { name: new RegExp(`^Semestre ${n}`) });
const adicionarSemestre = (u: U) => u.click(screen.getByRole('button', { name: '+ Adicionar semestre' }));
/** Abre a busca do semestre, procura pelo código e clica na opção (nome acessível: "Adicionar <nome> ao semestre n"). */
async function adicionar(u: U, n: number, codigo: string) {
  const sem = within(semestre(n));
  const detalhes = sem.getByText('+ Adicionar disciplina').closest('details') as HTMLDetailsElement;
  if (!detalhes.open) await u.click(sem.getByText('+ Adicionar disciplina'));
  const campo = sem.getByRole('searchbox', { name: `Buscar disciplina para o semestre ${n}` });
  await u.clear(campo);
  await u.type(campo, codigo);
  await u.click(sem.getByRole('button', { name: `Adicionar ${porCodigo.get(codigo)!.nome} ao semestre ${n}` }));
}

describe('abas', () => {
  it('alterna entre Grade e Planejamento, com setas do teclado', async () => {
    const u = userEvent.setup();
    render(<App />);
    const grade = screen.getByRole('tab', { name: 'Grade' });
    expect(grade.getAttribute('aria-selected')).toBe('true');
    expect(screen.queryByRole('heading', { name: 'Planejamento de semestres' })).toBeNull();

    grade.focus();
    await u.keyboard('{ArrowRight}');
    const plan = screen.getByRole('tab', { name: 'Planejamento' });
    expect(plan.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(plan);
    expect(screen.getByRole('tabpanel', { name: 'Planejamento' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Planejamento de semestres' })).toBeTruthy();

    await u.keyboard('{ArrowLeft}');
    expect(grade.getAttribute('aria-selected')).toBe('true');
    expect(document.querySelector('[data-codigo="ECV2101"]')).toBeTruthy();
  });
});

describe('planejamento', () => {
  it('adiciona semestre e disciplina; mostra totais e o rótulo da sugestão', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    // Com o plano vazio, a nota sobre sugestões ainda não aparece (só faz sentido com semestres)
    expect(screen.queryByText(/Sugestão automática: as disciplinas que mais liberam outras do curso/)).toBeNull();
    await adicionarSemestre(u);
    expect(screen.getByText(/Sugestão automática: as disciplinas que mais liberam outras do curso/)).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Semestre 1 (próximo)' })).toBeTruthy();
    await adicionar(u, 1, 'MTM3110');
    const s1 = within(semestre(1));
    expect(s1.getByText('Cálculo 1')).toBeTruthy();
    expect(s1.getByText(/MTM3110 · 4 créditos/)).toBeTruthy();
    expect(s1.getByText('4 créditos · 72 h-a')).toBeTruthy();
    expect(s1.getByText('Abaixo do mínimo de 16 créditos')).toBeTruthy();
    // Já planejada: não é mais oferecida na busca
    await u.click(s1.getByRole('searchbox', { name: 'Buscar disciplina para o semestre 1' }));
    await u.clear(s1.getByRole('searchbox', { name: 'Buscar disciplina para o semestre 1' }));
    await u.type(s1.getByRole('searchbox', { name: 'Buscar disciplina para o semestre 1' }), 'MTM3110');
    expect(s1.queryByRole('button', { name: 'Adicionar Cálculo 1 ao semestre 1' })).toBeNull();
    // A grade mostra o selo
    await u.click(screen.getByRole('tab', { name: 'Grade' }));
    expect(within(cartao('MTM3110')).getByText('Planejada (S1)')).toBeTruthy();
  });

  it('a busca mostra primeiro as que mais liberam, obrigatórias antes das optativas', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    await adicionarSemestre(u);
    const sem = within(semestre(1));
    await u.click(sem.getByText('+ Adicionar disciplina'));
    const botoes = sem.getAllByRole('button', { name: /^Adicionar .* ao semestre 1$/ });
    expect(botoes).toHaveLength(6); // sem texto, as 6 que mais liberam
    // Todas obrigatórias, da que mais libera para a que menos libera
    const libera = botoes.map((b) => Number(/libera (\d+)/.exec(b.textContent ?? '')?.[1] ?? 0));
    expect(libera).toEqual([...libera].sort((a, b) => b - a));
    expect(botoes.some((b) => b.textContent!.includes('Optativa'))).toBe(false);
    expect(sem.getByText(/Mostrando 6 de \d+/)).toBeTruthy();
  });

  it('a busca filtra por nome ou código, sem diferenciar acentos nem maiúsculas', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    await adicionarSemestre(u);
    const sem = within(semestre(1));
    await u.click(sem.getByText('+ Adicionar disciplina'));
    const campo = sem.getByRole('searchbox', { name: 'Buscar disciplina para o semestre 1' });
    await u.type(campo, 'algebra');
    expect(sem.getByRole('button', { name: 'Adicionar Álgebra Linear ao semestre 1' })).toBeTruthy();
    await u.clear(campo);
    await u.type(campo, 'ecv2101');
    expect(sem.getByRole('button', { name: 'Adicionar Introdução à Engenharia Civil ao semestre 1' })).toBeTruthy();
    await u.clear(campo);
    await u.type(campo, 'zzzz');
    expect(sem.getByText('Nenhuma disciplina disponível com esse texto.')).toBeTruthy();
  });

  it('mostra "Falta" quando um pré-requisito sai do plano e permite remover', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    await adicionarSemestre(u);
    await adicionarSemestre(u);
    await adicionar(u, 1, 'MTM3110');
    await adicionar(u, 2, 'MTM3120');
    expect(within(semestre(2)).queryByText(/^Falta:/)).toBeNull();

    await u.click(screen.getByRole('button', { name: 'Remover Cálculo 1 do semestre 1' }));
    const s2 = within(semestre(2));
    // Alternativa do currículo atual primeiro; código antigo depois, identificado
    expect(s2.getByText('Falta: Cálculo 1')).toBeTruthy();
    expect(s2.getByText('ou: MTM3101 (currículo anterior)')).toBeTruthy();

    await u.click(screen.getByRole('button', { name: 'Remover Cálculo 2 do semestre 2' }));
    expect(within(semestre(2)).queryByText(/^Falta:/)).toBeNull();
  });

  it('mostra os problemas Já cumprida e Repetida no plano', () => {
    semear(
      registroCom({
        status: { ECV2101: 'aprovada' },
        plano: { semestres: [{ codigos: ['ECV2101', 'MTM3110'] }, { codigos: ['MTM3110'] }] },
      }),
    );
    render(<App />);
    return userEvent.setup().click(screen.getByRole('tab', { name: 'Planejamento' })).then(() => {
      expect(within(semestre(1)).getByText('Já cumprida')).toBeTruthy();
      expect(within(semestre(2)).getByText('Repetida no plano')).toBeTruthy();
    });
  });

  it('Sugerir preenche o semestre com 5 disciplinas (padrão), as que mais liberam outras, e pede confirmação se não vazio', async () => {
    const u = userEvent.setup();
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<App />);
    await abrirPlanejamento(u);
    await adicionarSemestre(u);
    await u.click(screen.getByRole('button', { name: 'Sugerir disciplinas para o semestre 1' }));
    expect(confirmar).not.toHaveBeenCalled(); // semestre vazio: sem confirmação
    const s1 = within(semestre(1));
    const esperadas = sugerirSemestre(motor, new Set(), 30, 5);
    expect(esperadas).toHaveLength(5);
    for (const c of esperadas) expect(s1.getByText(new RegExp(`${c} ·`))).toBeTruthy();
    expect(s1.getAllByRole('button', { name: /^Remover .* do semestre 1$/ })).toHaveLength(5);

    // Não vazio: cancelar mantém; confirmar substitui
    const primeira = porCodigo.get(esperadas[0])!.nome;
    await u.click(s1.getByRole('button', { name: `Remover ${primeira} do semestre 1` }));
    await u.click(screen.getByRole('button', { name: 'Sugerir disciplinas para o semestre 1' }));
    expect(confirmar).toHaveBeenCalledTimes(1);
    // Fora do plano (a disciplina removida volta a aparecer só na busca de "+ Adicionar disciplina")
    expect(within(semestre(1)).queryByRole('button', { name: `Remover ${primeira} do semestre 1` })).toBeNull();
    confirmar.mockReturnValue(true);
    await u.click(screen.getByRole('button', { name: 'Sugerir disciplinas para o semestre 1' }));
    expect(within(semestre(1)).getByText(new RegExp(`${esperadas[0]} ·`))).toBeTruthy();
  });

  it('cada disciplina do plano mostra quantas outras ela libera', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    await adicionarSemestre(u);
    await adicionar(u, 1, 'MTM3110');
    const libera = motor.dependentes('MTM3110').size;
    expect(libera).toBeGreaterThan(10);
    expect(within(semestre(1)).getByText(`libera ${libera}`)).toBeTruthy();
  });

  it('a quantidade de disciplinas define quantas o Sugerir escolhe', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    await adicionarSemestre(u);
    const campo = screen.getByLabelText('Quantas disciplinas por semestre?') as HTMLInputElement;
    expect(campo.value).toBe('5');
    await u.clear(campo);
    await u.type(campo, '3');
    await u.click(screen.getByRole('button', { name: 'Sugerir disciplinas para o semestre 1' }));
    const esperadas = sugerirSemestre(motor, new Set(), 30, 3);
    expect(within(semestre(1)).getAllByRole('button', { name: /^Remover .* do semestre 1$/ })).toHaveLength(3);
    for (const c of esperadas) expect(within(semestre(1)).getByText(new RegExp(`${c} ·`))).toBeTruthy();
  });

  it('valores fora de 1 a 12 não são gravados', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    const campo = screen.getByLabelText('Quantas disciplinas por semestre?') as HTMLInputElement;
    await u.clear(campo);
    await u.type(campo, '40'); // "4" é válido e fica gravado; "40" não
    await u.tab();
    expect(campo.value).toBe('4'); // voltou ao último valor válido, nunca 40
  });

  it('avisa quando o semestre passa do máximo de 30 créditos', () => {
    const codigos = curriculo.disciplinas.filter((d) => d.fase !== null && d.fase <= 4).map((d) => d.codigo);
    semear(registroCom({ plano: { semestres: [{ codigos }, { codigos: [] }] } }));
    render(<App />);
    return userEvent.setup().click(screen.getByRole('tab', { name: 'Planejamento' })).then(() => {
      expect(within(semestre(1)).getByText('Acima do máximo de 30 créditos')).toBeTruthy();
      // Semestre vazio não recebe aviso de mínimo
      expect(within(semestre(2)).queryByText(/Abaixo do mínimo/)).toBeNull();
    });
  });

  it('mostra a integralização ao fim do plano e Limpar plano pede confirmação', async () => {
    const u = userEvent.setup();
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValue(true);
    semear(registroCom({ plano: { semestres: [{ codigos: ['MTM3110'] }] } }));
    render(<App />);
    await abrirPlanejamento(u);
    // O resumo do topo mostra o que o plano acrescenta (MTM3110 = 72 h-a de 4.518)
    expect(screen.getByText(/Ao fim do plano:/).textContent).toMatch(/1,6%/);
    expect(screen.getByRole('progressbar', { name: 'Integralização do curso' }).getAttribute('aria-valuetext')).toMatch(/1,6% ao fim do plano/);

    await u.click(screen.getByRole('button', { name: 'Limpar plano' }));
    expect(screen.queryByText('Semestre 1 (próximo)')).not.toBeNull(); // cancelado
    await u.click(screen.getByRole('button', { name: 'Limpar plano' }));
    expect(confirmar).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Semestre 1 (próximo)')).toBeNull();
  });
});

describe('aviso da sugestão', () => {
  it('diz que não verifica conflito de horário nem a oferta do semestre', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    await adicionarSemestre(u);
    expect(screen.getByText(/Não verifica conflito de horário nem a oferta do semestre/)).toBeTruthy();
  });
});
