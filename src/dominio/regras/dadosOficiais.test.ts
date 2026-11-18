// Verificações pontuais no currículo oficial (ecv-2020-1.json, fonte de verdade, decisão D1).
import { describe, expect, it } from 'vitest';
import type { Curriculo } from '../tipos';
import oficial from '../curriculos/ecv-2020-1.json';
import { criarMotor } from './motor';

const curriculo = oficial as Curriculo;
const motor = criarMotor(curriculo);
const S = (...c: string[]) => new Set(c);

describe('currículo oficial 2020.1: situação', () => {
  it('ECV2101 está disponível com o histórico vazio', () => {
    expect(motor.situacao('ECV2101', S())).toEqual({ tipo: 'disponivel' });
  });

  it('MTM3120 fica disponível com MTM3101 (ramo OU de código do currículo antigo)', () => {
    expect(motor.situacao('MTM3120', S())).toEqual({ tipo: 'bloqueada', faltantes: [['MTM3101'], ['MTM3110']] });
    expect(motor.situacao('MTM3120', S('MTM3101'))).toEqual({ tipo: 'disponivel' });
    expect(motor.situacao('MTM3120', S('MTM3110'))).toEqual({ tipo: 'disponivel' });
  });

  it('grafo: MTM3110 é pré-requisito obrigatório (não "via alternativa") de MTM3120, apesar do ramo antigo MTM3101', () => {
    expect(motor.preRequisitos('MTM3120').get('MTM3110')).toEqual({ distancia: 1, viaAlternativa: false });
    expect(motor.preRequisitos('MTM3120').has('MTM3101')).toBe(false); // código externo fora do grafo
    expect(motor.preRequisitos('ECV2302').get('MTM3120')?.viaAlternativa).toBe(false);
  });

  it('ECV2505 fica bloqueada sem MTM3131 e informa o que falta', () => {
    const s = motor.situacao('ECV2505', S('ECV2401', 'ECV2404'));
    expect(s).toEqual({ tipo: 'bloqueada', faltantes: [['MTM3131']] });
    expect(motor.situacao('ECV2505', S('ECV2401', 'ECV2404', 'MTM3131')).tipo).toBe('disponivel');
  });

  it('ECV2704 exige os 7 pré-requisitos', () => {
    const sete = ['ECV2401', 'ECV2402', 'ECV2403', 'ECV2404', 'ECV2405', 'ENS5101', 'MTM3103'];
    expect(motor.situacao('ECV2704', new Set(sete)).tipo).toBe('disponivel');
    for (const falta of sete) {
      const s = motor.situacao('ECV2704', new Set(sete.filter((c) => c !== falta)));
      expect(s).toEqual({ tipo: 'bloqueada', faltantes: [[falta]] });
    }
  });

  it('ECV2974 está disponível do zero (decisão D1: expressão vazia)', () => {
    expect(motor.situacao('ECV2974', S())).toEqual({ tipo: 'disponivel' });
  });

  it('ECV2000 (estágio) só libera com ECV2404, ECV2901, ECV2902 e ECV2903', () => {
    const quatro = ['ECV2404', 'ECV2901', 'ECV2902', 'ECV2903'];
    expect(motor.situacao('ECV2000', new Set(quatro)).tipo).toBe('disponivel');
    expect(motor.situacao('ECV2000', S()).tipo).toBe('bloqueada');
    for (const falta of quatro) {
      expect(motor.situacao('ECV2000', new Set(quatro.filter((c) => c !== falta))).tipo).toBe('bloqueada');
    }
  });

  it('equivalência: ECV5136 torna ECV2202 cumprida (e libera ECV2304)', () => {
    expect(motor.cumprida('ECV2202', S('ECV5136'))).toBe(true);
    expect(motor.situacao('ECV2202', S('ECV5136'))).toEqual({ tipo: 'cumprida' });
    expect(motor.situacao('ECV2304', S('ECV5136')).tipo).toBe('disponivel');
    expect(motor.cumprida('ECV2202', S())).toBe(false);
  });
});

describe('currículo oficial 2020.1: progresso', () => {
  it('denominador das obrigatórias = 4086 (3402 + 540 + 144)', () => {
    const p = motor.progresso(S());
    expect(p.obrigatorias).toEqual({ cumpridasHA: 0, totalHA: 4086 });
    expect(p.optativas).toEqual({ cumpridasHA: 0, totalHA: 432 });
  });

  it('o numerador cheio das obrigatórias fecha o denominador', () => {
    const obrigatorias = curriculo.disciplinas.filter((d) => d.tipo === 'obrigatoria').map((d) => d.codigo);
    expect(motor.progresso(new Set(obrigatorias)).obrigatorias.cumpridasHA).toBe(4086);
  });

  it('ECV2905 (atividades complementares) conta 54 h-a e respeita o teto', () => {
    expect(motor.progresso(S('ECV2905')).optativas.cumpridasHA).toBe(54);
  });
});

describe('currículo oficial 2020.1: integralização geral (%)', () => {
  const obrigatorias = curriculo.disciplinas.filter((d) => d.tipo === 'obrigatoria').map((d) => d.codigo);
  const optativasComuns = curriculo.disciplinas
    .filter((d) => d.tipo === 'optativa' && d.grupo === 'optativas' && d.horasAula === 54)
    .map((d) => d.codigo);

  it('sem nada cumprido: 0 % de 4518 h-a (3402 + 540 + 144 + 432)', () => {
    const g = motor.progresso(S()).geral;
    expect(g.totalHA).toBe(4518);
    expect(g.cumpridasHA).toBe(0);
    expect(g.percentual).toBe(0);
  });

  it('todas as obrigatórias: 4086 de 4518 h-a (cerca de 90,4 %)', () => {
    const g = motor.progresso(S(...obrigatorias)).geral;
    expect(g.cumpridasHA).toBe(4086);
    expect(g.percentual).toBeCloseTo((4086 / 4518) * 100, 6);
  });

  it('optativas além de 432 h-a não contam: obrigatórias + 9 optativas de 54 h-a = 100 %, não mais', () => {
    const g = motor.progresso(S(...obrigatorias, ...optativasComuns.slice(0, 9))).geral;
    expect(g.cumpridasHA).toBe(4518);
    expect(g.percentual).toBe(100);
  });

  it('as optativas contam até 432 h-a: 4 de 54 h-a somam 216', () => {
    const g = motor.progresso(S(...optativasComuns.slice(0, 4))).geral;
    expect(g.cumpridasHA).toBe(216);
    expect(g.percentual).toBeCloseTo((216 / 4518) * 100, 6);
  });

  it('sem integralizacao no currículo, total e percentual são null', () => {
    const g = criarMotor({ ...curriculo, integralizacao: null }).progresso(S('ECV2101')).geral;
    expect(g.totalHA).toBeNull();
    expect(g.percentual).toBeNull();
  });
});

describe('currículo oficial 2020.1: propriedades do motor', () => {
  const codigos = curriculo.disciplinas.map((d) => d.codigo);

  it('marcar de um conjunto vazio gera sempre um conjunto consistente, sem códigos externos', () => {
    for (const c of codigos) {
      const r = motor.marcar(S(), c);
      expect(r.has(c)).toBe(true);
      for (const x of r) {
        expect(codigos).toContain(x);
        expect(motor.requisitosAtendidos(x, r)).toBe(true);
      }
    }
  });

  it('desmarcar desfaz o marcar da mesma disciplina e mantém a consistência', () => {
    for (const c of codigos) {
      const marcado = motor.marcar(S(), c);
      const r = motor.desmarcar(marcado, c);
      expect(r.has(c)).toBe(false);
      for (const x of r) expect(motor.requisitosAtendidos(x, r)).toBe(true);
    }
  });

  it('grafo: sem ciclos e só com códigos do currículo', () => {
    for (const c of codigos) {
      const pre = motor.preRequisitos(c);
      const dep = motor.dependentes(c);
      expect(pre.has(c)).toBe(false);
      expect(dep.has(c)).toBe(false);
      for (const k of [...pre.keys(), ...dep.keys()]) expect(codigos).toContain(k);
      for (const k of pre.keys()) expect(motor.dependentes(k).has(c)).toBe(true); // simetria
    }
  });

  it('marcarFase(10) marca o estágio com todos os seus pré-requisitos', () => {
    const r = motor.marcarFase(S(), 10, true);
    for (const c of ['ECV2000', 'ECV2404', 'ECV2901', 'ECV2902', 'ECV2903']) expect(r.has(c)).toBe(true);
    expect(motor.situacao('ECV2000', r)).toEqual({ tipo: 'cumprida' });
  });
});
