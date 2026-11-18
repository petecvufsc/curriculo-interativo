// Texto do que falta para cursar uma disciplina, usado nos detalhes e no planejamento.
import { porCodigo } from './motorEcv';

const doCurriculo = (c: string) => porCodigo.has(c);

/** Nome para códigos do currículo; "MTM3101 (currículo anterior)" para os demais. */
export function nomeParaFaltante(c: string): string {
  return porCodigo.get(c)?.nome ?? `${c} (currículo anterior)`;
}

/**
 * Linhas "Falta: …" / "ou: …". As alternativas formadas só por disciplinas do currículo 2020.1 vêm
 * primeiro: para a maioria dos alunos, é o caminho que importa. As alternativas com códigos antigos
 * (alunos migrados) vêm depois, identificadas. A ordem relativa do PDF é mantida dentro de cada grupo.
 */
export function linhasFaltantes(faltantes: string[][]): string[] {
  const atuais = faltantes.filter((alt) => alt.every(doCurriculo));
  const antigas = faltantes.filter((alt) => !alt.every(doCurriculo));
  return [...atuais, ...antigas].map((alt, i) => `${i === 0 ? 'Falta' : 'ou'}: ${alt.map(nomeParaFaltante).join(' e ')}`);
}
