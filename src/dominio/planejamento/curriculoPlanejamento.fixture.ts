// Currículo FICTÍCIO (códigos PLN) para testar sugestão e limites de aulas do planejamento (§11).
//
// Grafo (P -> D):  PLN0001 -> PLN0010, PLN0011;  PLN0010 -> PLN0012;  PLN0002 -> PLN0013
// Dependentes (diretos + indiretos): PLN0001 = 3, PLN0002 = 1, demais = 0.
// Aulas: PLN0001 4, PLN0002 4, PLN0003 2, PLN0004 6, PLN0005 3, PLN0010/11/12/13 3, optativa PLN0090 2.
import type { Curriculo } from '../tipos';
import { disc } from '../regras/curriculoFicticio.fixture';

export function curriculoPlanejamento(): Curriculo {
  return {
    id: 'teste-plano', curso: 'Curso fictício', curriculo: 'x', fonte: 'x',
    integralizacao: {
      obrigatoriasHA: 400, optativasHA: 200, complementaresMaxHA: 54, estagioHA: 100,
      projetoIntegradorHA: 50, totalHA: 750, aulasSemanais: { min: 16, max: 30 }, semestres: { min: 10, max: 15 },
    },
    vagasOptativasPorFase: {},
    disciplinas: [
      disc('PLN0005', [], { aulasSemanais: 3 }),                       // fora de ordem de propósito
      disc('PLN0004', [], { aulasSemanais: 6 }),
      disc('PLN0003', [], { aulasSemanais: 2 }),
      disc('PLN0002', [], { aulasSemanais: 4 }),
      disc('PLN0001', [], { aulasSemanais: 4 }),
      disc('PLN0010', [['PLN0001']], { fase: 2 }),
      disc('PLN0011', [['PLN0001']], { fase: 2 }),
      disc('PLN0012', [['PLN0010']], { fase: 3 }),
      disc('PLN0013', [['PLN0002']], { fase: 2 }),
      disc('PLN0090', [], { tipo: 'optativa', grupo: 'optativas', fase: null, aulasSemanais: 2 }),
    ],
  };
}

/** Currículo com disciplinas de carga exata, para os limites 16 e 30 (§11). */
export function curriculoCargas(): Curriculo {
  const base = curriculoPlanejamento();
  return {
    ...base,
    disciplinas: [14, 15, 16, 30, 31].map((aulas) => disc(`CRG${aulas}`, [], { aulasSemanais: aulas })),
  };
}
