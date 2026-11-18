import type { Disciplina } from '../../dominio/tipos';

/** "3 créditos", ou "não conta nos créditos" para o estágio (`foraDoLimiteDeAulas`). */
export function textoCreditos(d: Disciplina): string {
  return d.foraDoLimiteDeAulas ? 'não conta nos créditos' : `${d.aulasSemanais} créditos`;
}
