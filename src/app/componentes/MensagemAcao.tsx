import type { EstadoAluno } from '../estado/useEstadoAluno';

/**
 * Aviso curto depois de uma ação que mexeu em várias disciplinas (cascata) ou que o aluno não veria
 * acontecer. Fica visível enquanto se rola a grade (sticky) e oferece "Desfazer".
 */
export function MensagemAcao({ e }: { e: EstadoAluno }) {
  if (!e.mensagem) return null;
  return (
    <div className="mensagem-acao" role="status">
      <span>{e.mensagem.texto}</span>
      <span className="mensagem-acoes">
        <button type="button" className="botao pequeno" onClick={() => {
            e.dispatch({ tipo: 'desfazer' });
            // O botão some ao desfazer: leva o foco para a área principal, em vez de deixá-lo cair no <body> (teclado/leitor de tela)
            document.getElementById('conteudo')?.focus();
          }}
        >
          Desfazer
        </button>
        <button type="button" className="botao pequeno" onClick={() => e.dispatch({ tipo: 'fecharMensagem' })} aria-label="Dispensar aviso">
          ×
        </button>
      </span>
    </div>
  );
}
