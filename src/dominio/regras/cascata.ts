// Marcar e desmarcar com cascata (regras-de-negocio.md §6, original R2, R3 e R4). Funções puras.
import type { CodigoDisciplina } from '../tipos';
import type { Indice } from './indice';
import { requisitosAtendidos } from './cumprimento';
import type { Aprovadas } from './tiposMotor';

/**
 * Marca `codigo` (§6). Se os requisitos já estão atendidos, nada mais é adicionado; senão escolhe a
 * primeira alternativa formada só por códigos do currículo e marca cada código dela, recursivamente.
 * Sem alternativa assim, marca apenas `codigo`. Devolve um novo conjunto.
 */
export function marcar(indice: Indice, aprovadas: Aprovadas, codigo: CodigoDisciplina): Set<CodigoDisciplina> {
  const resultado = new Set(aprovadas);
  marcarEm(indice, resultado, codigo, new Set());
  return resultado;
}

/** `visitados` evita laço infinito em dados cíclicos (o validador já rejeita ciclos). */
function marcarEm(
  indice: Indice,
  conjunto: Set<CodigoDisciplina>,
  codigo: CodigoDisciplina,
  visitados: Set<CodigoDisciplina>,
): void {
  conjunto.add(codigo);
  if (visitados.has(codigo)) return;
  visitados.add(codigo);
  const d = indice.porCodigo.get(codigo);
  if (!d || requisitosAtendidos(indice, codigo, conjunto)) return;
  const alternativa = d.preRequisitos.find((alt) => alt.every((c) => indice.porCodigo.has(c)));
  if (!alternativa) return;
  for (const p of alternativa) marcarEm(indice, conjunto, p, visitados);
}

/**
 * Desmarca `codigo` (§6) e repete até estabilizar: remove toda disciplina do currículo cujos
 * requisitos estavam atendidos e deixaram de estar. Códigos externos nunca são removidos.
 *
 * AMBIGUIDADE: "cujos requisitos deixaram de ser atendidos" pode ser lido como (A) remover qualquer
 * disciplina com requisitos não atendidos, ou (B) só as que estavam atendidas antes e quebraram.
 * Leitura conservadora adotada: (B). Assim uma disciplina marcada sem cascata (quebra de
 * pré-requisito, §9) não é apagada por desmarcar outra disciplina sem relação. Em conjuntos
 * consistentes (A) e (B) coincidem, e (B) também reproduz a cascata do original (R3), que só desce
 * pelos dependentes diretos e para em intermediários desmarcados.
 */
export function desmarcar(indice: Indice, aprovadas: Aprovadas, codigo: CodigoDisciplina): Set<CodigoDisciplina> {
  const resultado = new Set(aprovadas);
  resultado.delete(codigo);
  const removiveis = [...resultado].filter(
    (c) => indice.porCodigo.has(c) && requisitosAtendidos(indice, c, aprovadas),
  );
  let mudou = true;
  while (mudou) {
    mudou = false;
    for (const c of removiveis) {
      if (resultado.has(c) && !requisitosAtendidos(indice, c, resultado)) {
        resultado.delete(c);
        mudou = true;
      }
    }
  }
  return resultado;
}

/** Aplica `marcar` ou `desmarcar` a todas as obrigatórias da fase (§6, original R4). */
export function marcarFase(
  indice: Indice,
  aprovadas: Aprovadas,
  fase: number,
  valor: boolean,
): Set<CodigoDisciplina> {
  let atual: Set<CodigoDisciplina> = new Set(aprovadas);
  for (const d of indice.curriculo.disciplinas) {
    if (d.tipo !== 'obrigatoria' || d.fase !== fase) continue;
    atual = valor ? marcar(indice, atual, d.codigo) : desmarcar(indice, atual, d.codigo);
  }
  return atual;
}
