import type { ChangeEvent } from 'react';
import { baixarRegistro, lerArquivoImportado } from '../estado/arquivo';
import type { EstadoAluno } from '../estado/useEstadoAluno';

/** Exportar/importar o registro (.json) e o aviso (dispensável) com o resultado da importação. */
export function ArquivoRegistro({ e }: { e: EstadoAluno }) {
  const { aviso, dispatch } = e;

  const importar = async (ev: ChangeEvent<HTMLInputElement>) => {
    const entrada = ev.target;
    const arquivo = entrada.files?.[0];
    if (!arquivo) return;
    const { registro, aviso: resultado } = await lerArquivoImportado(arquivo);
    dispatch({ tipo: 'importar', registro, aviso: resultado });
    entrada.value = ''; // permite escolher o mesmo arquivo de novo
  };

  return (
    <section aria-labelledby="titulo-arquivo" className="arquivo">
      <h2 id="titulo-arquivo">Salvar e levar seus dados</h2>
      <p className="muted">Os dados ficam só neste navegador. Exporte para levar a outro dispositivo.</p>
      <div className="botoes">
        <button type="button" className="botao" onClick={() => baixarRegistro(e.registro)}>
          Exportar (.json)
        </button>
        <label className="botao botao-arquivo">
          Importar
          <input type="file" className="oculto-visualmente" accept=".json,application/json" onChange={importar} />
        </label>
      </div>
      {aviso && (
        <div className={`aviso aviso-${aviso.tipo}`} role={aviso.tipo === 'erro' ? 'alert' : 'status'}>
          <p>
            <strong>{aviso.tipo === 'erro' ? 'Erro: ' : ''}{aviso.titulo}</strong>
          </p>
          {aviso.linhas.length > 0 && (
            <ul className="aviso-linhas">
              {aviso.linhas.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          )}
          <button type="button" className="botao pequeno" onClick={() => dispatch({ tipo: 'fecharAviso' })}>
            Fechar aviso
          </button>
        </div>
      )}
    </section>
  );
}
