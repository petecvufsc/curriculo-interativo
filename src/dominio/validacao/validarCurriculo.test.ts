import { describe, expect, it } from 'vitest';
import type { Curriculo, Disciplina } from '../tipos';
import { validarCurriculo } from './validarCurriculo';
import oficial from '../curriculos/ecv-2020-1.json';
import original from '../curriculos/ecv-programa-original.json';

// Disciplinas FICTÍCIAS (prefixo TST), usadas só para testar o validador.
function disc(codigo: string, pre: string[][] = [], extra: Partial<Disciplina> = {}): Disciplina {
  return {
    codigo, nome: `Exemplo ${codigo}`, tipo: 'obrigatoria', grupo: 'fase', fase: 1,
    horasAula: 54, aulasSemanais: 3, preRequisitos: pre, equivalentes: [], conjunto: [],
    preCH: null, alertas: [], ...extra,
  };
}
function curr(disciplinas: Disciplina[]): Curriculo {
  return { id: 'teste', curso: 'x', curriculo: 'x', fonte: 'x', integralizacao: null, vagasOptativasPorFase: {}, disciplinas };
}

describe('validarCurriculo (casos fictícios)', () => {
  it('aceita currículo consistente com E e OU', () => {
    const r = validarCurriculo(curr([disc('TST0001'), disc('TST0002'), disc('TST0003', [['TST0001', 'TST0002']]), disc('TST0004', [['TST0001'], ['TST0003']])]));
    expect(r.erros).toEqual([]);
  });

  it('detecta código duplicado e formato inválido', () => {
    const r = validarCurriculo(curr([disc('TST0001'), disc('TST0001'), disc('abc')]));
    expect(r.erros.some((e) => e.includes('duplicado'))).toBe(true);
    expect(r.erros.some((e) => e.includes('inválido'))).toBe(true);
  });

  it('detecta auto-referência e ciclo indireto', () => {
    const r = validarCurriculo(curr([disc('TST0001', [['TST0001']]), disc('TST0002', [['TST0003']]), disc('TST0003', [['TST0004']]), disc('TST0004', [['TST0002']])]));
    expect(r.erros.some((e) => e.includes('si mesma'))).toBe(true);
    expect(r.erros.some((e) => e.startsWith('Ciclo'))).toBe(true);
  });

  it('código externo (currículo antigo) gera aviso, não erro', () => {
    const r = validarCurriculo(curr([disc('TST0001', [['OLD1234'], ['TST0002']]), disc('TST0002')]));
    expect(r.erros).toEqual([]);
    expect(r.avisos.some((a) => a.includes('OLD1234'))).toBe(true);
  });

  it('rejeita correquisitos e Pré CH (ainda não suportados pelo motor)', () => {
    const r = validarCurriculo(curr([disc('TST0001'), disc('TST0002', [], { conjunto: ['TST0001'] }), disc('TST0003', [], { preCH: 1000 })]));
    expect(r.erros.length).toBe(2);
  });

  it('rejeita grupo vazio e fase incoerente', () => {
    const r = validarCurriculo(curr([disc('TST0001', [[]]), disc('TST0002', [], { fase: 11 }), disc('TST0003', [], { tipo: 'optativa', fase: 2 })]));
    expect(r.erros.length).toBe(3);
  });
});

describe('currículos reais', () => {
  it('PDF 2020.1 não tem erros e fecha a carga horária obrigatória (3402 + 540 estágio + 144 TCC)', () => {
    const c = oficial as Curriculo;
    const r = validarCurriculo(c);
    expect(r.erros).toEqual([]);
    const i = c.integralizacao!;
    expect(r.totais.obrigatoriasHA).toBe(i.obrigatoriasHA + i.estagioHA + i.projetoIntegradorHA);
  });

  it('programa original (paridade) não tem erros estruturais', () => {
    expect(validarCurriculo(original as Curriculo).erros).toEqual([]);
  });
});
