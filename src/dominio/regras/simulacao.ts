// Simulação e progresso de integralização (regras-de-negocio.md §7 e §8).
import type { Indice } from './indice';
import { cumprida, situacao } from './cumprimento';
import type { Aprovadas, ResultadoProgresso, ResultadoSimulacao } from './tiposMotor';

/**
 * Simulação (§7, original R5): disciplinas disponíveis e somas. As somas de disponíveis NÃO
 * representam um semestre viável (o limite de aulas semanais é do planejador).
 */
export function simular(indice: Indice, aprovadas: Aprovadas): ResultadoSimulacao {
  const resultado: ResultadoSimulacao = {
    disponiveis: [],
    totaisDisponiveis: {
      obrigatorias: { horasAula: 0, aulasSemanais: 0 },
      optativas: { horasAula: 0, aulasSemanais: 0 },
    },
    totaisCursadas: { obrigatorias: 0, optativas: 0 },
  };
  for (const d of indice.curriculo.disciplinas) {
    const chave = d.tipo === 'optativa' ? 'optativas' : 'obrigatorias';
    const s = situacao(indice, d.codigo, aprovadas);
    if (s.tipo === 'disponivel') {
      resultado.disponiveis.push(d);
      resultado.totaisDisponiveis[chave].horasAula += d.horasAula;
      resultado.totaisDisponiveis[chave].aulasSemanais += d.aulasSemanais;
    } else if (s.tipo === 'cumprida') {
      resultado.totaisCursadas[chave] += d.horasAula;
    }
  }
  return resultado;
}

/**
 * Progresso (§8, PDF p. 16). Obrigatórias: horas-aula cumpridas sobre obrigatoriasHA + estagioHA +
 * projetoIntegradorHA. Optativas: horas-aula cumpridas, com o grupo 'atividades-complementares'
 * (ECV2905) limitado a complementaresMaxHA, sobre optativasHA.
 * As regras de transição (alunos migrados) e de extensão não estão implementadas (§8).
 */
export function progresso(indice: Indice, aprovadas: Aprovadas): ResultadoProgresso {
  const integ = indice.curriculo.integralizacao;
  let obrigatorias = 0;
  let optativas = 0;
  let complementares = 0;
  for (const d of indice.curriculo.disciplinas) {
    if (!cumprida(indice, d.codigo, aprovadas)) continue;
    if (d.tipo === 'obrigatoria') obrigatorias += d.horasAula;
    else if (d.grupo === 'atividades-complementares') complementares += d.horasAula;
    else optativas += d.horasAula;
  }
  // AMBIGUIDADE: o spec não limita o total de optativas a optativasHA (só as complementares).
  // Mantido sem limite; a interface decide se trunca a barra de progresso.
  optativas += integ ? Math.min(complementares, integ.complementaresMaxHA) : complementares;
  // Geral (§8): as optativas além de `optativasHA` não contam; só o mínimo exigido integraliza o curso.
  const totalHA = integ ? integ.obrigatoriasHA + integ.estagioHA + integ.projetoIntegradorHA + integ.optativasHA : null;
  const cumpridasHA = obrigatorias + (integ ? Math.min(optativas, integ.optativasHA) : optativas);
  return {
    geral: { cumpridasHA, totalHA, percentual: totalHA ? Math.min(100, (cumpridasHA / totalHA) * 100) : null },
    obrigatorias: {
      cumpridasHA: obrigatorias,
      totalHA: integ ? integ.obrigatoriasHA + integ.estagioHA + integ.projetoIntegradorHA : null,
    },
    optativas: { cumpridasHA: optativas, totalHA: integ ? integ.optativasHA : null },
  };
}
