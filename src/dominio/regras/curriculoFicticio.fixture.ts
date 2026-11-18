// Currículo FICTÍCIO (códigos TST/OLD) usado só nos testes unitários do motor.
//
// Grafo (P -> D = "P é pré-requisito de D"):
//   TST0001 -> TST0003, TST0004, TST0008
//   TST0002 -> TST0004
//   TST0003 -> TST0005 (OU), TST0006 (OU)
//   TST0004 -> TST0005 (OU)
//   TST0005 -> TST0007 -> TST0008
//   TST0009 (equivalente a OLD2001, ou a OLD2002+OLD2003) -> TST0011
//   TST0010 (equivalente a TST0009)                       -> TST0012
import type { Curriculo, Disciplina } from '../tipos';

export function disc(codigo: string, pre: string[][] = [], extra: Partial<Disciplina> = {}): Disciplina {
  return {
    codigo, nome: `Exemplo ${codigo}`, tipo: 'obrigatoria', grupo: 'fase', fase: 1,
    horasAula: 54, aulasSemanais: 3, preRequisitos: pre, equivalentes: [], conjunto: [],
    preCH: null, alertas: [], ...extra,
  };
}

export function curriculoFicticio(): Curriculo {
  return {
    id: 'teste', curso: 'Curso fictício', curriculo: 'x', fonte: 'x',
    integralizacao: {
      obrigatoriasHA: 400, optativasHA: 200, complementaresMaxHA: 54, estagioHA: 100,
      projetoIntegradorHA: 50, totalHA: 750, aulasSemanais: { min: 16, max: 30 }, semestres: { min: 10, max: 15 },
    },
    vagasOptativasPorFase: {},
    disciplinas: [
      disc('TST0001'),                                                    // sem pré-requisito
      disc('TST0002', [], { horasAula: 36, aulasSemanais: 2 }),
      disc('TST0003', [['TST0001']], { fase: 2 }),                        // um pré-requisito
      disc('TST0004', [['TST0001', 'TST0002']], { fase: 2 }),             // E
      disc('TST0005', [['TST0003'], ['TST0004']], { fase: 3 }),           // OU, ambos no currículo
      disc('TST0006', [['OLD1001'], ['TST0003']], { fase: 3 }),           // OU com código externo
      disc('TST0007', [['TST0005']], { fase: 4 }),
      disc('TST0008', [['TST0001', 'TST0007']], { fase: 5 }),             // TST0001 é direto e indireto
      disc('TST0009', [], { fase: 2, equivalentes: [['OLD2001'], ['OLD2002', 'OLD2003']] }),
      disc('TST0010', [], { fase: 2, equivalentes: [['TST0009']] }),      // equivalência de equivalência
      disc('TST0011', [['TST0009']], { fase: 3 }),
      disc('TST0012', [['TST0010']], { fase: 3 }),
      disc('TST0020', [], { tipo: 'optativa', grupo: 'optativas', fase: null, horasAula: 72, aulasSemanais: 4 }),
      disc('TST0021', [['TST0001']], { tipo: 'optativa', grupo: 'optativas', fase: null }),
      disc('TST0022', [], { tipo: 'optativa', grupo: 'atividades-complementares', fase: null, horasAula: 108, aulasSemanais: 6 }),
      disc('TST0030', [['OLD3001'], ['OLD3002']], { fase: 6 }),           // nenhuma alternativa só do currículo
    ],
  };
}
