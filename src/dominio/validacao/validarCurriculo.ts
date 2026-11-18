import type { Curriculo, Disciplina, ExpressaoRequisito } from '../tipos';

export interface ResultadoValidacao {
  erros: string[];
  avisos: string[];
  /** Somas de horas-aula por categoria, para comparar com a integralização. */
  totais: { obrigatoriasHA: number; optativasHA: number; porFase: Record<number, number> };
}

const FORMATO_CODIGO = /^[A-Z]{3}\d{4}$/;

function codigosDe(expr: ExpressaoRequisito): string[] {
  return expr.flat();
}

function validarExpressao(
  d: Disciplina,
  campo: 'preRequisitos' | 'equivalentes',
  expr: unknown,
  erros: string[],
): expr is ExpressaoRequisito {
  const ok =
    Array.isArray(expr) &&
    expr.every((g) => Array.isArray(g) && g.length > 0 && g.every((c) => typeof c === 'string'));
  if (!ok) erros.push(`${d.codigo}: "${campo}" precisa ser uma lista de grupos não vazios de códigos.`);
  return ok;
}

/**
 * Valida a estrutura e a consistência de um currículo (regras em docs/modelo-de-dados.md).
 * Erros tornam o currículo inutilizável. Avisos são informativos (ex.: códigos de currículos antigos).
 */
export function validarCurriculo(c: Curriculo): ResultadoValidacao {
  const erros: string[] = [];
  const avisos: string[] = [];
  const porCodigo = new Map<string, Disciplina>();

  for (const d of c.disciplinas) {
    if (!FORMATO_CODIGO.test(d.codigo)) erros.push(`Código inválido: "${d.codigo}".`);
    if (porCodigo.has(d.codigo)) erros.push(`Código duplicado: ${d.codigo}.`);
    porCodigo.set(d.codigo, d);
  }

  for (const d of c.disciplinas) {
    if (!d.nome?.trim()) erros.push(`${d.codigo}: nome vazio.`);
    if (d.tipo !== 'obrigatoria' && d.tipo !== 'optativa') erros.push(`${d.codigo}: tipo inválido "${d.tipo}".`);
    if (d.tipo === 'obrigatoria' && (!Number.isInteger(d.fase) || d.fase! < 1 || d.fase! > 10))
      erros.push(`${d.codigo}: obrigatória precisa de fase entre 1 e 10.`);
    if (d.tipo === 'optativa' && d.fase !== null) erros.push(`${d.codigo}: optativa deve ter fase null.`);
    if (!(d.horasAula > 0)) erros.push(`${d.codigo}: horasAula deve ser positiva.`);
    if (!(d.aulasSemanais > 0)) erros.push(`${d.codigo}: aulasSemanais deve ser positiva.`);

    if (validarExpressao(d, 'preRequisitos', d.preRequisitos, erros)) {
      for (const cod of codigosDe(d.preRequisitos)) {
        if (cod === d.codigo) erros.push(`${d.codigo}: é pré-requisito de si mesma.`);
        else if (!porCodigo.has(cod)) avisos.push(`${d.codigo}: pré-requisito ${cod} não pertence a este currículo (código externo).`);
      }
    }
    validarExpressao(d, 'equivalentes', d.equivalentes, erros);
    // O motor de regras ainda não suporta correquisitos nem Pré CH (vazios no PDF 2020.1).
    // Rejeitar em vez de ignorar em silêncio. Ver docs/regras-de-negocio.md, seção 9.
    if ((d.conjunto ?? []).length > 0) erros.push(`${d.codigo}: "conjunto" (correquisitos) ainda não é suportado pelo motor.`);
    if (d.preCH !== null && d.preCH !== undefined) erros.push(`${d.codigo}: "preCH" ainda não é suportado pelo motor.`);
    for (const a of d.alertas ?? []) avisos.push(`${d.codigo}: ${a}`);
  }

  // Ciclos: um ciclo entre disciplinas do currículo (por qualquer alternativa) torna as regras impossíveis.
  const estado = new Map<string, 'visitando' | 'feito'>();
  const ciclos = new Set<string>();
  const visitar = (cod: string, caminho: string[]): void => {
    const st = estado.get(cod);
    if (st === 'feito') return;
    if (st === 'visitando') {
      ciclos.add([...caminho.slice(caminho.indexOf(cod)), cod].join(' → '));
      return;
    }
    estado.set(cod, 'visitando');
    const d = porCodigo.get(cod);
    if (d && Array.isArray(d.preRequisitos)) {
      for (const pre of codigosDe(d.preRequisitos)) {
        if (pre !== cod && porCodigo.has(pre)) visitar(pre, [...caminho, cod]);
      }
    }
    estado.set(cod, 'feito');
  };
  for (const cod of porCodigo.keys()) visitar(cod, []);
  for (const ciclo of ciclos) erros.push(`Ciclo de pré-requisitos: ${ciclo}.`);

  const porFase: Record<number, number> = {};
  let obrigatoriasHA = 0;
  let optativasHA = 0;
  for (const d of c.disciplinas) {
    if (d.tipo === 'obrigatoria') {
      obrigatoriasHA += d.horasAula;
      porFase[d.fase!] = (porFase[d.fase!] ?? 0) + d.horasAula;
    } else optativasHA += d.horasAula;
  }

  return { erros, avisos, totais: { obrigatoriasHA, optativasHA, porFase } };
}
