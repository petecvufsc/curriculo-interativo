import type { Disciplina } from '../tipos';

/**
 * Aulas semanais de `d` que entram no limite de créditos do semestre (§11). Zero para as disciplinas
 * marcadas `foraDoLimiteDeAulas` (o estágio), cujas 30 aulas do PDF não são carga de sala de aula.
 */
export function aulasNoLimite(d: Disciplina): number {
  return d.foraDoLimiteDeAulas ? 0 : d.aulasSemanais;
}
