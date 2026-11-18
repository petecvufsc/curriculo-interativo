// Operações de status com cascata (docs/regras-de-negocio.md §10, que usa §6).
import type { Motor } from '../regras';
import { aprovadasDe, pertenceAoCurriculo } from './derivados';
import type { RegistroAluno, StatusEditavel } from './tipos';

/**
 * Define o status de uma disciplina e devolve um NOVO registro (§10). Não altera o plano nem as opções.
 *
 * - `aprovada`: aplica `motor.marcar` (§6). Pré-requisitos que faltam viram `aprovada`, sobrescrevendo
 *   `nao-cursada` e `reprovada`. Os que estão `cursando` NÃO são alterados.
 * - Sair de `aprovada` (para `nao-cursada`, `cursando` ou `reprovada`): aplica `motor.desmarcar` (§6);
 *   dependentes `aprovada` que perderam o requisito voltam a `nao-cursada` (entrada removida).
 * - `cursando` e `reprovada` a partir de outro status, e `nao-cursada`: alteram só este código.
 * - Código fora do currículo (§10): só `aprovada` ou `nao-cursada`; outro status lança `RangeError`.
 *
 * AMBIGUIDADE: §10 diz que `cursando` nunca é alterado automaticamente, mas também que `marcar` torna
 * aprovados "os pré-requisitos que faltam". Leitura conservadora: um pré-requisito `cursando` fica como
 * está (o aluno já declarou que está cursando). Só o código escolhido pelo aluno vira `aprovada`
 * mesmo que estivesse `cursando`.
 *
 * `atualizadoEm` (opcional) permite a quem chama carimbar a data sem que a função leia o relógio.
 */
export function definirStatus(
  motor: Motor,
  registro: RegistroAluno,
  codigo: string,
  status: StatusEditavel,
  atualizadoEm: string = registro.atualizadoEm,
): RegistroAluno {
  if (status !== 'aprovada' && status !== 'nao-cursada' && !pertenceAoCurriculo(motor, codigo)) {
    // AMBIGUIDADE: §10 não diz o que fazer na violação. Leitura conservadora: erro explícito.
    throw new RangeError(`Código fora do currículo (${codigo}) só pode ser "aprovada" ou removido.`);
  }
  const mapa = new Map(Object.entries(registro.status));
  const aprovadas = aprovadasDe(registro);

  if (status === 'aprovada') {
    for (const c of motor.marcar(aprovadas, codigo)) {
      if (aprovadas.has(c)) continue;
      if (c !== codigo && mapa.get(c) === 'cursando') continue; // AMBIGUIDADE: ver JSDoc
      mapa.set(c, 'aprovada');
    }
  } else {
    if (aprovadas.has(codigo)) {
      const depois = motor.desmarcar(aprovadas, codigo);
      for (const c of aprovadas) if (c !== codigo && !depois.has(c)) mapa.delete(c);
    }
    if (status === 'nao-cursada') mapa.delete(codigo);
    else mapa.set(codigo, status);
  }

  return {
    ...registro,
    atualizadoEm,
    status: Object.fromEntries(mapa),
    plano: { semestres: registro.plano.semestres.map((s) => ({ codigos: [...s.codigos] })) },
    opcoes: { ...registro.opcoes },
  };
}
