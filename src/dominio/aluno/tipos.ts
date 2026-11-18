// Registro do aluno: status por disciplina, plano de semestres e opções (docs/regras-de-negocio.md §10 e §12).
import { VERSAO_REGRAS_PADRAO, type VersaoRegras } from '../curriculos/versoes';

/** Status armazenado no registro (§10). `nao-cursada` é o padrão e fica ausente do registro. */
export type StatusDisciplina = 'aprovada' | 'cursando' | 'reprovada';

/** Valor aceito por `definirStatus`: `nao-cursada` remove a entrada do registro (§10). */
export type StatusEditavel = StatusDisciplina | 'nao-cursada';

/** Valores válidos de status em um arquivo/registro salvo (§12). */
export const STATUS_VALIDOS: readonly StatusDisciplina[] = ['aprovada', 'cursando', 'reprovada'];

/** Valor do campo `formato` (§12). */
export const FORMATO_REGISTRO = 'curriculo-interativo-ecv';
/** Valor do campo `versao` (§12). */
export const VERSAO_REGISTRO = 1;
/** Chave do `localStorage` (§12). O acesso ao `localStorage` é da interface, não do domínio. */
export const CHAVE_LOCAL_STORAGE = 'curriculo-interativo-ecv:v1';
/** Limite padrão de aulas semanais por semestre sugerido (§11, PDF). */
export const LIMITE_AULAS_PADRAO = 30;
/** Quantidade padrão de disciplinas que o botão "Sugerir" escolhe por semestre (§11). */
export const DISCIPLINAS_POR_SEMESTRE_PADRAO = 5;
/** Duração máxima do curso no PDF (15 semestres): o plano não passa disso (também protege a página de arquivos absurdos). */
export const SEMESTRES_MAX_PLANO = 15;
/** Teto de disciplinas num mesmo semestre do plano (o limite de créditos já é bem menor; isto barra arquivos fabricados). */
export const CODIGOS_MAX_POR_SEMESTRE = 40;
/** Teto de disciplinas "de outro currículo" no histórico (código fora do currículo atual). */
export const CODIGOS_EXTERNOS_MAX = 500;
/** Formato de código de disciplina da UFSC: três letras e quatro dígitos (usado também para códigos de outro currículo). */
export const FORMATO_CODIGO_EXTERNO = /^[A-Z]{3}\d{4}$/;
/** Faixa aceita para a quantidade de disciplinas por semestre. */
export const DISCIPLINAS_POR_SEMESTRE_MIN = 1;
export const DISCIPLINAS_POR_SEMESTRE_MAX = 12;

/** Um semestre futuro do plano: lista de códigos (§11). */
export interface SemestrePlano {
  codigos: string[];
}

/** Opções do aluno (§10, §11). */
export interface OpcoesAluno {
  /** "Considerar disciplinas em andamento como aprovadas" (padrão: ligada). */
  cursandoComoAprovada: boolean;
  /** Limite de aulas semanais usado na sugestão de semestre (padrão 30). */
  limiteAulas: number;
  /** Quantas disciplinas o "Sugerir" escolhe por semestre (1 a 12; padrão 5). */
  disciplinasPorSemestre: number;
  /** Nome do primeiro semestre do plano, "AAAA.1" ou "AAAA.2" (ex.: "2027.1"); null = sem nome real. */
  semestreInicial: string | null;
  /** Versão das regras de pré-requisito: "2020.1" (atuais, padrão) ou "2028.1" (novos). Decisão D5. */
  versaoRegras: VersaoRegras;
}

/** Registro salvo / arquivo exportado (§12). */
export interface RegistroAluno {
  formato: typeof FORMATO_REGISTRO;
  versao: typeof VERSAO_REGISTRO;
  curriculoId: string;
  /** Data ISO 8601. */
  atualizadoEm: string;
  status: Record<string, StatusDisciplina>;
  plano: { semestres: SemestrePlano[] };
  opcoes: OpcoesAluno;
}

/** Opções padrão (§10: opção ligada; §11: limite 30). */
export function opcoesPadrao(): OpcoesAluno {
  return {
    cursandoComoAprovada: true,
    limiteAulas: LIMITE_AULAS_PADRAO,
    disciplinasPorSemestre: DISCIPLINAS_POR_SEMESTRE_PADRAO,
    semestreInicial: null,
    versaoRegras: VERSAO_REGRAS_PADRAO,
  };
}

/**
 * Registro vazio para um currículo (§12). `atualizadoEm` é injetável para manter a função
 * determinística nos testes; por padrão usa o instante atual.
 */
export function registroVazio(curriculoId: string, atualizadoEm: string = new Date().toISOString()): RegistroAluno {
  return {
    formato: FORMATO_REGISTRO,
    versao: VERSAO_REGISTRO,
    curriculoId,
    atualizadoEm,
    status: {},
    plano: { semestres: [] },
    opcoes: opcoesPadrao(),
  };
}
