import { describe, expect, it } from 'vitest';
import { criarMotor } from './motor';
import { curriculoFicticio } from './curriculoFicticio.fixture';

const motor = criarMotor(curriculoFicticio());
const S = (...c: string[]) => new Set(c);
const ordenado = (s: Set<string>) => [...s].sort();

describe('marcar (currículo fictício)', () => {
  it('sem pré-requisito: marca só a própria disciplina', () => {
    expect(ordenado(motor.marcar(S(), 'TST0001'))).toEqual(['TST0001']);
  });

  it('marca os pré-requisitos recursivamente (E)', () => {
    expect(ordenado(motor.marcar(S(), 'TST0004'))).toEqual(['TST0001', 'TST0002', 'TST0004']);
  });

  it('OU: escolhe a primeira alternativa formada só por códigos do currículo', () => {
    // TST0005 = (TST0003) ou (TST0004): vale a primeira; TST0004/TST0002 não entram
    expect(ordenado(motor.marcar(S(), 'TST0005'))).toEqual(['TST0001', 'TST0003', 'TST0005']);
    // TST0006 = (OLD1001) ou (TST0003): pula a alternativa externa e nunca marca OLD1001
    expect(ordenado(motor.marcar(S(), 'TST0006'))).toEqual(['TST0001', 'TST0003', 'TST0006']);
  });

  it('cadeia indireta completa', () => {
    expect(ordenado(motor.marcar(S(), 'TST0008'))).toEqual(
      ['TST0001', 'TST0003', 'TST0005', 'TST0007', 'TST0008'],
    );
  });

  it('não adiciona nada além da disciplina quando os requisitos já estão atendidos', () => {
    const base = S('TST0001', 'TST0002', 'TST0004');
    expect(ordenado(motor.marcar(base, 'TST0005'))).toEqual(['TST0001', 'TST0002', 'TST0004', 'TST0005']);
    // atendido por código externo: também não adiciona o ramo do currículo
    expect(ordenado(motor.marcar(S('OLD1001'), 'TST0006'))).toEqual(['OLD1001', 'TST0006']);
  });

  it('sem alternativa só do currículo: marca apenas o próprio código', () => {
    expect(ordenado(motor.marcar(S(), 'TST0030'))).toEqual(['TST0030']);
  });

  it('requisito atendido por equivalência não puxa a disciplina equivalente', () => {
    expect(ordenado(motor.marcar(S('OLD2001'), 'TST0011'))).toEqual(['OLD2001', 'TST0011']);
  });

  it('é puro: não altera a entrada e devolve um novo conjunto', () => {
    const entrada = S('TST0001');
    const saida = motor.marcar(entrada, 'TST0003');
    expect(ordenado(entrada)).toEqual(['TST0001']);
    expect(saida).not.toBe(entrada);
  });

  it('código fora do currículo é apenas adicionado', () => {
    expect(ordenado(motor.marcar(S(), 'OLD9999'))).toEqual(['OLD9999']);
  });
});

describe('desmarcar (fixpoint)', () => {
  it('remove a disciplina e os dependentes cujos requisitos quebraram', () => {
    const todas = S('TST0001', 'TST0003', 'TST0005', 'TST0007', 'TST0008');
    expect(ordenado(motor.desmarcar(todas, 'TST0001'))).toEqual([]);
    expect(ordenado(motor.desmarcar(todas, 'TST0005'))).toEqual(['TST0001', 'TST0003']);
  });

  it('mantém disciplina cuja alternativa OU continua satisfeita', () => {
    const base = S('TST0001', 'TST0002', 'TST0003', 'TST0004', 'TST0005');
    // TST0005 = TST0003 ou TST0004; ao tirar TST0003 resta TST0004
    expect(ordenado(motor.desmarcar(base, 'TST0003'))).toEqual(['TST0001', 'TST0002', 'TST0004', 'TST0005']);
    // tirando TST0001 caem as duas alternativas
    expect(ordenado(motor.desmarcar(base, 'TST0001'))).toEqual(['TST0002']);
  });

  it('nunca remove códigos externos, e eles continuam satisfazendo ramos OU', () => {
    const base = S('OLD1001', 'TST0001', 'TST0003', 'TST0006');
    const r = motor.desmarcar(base, 'TST0001');
    expect(ordenado(r)).toEqual(['OLD1001', 'TST0006']); // TST0006 sobrevive via OLD1001
    const so = motor.desmarcar(S('OLD1001', 'OLD2001'), 'TST0001');
    expect(ordenado(so)).toEqual(['OLD1001', 'OLD2001']);
  });

  it('equivalência: remover aprovada explícita derruba dependente que dependia só dela', () => {
    const base = S('TST0009', 'TST0011');
    expect(ordenado(motor.desmarcar(base, 'TST0009'))).toEqual([]);
    // com a equivalência OLD2001 presente, TST0011 continua válida
    expect(ordenado(motor.desmarcar(S('OLD2001', 'TST0009', 'TST0011'), 'TST0009'))).toEqual(['OLD2001', 'TST0011']);
  });

  it('AMBIGUIDADE (B): não apaga disciplina que já estava sem requisitos (marcada sem cascata)', () => {
    // TST0005 está marcada sem pré-requisito; desmarcar TST0020 (sem relação) não deve tocá-la
    expect(ordenado(motor.desmarcar(S('TST0005', 'TST0020'), 'TST0020'))).toEqual(['TST0005']);
    expect(ordenado(motor.desmarcar(S('TST0005', 'TST0001'), 'TST0001'))).toEqual(['TST0005']);
  });

  it('desmarcar disciplina ausente não muda nada; é puro', () => {
    const entrada = S('TST0001', 'TST0003');
    const saida = motor.desmarcar(entrada, 'TST0002');
    expect(ordenado(saida)).toEqual(['TST0001', 'TST0003']);
    expect(saida).not.toBe(entrada);
    expect(ordenado(entrada)).toEqual(['TST0001', 'TST0003']);
  });
});

describe('marcarFase', () => {
  it('marca todas as obrigatórias da fase, com cascata de pré-requisitos', () => {
    // fase 2 = TST0003, TST0004, TST0009, TST0010
    expect(ordenado(motor.marcarFase(S(), 2, true))).toEqual(
      ['TST0001', 'TST0002', 'TST0003', 'TST0004', 'TST0009', 'TST0010'],
    );
  });

  it('desmarcar a fase remove suas disciplinas e as que dependem delas', () => {
    const tudo = motor.marcarFase(motor.marcarFase(S(), 3, true), 5, true);
    expect(tudo.has('TST0008')).toBe(true);
    const r = motor.marcarFase(tudo, 1, false);
    // TST0010 não foi marcada: TST0012 já estava satisfeita porque TST0009 (marcada antes) a cobre por equivalência
    expect(ordenado(r)).toEqual(['TST0009', 'TST0011', 'TST0012']);
  });

  it('não inclui optativas e não altera a entrada', () => {
    const entrada = S();
    const r = motor.marcarFase(entrada, 1, true);
    expect(ordenado(r)).toEqual(['TST0001', 'TST0002']);
    expect(entrada.size).toBe(0);
  });

  it('fase sem disciplinas não altera o conjunto', () => {
    expect(ordenado(motor.marcarFase(S('TST0001'), 9, true))).toEqual(['TST0001']);
  });
});
