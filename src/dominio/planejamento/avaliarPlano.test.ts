// avaliarPlano: cada linha da tabela do §11, currículo fictício.
import { describe, expect, it } from 'vitest';
import { reg, congelar } from '../aluno/registro.fixture';
import { criarMotor } from '../regras';
import { curriculoFicticio } from '../regras/curriculoFicticio.fixture';
import { avaliarPlano } from '.';
import { curriculoCargas } from './curriculoPlanejamento.fixture';

const motor = criarMotor(curriculoFicticio());
const problemas = (r: ReturnType<typeof reg>, semestre: number, indice = 0) =>
  avaliarPlano(motor, r).semestres[semestre - 1].itens[indice].problemas;

describe('requisito não atendido (§11, erro)', () => {
  it('informa o que falta por alternativa (§4)', () => {
    expect(problemas(reg({ plano: [['TST0003']] }), 1)).toEqual([{ tipo: 'requisito', faltantes: [['TST0001']] }]);
    expect(problemas(reg({ plano: [['TST0005']] }), 1)).toEqual([
      { tipo: 'requisito', faltantes: [['TST0003'], ['TST0004']] },
    ]);
  });

  it('disciplina do mesmo semestre não satisfaz o requisito', () => {
    const itens = avaliarPlano(motor, reg({ plano: [['TST0001', 'TST0003']] })).semestres[0].itens;
    expect(itens.map((i) => i.problemas)).toEqual([[], [{ tipo: 'requisito', faltantes: [['TST0001']] }]]);
  });

  it('semestres 1..k-1 do plano entram na base de k', () => {
    expect(problemas(reg({ plano: [['TST0001'], ['TST0003'], ['TST0005']] }), 2)).toEqual([]);
    expect(problemas(reg({ plano: [['TST0001'], ['TST0003'], ['TST0005']] }), 3)).toEqual([]);
  });

  it('semestre posterior não ajuda o anterior', () => {
    expect(problemas(reg({ plano: [['TST0003'], ['TST0001']] }), 1)).toEqual([
      { tipo: 'requisito', faltantes: [['TST0001']] },
    ]);
  });

  it('aprovada satisfaz; reprovada não', () => {
    expect(problemas(reg({ status: { TST0001: 'aprovada' }, plano: [['TST0003']] }), 1)).toEqual([]);
    expect(problemas(reg({ status: { TST0001: 'reprovada' }, plano: [['TST0003']] }), 1)).toHaveLength(1);
  });

  it('cursando satisfaz só com a opção ligada (§10)', () => {
    const status = { TST0001: 'cursando' } as const;
    expect(problemas(reg({ status, plano: [['TST0003']], cursandoComoAprovada: true }), 1)).toEqual([]);
    expect(problemas(reg({ status, plano: [['TST0003']], cursandoComoAprovada: false }), 1)).toEqual([
      { tipo: 'requisito', faltantes: [['TST0001']] },
    ]);
  });

  it('código de outro currículo aprovado satisfaz o ramo OU (§3)', () => {
    expect(problemas(reg({ status: { OLD1001: 'aprovada' }, plano: [['TST0006']] }), 1)).toEqual([]);
  });
});

describe('já cumprida (§11, erro)', () => {
  it('aprovada', () => {
    expect(problemas(reg({ status: { TST0001: 'aprovada' }, plano: [['TST0001']] }), 1)).toEqual([{ tipo: 'ja-cumprida' }]);
  });

  it('por equivalência (§2)', () => {
    expect(problemas(reg({ status: { OLD2001: 'aprovada' }, plano: [['TST0009']] }), 1)).toEqual([{ tipo: 'ja-cumprida' }]);
    expect(problemas(reg({ status: { OLD2002: 'aprovada', OLD2003: 'aprovada' }, plano: [['TST0009']] }), 1)).toEqual([
      { tipo: 'ja-cumprida' },
    ]);
  });

  it('cursando conta como cumprida só com a opção ligada', () => {
    const status = { TST0001: 'cursando' } as const;
    expect(problemas(reg({ status, plano: [['TST0001']], cursandoComoAprovada: true }), 1)).toEqual([{ tipo: 'ja-cumprida' }]);
    expect(problemas(reg({ status, plano: [['TST0001']], cursandoComoAprovada: false }), 1)).toEqual([]);
  });

  it('reprovada pode ser planejada de novo', () => {
    expect(problemas(reg({ status: { TST0001: 'reprovada' }, plano: [['TST0001']] }), 1)).toEqual([]);
  });

  it('cumprida por equivalência com disciplina planejada antes', () => {
    expect(problemas(reg({ plano: [['TST0009'], ['TST0010']] }), 2)).toEqual([{ tipo: 'ja-cumprida' }]);
  });
});

describe('repetida (§11, erro)', () => {
  it('em mais de um semestre: a primeira ocorrência é normal, as seguintes são repetidas', () => {
    const r = reg({ plano: [['TST0001'], ['TST0001']] });
    expect(problemas(r, 1)).toEqual([]);
    expect(problemas(r, 2)).toEqual([{ tipo: 'repetida' }]);
  });

  it('duas vezes no mesmo semestre', () => {
    const itens = avaliarPlano(motor, reg({ plano: [['TST0001', 'TST0001']] })).semestres[0].itens;
    expect(itens.map((i) => i.problemas)).toEqual([[], [{ tipo: 'repetida' }]]);
  });

  it('as duas ocorrências contam nos totais de aulas do semestre', () => {
    expect(avaliarPlano(motor, reg({ plano: [['TST0001', 'TST0001']] })).semestres[0].totalAulas).toBe(6);
  });
});

describe('fora do currículo (§11, erro)', () => {
  it('é sinalizado, não soma aulas e não satisfaz requisito nem equivalência', () => {
    const r = reg({ plano: [['ZZZ9999', 'TST0001'], ['TST0006']] });
    const a = avaliarPlano(motor, r);
    expect(a.semestres[0].itens[0]).toEqual({ codigo: 'ZZZ9999', problemas: [{ tipo: 'fora-do-curriculo' }] });
    expect(a.semestres[0].totalAulas).toBe(3);
    expect(a.semestres[0].totalHorasAula).toBe(54);
    const externo = reg({ plano: [['OLD1001'], ['TST0006']] });
    expect(avaliarPlano(motor, externo).semestres[1].itens[0].problemas).toEqual([
      { tipo: 'requisito', faltantes: [['OLD1001'], ['TST0003']] },
    ]);
    const equiv = reg({ plano: [['OLD2001'], ['TST0009']] });
    expect(avaliarPlano(motor, equiv).semestres[1].itens[0].problemas).toEqual([]);
  });
});

describe('avisos de carga (§11)', () => {
  const m = criarMotor(curriculoCargas());
  const avisos = (...codigos: string[]) => avaliarPlano(m, reg({ plano: [codigos] })).semestres[0].avisos;

  it('acima do máximo (> 30) com o limite da integralização', () => {
    expect(avisos('CRG31')).toEqual([{ tipo: 'acima-maximo', limite: 30 }]);
  });

  it('abaixo do mínimo (< 16)', () => {
    expect(avisos('CRG15')).toEqual([{ tipo: 'abaixo-minimo', limite: 16 }]);
    expect(avisos('CRG14')).toEqual([{ tipo: 'abaixo-minimo', limite: 16 }]);
  });

  it('exatamente no limite não avisa', () => {
    expect(avisos('CRG16')).toEqual([]);
    expect(avisos('CRG30')).toEqual([]);
  });

  it('soma de várias disciplinas (14 + 15 = 29: sem aviso)', () => {
    expect(avisos('CRG14', 'CRG15')).toEqual([]);
    expect(avaliarPlano(m, reg({ plano: [['CRG14', 'CRG15']] })).semestres[0].totalAulas).toBe(29);
  });

  it('semestre vazio não tem aviso de mínimo, mas os outros são avaliados', () => {
    const a = avaliarPlano(m, reg({ plano: [[], ['CRG15']] }));
    expect(a.semestres[0]).toMatchObject({ numero: 1, itens: [], totalAulas: 0, totalHorasAula: 0, avisos: [] });
    expect(a.semestres[1].avisos).toEqual([{ tipo: 'abaixo-minimo', limite: 16 }]);
  });

  it('o aviso usa os limites da integralização, não opcoes.limiteAulas', () => {
    expect(avaliarPlano(m, reg({ plano: [['CRG16']], limiteAulas: 10 })).semestres[0].avisos).toEqual([]);
  });

  it('sem integralização: não há avisos', () => {
    const sem = criarMotor({ ...curriculoCargas(), integralizacao: null });
    expect(avaliarPlano(sem, reg({ plano: [['CRG31']] })).semestres[0].avisos).toEqual([]);
  });

  it('semestre só com código externo não gera aviso de mínimo', () => {
    expect(avaliarPlano(motor, reg({ plano: [['ZZZ9999']] })).semestres[0].avisos).toEqual([]);
  });

  it('totais de horas-aula', () => {
    const a = avaliarPlano(motor, reg({ plano: [['TST0001', 'TST0002']] })).semestres[0];
    expect(a.totalAulas).toBe(5);
    expect(a.totalHorasAula).toBe(90);
  });
});

describe('correquisitos e progresso projetado (§11)', () => {
  it('correquisitos (conjunto) não são verificados', () => {
    const c = curriculoFicticio();
    c.disciplinas[0] = { ...c.disciplinas[0], conjunto: ['TST0002'] };
    expect(avaliarPlano(criarMotor(c), reg({ plano: [['TST0001']] })).semestres[0].itens[0].problemas).toEqual([]);
  });

  it('progressoProjetado = progresso(base ∪ plano inteiro)', () => {
    const r = reg({ status: { TST0001: 'aprovada' }, plano: [['TST0002'], ['TST0003', 'TST0020']] });
    const a = avaliarPlano(motor, r);
    expect(a.progressoProjetado).toEqual(motor.progresso(new Set(['TST0001', 'TST0002', 'TST0003', 'TST0020'])));
    expect(a.progressoProjetado.obrigatorias.cumpridasHA).toBe(54 + 36 + 54);
    expect(a.progressoProjetado.optativas.cumpridasHA).toBe(72);
  });

  it('progressoProjetado inclui cursando só com a opção ligada e ignora códigos fora do currículo', () => {
    const status = { TST0001: 'cursando' } as const;
    // OLD2001 planejado não pode virar equivalente de TST0009 (que somaria mais 54).
    const ligada = avaliarPlano(motor, reg({ status, plano: [['OLD2001']] }));
    expect(ligada.progressoProjetado.obrigatorias.cumpridasHA).toBe(54);
    const desligada = avaliarPlano(motor, reg({ status, plano: [['OLD2001']], cursandoComoAprovada: false }));
    expect(desligada.progressoProjetado.obrigatorias.cumpridasHA).toBe(0);
  });

  it('plano vazio: sem semestres e progresso da base', () => {
    const a = avaliarPlano(motor, reg({ status: { TST0001: 'aprovada' } }));
    expect(a.semestres).toEqual([]);
    expect(a.progressoProjetado.obrigatorias.cumpridasHA).toBe(54);
  });

  it('não muta o registro', () => {
    const r = congelar(reg({ status: { TST0001: 'aprovada' }, plano: [['TST0001', 'ZZZ9999'], ['TST0001']] }));
    const copia = JSON.stringify(r);
    avaliarPlano(motor, r);
    expect(JSON.stringify(r)).toBe(copia);
  });
});
