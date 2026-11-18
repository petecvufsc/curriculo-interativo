import { describe, expect, it } from 'vitest';
import json from './ecv-2020-1.json';
import {
  ALTERACOES_2028_1,
  AVISO_FIM_VERSAO_2020_1,
  DATA_FIM_VERSAO_2020_1,
  PRIMEIRO_SEMESTRE_2028_1,
  VERSAO_REGRAS_PADRAO,
  VERSOES_REGRAS,
  curriculoDaVersao,
  versao2020Disponivel,
  versaoEfetiva,
  versaoRegrasValida,
  versaoDoSemestre,
  versoesDisponiveis,
} from './versoes';
import { registroVazio } from '../aluno';
import { avaliarPlano, disponiveisNoSemestre, montarPlano, rotuloSemestre } from '../planejamento';
import { criarMotor } from '../regras';
import type { Curriculo } from '../tipos';

// Fonte: comunicado da Coordenação (repassado pelo CALEC em 18/11/2026): pré-requisitos novos a partir de 2028.1.
const base = json as unknown as Curriculo;
const pre = (c: Curriculo, codigo: string) => c.disciplinas.find((d) => d.codigo === codigo)!.preRequisitos;
const ordenar = (g: string[][]) => g.map((x) => [...x].sort()).sort();
const v2020 = curriculoDaVersao(base, '2020.1');
const v2028 = curriculoDaVersao(base, '2028.1');
const motor2020 = criarMotor(v2020);
const motor2028 = criarMotor(v2028);
const set = (...c: string[]) => new Set(c);

describe('versões das regras de pré-requisito (decisão D5)', () => {
  it('a versão padrão é a vigente hoje (2020.1) e só existem duas', () => {
    expect(VERSAO_REGRAS_PADRAO).toBe('2020.1');
    expect(VERSOES_REGRAS).toEqual(['2020.1', '2028.1']);
    expect(versaoRegrasValida('2028.1')).toBe(true);
    expect(versaoRegrasValida('2027.1')).toBe(false);
    expect(versaoRegrasValida(null)).toBe(false);
  });

  it('os dados transcritos (2028.1) coincidem com a coluna "A partir de" do comunicado', () => {
    for (const a of ALTERACOES_2028_1) expect(ordenar(pre(v2028, a.codigo))).toEqual(ordenar(a.depois));
  });

  it('a versão 2020.1 traz os pré-requisitos "Como é hoje" do comunicado', () => {
    expect(pre(v2020, 'ECV2501')).toEqual([['INE5108']]);
    expect(pre(v2020, 'ECV2505')).toEqual([['ECV2401', 'ECV2404']]);
    expect(pre(v2020, 'ECV2932')).toEqual([['ECV2405']]);
    expect(pre(v2020, 'ECV2704')).toEqual([]);
  });

  it('só as quatro disciplinas mudam entre as versões', () => {
    const alteradas = new Set(ALTERACOES_2028_1.map((a) => a.codigo));
    expect(alteradas.size).toBe(4);
    for (const d of base.disciplinas) {
      if (alteradas.has(d.codigo)) continue;
      expect(pre(v2020, d.codigo)).toEqual(d.preRequisitos);
    }
  });

  it('não altera o currículo original', () => {
    const antes = JSON.stringify(base);
    curriculoDaVersao(base, '2020.1');
    expect(JSON.stringify(base)).toBe(antes);
    expect(pre(base, 'ECV2704')).toHaveLength(1);
  });

  it('ECV2704 (Expressão Oral e Escrita): livre em 2020.1; exige as sete da 4ª fase em 2028.1', () => {
    expect(motor2020.requisitosAtendidos('ECV2704', set())).toBe(true);
    expect(motor2028.requisitosAtendidos('ECV2704', set())).toBe(false);
    const sete = ['ECV2401', 'ECV2402', 'ECV2403', 'ECV2404', 'ECV2405', 'ENS5101', 'MTM3103'];
    expect(motor2028.requisitosAtendidos('ECV2704', set(...sete))).toBe(true);
    expect(motor2028.requisitosAtendidos('ECV2704', set(...sete.slice(1)))).toBe(false);
  });

  it('ECV2501 (Ações e Segurança): só INE5108 em 2020.1; INE5108 e ECV2302 em 2028.1', () => {
    expect(motor2020.requisitosAtendidos('ECV2501', set('INE5108'))).toBe(true);
    expect(motor2028.requisitosAtendidos('ECV2501', set('INE5108'))).toBe(false);
    expect(motor2028.requisitosAtendidos('ECV2501', set('INE5108', 'ECV2302'))).toBe(true);
  });

  it('ECV2505 (Mecânica dos Sólidos II): sem MTM3131 em 2020.1; com MTM3131 em 2028.1', () => {
    expect(motor2020.requisitosAtendidos('ECV2505', set('ECV2401', 'ECV2404'))).toBe(true);
    expect(motor2028.requisitosAtendidos('ECV2505', set('ECV2401', 'ECV2404'))).toBe(false);
    expect(motor2028.requisitosAtendidos('ECV2505', set('ECV2401', 'ECV2404', 'MTM3131'))).toBe(true);
  });

  it('ECV2932 (Planejamento de Transportes): ECV2405 em 2020.1; ECV2603 em 2028.1', () => {
    expect(motor2020.requisitosAtendidos('ECV2932', set('ECV2405'))).toBe(true);
    expect(motor2020.requisitosAtendidos('ECV2932', set('ECV2603'))).toBe(false);
    expect(motor2028.requisitosAtendidos('ECV2932', set('ECV2603'))).toBe(true);
    expect(motor2028.requisitosAtendidos('ECV2932', set('ECV2405'))).toBe(false);
  });

  it('a versão 2020.1 deixa de existir na data de corte (1º de novembro de 2027), sozinha', () => {
    expect(DATA_FIM_VERSAO_2020_1).toBe('2027-11-01');
    expect(versao2020Disponivel('2026-11-18')).toBe(true);
    expect(versao2020Disponivel('2027-10-31')).toBe(true);
    expect(versao2020Disponivel('2027-11-01')).toBe(false);
    expect(versao2020Disponivel('2028-03-01')).toBe(false);
    expect(versoesDisponiveis('2027-10-31')).toEqual(['2020.1', '2028.1']);
    expect(versoesDisponiveis('2027-11-01')).toEqual(['2028.1']);
  });

  it('depois do corte a versão efetiva é sempre 2028.1, mesmo que a 2020.1 esteja salva; antes, vale a escolhida', () => {
    expect(versaoEfetiva('2020.1', '2027-10-31')).toBe('2020.1');
    expect(versaoEfetiva('2028.1', '2027-10-31')).toBe('2028.1');
    expect(versaoEfetiva('2020.1', '2027-11-01')).toBe('2028.1');
    expect(versaoEfetiva('2028.1', '2030-01-01')).toBe('2028.1');
  });

  it('versaoDoSemestre: até 2027.2 as regras atuais; de 2028.1 em diante as novas', () => {
    expect(PRIMEIRO_SEMESTRE_2028_1).toBe('2028.1');
    for (const s of ['2026.2', '2027.1', '2027.2']) expect(versaoDoSemestre(s)).toBe('2020.1');
    for (const s of ['2028.1', '2028.2', '2030.1']) expect(versaoDoSemestre(s)).toBe('2028.1');
    expect(versaoDoSemestre(null)).toBe('2020.1');
  });

  it('o plano avalia cada semestre com as regras do seu período (ECV2704 em 2027.2 e em 2028.1)', () => {
    const porSemestre = (k: number) => (versaoDoSemestre(rotuloSemestre('2027.2', k)) === '2028.1' ? motor2028 : motor2020);
    const plano = (semestres: string[][]) => ({
      ...registroVazio('ecv-2020-1'),
      plano: { semestres: semestres.map((codigos) => ({ codigos })) },
    });
    const problemas = (r: ReturnType<typeof plano>) => avaliarPlano(porSemestre, r).semestres.flatMap((s) => s.itens.flatMap((i) => i.problemas));
    // 1º semestre do plano = 2027.2 (regras atuais): sem pré-requisito
    expect(problemas(plano([['ECV2704']]))).toEqual([]);
    // 2º semestre = 2028.1 (regras novas): exige as sete da 4ª fase
    expect(problemas(plano([[], ['ECV2704']]))).toEqual([expect.objectContaining({ tipo: 'requisito' })]);
    // Com um motor só (como era antes), o resultado não distinguiria os períodos
    expect(avaliarPlano(motor2020, plano([[], ['ECV2704']])).semestres[1].itens[0].problemas).toEqual([]);
  });

  it('disponiveisNoSemestre e montarPlano também escolhem as regras pelo semestre', () => {
    const porSemestre = (k: number) => (k >= 2 ? motor2028 : motor2020);
    const registro = registroVazio('ecv-2020-1');
    expect(disponiveisNoSemestre(porSemestre, registro, 1)).toContain('ECV2704');
    expect(disponiveisNoSemestre(porSemestre, registro, 2)).not.toContain('ECV2704');
    const r = montarPlano(porSemestre, registro);
    expect(r.completo).toBe(true);
    // Nenhuma disciplina do plano montado fica sem os pré-requisitos do semestre em que foi colocada
    const avaliado = avaliarPlano(porSemestre, { ...registro, plano: { semestres: r.semestres.map((codigos) => ({ codigos })) } });
    expect(avaliado.semestres.flatMap((s) => s.itens.flatMap((i) => i.problemas))).toEqual([]);
  });

  it('o aviso fala do fim da versão 2020.1', () => {
    expect(AVISO_FIM_VERSAO_2020_1).toMatch(/2028\.1/);
  });
});
