// Modelo do currículo. Formato documentado em docs/modelo-de-dados.md.

/** Código de disciplina da UFSC, ex.: "ECV2101". */
export type CodigoDisciplina = string;

/**
 * Expressão "OU de grupos E" (forma normal disjuntiva), igual à notação do PDF.
 * [] = sem requisito; [["A","B"],["C"]] = (A e B) ou C.
 */
export type ExpressaoRequisito = CodigoDisciplina[][];

export type TipoDisciplina = 'obrigatoria' | 'optativa';
export type GrupoDisciplina = 'fase' | 'optativas' | 'atividades-complementares';

export interface Disciplina {
  codigo: CodigoDisciplina;
  nome: string;
  tipo: TipoDisciplina;
  grupo: GrupoDisciplina;
  /** Fase recomendada (1..10) para obrigatórias; null para optativas. */
  fase: number | null;
  /** Coluna H/A do PDF. */
  horasAula: number;
  /** Coluna "Aulas" do PDF (no programa original, chamada de "créditos"). */
  aulasSemanais: number;
  preRequisitos: ExpressaoRequisito;
  equivalentes: ExpressaoRequisito;
  /** Disciplinas que devem ser cursadas em conjunto (correquisitos). */
  conjunto: CodigoDisciplina[];
  /** Carga horária mínima já cumprida exigida (coluna "Pré CH"), se houver. */
  preCH: number | null;
  /** Inconsistências conhecidas da fonte, em texto. */
  alertas: string[];
  /**
   * Disciplina cuja inscrição só a coordenação do curso pode fazer (ex.: intercâmbio). Continua nos dados
   * (fiel ao PDF), mas o app não a mostra nem a considera: o aluno não pode planejá-la.
   */
  somenteCoordenacao?: boolean;
  /**
   * As aulas semanais desta disciplina não entram no limite de créditos do semestre (16 a 30). É o caso do
   * estágio: o PDF lhe atribui 30 aulas (equivalentes às 540 h-a), mas ele é feito fora da sala de aula e
   * convive com TCC II e optativas no mesmo semestre.
   */
  foraDoLimiteDeAulas?: boolean;
}

export interface Integralizacao {
  obrigatoriasHA: number;
  optativasHA: number;
  complementaresMaxHA: number;
  estagioHA: number;
  projetoIntegradorHA: number;
  totalHA: number;
  aulasSemanais: { min: number; max: number };
  semestres: { min: number; max: number };
}

export interface Curriculo {
  id: string;
  curso: string;
  curriculo: string;
  fonte: string;
  integralizacao: Integralizacao | null;
  vagasOptativasPorFase: Record<string, number>;
  disciplinas: Disciplina[];
}
