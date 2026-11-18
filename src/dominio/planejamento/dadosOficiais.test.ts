// Planejamento e registro sobre o currículo oficial ecv-2020-1.json (§10, §11, §12).
import { describe, expect, it } from 'vitest';
import { carregar, definirStatus, importar, registroVazio, serializar } from '../aluno';
import { reg } from '../aluno/registro.fixture';
import oficial from '../curriculos/ecv-2020-1.json';
import { criarMotor } from '../regras';
import type { Curriculo } from '../tipos';
import { avaliarPlano, disponiveisNoSemestre, sugerirSemestre } from '.';

const curriculo = oficial as Curriculo;
const motor = criarMotor(curriculo);
const oficialReg = (p: Parameters<typeof reg>[0]) => reg(p, 'ecv-2020-1');

describe('sugerirSemestre no currículo oficial', () => {
  const fase1 = curriculo.disciplinas.filter((d) => d.tipo === 'obrigatoria' && d.fase === 1);

  const aulas = (c: string) => curriculo.disciplinas.find((d) => d.codigo === c)!.aulasSemanais;
  const fase = (c: string) => curriculo.disciplinas.find((d) => d.codigo === c)!.fase!;

  it('a fase 1 tem 7 obrigatórias, com 21 aulas no total (cabem em 30)', () => {
    expect(fase1).toHaveLength(7);
    expect(fase1.reduce((s, d) => s + d.aulasSemanais, 0)).toBe(21);
  });

  it('ordena por quem mais libera e, no empate, por fase; sem optativas', () => {
    const r = sugerirSemestre(motor, new Set(), 30);
    expect(r.length).toBeGreaterThan(0);
    for (let i = 1; i < r.length; i++) {
      const [a, b] = [motor.dependentes(r[i - 1]).size, motor.dependentes(r[i]).size];
      expect(b).toBeLessThanOrEqual(a);
      if (a === b) expect(fase(r[i])).toBeGreaterThanOrEqual(fase(r[i - 1]));
    }
    expect(r.every((c) => curriculo.disciplinas.find((d) => d.codigo === c)!.tipo === 'obrigatoria')).toBe(true);
    expect(r.reduce((s, c) => s + aulas(c), 0)).toBeLessThanOrEqual(30);
  });

  it('com quantidade 5: devolve 5 disponíveis, e nenhuma disponível deixada de fora libera mais que as escolhidas', () => {
    const r = sugerirSemestre(motor, new Set(), 30, 5);
    expect(r).toHaveLength(5);
    const disponiveis = motor.simular(new Set()).disponiveis.filter((d) => d.tipo === 'obrigatoria').map((d) => d.codigo);
    const menorEscolhida = Math.min(...r.map((c) => motor.dependentes(c).size));
    for (const c of disponiveis.filter((c) => !r.includes(c))) expect(motor.dependentes(c).size).toBeLessThanOrEqual(menorEscolhida);
  });

  it('as sugestões do histórico vazio são válidas no semestre 1 (nenhum pré-requisito faltando)', () => {
    const r = sugerirSemestre(motor, new Set(), 30, 5);
    const plano = avaliarPlano(motor, oficialReg({ plano: [r] }));
    expect(plano.semestres[0].itens.every((i) => i.problemas.length === 0)).toBe(true);
  });

  it('respeita limites menores e nunca sugere optativas', () => {
    const r = sugerirSemestre(motor, new Set(), 8);
    const soma = r.reduce((s, c) => s + curriculo.disciplinas.find((d) => d.codigo === c)!.aulasSemanais, 0);
    expect(soma).toBeLessThanOrEqual(8);
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((c) => curriculo.disciplinas.find((d) => d.codigo === c)!.tipo === 'obrigatoria')).toBe(true);
  });
});

describe('MTM3110 cursando: planejamento no currículo oficial (§10, §11)', () => {
  const status = { MTM3110: 'cursando' } as const;

  it('opção ligada: MTM3120 é válida no semestre 1 do plano e aparece como disponível', () => {
    const r = oficialReg({ status, plano: [['MTM3120']], cursandoComoAprovada: true });
    expect(avaliarPlano(motor, r).semestres[0].itens).toEqual([{ codigo: 'MTM3120', problemas: [] }]);
    expect(disponiveisNoSemestre(motor, r, 1)).not.toContain('MTM3120'); // já planejada
    expect(disponiveisNoSemestre(motor, oficialReg({ status, cursandoComoAprovada: true }), 1)).toContain('MTM3120');
  });

  it('opção desligada: requisito faltante MTM3110, com a alternativa MTM3101', () => {
    const r = oficialReg({ status, plano: [['MTM3120']], cursandoComoAprovada: false });
    expect(avaliarPlano(motor, r).semestres[0].itens).toEqual([
      { codigo: 'MTM3120', problemas: [{ tipo: 'requisito', faltantes: [['MTM3101'], ['MTM3110']] }] },
    ]);
    expect(disponiveisNoSemestre(motor, oficialReg({ status, cursandoComoAprovada: false }), 1)).not.toContain('MTM3120');
  });

  it('MTM3110 planejado no semestre 1 libera MTM3120 no semestre 2', () => {
    const r = oficialReg({ plano: [['MTM3110'], ['MTM3120']] });
    expect(avaliarPlano(motor, r).semestres[1].itens[0].problemas).toEqual([]);
    expect(avaliarPlano(motor, oficialReg({ plano: [['MTM3120']] })).semestres[0].itens[0].problemas).toHaveLength(1);
  });
});

describe('registro sobre o currículo oficial (§10, §12)', () => {
  it('aprovar MTM3120 marca MTM3110 (ramo do currículo) e MTM3101 não é inventado', () => {
    const r = definirStatus(motor, oficialReg({}), 'MTM3120', 'aprovada');
    expect(r.status).toEqual({ MTM3110: 'aprovada', MTM3120: 'aprovada' });
  });

  it('desaprovar MTM3110 remove MTM3120 aprovada', () => {
    const r = definirStatus(motor, oficialReg({ status: { MTM3110: 'aprovada', MTM3120: 'aprovada' } }), 'MTM3110', 'nao-cursada');
    expect(r.status).toEqual({});
  });

  it('MTM3101 (currículo antigo) pode ser aprovada e libera MTM3120', () => {
    const r = definirStatus(motor, oficialReg({}), 'MTM3101', 'aprovada');
    expect(r.status).toEqual({ MTM3101: 'aprovada' });
    expect(avaliarPlano(motor, { ...r, plano: { semestres: [{ codigos: ['MTM3120'] }] } }).semestres[0].itens[0].problemas).toEqual([]);
  });

  it('exemplo do §12: importa, reporta MTM3101 externo e preserva o plano', () => {
    const texto = JSON.stringify({
      formato: 'curriculo-interativo-ecv', versao: 1, curriculoId: 'ecv-2020-1', atualizadoEm: '2026-11-11T15:00:00.000Z',
      status: { ECV2101: 'aprovada', MTM3101: 'aprovada', FSC5002: 'cursando', MTM3120: 'reprovada' },
      plano: { semestres: [{ codigos: ['ECV2201', 'FSC5122'] }] },
      opcoes: { cursandoComoAprovada: true, limiteAulas: 30 },
    });
    const r = importar(texto, curriculo);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.relatorio).toHaveLength(1);
    expect(r.relatorio[0]).toContain('MTM3101');
    expect(r.registro.plano.semestres).toEqual([{ codigos: ['ECV2201', 'FSC5122'] }]);
  });

  it('ida e volta e carregar com o currículo oficial', () => {
    const original = oficialReg({ status: { ECV2101: 'aprovada', FSC5002: 'cursando' }, plano: [['ECV2201']] });
    expect(carregar(serializar(original), curriculo)).toEqual(original);
    expect(carregar('lixo', curriculo, original.atualizadoEm)).toEqual(registroVazio('ecv-2020-1', original.atualizadoEm));
  });
});
