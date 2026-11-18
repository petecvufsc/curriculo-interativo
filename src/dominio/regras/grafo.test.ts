import { describe, expect, it } from 'vitest';
import { criarMotor } from './motor';
import { curriculoFicticio } from './curriculoFicticio.fixture';

const motor = criarMotor(curriculoFicticio());
const comoObjeto = (m: Map<string, unknown>) => Object.fromEntries(m);

describe('grafo de dependências (currículo fictício)', () => {
  it('sem pré-requisito: mapa vazio; código desconhecido também', () => {
    expect(motor.preRequisitos('TST0001').size).toBe(0);
    expect(motor.preRequisitos('XXX0000').size).toBe(0);
    expect(motor.dependentes('XXX0000').size).toBe(0);
  });

  it('pré-requisito direto e indireto, com distância', () => {
    expect(comoObjeto(motor.preRequisitos('TST0003'))).toEqual({
      TST0001: { distancia: 1, viaAlternativa: false },
    });
    expect(comoObjeto(motor.preRequisitos('TST0007'))).toEqual({
      TST0005: { distancia: 1, viaAlternativa: false },
      TST0003: { distancia: 2, viaAlternativa: true },
      TST0004: { distancia: 2, viaAlternativa: true },
      TST0001: { distancia: 3, viaAlternativa: true },
      TST0002: { distancia: 3, viaAlternativa: true },
    });
  });

  it('menor distância vence: nó direto e indireto é classificado como direto', () => {
    // TST0001 é pré-requisito direto de TST0008 e também indireto (via TST0007 ... TST0003).
    const pre = motor.preRequisitos('TST0008');
    expect(pre.get('TST0001')).toEqual({ distancia: 1, viaAlternativa: false });
    expect(pre.get('TST0007')?.distancia).toBe(1);
    expect(pre.get('TST0005')?.distancia).toBe(2);
    expect(pre.get('TST0003')?.distancia).toBe(3);
    expect(pre.get('TST0002')?.distancia).toBe(4);
  });

  it('dependentes: direto e indireto; direto e indireto ao mesmo tempo vale direto', () => {
    const dep = motor.dependentes('TST0001');
    expect([...dep.keys()].sort()).toEqual(
      ['TST0003', 'TST0004', 'TST0005', 'TST0006', 'TST0007', 'TST0008', 'TST0021'],
    );
    expect(dep.get('TST0008')?.distancia).toBe(1); // também alcançável via TST0007 (distância 4)
    expect(dep.get('TST0005')?.distancia).toBe(2);
    expect(dep.get('TST0007')?.distancia).toBe(3);
    expect(motor.dependentes('TST0008').size).toBe(0);
  });

  it('viaAlternativa direto: só quando há várias alternativas e o código não está em todas', () => {
    // TST0005 = (TST0003) ou (TST0004): ambos são opcionais
    expect(motor.preRequisitos('TST0005').get('TST0003')).toEqual({ distancia: 1, viaAlternativa: true });
    expect(motor.preRequisitos('TST0005').get('TST0004')).toEqual({ distancia: 1, viaAlternativa: true });
    // TST0004 = (TST0001 e TST0002): uma alternativa só, obrigatórios
    expect(motor.preRequisitos('TST0004').get('TST0001')?.viaAlternativa).toBe(false);
    // código externo não entra no grafo (TST0006 = OLD1001 ou TST0003)
    expect([...motor.preRequisitos('TST0006').keys()]).toEqual(['TST0003', 'TST0001']); // sem OLD1001
    // ...e a única alternativa só do currículo (TST0003) é obrigatória para quem não tem o código antigo
    expect(motor.preRequisitos('TST0006').get('TST0003')?.viaAlternativa).toBe(false);
  });

  it('viaAlternativa: código presente só num ramo com código antigo é opcional', () => {
    const c = curriculoFicticio();
    c.disciplinas.push({ ...c.disciplinas[0], codigo: 'TST0041', preRequisitos: [['OLD1001', 'TST0002'], ['TST0001']] });
    const m = criarMotor(c);
    expect(m.preRequisitos('TST0041').get('TST0001')?.viaAlternativa).toBe(false);
    expect(m.preRequisitos('TST0041').get('TST0002')?.viaAlternativa).toBe(true);
  });

  it('viaAlternativa: código presente em todos os ramos do currículo é obrigatório', () => {
    const c = curriculoFicticio();
    c.disciplinas.push({ ...c.disciplinas[0], codigo: 'TST0040', preRequisitos: [['TST0001', 'TST0002'], ['TST0001', 'TST0003']] });
    const m = criarMotor(c);
    expect(m.preRequisitos('TST0040').get('TST0001')?.viaAlternativa).toBe(false);
    expect(m.preRequisitos('TST0040').get('TST0002')?.viaAlternativa).toBe(true);
  });

  it('viaAlternativa em dependentes indiretos propaga a bandeira do primeiro caminho mais curto', () => {
    const dep = motor.dependentes('TST0002');
    expect(dep.get('TST0004')).toEqual({ distancia: 1, viaAlternativa: false });
    expect(dep.get('TST0005')).toEqual({ distancia: 2, viaAlternativa: true });
    expect(dep.get('TST0007')).toEqual({ distancia: 3, viaAlternativa: true });
    expect(dep.get('TST0008')).toEqual({ distancia: 4, viaAlternativa: true });
  });

  it('não modifica o currículo (entrada congelada)', () => {
    const c = curriculoFicticio();
    for (const d of c.disciplinas) {
      d.preRequisitos.forEach((g) => Object.freeze(g));
      Object.freeze(d.preRequisitos);
      Object.freeze(d);
    }
    Object.freeze(c.disciplinas);
    const m = criarMotor(c);
    expect(() => {
      m.preRequisitos('TST0008');
      m.dependentes('TST0001');
      m.simular(new Set(['TST0001']));
      m.marcar(new Set(), 'TST0008');
    }).not.toThrow();
  });
});
