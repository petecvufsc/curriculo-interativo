// Paridade com o programa original (WinFormsApp2.dll). O oráculo (tradução LITERAL dos métodos
// descompilados) fica em ./paridade/oraculoOriginal.ts. Dados: ecv-programa-original.json (só E).
import { describe, expect, it } from 'vitest';
import { criarMotor } from './motor';
import {
  curriculoOriginal as curriculo,
  desmarcarOriginal,
  listumDe,
  marcarOriginal,
  preRequisitosOriginal,
  simulaOriginal,
  trancadasOriginal,
} from './paridade/oraculoOriginal';

const motor = criarMotor(curriculo);
const codigos = curriculo.disciplinas.map((d) => d.codigo);

// ---------------------------------------------------------------------------------------------
// Utilitários de teste
// ---------------------------------------------------------------------------------------------
/** PRNG determinístico (mulberry32). */
function mulberry32(semente: number) {
  let a = semente;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const ordenado = (s: Iterable<string>) => [...s].sort();

describe('paridade com o programa original (ecv-programa-original.json)', () => {
  it('o conjunto de dados é só E e sem equivalências (premissa da paridade)', () => {
    expect(curriculo.disciplinas.every((d) => d.preRequisitos.length <= 1 && d.equivalentes.length === 0)).toBe(true);
  });

  it('marcar de um conjunto vazio: motor = preRequisitosRecursivoCheckbox, para cada disciplina', () => {
    for (const c of codigos) {
      expect(ordenado(motor.marcar(new Set(), c))).toEqual(ordenado(marcarOriginal(new Set(), c)));
    }
  });

  it('desmarcar de todas marcadas: motor = cascata recursiva do CheckedChanged, para cada disciplina', () => {
    const todas = new Set(codigos);
    for (const c of codigos) {
      expect(ordenado(motor.desmarcar(todas, c))).toEqual(ordenado(desmarcarOriginal(todas, c)));
    }
  });

  it('desmarcar a partir de conjuntos consistentes aleatórios (fechados por pré-requisitos)', () => {
    const rnd = mulberry32(2024);
    for (let i = 0; i < 40; i++) {
      let base = new Set<string>();
      const n = 1 + Math.floor(rnd() * 8);
      for (let k = 0; k < n; k++) base = marcarOriginal(base, codigos[Math.floor(rnd() * codigos.length)]);
      for (const c of base) {
        expect(ordenado(motor.desmarcar(base, c))).toEqual(ordenado(desmarcarOriginal(base, c)));
      }
    }
  });

  it('destaque: conjunto de pré-requisitos e de dependentes iguais aos do original (sem direto/indireto)', () => {
    for (const c of codigos) {
      expect(ordenado(motor.preRequisitos(c).keys())).toEqual(ordenado(preRequisitosOriginal(c).keys()));
      expect(ordenado(motor.dependentes(c).keys())).toEqual(ordenado(trancadasOriginal(c).keys()));
    }
  });

  it('simular em 300 conjuntos pseudo-aleatórios: disponíveis e totais iguais aos do original', () => {
    const rnd = mulberry32(12345);
    for (let i = 0; i < 300; i++) {
      const p = 0.05 + rnd() * 0.9;
      const aprovadas = new Set(codigos.filter(() => rnd() < p));
      const esperado = simulaOriginal(aprovadas);
      const r = motor.simular(aprovadas);
      expect(r.disponiveis.map((d) => d.codigo)).toEqual(esperado.disponiveis);
      expect(r.totaisDisponiveis.obrigatorias).toEqual({ horasAula: esperado.obrig.h, aulasSemanais: esperado.obrig.creditos });
      expect(r.totaisDisponiveis.optativas).toEqual({ horasAula: esperado.opt.h, aulasSemanais: esperado.opt.creditos });
      expect(r.totaisCursadas).toEqual({ obrigatorias: esperado.cursObrig, optativas: esperado.cursOpt });
    }
  });

  it('simular: conjunto vazio e conjunto cheio', () => {
    for (const aprovadas of [new Set<string>(), new Set(codigos)]) {
      const esperado = simulaOriginal(aprovadas);
      expect(motor.simular(aprovadas).disponiveis.map((d) => d.codigo)).toEqual(esperado.disponiveis);
    }
  });
});

describe('CORREÇÃO documentada: menor distância vence (clique em ECV2601)', () => {
  it('original: ECV2401 aparece como indireto; motor: direto (distância 1)', () => {
    // ECV2601 exige ECV2401, ECV2505 e MTM3121, e ECV2505 também exige ECV2401. No laço do original,
    // ECV2401 é pintado como direto e depois repintado como indireto ao descer por ECV2505.
    expect(listumDe.get('ECV2601')!.pre).toContain('ECV2401');
    expect(listumDe.get('ECV2505')!.pre).toContain('ECV2401');
    expect(preRequisitosOriginal('ECV2601').get('ECV2401')).toBe('indireto');
    expect(motor.preRequisitos('ECV2601').get('ECV2401')).toEqual({ distancia: 1, viaAlternativa: false });
  });

  it('em todos os cliques, o motor só diverge do original promovendo indireto a direto', () => {
    const divergencias: string[] = [];
    for (const c of codigos) {
      const pre = motor.preRequisitos(c);
      for (const [alvo, cor] of preRequisitosOriginal(c)) {
        const direto = pre.get(alvo)!.distancia === 1;
        if (cor === 'direto') expect(direto).toBe(true);
        else if (direto) divergencias.push(`${c}>${alvo}`);
      }
    }
    expect(divergencias).toContain('ECV2601>ECV2401');
  });
});
