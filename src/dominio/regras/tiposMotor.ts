// Tipos públicos do motor de regras. Semântica em docs/regras-de-negocio.md.
import type { CodigoDisciplina, Curriculo, Disciplina } from '../tipos';

/** Conjunto de códigos aprovados (regras-de-negocio.md §1). Pode conter códigos externos ao currículo. */
export type Aprovadas = ReadonlySet<CodigoDisciplina>;

/** Relação de uma disciplina com a consultada no grafo (regras-de-negocio.md §5). */
export interface RelacaoGrafo {
  /** 1 = direto; >= 2 = indireto. */
  distancia: number;
  /** true quando a relação depende de uma alternativa (OU) que não é comum a todas. */
  viaAlternativa: boolean;
}

/** Situação de uma disciplina (regras-de-negocio.md §4). */
export type Situacao =
  | { tipo: 'cumprida' }
  | { tipo: 'disponivel' }
  /** `faltantes`: para cada alternativa, os códigos ainda não cumpridos (na ordem da alternativa). */
  | { tipo: 'bloqueada'; faltantes: CodigoDisciplina[][] };

export interface TotaisHoras {
  horasAula: number;
  aulasSemanais: number;
}

/** Resultado de `simular` (regras-de-negocio.md §7). */
export interface ResultadoSimulacao {
  /** Disciplinas `disponivel`, na ordem do currículo. */
  disponiveis: Disciplina[];
  totaisDisponiveis: { obrigatorias: TotaisHoras; optativas: TotaisHoras };
  /** Soma de `horasAula` das disciplinas do currículo `cumprida`. */
  totaisCursadas: { obrigatorias: number; optativas: number };
}

export interface ProgressoCategoria {
  cumpridasHA: number;
  /** null quando o currículo não tem `integralizacao`. */
  totalHA: number | null;
}

/** Integralização do curso inteiro (regras-de-negocio.md §8). */
export interface ProgressoGeral {
  /** Obrigatórias cumpridas + optativas cumpridas, estas limitadas a `optativasHA` (o excesso não conta). */
  cumpridasHA: number;
  /** Total mínimo para integralização (PDF: 4518 h-a); null se o currículo não tem `integralizacao`. */
  totalHA: number | null;
  /** 0 a 100 (sem arredondar); null se não há `totalHA`. */
  percentual: number | null;
}

/** Resultado de `progresso` (regras-de-negocio.md §8). */
export interface ResultadoProgresso {
  obrigatorias: ProgressoCategoria;
  optativas: ProgressoCategoria;
  geral: ProgressoGeral;
}

/** Motor indexado para um currículo. Todas as operações são puras. */
export interface Motor {
  /** Currículo do motor (somente leitura; usado pelo aluno e pelo planejamento, §10 e §11). */
  readonly curriculo: Curriculo;
  cumprida(codigo: CodigoDisciplina, aprovadas: Aprovadas): boolean;
  requisitosAtendidos(codigo: CodigoDisciplina, aprovadas: Aprovadas): boolean;
  situacao(codigo: CodigoDisciplina, aprovadas: Aprovadas): Situacao;
  preRequisitos(codigo: CodigoDisciplina): Map<CodigoDisciplina, RelacaoGrafo>;
  dependentes(codigo: CodigoDisciplina): Map<CodigoDisciplina, RelacaoGrafo>;
  marcar(aprovadas: Aprovadas, codigo: CodigoDisciplina): Set<CodigoDisciplina>;
  desmarcar(aprovadas: Aprovadas, codigo: CodigoDisciplina): Set<CodigoDisciplina>;
  marcarFase(aprovadas: Aprovadas, fase: number, valor: boolean): Set<CodigoDisciplina>;
  simular(aprovadas: Aprovadas): ResultadoSimulacao;
  progresso(aprovadas: Aprovadas): ResultadoProgresso;
}
