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
    entrada.value = ''; // permite escolher o mesmo arquivo de novo
    // Importar troca TUDO (histórico, plano e opções): pede confirmação quando já há dados no navegador
    const marcadas = Object.keys(e.registro.status).length;
    const semestres = e.registro.plano.semestres.length;
    if (registro && (marcadas > 0 || semestres > 0)) {
      const itens = [marcadas > 0 ? `${marcadas} disciplinas marcadas` : '', semestres > 0 ? `${semestres} semestres no plano` : ''].filter(Boolean).join(' e ');
      if (!window.confirm(`Importar vai SUBSTITUIR os dados deste navegador (${itens}) pelos do arquivo. Quer continuar? Dica: use "Exportar (.json)" antes para guardar os atuais.`)) {
        dispatch({ tipo: 'importar', registro: null, aviso: { tipo: 'sucesso', titulo: 'Importação cancelada.', linhas: ['Seus dados atuais foram mantidos.'] } });
        return;
      }
    }
    dispatch({ tipo: 'importar', registro, aviso: resultado });
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
