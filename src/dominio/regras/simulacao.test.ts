import { describe, expect, it } from 'vitest';
import { criarMotor } from './motor';
import { curriculoFicticio } from './curriculoFicticio.fixture';

const motor = criarMotor(curriculoFicticio());
const S = (...c: string[]) => new Set(c);

describe('simular (currículo fictício)', () => {
  it('do zero: lista as disponíveis e soma horas e aulas por tipo', () => {
    const r = motor.simular(S());
    // obrigatórias sem requisito: TST0001, TST0002, TST0009, TST0010 (TST0030 e as demais bloqueadas)
    // optativas: TST0020 e TST0022 (TST0021 exige TST0001)
    expect(r.disponiveis.map((d) => d.codigo)).toEqual(['TST0001', 'TST0002', 'TST0009', 'TST0010', 'TST0020', 'TST0022']);
    expect(r.totaisDisponiveis.obrigatorias).toEqual({ horasAula: 54 + 36 + 54 + 54, aulasSemanais: 3 + 2 + 3 + 3 });
    expect(r.totaisDisponiveis.optativas).toEqual({ horasAula: 72 + 108, aulasSemanais: 4 + 6 });
    expect(r.totaisCursadas).toEqual({ obrigatorias: 0, optativas: 0 });
  });

  it('cursadas: soma horas das cumpridas (inclusive por equivalência) e tira-as das disponíveis', () => {
    const r = motor.simular(S('TST0001', 'TST0020', 'OLD2001'));
    expect(r.totaisCursadas).toEqual({ obrigatorias: 54 + 54, optativas: 72 }); // TST0001 + TST0009 (equiv.)
    const codigos = r.disponiveis.map((d) => d.codigo);
    expect(codigos).not.toContain('TST0001');
    expect(codigos).not.toContain('TST0009');
    expect(codigos).toContain('TST0003');
    expect(codigos).toContain('TST0011');
    expect(codigos).toContain('TST0021');
  });

  it('não impõe limite de aulas semanais às somas de disponíveis', () => {
    const r = motor.simular(S('TST0001', 'TST0002', 'TST0009'));
    const soma = r.disponiveis.reduce((s, d) => s + d.aulasSemanais, 0);
    expect(r.totaisDisponiveis.obrigatorias.aulasSemanais + r.totaisDisponiveis.optativas.aulasSemanais).toBe(soma);
  });

  it('não altera a entrada', () => {
    const entrada = S('TST0001');
    motor.simular(entrada);
    expect([...entrada]).toEqual(['TST0001']);
  });
});

describe('progresso (currículo fictício)', () => {
  it('denominadores vêm da integralização (obrigatórias = obrig + estágio + projeto integrador)', () => {
    const p = motor.progresso(S());
    expect(p.obrigatorias).toEqual({ cumpridasHA: 0, totalHA: 400 + 100 + 50 });
    expect(p.optativas).toEqual({ cumpridasHA: 0, totalHA: 200 });
  });

  it('soma obrigatórias e optativas cumpridas', () => {
    const p = motor.progresso(S('TST0001', 'TST0002', 'TST0020'));
    expect(p.obrigatorias.cumpridasHA).toBe(54 + 36);
    expect(p.optativas.cumpridasHA).toBe(72);
  });

  it('limita as atividades complementares a complementaresMaxHA', () => {
    // TST0022 tem 108 h-a no grupo atividades-complementares; o teto é 54
    const p = motor.progresso(S('TST0022', 'TST0020'));
    expect(p.optativas.cumpridasHA).toBe(72 + 54);
  });

  it('equivalência conta como cumprida no progresso', () => {
    expect(motor.progresso(S('OLD2001')).obrigatorias.cumpridasHA).toBe(54);
  });

  it('sem integralização: totais nulos e sem teto', () => {
    const c = curriculoFicticio();
    c.integralizacao = null;
    const p = criarMotor(c).progresso(S('TST0022'));
    expect(p.obrigatorias.totalHA).toBeNull();
    expect(p.optativas).toEqual({ cumpridasHA: 108, totalHA: null });
  });
});
