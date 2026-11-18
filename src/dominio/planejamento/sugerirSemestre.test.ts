// sugerirSemestre e disponiveisNoSemestre (§11), currículo fictício PLN.
import { describe, expect, it } from 'vitest';
import { reg } from '../aluno/registro.fixture';
import { criarMotor } from '../regras';
import { disciplinaDe } from '../aluno';
import { baseDoSemestre, disponiveisNoSemestre, impactoDe, sugerirSemestre } from '.';
import { curriculoPlanejamento } from './curriculoPlanejamento.fixture';

const motor = criarMotor(curriculoPlanejamento());
const S = (...c: string[]) => new Set(c);

describe('sugerirSemestre: ordem (§11)', () => {
  it('mais dependentes (total), depois menor fase, depois código', () => {
    // PLN0001 (3 dependentes), PLN0002 (1), depois os de 0 dependentes em ordem de código
    expect(sugerirSemestre(motor, S(), 100)).toEqual(['PLN0001', 'PLN0002', 'PLN0003', 'PLN0004', 'PLN0005']);
    // fase 2: PLN0010 (1 dependente) antes de PLN0011 e PLN0013 (0, em ordem de código)
    expect(sugerirSemestre(motor, S('PLN0001', 'PLN0002', 'PLN0003', 'PLN0004', 'PLN0005'), 100)).toEqual([
      'PLN0010', 'PLN0011', 'PLN0013',
    ]);
  });

  it('quem mais libera vem antes, mesmo de fase maior: PLN0010 (fase 2, libera 1) precede PLN0005 (fase 1, libera 0)', () => {
    const r = sugerirSemestre(motor, S('PLN0001'), 100);
    expect(r.indexOf('PLN0010')).toBeLessThan(r.indexOf('PLN0005'));
    expect(impactoDe(motor, 'PLN0010')).toBeGreaterThan(impactoDe(motor, 'PLN0005'));
  });

  it('a contagem de dependentes inclui os indiretos', () => {
    expect(motor.dependentes('PLN0001').size).toBe(3);
    expect(motor.dependentes('PLN0002').size).toBe(1);
  });

  it('desempate: dependentes, depois fase, depois código', () => {
    expect(sugerirSemestre(motor, S('PLN0001', 'PLN0002'), 100)).toEqual([
      'PLN0010', // libera 1
      'PLN0003', 'PLN0004', 'PLN0005', // libera 0, fase 1, por código
      'PLN0011', 'PLN0013', // libera 0, fase 2, por código
    ]);
  });

  it('impactoDe é a contagem de dependentes diretos e indiretos', () => {
    expect(impactoDe(motor, 'PLN0001')).toBe(3);
    expect(impactoDe(motor, 'PLN0005')).toBe(0);
  });
});

describe('sugerirSemestre: quantidade de disciplinas (§11)', () => {
  it('para na quantidade pedida, ficando com as que mais liberam', () => {
    expect(sugerirSemestre(motor, S(), 100, 2)).toEqual(['PLN0001', 'PLN0002']);
    expect(sugerirSemestre(motor, S(), 100, 3)).toEqual(['PLN0001', 'PLN0002', 'PLN0003']);
  });

  it('quantidade e limite de aulas valem juntos: o que vier primeiro', () => {
    expect(sugerirSemestre(motor, S(), 10, 5)).toEqual(['PLN0001', 'PLN0002', 'PLN0003']); // limite de aulas
    expect(sugerirSemestre(motor, S(), 100, 2)).toHaveLength(2); // quantidade
  });

  it('quantidade maior que as disponíveis devolve todas; zero devolve nada', () => {
    expect(sugerirSemestre(motor, S(), 100, 50)).toHaveLength(5);
    expect(sugerirSemestre(motor, S(), 100, 0)).toEqual([]);
  });

  it('sem quantidade, só vale o limite de aulas', () => {
    expect(sugerirSemestre(motor, S(), 100)).toEqual(sugerirSemestre(motor, S(), 100, Infinity));
  });
});

describe('sugerirSemestre: limite de aulas (§11)', () => {
  const soma = (codigos: string[]) => codigos.reduce((s, c) => s + disciplinaDe(motor, c)!.aulasSemanais, 0);

  it('adiciona enquanto a soma <= limite (limite exato cabe)', () => {
    const r = sugerirSemestre(motor, S(), 10);
    expect(r).toEqual(['PLN0001', 'PLN0002', 'PLN0003']);
    expect(soma(r)).toBe(10);
  });

  it('pula a que não cabe e continua tentando as menores', () => {
    // 4 + 4 + 2 = 10; PLN0004 (6) estoura; PLN0005 (3) cabe em 13 <= 14
    const r = sugerirSemestre(motor, S(), 14);
    expect(r).toEqual(['PLN0001', 'PLN0002', 'PLN0003', 'PLN0005']);
    expect(soma(r)).toBe(13);
  });

  it('limite zero ou menor que qualquer disciplina: nada', () => {
    expect(sugerirSemestre(motor, S(), 0)).toEqual([]);
    expect(sugerirSemestre(motor, S(), 1)).toEqual([]);
  });
});

describe('sugerirSemestre: elegibilidade (§11)', () => {
  it('nunca sugere optativas', () => {
    expect(sugerirSemestre(motor, S(), 1000)).not.toContain('PLN0090');
  });

  it('só disponíveis: cumpridas e bloqueadas ficam de fora', () => {
    const r = sugerirSemestre(motor, S('PLN0001'), 1000);
    expect(r).not.toContain('PLN0001');
    expect(r).not.toContain('PLN0012'); // exige PLN0010
    expect(r).toContain('PLN0010');
  });

  it('não muta a base recebida', () => {
    const base = S('PLN0001');
    sugerirSemestre(motor, base, 10);
    expect([...base]).toEqual(['PLN0001']);
  });
});

describe('disponiveisNoSemestre (§11)', () => {
  it('semestre 1: requisitos atendidos com a base do aluno, sem cumpridas', () => {
    const r = reg({ status: { PLN0001: 'aprovada' } });
    expect(disponiveisNoSemestre(motor, r, 1)).toEqual([
      'PLN0005', 'PLN0004', 'PLN0003', 'PLN0002', 'PLN0010', 'PLN0011', 'PLN0090',
    ]);
  });

  it('exclui o que já está planejado em qualquer semestre', () => {
    const r = reg({ plano: [['PLN0001'], ['PLN0003']] });
    const s1 = disponiveisNoSemestre(motor, r, 1);
    expect(s1).not.toContain('PLN0001');
    expect(s1).not.toContain('PLN0003');
  });

  it('semestre k enxerga o que foi planejado em 1..k-1', () => {
    const r = reg({ plano: [['PLN0001'], []] });
    expect(disponiveisNoSemestre(motor, r, 1)).not.toContain('PLN0010');
    expect(disponiveisNoSemestre(motor, r, 2)).toContain('PLN0010');
    expect(disponiveisNoSemestre(motor, r, 2)).toContain('PLN0011');
  });

  it('semestre k não enxerga o próprio semestre nem os posteriores', () => {
    const r = reg({ plano: [[], ['PLN0001', 'PLN0010']] });
    expect(disponiveisNoSemestre(motor, r, 2)).not.toContain('PLN0011');
  });

  it('opção cursando ligada/desligada', () => {
    const status = { PLN0001: 'cursando' } as const;
    expect(disponiveisNoSemestre(motor, reg({ status, cursandoComoAprovada: true }), 1)).toContain('PLN0010');
    expect(disponiveisNoSemestre(motor, reg({ status, cursandoComoAprovada: false }), 1)).not.toContain('PLN0010');
    // cursando (opção ligada) não pode ser planejada de novo
    expect(disponiveisNoSemestre(motor, reg({ status, cursandoComoAprovada: true }), 1)).not.toContain('PLN0001');
    expect(disponiveisNoSemestre(motor, reg({ status, cursandoComoAprovada: false }), 1)).toContain('PLN0001');
  });

  it('k fora da faixa não quebra (k < 1 vale como 1; k grande usa o plano todo)', () => {
    const r = reg({ plano: [['PLN0001']] });
    expect(disponiveisNoSemestre(motor, r, 0)).toEqual(disponiveisNoSemestre(motor, r, 1));
    expect(disponiveisNoSemestre(motor, r, 9)).toContain('PLN0010');
  });
});

describe('baseDoSemestre (§11)', () => {
  it('= base do aluno ∪ semestres 1..k-1 (sem códigos fora do currículo)', () => {
    const r = reg({ status: { OLD1: 'aprovada', PLN0003: 'reprovada' }, plano: [['PLN0001', 'ZZZ'], ['PLN0002']] });
    expect([...baseDoSemestre(motor, r, 1)].sort()).toEqual(['OLD1']);
    expect([...baseDoSemestre(motor, r, 2)].sort()).toEqual(['OLD1', 'PLN0001']);
    expect([...baseDoSemestre(motor, r, 3)].sort()).toEqual(['OLD1', 'PLN0001', 'PLN0002']);
  });
});
