import { describe, expect, it } from 'vitest';
import { criarMotor } from './motor';
import { curriculoFicticio } from './curriculoFicticio.fixture';

const motor = criarMotor(curriculoFicticio());
const S = (...c: string[]) => new Set(c);

describe('requisitos e situação (currículo fictício)', () => {
  it('sem pré-requisito: disponível de início; cumprida quando aprovada', () => {
    expect(motor.requisitosAtendidos('TST0001', S())).toBe(true);
    expect(motor.situacao('TST0001', S())).toEqual({ tipo: 'disponivel' });
    expect(motor.situacao('TST0001', S('TST0001'))).toEqual({ tipo: 'cumprida' });
  });

  it('um pré-requisito: bloqueada com faltantes; disponível após o pré-requisito', () => {
    expect(motor.situacao('TST0003', S())).toEqual({ tipo: 'bloqueada', faltantes: [['TST0001']] });
    expect(motor.situacao('TST0003', S('TST0001'))).toEqual({ tipo: 'disponivel' });
  });

  it('vários pré-requisitos (E): exige todos; faltantes lista só o que falta', () => {
    expect(motor.requisitosAtendidos('TST0004', S('TST0001'))).toBe(false);
    expect(motor.situacao('TST0004', S('TST0001'))).toEqual({ tipo: 'bloqueada', faltantes: [['TST0002']] });
    expect(motor.requisitosAtendidos('TST0004', S('TST0001', 'TST0002'))).toBe(true);
  });

  it('alternativas (OU): basta uma alternativa completa; faltantes é por alternativa', () => {
    expect(motor.situacao('TST0005', S())).toEqual({ tipo: 'bloqueada', faltantes: [['TST0003'], ['TST0004']] });
    expect(motor.requisitosAtendidos('TST0005', S('TST0003'))).toBe(true);
    expect(motor.requisitosAtendidos('TST0005', S('TST0004'))).toBe(true);
    // alternativa parcial não vale: TST0001 sozinho não completa nenhuma
    expect(motor.requisitosAtendidos('TST0005', S('TST0001', 'TST0002'))).toBe(false);
  });

  it('código externo (currículo antigo) satisfaz um ramo OU', () => {
    expect(motor.requisitosAtendidos('TST0006', S())).toBe(false);
    expect(motor.requisitosAtendidos('TST0006', S('OLD1001'))).toBe(true);
    expect(motor.situacao('TST0006', S())).toEqual({ tipo: 'bloqueada', faltantes: [['OLD1001'], ['TST0003']] });
  });

  it('código externo só é cumprido se estiver em aprovadas', () => {
    expect(motor.cumprida('OLD1001', S('OLD1001'))).toBe(true);
    expect(motor.cumprida('OLD1001', S())).toBe(false);
  });

  it('reprovada / em andamento = ausente de aprovadas: dependentes continuam bloqueadas', () => {
    // TST0003 em andamento (ou reprovada) não entra em aprovadas.
    const aprovadas = S('TST0001');
    expect(motor.situacao('TST0003', aprovadas)).toEqual({ tipo: 'disponivel' });
    expect(motor.situacao('TST0005', aprovadas).tipo).toBe('bloqueada');
    expect(motor.situacao('TST0007', aprovadas).tipo).toBe('bloqueada');
  });

  it('simulação "supondo aprovação": aprovadas ∪ emAndamento libera os dependentes', () => {
    const aprovadas = S('TST0001');
    const emAndamento = S('TST0003');
    const hipotese = new Set([...aprovadas, ...emAndamento]);
    expect(motor.situacao('TST0005', hipotese)).toEqual({ tipo: 'disponivel' });
    expect(motor.situacao('TST0003', hipotese)).toEqual({ tipo: 'cumprida' });
  });

  it('a fase não bloqueia: disciplina de fase alta sem pré-requisito está disponível', () => {
    expect(motor.situacao('TST0030', S('OLD3001'))).toEqual({ tipo: 'disponivel' });
    expect(motor.situacao('TST0020', S())).toEqual({ tipo: 'disponivel' });
  });

  it('situacao e requisitosAtendidos recusam código fora do currículo', () => {
    expect(() => motor.situacao('OLD1001', S())).toThrow();
    expect(() => motor.requisitosAtendidos('OLD1001', S())).toThrow();
  });
});

describe('equivalências (um único nível)', () => {
  it('uma alternativa de equivalentes completa torna a disciplina cumprida', () => {
    expect(motor.cumprida('TST0009', S('OLD2001'))).toBe(true);
    expect(motor.cumprida('TST0009', S('OLD2002', 'OLD2003'))).toBe(true);
    expect(motor.situacao('TST0009', S('OLD2001'))).toEqual({ tipo: 'cumprida' });
  });

  it('alternativa de equivalência incompleta não vale', () => {
    expect(motor.cumprida('TST0009', S('OLD2002'))).toBe(false);
    expect(motor.cumprida('TST0009', S())).toBe(false);
  });

  it('a disciplina cumprida por equivalência satisfaz pré-requisitos de outras', () => {
    expect(motor.situacao('TST0011', S('OLD2001'))).toEqual({ tipo: 'disponivel' });
  });

  it('NÃO encadeia equivalência de equivalência', () => {
    // TST0010 é equivalente a TST0009, e TST0009 é cumprida por OLD2001.
    // Mesmo assim TST0010 não é cumprida: o motor só olha `aprovadas`, não `cumprida(TST0009)`.
    const aprovadas = S('OLD2001');
    expect(motor.cumprida('TST0009', aprovadas)).toBe(true);
    expect(motor.cumprida('TST0010', aprovadas)).toBe(false);
    expect(motor.situacao('TST0012', aprovadas)).toEqual({ tipo: 'bloqueada', faltantes: [['TST0010']] });
    // com TST0009 realmente aprovada (um nível), TST0010 passa a ser cumprida
    expect(motor.cumprida('TST0010', S('TST0009'))).toBe(true);
    expect(motor.situacao('TST0012', S('TST0009'))).toEqual({ tipo: 'disponivel' });
  });
});
