// Sugestão de semestre e disciplinas disponíveis (docs/regras-de-negocio.md §11).
import type { RegistroAluno } from '../aluno';
import type { Motor } from '../regras';
import { aulasNoLimite } from './aulasNoLimite';
import { baseDoSemestre } from './baseSemestre';
import { motorEm, type MotorDoPlano } from './motorPorSemestre';

/**
 * Impacto de uma disciplina (§11): quantas outras do currículo ela libera, direta ou indiretamente
 * (os dependentes do grafo, §5). Serve para priorizar o que mais "destranca" o curso.
 */
export function impactoDe(motor: Motor, codigo: string): number {
  return motor.dependentes(codigo).size;
}

/**
 * Sugestão de semestre (§11, heurística; nunca regra oficial). Percorre as obrigatórias `disponivel`
 * com `base` na ordem: **mais dependentes** (total, diretos e indiretos, §5); menor fase; código.
 * Adiciona cada uma enquanto houver menos de `quantidade` disciplinas e a soma de `aulasSemanais`
 * continuar <= `limiteAulas` (o estágio, `foraDoLimiteDeAulas`, não conta); a que não cabe nos créditos
 * é pulada e as seguintes continuam sendo tentadas. Optativas nunca são sugeridas. Não considera horários de turma (o currículo não os traz).
 */
export function sugerirSemestre(
  motor: Motor,
  base: ReadonlySet<string>,
  limiteAulas: number,
  quantidade: number = Infinity,
): string[] {
  const candidatas = motor
    .simular(base)
    .disponiveis.filter((d) => d.tipo === 'obrigatoria')
    .sort(
      (a, b) =>
        impactoDe(motor, b.codigo) - impactoDe(motor, a.codigo) ||
        (a.fase ?? Infinity) - (b.fase ?? Infinity) ||
        (a.codigo < b.codigo ? -1 : a.codigo > b.codigo ? 1 : 0),
    );
  const sugeridas: string[] = [];
  let soma = 0;
  for (const d of candidatas) {
    if (sugeridas.length >= quantidade) break;
    if (soma + aulasNoLimite(d) > limiteAulas) continue;
    soma += aulasNoLimite(d);
    sugeridas.push(d.codigo);
  }
  return sugeridas;
}

/**
 * Códigos que seriam válidos para adicionar ao semestre `k` (a partir de 1) do plano (§11): requisitos
 * atendidos com `base(k)`, não cumpridos em `base(k)` e ainda não planejados em nenhum semestre.
 * Inclui optativas. Ordem do currículo. Não altera o registro.
 */
export function disponiveisNoSemestre(motorDoPlano: MotorDoPlano, registro: RegistroAluno, k: number): string[] {
  const motor = motorEm(motorDoPlano, k);
  const planejadas = new Set(registro.plano.semestres.flatMap((s) => s.codigos));
  return motor
    .simular(baseDoSemestre(motor, registro, k))
    .disponiveis.map((d) => d.codigo)
    .filter((codigo) => !planejadas.has(codigo));
}
