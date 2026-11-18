// Currículo usado pelo app (ecv-2020-1.json) e os motores indexados, um por versão das regras de pré-requisito.
import json from '../../dominio/curriculos/ecv-2020-1.json';
import { curriculoParaAluno } from '../../dominio/curriculos/paraAluno';
import {
  VERSAO_REGRAS_PADRAO,
  VERSOES_REGRAS,
  curriculoDaVersao,
  versaoDoSemestre,
  versaoEfetiva,
  type VersaoRegras,
} from '../../dominio/curriculos/versoes';
import { proximoSemestreSugerido, rotuloSemestre } from '../../dominio/planejamento';
import { criarMotor, type Motor } from '../../dominio/regras';
import type { Curriculo, Disciplina } from '../../dominio/tipos';

/** Sem as disciplinas de inscrição exclusiva da coordenação (intercâmbio): o aluno não as planeja. */
export const curriculo = curriculoParaAluno(json as unknown as Curriculo);

/** Um motor por versão (2020.1 = pré-requisitos atuais; 2028.1 = novos). As disciplinas são as mesmas nas duas. */
const motores = Object.fromEntries(VERSOES_REGRAS.map((v) => [v, criarMotor(curriculoDaVersao(curriculo, v))])) as Record<
  VersaoRegras,
  Motor
>;

export function motorDe(versao: VersaoRegras): Motor {
  return motores[versao];
}

/** Primeiro semestre do plano: o escolhido ou, se ainda não houver, o próximo semestre do calendário ("2027.1"). */
export const inicioDoPlano = (escolhido: string | null): string => escolhido ?? proximoSemestreSugerido(new Date());

/** Motor de cada semestre `k` (a partir de 1) de um plano que começa em `inicio`: as regras do período do semestre. */
export const motorDoSemestreDe = (inicio: string) => (k: number): Motor =>
  motorDe(versaoDoSemestre(rotuloSemestre(inicio, k)));

/** Data de hoje no fuso do aparelho, "AAAA-MM-DD" (a versão 2020.1 tem data de encerramento). */
export const hojeIso = (): string => new Date().toLocaleDateString('sv-SE');

/** Versão aplicada ao registro hoje: a escolhida, ou 2028.1 depois do encerramento da 2020.1. */
export const versaoDoRegistro = (versaoEscolhida: VersaoRegras): VersaoRegras => versaoEfetiva(versaoEscolhida, hojeIso());

/** Motor da versão padrão (2020.1). O app usa `motorDe(registro.opcoes.versaoRegras)`; este serve aos testes. */
export const motor = motorDe(VERSAO_REGRAS_PADRAO);

export const porCodigo =new Map<string, Disciplina>(curriculo.disciplinas.map((d) => [d.codigo, d]));

export const fases = Array.from({ length: 10 }, (_, i) => ({
  fase: i + 1,
  disciplinas: curriculo.disciplinas.filter((d) => d.tipo === 'obrigatoria' && d.fase === i + 1),
}));

export const optativas = curriculo.disciplinas.filter((d) => d.tipo === 'optativa');

export function rotuloCodigo(codigo: string): string {
  const d = porCodigo.get(codigo);
  return d ? `${codigo} — ${d.nome}` : `${codigo} (currículo anterior)`;
}
