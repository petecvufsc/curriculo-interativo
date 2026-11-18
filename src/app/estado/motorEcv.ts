// Único currículo usado pelo app (ecv-2020-1.json) e o motor indexado para ele.
import json from '../../dominio/curriculos/ecv-2020-1.json';
import { curriculoParaAluno } from '../../dominio/curriculos/paraAluno';
import { criarMotor } from '../../dominio/regras';
import type { Curriculo, Disciplina } from '../../dominio/tipos';

/** Sem as disciplinas de inscrição exclusiva da coordenação (intercâmbio): o aluno não as planeja. */
export const curriculo = curriculoParaAluno(json as unknown as Curriculo);
export const motor = criarMotor(curriculo);

export const porCodigo = new Map<string, Disciplina>(curriculo.disciplinas.map((d) => [d.codigo, d]));

export const fases = Array.from({ length: 10 }, (_, i) => ({
  fase: i + 1,
  disciplinas: curriculo.disciplinas.filter((d) => d.tipo === 'obrigatoria' && d.fase === i + 1),
}));

export const optativas = curriculo.disciplinas.filter((d) => d.tipo === 'optativa');

export function rotuloCodigo(codigo: string): string {
  const d = porCodigo.get(codigo);
  return d ? `${codigo} — ${d.nome}` : `${codigo} (currículo anterior)`;
}
