// API pública do planejamento de semestres (docs/regras-de-negocio.md §11).
export { aulasNoLimite } from './aulasNoLimite';
export { avaliarPlano } from './avaliarPlano';
export { baseDoSemestre } from './baseSemestre';
export { faseAtualDe, montarGradeOficial } from './gradeOficial';
export type { ResultadoGradeOficial } from './gradeOficial';
export { LIMITE_SEMESTRES_PADRAO, montarPlano } from './montarPlano';
export type { ResultadoMontagem } from './montarPlano';
export { motorEm } from './motorPorSemestre';
export type { MotorDoPlano } from './motorPorSemestre';
export { opcoesDeInicio, proximoSemestreSugerido, rotuloSemestre, semestreValido, somarSemestres } from './rotuloSemestre';
export { disponiveisNoSemestre, impactoDe, sugerirSemestre } from './sugerirSemestre';
export type {
  AvaliacaoPlano,
  AvisoSemestre,
  ItemPlano,
  ProblemaItem,
  SemestreAvaliado,
} from './tipos';
