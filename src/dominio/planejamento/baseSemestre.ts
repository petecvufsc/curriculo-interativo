// Base de cada semestre do plano (docs/regras-de-negocio.md §11).
import { baseSimulacao, pertenceAoCurriculo, type RegistroAluno } from '../aluno';
import type { Motor } from '../regras';

/**
 * `base(k) = aprovadas ∪ (cursando, se a opção estiver ligada) ∪ disciplinas dos semestres 1..k-1 do plano`
 * (§11), com `k` a partir de 1. Códigos do plano fora do currículo são ignorados: não podem satisfazer
 * pré-requisitos nem equivalências. Devolve um conjunto novo.
 */
export function baseDoSemestre(motor: Motor, registro: RegistroAluno, k: number): Set<string> {
  const base = baseSimulacao(registro);
  for (const semestre of registro.plano.semestres.slice(0, Math.max(0, k - 1))) {
    for (const codigo of semestre.codigos) {
      if (pertenceAoCurriculo(motor, codigo)) base.add(codigo);
    }
  }
  return base;
}
