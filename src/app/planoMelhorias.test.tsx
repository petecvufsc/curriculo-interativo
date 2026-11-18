// @vitest-environment jsdom
// Melhorias do planejamento: montar plano até o fim, nome real do semestre, medidor de créditos,
// linhas enxutas e resumo do plano.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { montarPlano } from '../dominio/planejamento';
import { registroVazio } from '../dominio/aluno';
import { App } from './App';
import { curriculo, motor } from './estado/motorEcv';
import { registroCom, semear } from './testeAuxiliar';

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

type U = ReturnType<typeof userEvent.setup>;
const abrirPlanejamento = (u: U) => u.click(screen.getByRole('tab', { name: 'Planejamento' }));
const semestres = () => screen.queryAllByRole('listitem', { name: /^(Semestre \d|\d{4}\.[12])/ });
const montar = (u: U) => u.click(screen.getByRole('button', { name: 'Montar plano até o fim' }));
const situacao = () => screen.getByRole('status', { name: 'Situação do plano' });

describe('montar plano até o fim', () => {
  it('cria todos os semestres até cobrir as obrigatórias, e o resumo diz o que falta de optativas', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    await montar(u);
    const esperado = montarPlano(motor, registroVazio('ecv-2020-1')).semestres.length;
    expect(esperado).toBeGreaterThan(8);
    expect(semestres()).toHaveLength(esperado);
    const resumo = within(situacao());
    expect(resumo.getByText(`${esperado}`)).toBeTruthy();
    expect(resumo.getByText('Cobre todas as obrigatórias')).toBeTruthy();
    expect(resumo.getByText('Faltam 432 h-a de optativas, que você escolhe')).toBeTruthy();
    expect(screen.queryByText(/pré-requisito faltando/)).toBeNull();
  });

  it('a barra do topo mostra 90,4 % ao fim do plano (4.086 de 4.518 h-a)', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    await montar(u);
    expect(screen.getByText(/Ao fim do plano:/).textContent).toMatch(/90,4%/);
  });

  it('respeita a quantidade de disciplinas por semestre', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    const campo = screen.getByLabelText('Quantas disciplinas por semestre?') as HTMLInputElement;
    await u.clear(campo);
    await u.type(campo, '8');
    await montar(u);
    const esperado = montarPlano(motor, { ...registroVazio('ecv-2020-1'), opcoes: { ...registroVazio('x').opcoes, disciplinasPorSemestre: 8 } });
    expect(semestres()).toHaveLength(esperado.semestres.length);
    for (const s of semestres()) {
      expect(within(s).queryAllByRole('button', { name: /^Remover .* do semestre \d+$/ }).length).toBeLessThanOrEqual(8);
    }
  });

  it('com plano existente, pede confirmação; cancelar mantém o plano', async () => {
    const u = userEvent.setup();
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false);
    semear(registroCom({ plano: { semestres: [{ codigos: ['MTM3110'] }] } }));
    render(<App />);
    await abrirPlanejamento(u);
    await montar(u);
    expect(confirmar).toHaveBeenCalledTimes(1);
    expect(semestres()).toHaveLength(1);
    confirmar.mockReturnValue(true);
    await montar(u);
    expect(semestres().length).toBeGreaterThan(8);
  });

  it('o plano montado é salvo e continua depois de recarregar', async () => {
    const u = userEvent.setup();
    const { unmount } = render(<App />);
    await abrirPlanejamento(u);
    await montar(u);
    const n = semestres().length;
    await new Promise((r) => setTimeout(r, 400)); // o salvamento tem um pequeno atraso
    unmount();
    render(<App />);
    await abrirPlanejamento(u);
    expect(semestres()).toHaveLength(n);
  });
});

describe('nome real dos semestres', () => {
  it('"2027.1" dá nome aos semestres: 2027.1 (próximo), 2027.2, 2028.1…', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    await u.type(screen.getByLabelText('Primeiro semestre do plano (opcional)'), '2027.1');
    for (let i = 0; i < 3; i++) await u.click(screen.getByRole('button', { name: '+ Adicionar semestre' }));
    expect(screen.getByRole('heading', { name: '2027.1 (próximo)' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '2027.2' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '2028.1' })).toBeTruthy();
    // os botões mantêm o número e acrescentam o nome real
    expect(screen.getByRole('button', { name: 'Remover o semestre 3 (2028.1)' })).toBeTruthy();
    expect(within(situacao()).getByText(/\(2027\.1 a 2028\.1\)/)).toBeTruthy();
  });

  it('sem nome, continua "Semestre 1 (próximo)"', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    await u.click(screen.getByRole('button', { name: '+ Adicionar semestre' }));
    expect(screen.getByRole('heading', { name: 'Semestre 1 (próximo)' })).toBeTruthy();
  });

  it('formato inválido mostra o erro e não muda os nomes', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    await u.click(screen.getByRole('button', { name: '+ Adicionar semestre' }));
    const campo = screen.getByLabelText('Primeiro semestre do plano (opcional)') as HTMLInputElement;
    await u.type(campo, '2027.3');
    expect(screen.getByText('Use o formato AAAA.1 ou AAAA.2, por exemplo 2027.1.')).toBeTruthy();
    expect(campo.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('heading', { name: 'Semestre 1 (próximo)' })).toBeTruthy();
  });

  it('apagar o campo volta aos nomes por número', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    await u.click(screen.getByRole('button', { name: '+ Adicionar semestre' }));
    const campo = screen.getByLabelText('Primeiro semestre do plano (opcional)');
    await u.type(campo, '2027.1');
    expect(screen.getByRole('heading', { name: '2027.1 (próximo)' })).toBeTruthy();
    await u.clear(campo);
    expect(screen.getByRole('heading', { name: 'Semestre 1 (próximo)' })).toBeTruthy();
  });
});

describe('medidor de créditos', () => {
  const fase1 = ['ECV2101', 'EGR5213', 'EGR5604', 'FSC5101', 'MTM3110', 'QMC5125', 'QMC5138']; // 21 créditos

  it('dentro da faixa (21 créditos): meter com o valor, o texto da faixa e as marcas 16 e 30', () => {
    semear(registroCom({ plano: { semestres: [{ codigos: fase1 }] } }));
    render(<App />);
    return userEvent.setup().click(screen.getByRole('tab', { name: 'Planejamento' })).then(() => {
      const medidor = screen.getByRole('meter', { name: 'Créditos do semestre' });
      expect(medidor.getAttribute('aria-valuenow')).toBe('21');
      expect(medidor.getAttribute('aria-valuetext')).toBe('21 créditos. Dentro da faixa de 16 a 30 créditos');
      expect(screen.getByText('Dentro da faixa de 16 a 30 créditos')).toBeTruthy();
      const escala = document.querySelector('.medidor-escala')!;
      expect(escala.textContent).toBe('01630');
    });
  });

  it('abaixo do mínimo: o texto do aviso aparece junto ao medidor', () => {
    semear(registroCom({ plano: { semestres: [{ codigos: ['MTM3110'] }] } }));
    render(<App />);
    return userEvent.setup().click(screen.getByRole('tab', { name: 'Planejamento' })).then(() => {
      expect(screen.getByRole('meter').getAttribute('aria-valuetext')).toBe('4 créditos. Abaixo do mínimo de 16 créditos');
      expect(screen.getByText('Abaixo do mínimo de 16 créditos')).toBeTruthy();
      expect(document.querySelector('.medidor-abaixo')).not.toBeNull();
    });
  });

  it('semestre vazio: sem aviso de faixa', () => {
    semear(registroCom({ plano: { semestres: [{ codigos: [] }] } }));
    render(<App />);
    return userEvent.setup().click(screen.getByRole('tab', { name: 'Planejamento' })).then(() => {
      expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('0');
      expect(screen.queryByText(/Abaixo do mínimo|Acima do máximo|Dentro da faixa/)).toBeNull();
    });
  });
});

describe('linhas enxutas e resumo do plano', () => {
  it('cada disciplina tem um × com nome acessível completo, e não um botão "Remover" escrito', () => {
    semear(registroCom({ plano: { semestres: [{ codigos: ['MTM3110'] }] } }));
    render(<App />);
    return userEvent.setup().click(screen.getByRole('tab', { name: 'Planejamento' })).then(() => {
      const x = screen.getByRole('button', { name: 'Remover Cálculo 1 do semestre 1' });
      expect(x.textContent).toBe('×');
      expect(x.getAttribute('title')).toBe('Remover do semestre');
    });
  });

  it('o × remove a disciplina do semestre', async () => {
    const u = userEvent.setup();
    semear(registroCom({ plano: { semestres: [{ codigos: ['MTM3110', 'ECV2101'] }] } }));
    render(<App />);
    await abrirPlanejamento(u);
    await u.click(screen.getByRole('button', { name: 'Remover Cálculo 1 do semestre 1' }));
    expect(screen.queryByRole('button', { name: 'Remover Cálculo 1 do semestre 1' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Remover Introdução à Engenharia Civil do semestre 1' })).toBeTruthy();
  });

  it('o resumo conta as disciplinas com pré-requisito faltando', () => {
    semear(registroCom({ plano: { semestres: [{ codigos: ['ECV2302', 'ECV2401'] }] } }));
    render(<App />);
    return userEvent.setup().click(screen.getByRole('tab', { name: 'Planejamento' })).then(() => {
      expect(within(situacao()).getByText('2 disciplinas com pré-requisito faltando')).toBeTruthy();
    });
  });

  it('plano vazio: nenhum resumo de plano', async () => {
    const u = userEvent.setup();
    render(<App />);
    await abrirPlanejamento(u);
    expect(screen.queryByRole('status', { name: 'Situação do plano' })).toBeNull();
  });
});

describe('estágio fora do limite de créditos', () => {
  // histórico de quem concluiu as fases 1 a 9: sobram o estágio e o TCC II
  const ate9 = Object.fromEntries(
    curriculo.disciplinas.filter((d) => d.tipo === 'obrigatoria' && d.fase! <= 9).map((d) => [d.codigo, 'aprovada' as const]),
  );

  it('estágio + TCC II no mesmo semestre: 4 créditos, sem aviso, e o estágio diz que não conta', async () => {
    const u = userEvent.setup();
    semear(registroCom({ status: ate9, plano: { semestres: [{ codigos: ['ECV2000', 'ECV2002'] }] } }));
    render(<App />);
    await abrirPlanejamento(u);
    const sem = within(screen.getByRole('listitem', { name: /^Semestre 1/ }));
    expect(sem.getByText('4 créditos · 612 h-a')).toBeTruthy(); // 540 h-a do estágio + 72 do TCC II
    expect(sem.getByText(/ECV2000 · não conta nos créditos/)).toBeTruthy();
    expect(sem.getByRole('meter').getAttribute('aria-valuenow')).toBe('4');
    expect(sem.queryByText(/Abaixo do mínimo|Acima do máximo/)).toBeNull();
    expect(screen.queryByText(/pré-requisito faltando/)).toBeNull();
  });

  it('o detalhe do estágio explica as 30 aulas do PDF', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole('button', { name: 'Estágio Profissionalizante Supervisionado' }));
    expect(screen.getByText('30 (não contam no limite de créditos do semestre)')).toBeTruthy();
  });

  it('montar o plano coloca o estágio junto com outras disciplinas', async () => {
    const u = userEvent.setup();
    semear(registroCom({ status: ate9 }));
    render(<App />);
    await abrirPlanejamento(u);
    await montar(u);
    expect(semestres()).toHaveLength(1);
    expect(within(semestres()[0]).getByRole('button', { name: /^Remover Estágio .* do semestre 1$/ })).toBeTruthy();
    expect(within(semestres()[0]).getByRole('button', { name: /^Remover TCC: Projeto Integrador II do semestre 1$/ })).toBeTruthy();
  });
});
