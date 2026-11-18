// Status do aluno: derivados (§1, §10) e definirStatus com cascata (§10 + §6), currículo fictício.
import { describe, expect, it } from 'vitest';
import { criarMotor } from '../regras';
import { curriculoFicticio } from '../regras/curriculoFicticio.fixture';
import { aprovadasDe, baseSimulacao, definirStatus, registroVazio } from '.';
import { DATA_FIXA, congelar, reg } from './registro.fixture';

const motor = criarMotor(curriculoFicticio());
const ordenado = (s: Set<string>) => [...s].sort();

describe('registroVazio (§12)', () => {
  it('traz formato, versão, currículo, plano vazio e opções padrão (§10, §11)', () => {
    expect(registroVazio('ecv-2020-1', DATA_FIXA)).toEqual({
      formato: 'curriculo-interativo-ecv',
      versao: 1,
      curriculoId: 'ecv-2020-1',
      atualizadoEm: DATA_FIXA,
      status: {},
      plano: { semestres: [] },
      opcoes: { cursandoComoAprovada: true, limiteAulas: 30, disciplinasPorSemestre: 5, semestreInicial: null, versaoRegras: '2020.1' },
    });
  });
});

describe('aprovadasDe e baseSimulacao (§10)', () => {
  const r = reg({ status: { TST0001: 'aprovada', OLD1001: 'aprovada', TST0002: 'cursando', TST0003: 'reprovada' } });

  it('aprovadasDe: só aprovada, inclusive código externo', () => {
    expect(ordenado(aprovadasDe(r))).toEqual(['OLD1001', 'TST0001']);
  });

  it('opção ligada: cursando entra; reprovada nunca', () => {
    expect(ordenado(baseSimulacao(r))).toEqual(['OLD1001', 'TST0001', 'TST0002']);
  });

  it('opção desligada: cursando não entra', () => {
    const desligada = reg({ status: r.status, cursandoComoAprovada: false });
    expect(ordenado(baseSimulacao(desligada))).toEqual(['OLD1001', 'TST0001']);
  });

  it('registro vazio: conjuntos vazios', () => {
    expect(aprovadasDe(reg()).size).toBe(0);
    expect(baseSimulacao(reg()).size).toBe(0);
  });
});

describe('definirStatus: aprovada (cascata de marcar)', () => {
  it('marca os pré-requisitos que faltam (§6)', () => {
    const r = definirStatus(motor, reg(), 'TST0004', 'aprovada');
    expect(r.status).toEqual({ TST0001: 'aprovada', TST0002: 'aprovada', TST0004: 'aprovada' });
  });

  it('pré-requisito reprovada é sobrescrito para aprovada (§10)', () => {
    const r = definirStatus(motor, reg({ status: { TST0001: 'reprovada' } }), 'TST0004', 'aprovada');
    expect(r.status.TST0001).toBe('aprovada');
  });

  it('pré-requisito cursando permanece cursando (§10, leitura conservadora)', () => {
    const r = definirStatus(motor, reg({ status: { TST0002: 'cursando' } }), 'TST0004', 'aprovada');
    expect(r.status).toEqual({ TST0001: 'aprovada', TST0002: 'cursando', TST0004: 'aprovada' });
  });

  it('o próprio código cursando vira aprovada por escolha explícita do aluno', () => {
    const r = definirStatus(motor, reg({ status: { TST0001: 'cursando' } }), 'TST0001', 'aprovada');
    expect(r.status).toEqual({ TST0001: 'aprovada' });
  });

  it('não altera status que já eram aprovada nem entradas sem relação', () => {
    const r = definirStatus(motor, reg({ status: { TST0001: 'aprovada', TST0009: 'cursando' } }), 'TST0003', 'aprovada');
    expect(r.status).toEqual({ TST0001: 'aprovada', TST0003: 'aprovada', TST0009: 'cursando' });
  });

  it('código externo pode ser aprovada, sem cascata', () => {
    expect(definirStatus(motor, reg(), 'OLD1001', 'aprovada').status).toEqual({ OLD1001: 'aprovada' });
  });
});

describe('definirStatus: sair de aprovada (cascata de desmarcar)', () => {
  const cadeia = { TST0001: 'aprovada', TST0003: 'aprovada', TST0005: 'aprovada' } as const;

  it('nao-cursada remove o código e os dependentes aprovados que perderam o requisito', () => {
    expect(definirStatus(motor, reg({ status: { ...cadeia } }), 'TST0001', 'nao-cursada').status).toEqual({});
  });

  it('aprovada -> reprovada: código fica reprovada e dependentes aprovados saem', () => {
    const r = definirStatus(motor, reg({ status: { ...cadeia } }), 'TST0001', 'reprovada');
    expect(r.status).toEqual({ TST0001: 'reprovada' });
  });

  it('aprovada -> cursando: código fica cursando e dependentes aprovados saem', () => {
    const r = definirStatus(motor, reg({ status: { ...cadeia } }), 'TST0003', 'cursando');
    expect(r.status).toEqual({ TST0001: 'aprovada', TST0003: 'cursando' });
  });

  it('dependentes cursando ou reprovada nunca são alterados', () => {
    const r = definirStatus(
      motor,
      reg({ status: { TST0001: 'aprovada', TST0003: 'cursando', TST0004: 'reprovada' } }),
      'TST0001',
      'nao-cursada',
    );
    expect(r.status).toEqual({ TST0003: 'cursando', TST0004: 'reprovada' });
  });

  it('removido o código externo, dependente que perdeu o requisito sai', () => {
    const r = definirStatus(motor, reg({ status: { OLD1001: 'aprovada', TST0006: 'aprovada' } }), 'OLD1001', 'nao-cursada');
    expect(r.status).toEqual({});
  });

  it('dependente continua se outra alternativa mantém o requisito (OU)', () => {
    const r = definirStatus(
      motor,
      reg({ status: { OLD1001: 'aprovada', TST0001: 'aprovada', TST0003: 'aprovada', TST0006: 'aprovada' } }),
      'OLD1001',
      'nao-cursada',
    );
    expect(r.status).toEqual({ TST0001: 'aprovada', TST0003: 'aprovada', TST0006: 'aprovada' });
  });
});

describe('definirStatus: cursando, reprovada e nao-cursada sem cascata', () => {
  it('cursando e reprovada alteram só o código', () => {
    expect(definirStatus(motor, reg(), 'TST0004', 'cursando').status).toEqual({ TST0004: 'cursando' });
    expect(definirStatus(motor, reg(), 'TST0004', 'reprovada').status).toEqual({ TST0004: 'reprovada' });
  });

  it('reprovada/cursando em pré-requisito que não era aprovada não desmarca dependentes', () => {
    const r = definirStatus(motor, reg({ status: { TST0003: 'cursando', TST0005: 'aprovada' } }), 'TST0003', 'reprovada');
    expect(r.status).toEqual({ TST0003: 'reprovada', TST0005: 'aprovada' });
  });

  it('nao-cursada em código ausente é neutro', () => {
    expect(definirStatus(motor, reg({ status: { TST0001: 'aprovada' } }), 'TST0002', 'nao-cursada').status).toEqual({
      TST0001: 'aprovada',
    });
  });

  it('código fora do currículo só aceita aprovada ou remoção', () => {
    expect(() => definirStatus(motor, reg(), 'OLD1001', 'cursando')).toThrow(RangeError);
    expect(() => definirStatus(motor, reg(), 'OLD1001', 'reprovada')).toThrow(RangeError);
  });
});

describe('definirStatus: pureza', () => {
  it('não muta o registro (congelado) e devolve cópias independentes', () => {
    const original = congelar(reg({ status: { TST0001: 'aprovada' }, plano: [['TST0002']] }));
    const r = definirStatus(motor, original, 'TST0003', 'aprovada');
    expect(original.status).toEqual({ TST0001: 'aprovada' });
    expect(r).not.toBe(original);
    expect(r.plano).toEqual(original.plano);
    expect(r.plano.semestres[0]).not.toBe(original.plano.semestres[0]);
    expect(r.opcoes).not.toBe(original.opcoes);
  });

  it('mantém atualizadoEm, a menos que seja informado', () => {
    expect(definirStatus(motor, reg(), 'TST0001', 'aprovada').atualizadoEm).toBe(DATA_FIXA);
    expect(definirStatus(motor, reg(), 'TST0001', 'aprovada', '2027-02-02T00:00:00.000Z').atualizadoEm).toBe(
      '2027-02-02T00:00:00.000Z',
    );
  });
});
