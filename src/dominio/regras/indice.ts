// Índice pré-computado de um currículo: busca por código e grafo de dependências (ambos os sentidos).
import type { Curriculo, CodigoDisciplina, Disciplina } from '../tipos';

/** Aresta do grafo vista a partir de um vizinho. */
export interface Aresta {
  codigo: CodigoDisciplina;
  /** Ver `criarIndice`: regra do viaAlternativa. */
  viaAlternativa: boolean;
}

export interface Indice {
  curriculo: Curriculo;
  porCodigo: ReadonlyMap<CodigoDisciplina, Disciplina>;
  /** D -> pré-requisitos diretos de D que pertencem ao currículo (sem repetição). */
  preDiretos: ReadonlyMap<CodigoDisciplina, readonly Aresta[]>;
  /** P -> disciplinas que têm P como pré-requisito direto (grafo invertido, calculado uma única vez). */
  dependentesDiretos: ReadonlyMap<CodigoDisciplina, readonly Aresta[]>;
}

/**
 * Monta o índice. regras-de-negocio.md §5: para cada D e cada código P do currículo em qualquer
 * alternativa de D, existe a aresta P -> D; códigos externos não entram no grafo.
 *
 * `viaAlternativa` da aresta P -> D = P não está em todos os "ramos" de D. Ramos são as alternativas
 * formadas só por códigos do currículo; se não houver nenhuma, todas as alternativas. Assim, uma
 * alternativa com código antigo (ex.: MTM3120 = MTM3101 ou MTM3110) não faz MTM3110 parecer opcional
 * para quem está no currículo 2020.1.
 */
export function criarIndice(curriculo: Curriculo): Indice {
  const porCodigo = new Map<CodigoDisciplina, Disciplina>();
  for (const d of curriculo.disciplinas) porCodigo.set(d.codigo, d);

  const preDiretos = new Map<CodigoDisciplina, Aresta[]>();
  const dependentesDiretos = new Map<CodigoDisciplina, Aresta[]>();
  for (const codigo of porCodigo.keys()) dependentesDiretos.set(codigo, []);

  for (const d of curriculo.disciplinas) {
    const expr = d.preRequisitos;
    const puros = expr.filter((alt) => alt.every((c) => porCodigo.has(c)));
    const ramos = puros.length > 0 ? puros : expr;
    const vistos = new Set<CodigoDisciplina>();
    const arestas: Aresta[] = [];
    for (const alternativa of expr) {
      for (const p of alternativa) {
        if (!porCodigo.has(p) || vistos.has(p)) continue;
        vistos.add(p);
        arestas.push({ codigo: p, viaAlternativa: !ramos.every((a) => a.includes(p)) });
      }
    }
    preDiretos.set(d.codigo, arestas);
    for (const a of arestas) {
      dependentesDiretos.get(a.codigo)!.push({ codigo: d.codigo, viaAlternativa: a.viaAlternativa });
    }
  }
  return { curriculo, porCodigo, preDiretos, dependentesDiretos };
}
