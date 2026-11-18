// API pública do planejamento de semestres (docs/regras-de-negocio.md §11).
export { aulasNoLimite } from './aulasNoLimite';
export { avaliarPlano } from './avaliarPlano';
export { baseDoSemestre } from './baseSemestre';
export { LIMITE_SEMESTRES_PADRAO, montarPlano } from './montarPlano';
export type { ResultadoMontagem } from './montarPlano';
export { proximoSemestreSugerido, rotuloSemestre, semestreValido } from './rotuloSemestre';
export { disponiveisNoSemestre, impactoDe, sugerirSemestre } from './sugerirSemestre';
export type {
  AvaliacaoPlano,
  AvisoSemestre,
  ItemPlano,
  ProblemaItem,
  SemestreAvaliado,
} from './tipos';
