// Exportação do registro (docs/regras-de-negocio.md §12). Funções puras: sem acesso ao localStorage.
import { FORMATO_REGISTRO, VERSAO_REGISTRO, type RegistroAluno } from './tipos';

/**
 * Texto JSON (indentação de 2 espaços) do registro, para o `localStorage` e para o arquivo `.json` (§12).
 * A ordem dos campos segue o exemplo do §12.
 */
export function serializar(registro: RegistroAluno): string {
  return JSON.stringify(
    {
      formato: FORMATO_REGISTRO,
      versao: VERSAO_REGISTRO,
      curriculoId: registro.curriculoId,
      atualizadoEm: registro.atualizadoEm,
      status: registro.status,
      plano: { semestres: registro.plano.semestres.map((s) => ({ codigos: s.codigos })) },
      opcoes: {
        cursandoComoAprovada: registro.opcoes.cursandoComoAprovada,
        limiteAulas: registro.opcoes.limiteAulas,
      },
    },
    null,
    2,
  );
}
