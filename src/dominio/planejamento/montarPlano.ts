// Montagem automática do plano até o fim do curso (docs/regras-de-negocio.md §11).
import { baseSimulacao, type RegistroAluno } from '../aluno';
import { SEMESTRES_MAX_PLANO } from '../aluno/tipos';
import { motorEm, type MotorDoPlano } from './motorPorSemestre';
import { sugerirSemestre } from './sugerirSemestre';

export interface ResultadoMontagem {
  /** Semestres sugeridos, em ordem. Cada um é uma lista de códigos. */
  semestres: string[][];
  /** Todas as obrigatórias ficaram cobertas (cumpridas ou planejadas). */
  completo: boolean;
  /** Obrigatórias que o plano não cobre (vazio se `completo`). */
  faltantes: string[];
}

/** Limite de semestres do plano: a duração máxima do curso no PDF (15 semestres). */
export const LIMITE_SEMESTRES_PADRAO = SEMESTRES_MAX_PLANO;

/**
 * Monta, a partir do histórico, os semestres seguintes até cobrir todas as **obrigatórias** (§11,
 * heurística; nunca regra oficial). Em cada semestre usa a mesma sugestão do botão "Sugerir":
 * `registro.opcoes.disciplinasPorSemestre` disciplinas, as que mais liberam outras do curso, dentro de
 * `limiteAulas`. O que entra em um semestre conta como cumprido para os seguintes. Para quando as
 * obrigatórias acabam, quando nada mais cabe, ou ao atingir `limiteSemestres`.
 *
 * Ignora o plano atual do registro (o chamador decide se o substitui). Optativas não são escolhidas: a
 * decisão é do aluno. Não considera horários nem a oferta de turmas.
 */
export function montarPlano(
  motorDoPlano: MotorDoPlano,
  registro: RegistroAluno,
  limiteSemestres: number = LIMITE_SEMESTRES_PADRAO,
): ResultadoMontagem {
  // As disciplinas e o que conta como cumprido são os mesmos em todas as versões; só os pré-requisitos mudam por semestre.
  const motor = motorEm(motorDoPlano, 1);
  const obrigatorias = motor.curriculo.disciplinas.filter((d) => d.tipo === 'obrigatoria').map((d) => d.codigo);
  const base = baseSimulacao(registro);
  const semestres: string[][] = [];
  const faltam = () => obrigatorias.filter((c) => !motor.cumprida(c, base));

  while (semestres.length < limiteSemestres && faltam().length > 0) {
    const { limiteAulas, disciplinasPorSemestre } = registro.opcoes;
    const semestre = sugerirSemestre(motorEm(motorDoPlano, semestres.length + 1), base, limiteAulas, disciplinasPorSemestre);
    if (semestre.length === 0) break; // nada mais disponível ou cabível: evita laço infinito
    semestres.push(semestre);
    for (const c of semestre) base.add(c);
  }
  const faltantes = faltam();
  return { semestres, completo: faltantes.length === 0, faltantes };
}
