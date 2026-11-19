import type { EstadoAluno } from '../estado/useEstadoAluno';
import { formatarPercentual } from '../estado/formato';
import { SetasFases } from './SetasFases';

/** Ícone de painel lateral (decorativo). */
export function IconePainel() {
  return (
    <svg className="icone-painel" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M14 4v16" stroke="currentColor" strokeWidth="2" />
      <path d="M16.5 9h2M16.5 12h2M16.5 15h2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

interface Props {
  e: EstadoAluno;
  painelAberto: boolean;
  onAlternarPainel: () => void;
  /** Celular: a gaveta não abre sozinha ao escolher disciplina, então o botão avisa que o detalhe está lá. */
  avisarDetalhe: boolean;
  mostrarDica: boolean;
  onDispensarDica: () => void;
}

/**
 * Barra de ações rápidas, em telas abaixo de 1620 px (ver CSS), onde o painel vira gaveta. Do notebook ao tablet
 * (768 px ou mais) fica fixa no topo; no celular, fixa embaixo. O botão (verde, com ícone) abre e fecha a gaveta.
 * Em computador com mouse, de 1100 a 1619 px, o botão some (CSS) e quem abre a gaveta é a aba da borda direita:
 * um controle só por aparelho, para ninguém ver ou ouvir dois botões que fazem a mesma coisa.
 */
export function BarraAcoes({ e, painelAberto, onAlternarPainel, avisarDetalhe, mostrarDica, onDispensarDica }: Props) {
  const pct = e.progresso.geral.percentual;
  const rotulo = avisarDetalhe && e.selecionada ? 'Ver detalhe da disciplina' : 'Resumo e ações';
  return (
    <nav className="barra-acoes" aria-label="Ações rápidas">
      {/* Com a gaveta aberta o "Simular" dela basta: dois botões iguais lado a lado confundem */}
      {e.aba === 'grade' && !painelAberto && (
        <button type="button" className="botao primario" onClick={() => e.dispatch({ tipo: 'simular' })}>
          Simular
        </button>
      )}
      {e.aba === 'grade' && painelAberto && <SetasFases />}
      {pct !== null && (
        <span className="barra-resumo">
          {formatarPercentual(pct)}%<span className="barra-resumo-longo"> integralizado</span>
        </span>
      )}
      <button
        type="button"
        id="botao-painel"
        className="botao botao-painel barra-acoes-detalhes"
        aria-expanded={painelAberto}
        aria-controls="painel"
        onClick={onAlternarPainel}
      >
        <IconePainel />
        <span>{rotulo}</span>
      </button>
      {mostrarDica && (
        <div className="dica-painel" role="note">
          <p>
            Seu resumo, <strong>Exportar</strong>, <strong>Importar</strong> e o detalhe das disciplinas ficam em{' '}
            <strong>Resumo e ações</strong>.
          </p>
          <button type="button" className="botao pequeno" onClick={onDispensarDica}>
            Entendi
          </button>
        </div>
      )}
    </nav>
  );
}
