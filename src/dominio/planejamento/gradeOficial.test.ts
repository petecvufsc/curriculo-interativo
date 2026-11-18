import { describe, expect, it } from 'vitest';
import json from '../curriculos/ecv-2020-1.json';
import { curriculoParaAluno } from '../curriculos/paraAluno';
import { curriculoDaVersao, versaoDoSemestre } from '../curriculos/versoes';
import { registroVazio, type RegistroAluno } from '../aluno';
import { criarMotor } from '../regras';
import type { Curriculo } from '../tipos';
import { aulasNoLimite } from './aulasNoLimite';
import { avaliarPlano } from './avaliarPlano';
import { faseAtualDe, montarGradeOficial } from './gradeOficial';
import { rotuloSemestre } from './rotuloSemestre';

const curriculo = curriculoParaAluno(json as unknown as Curriculo);
const motor2020 = criarMotor(curriculoDaVersao(curriculo, '2020.1'));
const motor2028 = criarMotor(curriculoDaVersao(curriculo, '2028.1'));
// Regras do período de cada semestre de um plano que começa em 2027.1 (decisão D5)
const motorDoPlano = (k: number) => (versaoDoSemestre(rotuloSemestre('2027.1', k)) === '2028.1' ? motor2028 : motor2020);

const fase = (f: number) => curriculo.disciplinas.filter((d) => d.tipo === 'obrigatoria' && d.fase === f).map((d) => d.codigo);
const registro = (aprovadas: string[] = [], extra: Partial<RegistroAluno['opcoes']> = {}): RegistroAluno => {
  const r = registroVazio('ecv-2020-1');
  return {
    ...r,
    status: Object.fromEntries(aprovadas.map((c) => [c, 'aprovada' as const])),
    opcoes: { ...r.opcoes, ...extra },
  };
};
const problemas = (r: RegistroAluno, semestres: string[][]) =>
  avaliarPlano(motorDoPlano, { ...r, plano: { semestres: semestres.map((codigos) => ({ codigos })) } }).semestres.flatMap((s) =>
    s.itens.flatMap((i) => i.problemas.map((p) => `${i.codigo}:${p.tipo}`)),
  );

describe('faseAtualDe', () => {
  it('sem nada cumprido é a 1ª fase', () => {
    expect(faseAtualDe(motor2020, new Set())).toBe(1);
  });
  it('é a seguinte à mais alta fase cumprida pelo menos pela metade', () => {
    expect(faseAtualDe(motor2020, new Set([...fase(1), ...fase(2), ...fase(3)]))).toBe(4);
    // metade da 4ª fase também conta: já está na 5ª
    const quarta = fase(4);
    expect(faseAtualDe(motor2020, new Set([...fase(1), ...fase(2), ...fase(3), ...quarta.slice(0, Math.ceil(quarta.length / 2))]))).toBe(5);
  });
});

describe('montarGradeOficial', () => {
  it('calouro: um semestre por fase, na ordem, com as obrigatórias de cada fase, e sem problemas no plano', () => {
    const r = montarGradeOficial(motorDoPlano, registro());
    expect(r.faseAtual).toBe(1);
    expect(r.completo).toBe(true);
    expect(r.faltantes).toEqual([]);
    expect(r.semestres.length).toBeGreaterThanOrEqual(10);
    expect(new Set(r.semestres[0])).toEqual(new Set(fase(1)));
    expect(new Set(r.semestres[1])).toEqual(new Set(fase(2)));
    // todas as obrigatórias aparecem uma vez
    const todas = r.semestres.flat();
    expect(new Set(todas).size).toBe(todas.length);
    expect(new Set(todas)).toEqual(new Set(curriculo.disciplinas.filter((d) => d.tipo === 'obrigatoria').map((d) => d.codigo)));
    expect(problemas(registro(), r.semestres)).toEqual([]);
  });

  it('quem já fez as três primeiras fases começa na 4ª', () => {
    const feitas = [...fase(1), ...fase(2), ...fase(3)];
    const r = montarGradeOficial(motorDoPlano, registro(feitas));
    expect(r.faseAtual).toBe(4);
    expect(new Set(r.semestres[0])).toEqual(new Set(fase(4)));
    expect(r.semestres.flat().some((c) => feitas.includes(c))).toBe(false);
    expect(problemas(registro(feitas), r.semestres)).toEqual([]);
  });

  it('disciplina atrasada de uma fase anterior entra junto com a fase atual', () => {
    // Fases 1 a 4 feitas, menos Topografia II (ECV2304, da 3ª fase) e o que depende dela: ela fica "atrasada"
    const atrasada = 'ECV2304';
    const semela = new Set([atrasada, ...motor2020.dependentes(atrasada).keys()]);
    const feitas = [...fase(1), ...fase(2), ...fase(3), ...fase(4)].filter((c) => !semela.has(c));
    const r = montarGradeOficial(motorDoPlano, registro(feitas));
    // Começa na fase atual (depois das cumpridas pela metade), e a atrasada vai já no 1º semestre, onde seus pré-requisitos estão cumpridos
    expect(r.faseAtual).toBeGreaterThanOrEqual(4);
    expect(r.semestres[0]).toContain(atrasada);
    expect(r.semestres.flat().filter((c) => c === atrasada)).toHaveLength(1);
    expect(r.completo).toBe(true);
    expect(problemas(registro(feitas), r.semestres)).toEqual([]);
  });

  it('atrasada que depende de outra atrasada vai para um semestre depois da pré-requisito', () => {
    // Faltam Cálculo 1 (MTM3110) e Cálculo 2 (MTM3120, que exige o 1), mais nada: as duas não ficam juntas
    const feitas = [...fase(1), ...fase(2), ...fase(3), ...fase(4)].filter((c) => c !== 'MTM3110' && c !== 'MTM3120');
    const r = montarGradeOficial(motorDoPlano, registro(feitas));
    const onde = (c: string) => r.semestres.findIndex((s) => s.includes(c));
    expect(onde('MTM3110')).toBeGreaterThanOrEqual(0);
    expect(onde('MTM3120')).toBeGreaterThan(onde('MTM3110'));
  });

  it('respeita o limite de créditos: divide a fase que passa do limite', () => {
    const r = montarGradeOficial(motorDoPlano, registro([], { limiteAulas: 10 }));
    const porCodigo = new Map(curriculo.disciplinas.map((d) => [d.codigo, d]));
    for (const s of r.semestres) {
      const soma = s.reduce((t, c) => t + aulasNoLimite(porCodigo.get(c)!), 0);
      expect(soma).toBeLessThanOrEqual(10);
    }
    expect(r.semestres.length).toBeGreaterThan(10);
  });

  it('com todas as obrigatórias cumpridas, o plano é vazio e completo', () => {
    const todas = curriculo.disciplinas.filter((d) => d.tipo === 'obrigatoria').map((d) => d.codigo);
    const r = montarGradeOficial(motorDoPlano, registro(todas));
    expect(r).toEqual({ semestres: [], completo: true, faltantes: [], faseAtual: null });
  });

  it('não escolhe optativas e ignora o plano atual do registro', () => {
    const r0 = registro();
    const r = montarGradeOficial(motorDoPlano, { ...r0, plano: { semestres: [{ codigos: ['ECV2932'] }] } });
    expect(r.semestres.flat()).not.toContain('ECV2932');
    expect(r.semestres.flat().every((c) => curriculo.disciplinas.find((d) => d.codigo === c)!.tipo === 'obrigatoria')).toBe(true);
  });
});
