// Oráculo do programa original (WinFormsApp2.dll): tradução LITERAL dos métodos descompilados em
// docs/engenharia-reversa/logica_original_Form1.cs.txt, trabalhando sobre um conjunto de códigos
// "marcados" no lugar dos CheckBox. Usa só os dados do original (ecv-programa-original.json, só E).
// Serve aos testes de paridade e ao roteiro de validação (scripts/gerar-roteiro-validacao.ts).
// NÃO usar no app: reproduz inclusive os defeitos do original.
import type { Curriculo } from '../../tipos';
import original from '../../curriculos/ecv-programa-original.json';

export const curriculoOriginal = original as Curriculo;

/** `lista` = ordem de UmaDisciplina; `pre` = listaPreRequisitos. */
export const lista = curriculoOriginal.disciplinas.map((d) => ({ d, pre: d.preRequisitos.flat() }));
export const listumDe = new Map(lista.map((l) => [l.d.codigo, l]));

export interface SimulacaoOriginal {
  obrig: { h: number; creditos: number };
  opt: { h: number; creditos: number };
  cursObrig: number;
  cursOpt: number;
  disponiveis: string[];
}

/** simula(): laço de disponibilidade e somas (h = horasAula, créditos = aulasSemanais). */
export function simulaOriginal(marcados: ReadonlySet<string>): SimulacaoOriginal {
  const r: SimulacaoOriginal = { obrig: { h: 0, creditos: 0 }, opt: { h: 0, creditos: 0 }, cursObrig: 0, cursOpt: 0, disponiveis: [] };
  for (const listum of lista) {
    let num7 = listum.pre.length;
    for (const p of listum.pre) if (marcados.has(p)) num7--;
    const corSimula = num7 === 0 && !marcados.has(listum.d.codigo);
    const optativa = listum.d.tipo === 'optativa';
    if (corSimula) {
      r.disponiveis.push(listum.d.codigo);
      const alvo = optativa ? r.opt : r.obrig;
      alvo.h += listum.d.horasAula;
      alvo.creditos += listum.d.aulasSemanais;
    }
    if (marcados.has(listum.d.codigo)) {
      if (optativa) r.cursOpt += listum.d.horasAula;
      else r.cursObrig += listum.d.horasAula;
    }
  }
  return r;
}

/** chkDisciplina_Click (marcado): preRequisitosRecursivoCheckbox para cada pré-requisito direto. */
export function marcarOriginal(inicial: ReadonlySet<string>, codigo: string): Set<string> {
  const marcados = new Set(inicial);
  function recursivoCheckbox(c: string) {
    marcados.add(c);
    for (const listum of lista) {
      if (listum.d.codigo !== c) continue;
      for (const p of listum.pre) recursivoCheckbox(p);
    }
  }
  marcados.add(codigo); // o clique já marcou a caixa
  for (const p of listumDe.get(codigo)!.pre) recursivoCheckbox(p);
  return marcados;
}

/**
 * Desmarcar: o clique desmarca a caixa e dispara procuraTrancadasCheckbox, que faz
 * `chk.Checked = false` nos dependentes diretos. O evento ligado é CheckedChanged (confirmado nas 94
 * disciplinas no código descompilado): só reage quando o valor muda.
 */
export function desmarcarOriginal(inicial: ReadonlySet<string>, codigo: string): Set<string> {
  const marcados = new Set(inicial);
  function procuraTrancadasCheckbox(nome: string) {
    for (const listum of lista) {
      if (listum.pre.length === 0) continue;
      for (const p of listum.pre) if (p === nome) definirFalso(listum.d.codigo);
    }
  }
  function definirFalso(c: string) {
    if (!marcados.has(c)) return;
    marcados.delete(c);
    procuraTrancadasCheckbox(c);
  }
  definirFalso(codigo);
  return marcados;
}

/** chkNsemestre: marca cada disciplina da fase, na ordem da lista; cada uma dispara a cascata. */
export function marcarFaseOriginal(inicial: ReadonlySet<string>, fase: number): Set<string> {
  let marcados = new Set(inicial);
  for (const l of lista) if (l.d.tipo === 'obrigatoria' && l.d.fase === fase) marcados = marcarOriginal(marcados, l.d.codigo);
  return marcados;
}

export type Cor = 'direto' | 'indireto';

/** lblDisciplina_Click: preRequisitosRecursivo com o campo global `aux`; a última escrita vence. */
export function preRequisitosOriginal(codigo: string): Map<string, Cor> {
  const cor = new Map<string, Cor>();
  let aux = 0;
  function preRequisitosRecursivo(c: string) {
    cor.set(c, aux === 0 ? 'direto' : 'indireto');
    for (const listum of lista) {
      if (listum.d.codigo !== c) continue;
      aux = 1;
      for (const p of listum.pre) preRequisitosRecursivo(p);
    }
  }
  for (const p of listumDe.get(codigo)!.pre) {
    aux = 0;
    preRequisitosRecursivo(p);
  }
  return cor;
}

/** MarcaTrancadas -> procuraTrancadas(nome, 0). 0 = trancada direta; 1 = trancada recursiva. */
export function trancadasOriginal(codigo: string): Map<string, Cor> {
  const cor = new Map<string, Cor>();
  function procuraTrancadas(nome: string, aux: number) {
    for (const listum of lista) {
      if (listum.pre.length === 0) continue;
      for (const p of listum.pre) {
        if (p !== nome) continue;
        cor.set(listum.d.codigo, aux === 0 ? 'direto' : 'indireto');
        procuraTrancadas(listum.d.codigo, 1);
      }
    }
  }
  procuraTrancadas(codigo, 0);
  return cor;
}
