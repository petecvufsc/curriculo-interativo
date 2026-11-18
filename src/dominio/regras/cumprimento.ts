// Cumprimento, requisitos e situação (regras-de-negocio.md §2, §3 e §4).
import type { CodigoDisciplina } from '../tipos';
import type { Indice } from './indice';
import type { Aprovadas, Situacao } from './tiposMotor';

/**
 * Disciplina cumprida (regras-de-negocio.md §2): está em `aprovadas`, ou pertence ao currículo e
 * todos os códigos de alguma alternativa de `equivalentes` estão em `aprovadas`.
 * A equivalência vale em um único nível: as alternativas são conferidas só contra `aprovadas`,
 * nunca contra o resultado de `cumprida` de outra disciplina.
 */
export function cumprida(indice: Indice, codigo: CodigoDisciplina, aprovadas: Aprovadas): boolean {
  if (aprovadas.has(codigo)) return true;
  const d = indice.porCodigo.get(codigo);
  if (!d) return false;
  return d.equivalentes.some((grupo) => grupo.length > 0 && grupo.every((c) => aprovadas.has(c)));
}

function disciplinaOuErro(indice: Indice, codigo: CodigoDisciplina) {
  const d = indice.porCodigo.get(codigo);
  // AMBIGUIDADE: o spec não diz o que fazer com código fora do currículo em requisitosAtendidos/situacao.
  // Leitura conservadora: erro explícito, em vez de inventar uma situação.
  if (!d) throw new Error(`Disciplina fora do currículo: ${codigo}`);
  return d;
}

/**
 * Pré-requisitos atendidos (regras-de-negocio.md §3): expressão vazia é verdadeira; senão, alguma
 * alternativa com todos os códigos cumpridos (§2). Código externo só conta se estiver em `aprovadas`.
 */
export function requisitosAtendidos(indice: Indice, codigo: CodigoDisciplina, aprovadas: Aprovadas): boolean {
  const expr = disciplinaOuErro(indice, codigo).preRequisitos;
  if (expr.length === 0) return true;
  return expr.some((alt) => alt.every((c) => cumprida(indice, c, aprovadas)));
}

/**
 * Situação (regras-de-negocio.md §4). Para `bloqueada`, informa por alternativa o que ainda falta.
 * A fase não influencia a situação (§4, original R5).
 */
export function situacao(indice: Indice, codigo: CodigoDisciplina, aprovadas: Aprovadas): Situacao {
  const d = disciplinaOuErro(indice, codigo);
  if (cumprida(indice, codigo, aprovadas)) return { tipo: 'cumprida' };
  if (requisitosAtendidos(indice, codigo, aprovadas)) return { tipo: 'disponivel' };
  const faltantes = d.preRequisitos.map((alt) => alt.filter((c) => !cumprida(indice, c, aprovadas)));
  return { tipo: 'bloqueada', faltantes };
}
