// Grafo de dependências para visualização (regras-de-negocio.md §5, original R1).
import type { CodigoDisciplina } from '../tipos';
import type { Aresta, Indice } from './indice';
import type { RelacaoGrafo } from './tiposMotor';

/**
 * Busca em largura a partir de `inicio`. A menor distância vence (§5, correção do original).
 *
 * Escolha sobre `viaAlternativa` em relações indiretas: o BFS guarda a bandeira do PRIMEIRO caminho
 * mais curto encontrado (ordem determinística: ordem das alternativas / do currículo). A bandeira do
 * nó é a do pai que o descobriu OU a da aresta usada. Não consideramos os demais caminhos de mesmo
 * comprimento (simplificação documentada).
 */
function largura(
  inicio: CodigoDisciplina,
  vizinhos: ReadonlyMap<CodigoDisciplina, readonly Aresta[]>,
): Map<CodigoDisciplina, RelacaoGrafo> {
  const resultado = new Map<CodigoDisciplina, RelacaoGrafo>();
  const visitados = new Set<CodigoDisciplina>([inicio]);
  let fronteira: Array<{ codigo: CodigoDisciplina; via: boolean }> = [{ codigo: inicio, via: false }];
  let distancia = 0;
  while (fronteira.length > 0) {
    distancia++;
    const proxima: typeof fronteira = [];
    for (const no of fronteira) {
      for (const aresta of vizinhos.get(no.codigo) ?? []) {
        if (visitados.has(aresta.codigo)) continue;
        visitados.add(aresta.codigo);
        const via = no.via || aresta.viaAlternativa;
        resultado.set(aresta.codigo, { distancia, viaAlternativa: via });
        proxima.push({ codigo: aresta.codigo, via });
      }
    }
    fronteira = proxima;
  }
  return resultado;
}

/** Pré-requisitos (diretos e indiretos) de `codigo`, por BFS nas arestas invertidas (§5). */
export function preRequisitos(indice: Indice, codigo: CodigoDisciplina): Map<CodigoDisciplina, RelacaoGrafo> {
  return largura(codigo, indice.preDiretos);
}

/** Disciplinas que `codigo` tranca (diretas e indiretas), por BFS nas arestas (§5). */
export function dependentes(indice: Indice, codigo: CodigoDisciplina): Map<CodigoDisciplina, RelacaoGrafo> {
  return largura(codigo, indice.dependentesDiretos);
}
