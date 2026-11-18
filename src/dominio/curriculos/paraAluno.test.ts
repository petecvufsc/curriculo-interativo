import { describe, expect, it } from 'vitest';
import type { Curriculo, Disciplina } from '../tipos';
import oficial from './ecv-2020-1.json';
import { curriculoParaAluno } from './paraAluno';

const d = (codigo: string, extra: Partial<Disciplina> = {}): Disciplina => ({
  codigo, nome: `Exemplo ${codigo}`, tipo: 'optativa', grupo: 'optativas', fase: null, horasAula: 54, aulasSemanais: 3,
  preRequisitos: [], equivalentes: [], conjunto: [], preCH: null, alertas: [], ...extra,
});
const base = (disciplinas: Disciplina[]): Curriculo => ({
  id: 't', curso: 't', curriculo: 't', fonte: 't', integralizacao: null, vagasOptativasPorFase: {}, disciplinas,
});

describe('curriculoParaAluno', () => {
  it('remove só as disciplinas marcadas e não altera o original', () => {
    const c = base([d('TST0001'), d('TST0002', { somenteCoordenacao: true }), d('TST0003')]);
    const r = curriculoParaAluno(c);
    expect(r.disciplinas.map((x) => x.codigo)).toEqual(['TST0001', 'TST0003']);
    expect(c.disciplinas).toHaveLength(3);
  });

  it('sem disciplinas marcadas, devolve o mesmo currículo', () => {
    const c = base([d('TST0001')]);
    expect(curriculoParaAluno(c)).toBe(c);
  });

  it('currículo oficial: os quatro intercâmbios (ECV2971 a ECV2974) ficam fora; as demais optativas continuam', () => {
    const c = oficial as unknown as Curriculo;
    const codigos = new Set(curriculoParaAluno(c).disciplinas.map((x) => x.codigo));
    for (const cod of ['ECV2971', 'ECV2972', 'ECV2973', 'ECV2974']) expect(codigos.has(cod), cod).toBe(false);
    for (const cod of ['ECV2905', 'ECV2906', 'ECV2811', 'ECV2945']) expect(codigos.has(cod), cod).toBe(true);
    expect(c.disciplinas.length - codigos.size).toBe(4);
  });
});
