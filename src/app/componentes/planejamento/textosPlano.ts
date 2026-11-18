import type { AvisoSemestre, ProblemaItem } from '../../../dominio/planejamento';
import { linhasFaltantes } from '../../estado/textoFaltantes';

/** Linhas de texto de um problema (nunca só cor: o texto diz o que está errado). */
export function textosDoProblema(p: ProblemaItem): string[] {
  switch (p.tipo) {
    case 'requisito':
      return linhasFaltantes(p.faltantes);
    case 'ja-cumprida':
      return ['Já cumprida'];
    case 'repetida':
      return ['Repetida no plano'];
    case 'fora-do-curriculo':
      return ['Fora do currículo'];
  }
}

export function textoDoAviso(a: AvisoSemestre): string {
  return a.tipo === 'acima-maximo'
    ? `Acima do máximo de ${a.limite} créditos`
    : `Abaixo do mínimo de ${a.limite} créditos`;
}

export const ROTULO_SUGESTAO =
  'Sugestão automática: as disciplinas que mais liberam outras do curso, na quantidade que você definiu. Não verifica conflito de horário nem a oferta do semestre — confira no CAGR e com a coordenação.';
