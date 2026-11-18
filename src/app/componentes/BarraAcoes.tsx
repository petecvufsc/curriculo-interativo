import type { EstadoAluno } from '../estado/useEstadoAluno';
import { formatarPercentual } from '../estado/formato';
import { porCodigo } from '../estado/motorEcv';

/**
 * Barra fixa no rodapé, só na aba Grade e em telas estreitas (< 1620 px; ver CSS). Nelas o painel fica abaixo da
 * grade, a milhares de pixels de distância; a barra mantém "Simular" e o acesso aos detalhes à mão.
 */
export function BarraAcoes({ e }: { e: EstadoAluno }) {
  const nome = e.selecionada ? porCodigo.get(e.selecionada)?.nome : null;
  const pct = e.progresso.geral.percentual;
  return (
    <nav className="barra-acoes" aria-label="Ações rápidas">
      <button type="button" className="botao primario" onClick={() => e.dispatch({ tipo: 'simular' })}>
        Simular
      </button>
      {pct !== null && <span className="barra-resumo">{formatarPercentual(pct)}% integralizado</span>}
      <a className="botao barra-acoes-detalhes" href="#painel">
        {nome ? `Detalhes: ${nome}` : 'Resumo e detalhes'} ↓
      </a>
    </nav>
  );
}
