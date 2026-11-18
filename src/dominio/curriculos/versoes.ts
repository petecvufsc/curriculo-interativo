import type { Curriculo, Disciplina } from '../tipos';

/**
 * Versões de regras de pré-requisito do currículo 2020.1.
 *
 * Fonte (decisão D5, docs/ACOMPANHAMENTO.md): comunicado da Coordenação do Curso de Graduação em Engenharia Civil,
 * repassado pelo CALEC em 18/11/2026. Os pré-requisitos de quatro disciplinas mudam, e a entrada em vigor foi
 * adiada pelo NDE e pelo Colegiado de 2027.1 para **2028.1**. Até lá valem os pré-requisitos antigos.
 *
 * - `2020.1`: pré-requisitos vigentes até 2027.2.
 * - `2028.1`: pré-requisitos novos, a partir de 2028.1.
 *
 * Os dados em `ecv-2020-1.json` (transcritos do PDF) já trazem os pré-requisitos novos; a versão `2020.1`
 * troca os quatro pelos antigos. Pura: devolve um novo currículo e não altera o original.
 */
export type VersaoRegras = '2020.1' | '2028.1';

export const VERSOES_REGRAS: readonly VersaoRegras[] = ['2020.1', '2028.1'];

/** Versão padrão: a que vale hoje. */
export const VERSAO_REGRAS_PADRAO: VersaoRegras = '2020.1';

export function versaoRegrasValida(v: unknown): v is VersaoRegras {
  return v === '2020.1' || v === '2028.1';
}

export interface AlteracaoPreRequisitos {
  codigo: string;
  /** Vigente até 2027.2 ("Como é hoje" no comunicado). Lista de grupos E dentro de um OU; vazio = sem pré-requisito. */
  antes: string[][];
  /** Vigente a partir de 2028.1 ("A partir de 2027.1", depois adiado). */
  depois: string[][];
}

export const ALTERACOES_2028_1: readonly AlteracaoPreRequisitos[] = [
  { codigo: 'ECV2501', antes: [['INE5108']], depois: [['ECV2302', 'INE5108']] },
  { codigo: 'ECV2505', antes: [['ECV2401', 'ECV2404']], depois: [['ECV2401', 'ECV2404', 'MTM3131']] },
  { codigo: 'ECV2932', antes: [['ECV2405']], depois: [['ECV2603']] },
  {
    codigo: 'ECV2704',
    antes: [],
    depois: [['ECV2401', 'ECV2402', 'ECV2403', 'ECV2404', 'ECV2405', 'ENS5101', 'MTM3103']],
  },
];

/**
 * Primeiro dia em que a versão 2020.1 deixa de ser oferecida: dali em diante o app usa só a 2028.1.
 * Data aproximada, definida pelo PET ("novembro de 2027"): confirmar com a Coordenação. Para mudar, basta editar aqui.
 */
export const DATA_FIM_VERSAO_2020_1 = '2027-11-01';

/** Primeiro semestre letivo em que valem os novos pré-requisitos (decisão da Coordenação: adiado de 2027.1 para 2028.1). */
export const PRIMEIRO_SEMESTRE_2028_1 = '2028.1';

/**
 * Regras que valem num semestre letivo ("AAAA.1" ou "AAAA.2"): até 2027.2, as atuais (2020.1); de 2028.1 em diante,
 * as novas (2028.1). Serve ao planejamento, em que cada semestre usa as regras do seu próprio período.
 * Comparação de texto: com o formato AAAA.S a ordem alfabética é a ordem do tempo.
 */
export function versaoDoSemestre(nome: string | null): VersaoRegras {
  return nome !== null && nome >= PRIMEIRO_SEMESTRE_2028_1 ? '2028.1' : '2020.1';
}

/** Aviso mostrado enquanto a versão 2020.1 ainda existe. */
export const AVISO_FIM_VERSAO_2020_1 =
  'A partir de novembro de 2027, apenas a versão 2028.1 estará disponível neste site.';

/** Aviso mostrado depois da data de corte. */
export const AVISO_VERSAO_UNICA =
  'A versão 2020.1 foi encerrada em novembro de 2027: valem os pré-requisitos da versão 2028.1.';

/** A versão 2020.1 ainda pode ser escolhida em `hojeIso` ("AAAA-MM-DD")? Comparação de texto ISO, sem fuso. */
export function versao2020Disponivel(hojeIso: string): boolean {
  return hojeIso < DATA_FIM_VERSAO_2020_1;
}

/** Versões que o aluno pode escolher em `hojeIso`. */
export function versoesDisponiveis(hojeIso: string): readonly VersaoRegras[] {
  return versao2020Disponivel(hojeIso) ? VERSOES_REGRAS : ['2028.1'];
}

/** Versão realmente aplicada: a escolhida, ou a 2028.1 se a 2020.1 já foi encerrada (mesmo que esteja salva). */
export function versaoEfetiva(escolhida: VersaoRegras, hojeIso: string): VersaoRegras {
  return versao2020Disponivel(hojeIso) ? escolhida : '2028.1';
}

export const DESCRICAO_VERSAO: Record<VersaoRegras, string> = {
  '2020.1': 'Currículo 2020.1 — pré-requisitos atuais (valem até 2027.2)',
  '2028.1': 'Currículo 2028.1 — novos pré-requisitos (valem a partir de 2028.1)',
};

/** Currículo com os pré-requisitos da versão escolhida. A versão 2028.1 é o próprio currículo transcrito. */
export function curriculoDaVersao(c: Curriculo, versao: VersaoRegras): Curriculo {
  if (versao === '2028.1') return c;
  const antes = new Map(ALTERACOES_2028_1.map((a) => [a.codigo, a.antes]));
  return {
    ...c,
    disciplinas: c.disciplinas.map((d): Disciplina => {
      const pre = antes.get(d.codigo);
      return pre ? { ...d, preRequisitos: pre.map((g) => [...g]) } : d;
    }),
  };
}
