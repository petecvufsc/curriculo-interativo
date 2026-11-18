import type { Motor } from '../../dominio/regras';
import type { Modo } from './useEstadoAluno';

export type TipoDestaque =
  | 'selecionada'
  | 'pre-direto'
  | 'pre-indireto'
  | 'tranca-direto'
  | 'tranca-indireto'
  | 'disponivel';

export const ROTULOS: Record<TipoDestaque, string> = {
  selecionada: 'Selecionada',
  'pre-direto': 'Pré-requisito direto',
  'pre-indireto': 'Pré-requisito indireto',
  'tranca-direto': 'Tranca diretamente',
  'tranca-indireto': 'Tranca indiretamente',
  disponivel: 'Disponível',
};

export interface Destaque {
  tipo: TipoDestaque;
  /** Relação que depende de uma alternativa (OU). */
  alternativa: boolean;
}

/** Mapa código → destaque visual, derivado do modo atual (nunca reimplementa regras: só consulta o motor). */
export function calcularDestaques(
  motor: Motor,
  modo: Modo,
  selecionada: string | null,
  aprovadas: ReadonlySet<string>,
): Map<string, Destaque> {
  const mapa = new Map<string, Destaque>();
  if (modo === 'relacoes' && selecionada) {
    for (const [c, r] of motor.preRequisitos(selecionada))
      mapa.set(c, { tipo: r.distancia === 1 ? 'pre-direto' : 'pre-indireto', alternativa: r.viaAlternativa });
    for (const [c, r] of motor.dependentes(selecionada))
      mapa.set(c, { tipo: r.distancia === 1 ? 'tranca-direto' : 'tranca-indireto', alternativa: r.viaAlternativa });
    mapa.set(selecionada, { tipo: 'selecionada', alternativa: false });
  } else if (modo === 'simulacao') {
    for (const d of motor.simular(aprovadas).disponiveis) mapa.set(d.codigo, { tipo: 'disponivel', alternativa: false });
  }
  return mapa;
}