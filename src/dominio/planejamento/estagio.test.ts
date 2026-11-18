// Estágio fora do limite de créditos (§11): cabe com TCC II e optativas no mesmo semestre.
import { describe, expect, it } from 'vitest';
import oficial from '../curriculos/ecv-2020-1.json';
import type { Curriculo, Disciplina } from '../tipos';
import { reg } from '../aluno/registro.fixture';
import { criarMotor } from '../regras';
import { aulasNoLimite, avaliarPlano, montarPlano, sugerirSemestre } from '.';
import { disc } from '../regras/curriculoFicticio.fixture';

const ecv = oficial as unknown as Curriculo;
const motor = criarMotor(ecv);
const ate9 = Object.fromEntries(
  ecv.disciplinas.filter((d) => d.tipo === 'obrigatoria' && d.fase! <= 9).map((d) => [d.codigo, 'aprovada' as const]),
);
const comTccI = reg({ status: ate9 }, 'ecv-2020-1'); // falta só a fase 10: ECV2000 e ECV2002 ficam disponíveis

describe('aulasNoLimite', () => {
  it('o estágio (ECV2000) vale 0 no limite; as demais valem as próprias aulas semanais', () => {
    const d = (c: string) => ecv.disciplinas.find((x) => x.codigo === c)!;
    expect(d('ECV2000').aulasSemanais).toBe(30); // o PDF continua com 30
    expect(d('ECV2000').foraDoLimiteDeAulas).toBe(true);
    expect(aulasNoLimite(d('ECV2000'))).toBe(0);
    expect(aulasNoLimite(d('ECV2002'))).toBe(4);
    expect(aulasNoLimite(disc('TST0001', [], { aulasSemanais: 5 }) as Disciplina)).toBe(5);
  });
});

describe('sugerirSemestre com o estágio', () => {
  it('estágio e TCC II são sugeridos juntos', () => {
    const base = new Set(Object.keys(ate9));
    const r = sugerirSemestre(motor, base, 30, 5);
    expect(r).toContain('ECV2000');
    expect(r).toContain('ECV2002');
  });

  it('o estágio não consome os 30 créditos: sobra espaço para outras disciplinas', () => {
    const base = new Set(Object.keys(ate9));
    expect(sugerirSemestre(motor, base, 4, 5).sort()).toEqual(['ECV2000', 'ECV2002']); // TCC II (4) cabe em 4; estágio não pesa
  });
});

describe('avaliarPlano com o estágio', () => {
  it('estágio + TCC II: 4 créditos (não 34), sem aviso de máximo nem de mínimo', () => {
    const av = avaliarPlano(motor, reg({ ...comTccI, plano: [['ECV2000', 'ECV2002']] , status: ate9 }, 'ecv-2020-1'));
    const s = av.semestres[0];
    expect(s.itens.every((i) => i.problemas.length === 0)).toBe(true);
    expect(s.totalAulas).toBe(4);
    expect(s.totalHorasAula).toBe(540 + 72); // as horas do estágio continuam contando
    expect(s.avisos).toEqual([]);
  });

  it('estágio + TCC II + uma optativa: soma só a optativa e o TCC II', () => {
    const av = avaliarPlano(motor, reg({ status: ate9, plano: [['ECV2000', 'ECV2002', 'ECV2811']] }, 'ecv-2020-1'));
    expect(av.semestres[0].totalAulas).toBe(4 + 3);
    expect(av.semestres[0].avisos).toEqual([]);
  });

  it('sem estágio, o aviso de mínimo continua valendo', () => {
    const av = avaliarPlano(motor, reg({ status: ate9, plano: [['ECV2002']] }, 'ecv-2020-1'));
    expect(av.semestres[0].avisos).toEqual([{ tipo: 'abaixo-minimo', limite: 16 }]);
  });

  it('o aviso de máximo ainda vale com o estágio: as outras disciplinas passam de 30', () => {
    const optativas = ecv.disciplinas.filter((d) => d.tipo === 'optativa' && d.aulasSemanais === 3 && d.grupo === 'optativas').slice(0, 11).map((d) => d.codigo);
    const av = avaliarPlano(motor, reg({ status: { ...ate9 }, plano: [['ECV2000', ...optativas]] }, 'ecv-2020-1'));
    expect(av.semestres[0].avisos.map((a) => a.tipo)).toContain('acima-maximo');
  });
});

describe('montarPlano com o estágio', () => {
  it('o estágio vai no mesmo semestre do TCC II', () => {
    const r = montarPlano(motor, reg({ status: ate9, disciplinasPorSemestre: 5 }, 'ecv-2020-1'));
    expect(r.completo).toBe(true);
    expect(r.semestres).toHaveLength(1);
    expect([...r.semestres[0]].sort()).toEqual(['ECV2000', 'ECV2002']);
  });

  it('do zero, com 7 por semestre: o estágio divide o semestre com outras disciplinas', () => {
    const r = montarPlano(motor, reg({ disciplinasPorSemestre: 7 }, 'ecv-2020-1'));
    expect(r.completo).toBe(true);
    const sem = r.semestres.find((s) => s.includes('ECV2000'))!;
    expect(sem.length).toBeGreaterThan(1);
  });
});
