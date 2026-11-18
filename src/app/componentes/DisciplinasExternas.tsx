import { useState, type FormEvent } from 'react';
import { codigosExternos, erroCodigoExterno, normalizarCodigo } from '../estado/operacoesRegistro';
import type { EstadoAluno } from '../estado/useEstadoAluno';

/** Disciplinas aprovadas em outro currículo: satisfazem alternativas (OU) e equivalências por código. */
export function DisciplinasExternas({ e }: { e: EstadoAluno }) {
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const externas = codigosExternos(e.registro);

  const adicionar = (ev: FormEvent) => {
    ev.preventDefault();
    const codigo = normalizarCodigo(texto);
    const problema = erroCodigoExterno(codigo, e.registro);
    setErro(problema);
    if (problema) return;
    e.dispatch({ tipo: 'status', codigo, status: 'aprovada' });
    setTexto('');
  };

  return (
    <details className="externas">
      <summary>Disciplinas do currículo anterior{externas.length > 0 ? ` (${externas.length})` : ''}</summary>
      <p className="muted">
        Informe o código de disciplinas aprovadas no currículo anterior ou em outro curso. Elas valem como alternativas
        (&quot;ou&quot;) e equivalências.
      </p>
      <form className="externas-form" onSubmit={adicionar} noValidate>
        <label htmlFor="codigo-externo">Código (AAA9999)</label>
        <div className="externas-linha">
          <input
            id="codigo-externo"
            className="campo"
            value={texto}
            maxLength={12}
            autoComplete="off"
            aria-invalid={erro ? true : undefined}
            aria-describedby={erro ? 'erro-externo' : undefined}
            onChange={(ev) => setTexto(ev.target.value.toUpperCase())}
          />
          <button type="submit" className="botao">
            Adicionar
          </button>
        </div>
        {erro && (
          <p id="erro-externo" className="erro-campo" role="alert">
            {erro}
          </p>
        )}
      </form>
      {externas.length > 0 && (
        <ul className="externas-lista" aria-label="Disciplinas do currículo anterior adicionadas">
          {externas.map((c) => (
            <li key={c}>
              <span>{c}</span>
              <button
                type="button"
                className="botao pequeno"
                aria-label={`Remover ${c}`}
                onClick={() => e.dispatch({ tipo: 'status', codigo: c, status: 'nao-cursada' })}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}
