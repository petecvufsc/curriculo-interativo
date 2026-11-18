// Importação validada do registro (docs/regras-de-negocio.md §12). Funções puras.
import type { Curriculo } from '../tipos';
import { semestreValido } from '../planejamento/rotuloSemestre';
import {
  DISCIPLINAS_POR_SEMESTRE_MAX,
  DISCIPLINAS_POR_SEMESTRE_MIN,
  DISCIPLINAS_POR_SEMESTRE_PADRAO,
  FORMATO_REGISTRO,
  LIMITE_AULAS_PADRAO,
  STATUS_VALIDOS,
  VERSAO_REGISTRO,
  registroVazio,
  type RegistroAluno,
  type SemestrePlano,
  type StatusDisciplina,
} from './tipos';

export type ResultadoImportacao =
  | { ok: true; registro: RegistroAluno; relatorio: string[] }
  | { ok: false; erro: string };

type Objeto = Record<string, unknown>;

const ehObjeto = (v: unknown): v is Objeto => typeof v === 'object' && v !== null && !Array.isArray(v);
const ehStatus = (v: unknown): v is StatusDisciplina => STATUS_VALIDOS.includes(v as StatusDisciplina);
const texto = (v: unknown) => JSON.stringify(v) ?? 'ausente';

/** Status (§12): entrada inválida é ignorada e listada; código desconhecido é aceito como de outro currículo. */
function lerStatus(bruto: unknown, codigos: Set<string>, rel: string[]): Record<string, StatusDisciplina> {
  if (bruto === undefined) rel.push('Campo "status" ausente: nenhum status importado.');
  else if (!ehObjeto(bruto)) rel.push('Campo "status" inválido (esperado um objeto): nenhum status importado.');
  if (!ehObjeto(bruto)) return {};
  const aceitos = new Map<string, StatusDisciplina>();
  for (const [codigo, valor] of Object.entries(bruto)) {
    if (!ehStatus(valor)) {
      rel.push(`Status inválido para ${codigo}: ${texto(valor)}. Entrada ignorada.`);
      continue;
    }
    if (!codigos.has(codigo)) {
      if (valor !== 'aprovada') {
        // AMBIGUIDADE: §12 aceita código desconhecido, mas §10 só permite "aprovada" para outro currículo.
        rel.push(`${codigo} não pertence ao currículo e só pode ser "aprovada" (recebido "${valor}"). Entrada ignorada.`);
        continue;
      }
      rel.push(`${codigo} não pertence ao currículo: aceito como disciplina aprovada de outro currículo.`);
    }
    aceitos.set(codigo, valor);
  }
  return Object.fromEntries(aceitos);
}

/** Plano (§12): código fora do currículo é removido do plano e listado. */
function lerPlano(bruto: unknown, codigos: Set<string>, rel: string[]): SemestrePlano[] {
  const semestres = ehObjeto(bruto) ? bruto.semestres : undefined;
  if (!Array.isArray(semestres)) {
    rel.push('Campo "plano.semestres" ausente ou inválido: plano vazio.');
    return [];
  }
  return semestres.map((s, i) => {
    const lista = ehObjeto(s) ? s.codigos : undefined;
    if (!Array.isArray(lista)) {
      rel.push(`Semestre ${i + 1} do plano malformado: tratado como vazio.`);
      return { codigos: [] };
    }
    const validos: string[] = [];
    for (const c of lista) {
      if (typeof c === 'string' && codigos.has(c)) validos.push(c);
      else rel.push(`Semestre ${i + 1}: ${texto(c)} não pertence ao currículo e foi removido do plano.`);
    }
    return { codigos: validos };
  });
}

/** Opções: valor ausente ou inválido volta ao padrão, com aviso no relatório. */
function lerOpcoes(bruto: unknown, rel: string[]): RegistroAluno['opcoes'] {
  const o: Objeto = ehObjeto(bruto) ? bruto : {};
  if (!ehObjeto(bruto)) rel.push('Campo "opcoes" ausente ou inválido: opções padrão.');
  let cursandoComoAprovada = true;
  if (typeof o.cursandoComoAprovada === 'boolean') cursandoComoAprovada = o.cursandoComoAprovada;
  else if (ehObjeto(bruto)) rel.push(`opcoes.cursandoComoAprovada inválido (${texto(o.cursandoComoAprovada)}): usado "true".`);
  let limiteAulas = LIMITE_AULAS_PADRAO;
  // AMBIGUIDADE: §12 não define a validade de limiteAulas; exigimos inteiro >= 1.
  if (Number.isInteger(o.limiteAulas) && (o.limiteAulas as number) >= 1) limiteAulas = o.limiteAulas as number;
  else if (ehObjeto(bruto)) rel.push(`opcoes.limiteAulas inválido (${texto(o.limiteAulas)}): usado ${LIMITE_AULAS_PADRAO}.`);
  // Campo novo (etapa 5): arquivos antigos não o têm, e isso não é erro (sem aviso); só valor inválido avisa.
  let disciplinasPorSemestre = DISCIPLINAS_POR_SEMESTRE_PADRAO;
  const d = o.disciplinasPorSemestre;
  if (d === undefined) {
    // padrão
  } else if (Number.isInteger(d) && (d as number) >= DISCIPLINAS_POR_SEMESTRE_MIN && (d as number) <= DISCIPLINAS_POR_SEMESTRE_MAX) {
    disciplinasPorSemestre = d as number;
  } else if (ehObjeto(bruto)) {
    rel.push(`opcoes.disciplinasPorSemestre inválido (${texto(d)}): usado ${DISCIPLINAS_POR_SEMESTRE_PADRAO}.`);
  }
  // Campo novo (etapa 5): ausente = sem nome real, sem aviso; presente e inválido = aviso.
  let semestreInicial: string | null = null;
  const s = o.semestreInicial;
  if (s === undefined || s === null) {
    // sem nome real
  } else if (typeof s === 'string' && semestreValido(s)) {
    semestreInicial = s;
  } else if (ehObjeto(bruto)) {
    rel.push(`opcoes.semestreInicial inválido (${texto(s)}): ignorado (use o formato AAAA.1 ou AAAA.2).`);
  }
  return { cursandoComoAprovada, limiteAulas, disciplinasPorSemestre, semestreInicial };
}

/**
 * Importa e valida um registro (§12), sem aplicar dados parcialmente inválidos sem avisar.
 * Rejeita (`ok: false`): JSON malformado, `formato` diferente, `versao` desconhecida, `curriculoId` diferente.
 * Demais problemas são tratados entrada a entrada e listados em `relatorio`.
 * `agora` só é usado se `atualizadoEm` estiver ausente/inválido (injetável para testes).
 */
export function importar(textoJson: string, curriculo: Curriculo, agora: string = new Date().toISOString()): ResultadoImportacao {
  let bruto: unknown;
  try {
    bruto = JSON.parse(textoJson);
  } catch {
    return { ok: false, erro: 'O arquivo não é um JSON válido.' };
  }
  if (!ehObjeto(bruto)) return { ok: false, erro: 'O arquivo não contém um registro do currículo interativo.' };
  if (bruto.formato !== FORMATO_REGISTRO) {
    return { ok: false, erro: `Formato desconhecido (${texto(bruto.formato)}); esperado "${FORMATO_REGISTRO}".` };
  }
  if (bruto.versao !== VERSAO_REGISTRO) {
    return { ok: false, erro: `Versão desconhecida (${texto(bruto.versao)}); só a versão ${VERSAO_REGISTRO} é suportada.` };
  }
  if (bruto.curriculoId !== curriculo.id) {
    return { ok: false, erro: `O arquivo é do currículo ${texto(bruto.curriculoId)}, não de "${curriculo.id}".` };
  }
  const relatorio: string[] = [];
  const codigos = new Set(curriculo.disciplinas.map((d) => d.codigo));
  let atualizadoEm = agora;
  if (typeof bruto.atualizadoEm === 'string' && bruto.atualizadoEm !== '') atualizadoEm = bruto.atualizadoEm;
  else relatorio.push('Campo "atualizadoEm" ausente ou inválido: usada a data da importação.');
  const registro: RegistroAluno = {
    ...registroVazio(curriculo.id, atualizadoEm),
    status: lerStatus(bruto.status, codigos, relatorio),
    plano: { semestres: lerPlano(bruto.plano, codigos, relatorio) },
    opcoes: lerOpcoes(bruto.opcoes, relatorio),
  };
  return { ok: true, registro, relatorio };
}

/**
 * Leitura tolerante para o texto do `localStorage` (§12): ausente ou rejeitado (qualquer motivo)
 * volta a `registroVazio`. Não acessa o `localStorage`; quem chama passa o texto lido.
 */
export function carregar(textoSalvo: string | null | undefined, curriculo: Curriculo, agora?: string): RegistroAluno {
  if (typeof textoSalvo !== 'string') return registroVazio(curriculo.id, agora);
  const resultado = importar(textoSalvo, curriculo, agora);
  return resultado.ok ? resultado.registro : registroVazio(curriculo.id, agora);
}
