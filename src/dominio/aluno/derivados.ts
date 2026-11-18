// Conjuntos derivados do registro (docs/regras-de-negocio.md §1 e §10) e consulta ao currículo.
import type { Motor } from '../regras';
import type { Disciplina } from '../tipos';
import type { RegistroAluno } from './tipos';

/** Conjunto `aprovadas` do motor (§1): códigos com status `aprovada`, inclusive de outro currículo (§10). */
export function aprovadasDe(registro: RegistroAluno): Set<string> {
  const conjunto = new Set<string>();
  for (const [codigo, status] of Object.entries(registro.status)) {
    if (status === 'aprovada') conjunto.add(codigo);
  }
  return conjunto;
}

/**
 * Base da simulação e do planejamento (§10): `aprovadas`, mais as disciplinas `cursando` somente se
 * a opção "cursandoComoAprovada" estiver ligada. `reprovada` nunca entra.
 */
export function baseSimulacao(registro: RegistroAluno): Set<string> {
  const base = aprovadasDe(registro);
  if (registro.opcoes.cursandoComoAprovada) {
    for (const [codigo, status] of Object.entries(registro.status)) {
      if (status === 'cursando') base.add(codigo);
    }
  }
  return base;
}

const indices = new WeakMap<Motor, Map<string, Disciplina>>();

/** Disciplina do currículo do motor, ou `undefined` para código externo (§1). */
export function disciplinaDe(motor: Motor, codigo: string): Disciplina | undefined {
  let mapa = indices.get(motor);
  if (!mapa) {
    mapa = new Map(motor.curriculo.disciplinas.map((d) => [d.codigo, d]));
    indices.set(motor, mapa);
  }
  return mapa.get(codigo);
}

/** Indica se o código pertence ao currículo do motor (§1: o conjunto de aprovadas pode ter códigos externos). */
export function pertenceAoCurriculo(motor: Motor, codigo: string): boolean {
  return disciplinaDe(motor, codigo) !== undefined;
}
