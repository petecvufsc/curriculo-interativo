// Nome dos semestres do plano (docs/regras-de-negocio.md §11). A UFSC nomeia os semestres "AAAA.1" e "AAAA.2".

const FORMATO = /^(\d{4})\.([12])$/;

/** "2027.1" e "2027.2" são válidos; qualquer outra coisa, não. */
export function semestreValido(texto: string): boolean {
  return FORMATO.test(texto);
}

/**
 * Nome do semestre `k` (a partir de 1) de um plano que começa em `inicial`.
 * Ex.: inicial "2027.1": k=1 → "2027.1", k=2 → "2027.2", k=3 → "2028.1". Sem início válido, `null`.
 */
export function rotuloSemestre(inicial: string | null, k: number): string | null {
  const m = inicial ? FORMATO.exec(inicial) : null;
  if (!m || k < 1) return null;
  const indice = Number(m[1]) * 2 + (Number(m[2]) - 1) + (k - 1);
  return `${Math.floor(indice / 2)}.${(indice % 2) + 1}`;
}

/** Semestre `delta` semestres depois (ou antes, se negativo) de `nome`: somarSemestres("2027.2", 1) = "2028.1". Nome inválido: `null`. */
export function somarSemestres(nome: string, delta: number): string | null {
  const m = FORMATO.exec(nome);
  if (!m) return null;
  const indice = Number(m[1]) * 2 + (Number(m[2]) - 1) + delta;
  return `${Math.floor(indice / 2)}.${(indice % 2) + 1}`;
}

/**
 * Opções do "primeiro semestre do plano": do semestre anterior ao próximo sugerido até 8 depois (cerca de quatro
 * anos), em ordem. O valor já escolhido entra na lista mesmo que fique fora dessa faixa. O nome não é livre: só AAAA.1 e AAAA.2.
 */
export function opcoesDeInicio(hoje: Date, atual: string | null): string[] {
  const proximo = proximoSemestreSugerido(hoje);
  const lista = Array.from({ length: 10 }, (_, i) => somarSemestres(proximo, i - 1) as string);
  if (atual && semestreValido(atual) && !lista.includes(atual)) lista.push(atual);
  return lista.sort();
}

/**
 * Próximo semestre letivo a partir de uma data, para sugerir o início do plano: até junho o "próximo" é
 * o segundo semestre do ano; de julho em diante, o primeiro do ano seguinte. É só uma sugestão: o
 * calendário real da UFSC varia.
 */
export function proximoSemestreSugerido(hoje: Date): string {
  const ano = hoje.getFullYear();
  return hoje.getMonth() < 6 ? `${ano}.2` : `${ano + 1}.1`;
}
