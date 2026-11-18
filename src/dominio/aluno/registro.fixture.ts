// Auxiliares de teste para o registro do aluno (currículo fictício, id "teste").
import { registroVazio, type RegistroAluno, type StatusDisciplina } from './tipos';

export interface ParcialRegistro {
  status?: Record<string, StatusDisciplina>;
  /** Cada item é um semestre (lista de códigos). */
  plano?: string[][];
  cursandoComoAprovada?: boolean;
  limiteAulas?: number;
  disciplinasPorSemestre?: number;
  semestreInicial?: string | null;
}

export const DATA_FIXA = '2026-01-01T00:00:00.000Z';

export function reg(p: ParcialRegistro = {}, curriculoId = 'teste'): RegistroAluno {
  const base = registroVazio(curriculoId, DATA_FIXA);
  return {
    ...base,
    status: { ...(p.status ?? {}) },
    plano: { semestres: (p.plano ?? []).map((codigos) => ({ codigos: [...codigos] })) },
    opcoes: {
      cursandoComoAprovada: p.cursandoComoAprovada ?? base.opcoes.cursandoComoAprovada,
      limiteAulas: p.limiteAulas ?? base.opcoes.limiteAulas,
      disciplinasPorSemestre: p.disciplinasPorSemestre ?? base.opcoes.disciplinasPorSemestre,
      semestreInicial: p.semestreInicial ?? base.opcoes.semestreInicial,
    },
  };
}

/** Congela o valor recursivamente: qualquer mutação em teste lança TypeError. */
export function congelar<T>(valor: T): T {
  if (typeof valor === 'object' && valor !== null && !Object.isFrozen(valor)) {
    Object.freeze(valor);
    for (const v of Object.values(valor)) congelar(v);
  }
  return valor;
}
