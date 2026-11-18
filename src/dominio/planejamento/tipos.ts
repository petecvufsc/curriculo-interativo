// Tipos do planejamento de semestres (docs/regras-de-negocio.md §11).
import type { ResultadoProgresso } from '../regras';

/** Problema (erro) de uma disciplina planejada (§11). */
export type ProblemaItem =
  /** Requisito não atendido com `base(k)`; `faltantes` = por alternativa, o que falta (§4). */
  | { tipo: 'requisito'; faltantes: string[][] }
  /** Já cumprida em `base(k)` (aprovada, em andamento com a opção ligada, equivalência ou planejada antes). */
  | { tipo: 'ja-cumprida' }
  /** Aparece mais de uma vez no plano (nesta ocorrência, que não é a primeira). */
  | { tipo: 'repetida' }
  /** Código que não pertence ao currículo. */
  | { tipo: 'fora-do-curriculo' };

export interface ItemPlano {
  codigo: string;
  problemas: ProblemaItem[];
}

/** Aviso (não bloqueante) de carga semanal, com o limite de `integralizacao.aulasSemanais` (§11). */
export interface AvisoSemestre {
  tipo: 'acima-maximo' | 'abaixo-minimo';
  limite: number;
}

export interface SemestreAvaliado {
  /** Posição do semestre no plano, a partir de 1 (o `k` do §11). */
  numero: number;
  itens: ItemPlano[];
  /** Soma de `aulasSemanais` das disciplinas do currículo no semestre. */
  totalAulas: number;
  /** Soma de `horasAula` das disciplinas do currículo no semestre. */
  totalHorasAula: number;
  avisos: AvisoSemestre[];
}

export interface AvaliacaoPlano {
  semestres: SemestreAvaliado[];
  /** `motor.progresso` com tudo o que está cumprido ou planejado (§11). */
  progressoProjetado: ResultadoProgresso;
}
