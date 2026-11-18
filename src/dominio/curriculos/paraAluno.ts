import type { Curriculo } from '../tipos';

/**
 * Currículo como o aluno o vê: sem as disciplinas de inscrição exclusiva da coordenação
 * (`somenteCoordenacao`), como o intercâmbio. Os dados continuam fiéis ao PDF; só o app as oculta.
 * Pura: devolve um novo currículo e não altera o original.
 */
export function curriculoParaAluno(c: Curriculo): Curriculo {
  const ocultas = new Set(c.disciplinas.filter((d) => d.somenteCoordenacao).map((d) => d.codigo));
  if (ocultas.size === 0) return c;
  return {
    ...c,
    disciplinas: c.disciplinas
      .filter((d) => !ocultas.has(d.codigo))
      // Nenhuma disciplina visível depende de uma oculta; se dependesse, o requisito ficaria como código externo.
      .map((d) => ({ ...d })),
  };
}
