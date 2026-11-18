// Plano pela grade oficial (fases do currículo, PDF 2020.1), a partir da fase em que o aluno está.
import { baseSimulacao, type RegistroAluno } from '../aluno';
import type { Motor } from '../regras';
import type { Disciplina } from '../tipos';
import { aulasNoLimite } from './aulasNoLimite';
import { LIMITE_SEMESTRES_PADRAO, type ResultadoMontagem } from './montarPlano';
import { motorEm, type MotorDoPlano } from './motorPorSemestre';

export interface ResultadoGradeOficial extends ResultadoMontagem {
  /** Fase em que o plano começa (a "fase atual" do aluno); null se não falta nenhuma obrigatória. */
  faseAtual: number | null;
}

const FASES = 10;

/**
 * Fase atual do aluno: a seguinte à mais alta que ele já cumpriu pelo menos pela metade (obrigatórias da fase).
 * Quem fez poucas disciplinas de uma fase não conta como tendo chegado nela; o que ficou para trás é "atrasada".
 * Sem nenhuma fase cumprida pela metade, é a 1ª. Heurística de apoio: o aluno vê o resultado e pode editar o plano.
 */
export function faseAtualDe(motor: Motor, aprovadas: ReadonlySet<string>): number {
  let melhor = 0;
  for (let f = 1; f <= FASES; f++) {
    const da = motor.curriculo.disciplinas.filter((d) => d.tipo === 'obrigatoria' && d.fase === f);
    if (da.length === 0) continue;
    const feitas = da.filter((d) => motor.cumprida(d.codigo, aprovadas)).length;
    if (feitas / da.length >= 0.5) melhor = f;
  }
  return Math.min(FASES, melhor + 1);
}

/**
 * Monta o plano **como a grade oficial**: cada semestre traz as obrigatórias pendentes de uma fase, na ordem das
 * fases, começando na fase atual. As disciplinas atrasadas (de fases anteriores à atual) entram junto com a fase atual.
 * Fases já cumpridas são puladas. Um grupo que passa do limite de créditos (`opcoes.limiteAulas`, o estágio não conta)
 * ou que depende de outra do mesmo grupo é dividido em mais de um semestre. Os pré-requisitos de cada semestre são os do
 * seu período (decisão D5). Optativas não são escolhidas. Não considera a oferta de turmas. Ignora o plano atual do
 * registro (o chamador decide se o substitui).
 */
export function montarGradeOficial(
  motorDoPlano: MotorDoPlano,
  registro: RegistroAluno,
  limiteSemestres: number = LIMITE_SEMESTRES_PADRAO,
): ResultadoGradeOficial {
  const motor = motorEm(motorDoPlano, 1);
  const base = baseSimulacao(registro);
  const pendentes = motor.curriculo.disciplinas.filter((d) => d.tipo === 'obrigatoria' && !motor.cumprida(d.codigo, base));
  if (pendentes.length === 0) return { semestres: [], completo: true, faltantes: [], faseAtual: null };

  const faseAtual = faseAtualDe(motor, base);
  const daFase = (f: number) => pendentes.filter((d) => d.fase === f);
  const atrasadas = pendentes.filter((d) => (d.fase ?? 0) < faseAtual).sort((a, b) => (a.fase ?? 0) - (b.fase ?? 0));

  const grupos: Disciplina[][] = [];
  for (let f = faseAtual; f <= FASES; f++) {
    const grupo = f === faseAtual ? [...atrasadas, ...daFase(f)] : daFase(f);
    if (grupo.length > 0) grupos.push(grupo);
  }

  const semestres: string[][] = [];
  const { limiteAulas } = registro.opcoes;
  for (const grupo of grupos) {
    let resta = grupo;
    while (resta.length > 0 && semestres.length < limiteSemestres) {
      const motorK = motorEm(motorDoPlano, semestres.length + 1);
      let soma = 0;
      let escolhidos: Disciplina[] = [];
      let ficam: Disciplina[] = [];
      for (const d of resta) {
        if (motorK.requisitosAtendidos(d.codigo, base) && soma + aulasNoLimite(d) <= limiteAulas) {
          escolhidos.push(d);
          soma += aulasNoLimite(d);
        } else ficam.push(d);
      }
      if (escolhidos.length === 0) {
        // Nada cabe ou falta um pré-requisito que o plano não cobre: coloca a primeira mesmo assim (o plano a marcará)
        escolhidos = [resta[0]];
        ficam = resta.slice(1);
      }
      semestres.push(escolhidos.map((d) => d.codigo));
      for (const d of escolhidos) base.add(d.codigo);
      resta = ficam;
    }
  }
  const faltantes = pendentes.filter((d) => !motor.cumprida(d.codigo, base)).map((d) => d.codigo);
  return { semestres, completo: faltantes.length === 0, faltantes, faseAtual };
}
