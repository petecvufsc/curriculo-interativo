// montarPlano (§11): plano até o fim do curso, com o currículo fictício PLN e com os dados oficiais.
import { describe, expect, it } from 'vitest';
import oficial from '../curriculos/ecv-2020-1.json';
import type { Curriculo } from '../tipos';
import { reg } from '../aluno/registro.fixture';
import { criarMotor } from '../regras';
import { avaliarPlano, montarPlano } from '.';
import { curriculoPlanejamento } from './curriculoPlanejamento.fixture';

const fic = criarMotor(curriculoPlanejamento());
const ecv = criarMotor(oficial as unknown as Curriculo);
const obrigatoriasEcv = (oficial as unknown as Curriculo).disciplinas.filter((d) => d.tipo === 'obrigatoria').map((d) => d.codigo);

describe('montarPlano: currículo fictício', () => {
  // 9 obrigatórias; PLN0001->0010,0011; 0010->0012; 0002->0013
  it('cobre todas as obrigatórias, respeitando a quantidade por semestre', () => {
    const r = montarPlano(fic, reg({ disciplinasPorSemestre: 3 }));
    expect(r.completo).toBe(true);
    expect(r.faltantes).toEqual([]);
    expect(r.semestres.every((s) => s.length <= 3)).toBe(true);
    expect(new Set(r.semestres.flat()).size).toBe(r.semestres.flat().length); // ninguém repetido
    expect(r.semestres.flat().sort()).toEqual(['PLN0001', 'PLN0002', 'PLN0003', 'PLN0004', 'PLN0005', 'PLN0010', 'PLN0011', 'PLN0012', 'PLN0013']);
  });

  it('o semestre seguinte conta com o anterior: PLN0012 só entra depois de PLN0010', () => {
    const r = montarPlano(fic, reg({ disciplinasPorSemestre: 3 }));
    const sem = (c: string) => r.semestres.findIndex((s) => s.includes(c));
    expect(sem('PLN0012')).toBeGreaterThan(sem('PLN0010'));
    expect(sem('PLN0010')).toBeGreaterThan(sem('PLN0001'));
  });

  it('o plano montado não tem nenhum pré-requisito faltando', () => {
    const r = montarPlano(fic, reg({ disciplinasPorSemestre: 3 }));
    const av = avaliarPlano(fic, reg({ plano: r.semestres, disciplinasPorSemestre: 3 }));
    expect(av.semestres.flatMap((s) => s.itens).every((i) => i.problemas.length === 0)).toBe(true);
  });

  it('com mais quantidade, menos semestres', () => {
    const a = montarPlano(fic, reg({ disciplinasPorSemestre: 2 })).semestres.length;
    const b = montarPlano(fic, reg({ disciplinasPorSemestre: 5 })).semestres.length;
    expect(b).toBeLessThan(a);
  });

  it('não repete o que já foi cumprido e cobre só o que falta', () => {
    const r = montarPlano(fic, reg({ status: { PLN0001: 'aprovada', PLN0002: 'aprovada' }, disciplinasPorSemestre: 5 }));
    expect(r.semestres.flat()).not.toContain('PLN0001');
    expect(r.semestres.flat()).not.toContain('PLN0002');
    expect(r.completo).toBe(true);
  });

  it('com tudo cumprido: plano vazio e completo', () => {
    const todas = Object.fromEntries(curriculoPlanejamento().disciplinas.filter((d) => d.tipo === 'obrigatoria').map((d) => [d.codigo, 'aprovada' as const]));
    const r = montarPlano(fic, reg({ status: todas }));
    expect(r.semestres).toEqual([]);
    expect(r.completo).toBe(true);
  });

  it('respeita o limite de semestres e informa o que ficou de fora', () => {
    const r = montarPlano(fic, reg({ disciplinasPorSemestre: 1 }), 2);
    expect(r.semestres).toHaveLength(2);
    expect(r.completo).toBe(false);
    expect(r.faltantes.length).toBeGreaterThan(0);
  });

  it('o plano atual do registro é ignorado (quem chama decide se o substitui)', () => {
    const sem = montarPlano(fic, reg({ disciplinasPorSemestre: 3 }));
    const com = montarPlano(fic, reg({ disciplinasPorSemestre: 3, plano: [['PLN0001']] }));
    expect(com).toEqual(sem);
  });

  it('não muta o registro', () => {
    const r = reg({ plano: [['PLN0001']], disciplinasPorSemestre: 3 });
    const antes = JSON.stringify(r);
    montarPlano(fic, r);
    expect(JSON.stringify(r)).toBe(antes);
  });
});

describe('montarPlano: currículo oficial 2020.1', () => {
  it('de um histórico vazio, com 7 por semestre, cobre as 62 obrigatórias em até 15 semestres', () => {
    expect(obrigatoriasEcv).toHaveLength(62);
    const r = montarPlano(ecv, reg({ disciplinasPorSemestre: 7 }, 'ecv-2020-1'));
    expect(r.completo).toBe(true);
    expect(r.semestres.length).toBeLessThanOrEqual(15);
    expect(r.semestres.flat().sort()).toEqual([...obrigatoriasEcv].sort());
  });

  it('o plano completo não tem pré-requisito faltando nem passa de 30 créditos por semestre', () => {
    const r = montarPlano(ecv, reg({ disciplinasPorSemestre: 7 }, 'ecv-2020-1'));
    const av = avaliarPlano(ecv, reg({ plano: r.semestres, disciplinasPorSemestre: 7 }, 'ecv-2020-1'));
    expect(av.semestres.flatMap((s) => s.itens).filter((i) => i.problemas.length > 0)).toEqual([]);
    expect(av.semestres.every((s) => s.totalAulas <= 30)).toBe(true);
  });

  it('projeta 90,4 % (4086 de 4518 h-a): as optativas ficam por conta do aluno', () => {
    const r = montarPlano(ecv, reg({ disciplinasPorSemestre: 7 }, 'ecv-2020-1'));
    const av = avaliarPlano(ecv, reg({ plano: r.semestres, disciplinasPorSemestre: 7 }, 'ecv-2020-1'));
    expect(av.progressoProjetado.geral.cumpridasHA).toBe(4086);
    expect(av.progressoProjetado.geral.percentual).toBeCloseTo((4086 / 4518) * 100, 6);
  });

  it('o estágio não conta nos 30 créditos: pode dividir o semestre com TCC II e outras disciplinas', () => {
    const r = montarPlano(ecv, reg({ disciplinasPorSemestre: 7 }, 'ecv-2020-1'));
    const sem = r.semestres.find((s) => s.includes('ECV2000'))!;
    expect(sem.length).toBeGreaterThan(1);
  });

  it('quem já fez as quatro primeiras fases precisa de menos semestres', () => {
    const fases14 = (oficial as unknown as Curriculo).disciplinas.filter((d) => d.tipo === 'obrigatoria' && d.fase! <= 4);
    const status = Object.fromEntries(fases14.map((d) => [d.codigo, 'aprovada' as const]));
    const novo = montarPlano(ecv, reg({ disciplinasPorSemestre: 7 }, 'ecv-2020-1'));
    const adiantado = montarPlano(ecv, reg({ status, disciplinasPorSemestre: 7 }, 'ecv-2020-1'));
    expect(adiantado.completo).toBe(true);
    expect(adiantado.semestres.length).toBeLessThan(novo.semestres.length);
  });

  it('com 1 disciplina por semestre não cabe em 15 semestres: informa o que falta', () => {
    const r = montarPlano(ecv, reg({ disciplinasPorSemestre: 1 }, 'ecv-2020-1'));
    expect(r.semestres).toHaveLength(15);
    expect(r.completo).toBe(false);
    expect(r.faltantes.length).toBe(62 - 15);
  });
});
