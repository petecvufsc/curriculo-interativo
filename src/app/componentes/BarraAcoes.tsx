import type { EstadoAluno } from '../estado/useEstadoAluno';
import { formatarPercentual } from '../estado/formato';
import { porCodigo } from '../estado/motorEcv';

/**
 * Barra de ações rápidas, em telas abaixo de 1620 px (ver CSS), onde o painel vira gaveta. Do notebook ao tablet
 * (768 px ou mais) fica fixa no topo; no celular, fixa embaixo. O botão abre e fecha a gaveta do painel.
 */
export function BarraAcoes({ e, painelAberto, onAlternarPainel }: { e: EstadoAluno; painelAberto: boolean; onAlternarPainel: () => void }) {
  const nome = e.selecionada ? porCodigo.get(e.selecionada)?.nome : null;
  const pct = e.progresso.geral.percentual;
  return (
    <nav className="barra-acoes" aria-label="Ações rápidas">
      {e.aba === 'grade' && (
        <button type="button" className="botao primario" onClick={() => e.dispatch({ tipo: 'simular' })}>
          Simular
        </button>
      )}
      {pct !== null && <span className="barra-resumo">{formatarPercentual(pct)}% integralizado</span>}
      <button
        type="button"
        id="botao-painel"
        className="botao barra-acoes-detalhes"
        aria-expanded={painelAberto}
        aria-controls="painel"
        onClick={onAlternarPainel}
      >
        {nome ? `Detalhes: ${nome}` : 'Resumo e ações'}
      </button>
    </nav>
  );
}
