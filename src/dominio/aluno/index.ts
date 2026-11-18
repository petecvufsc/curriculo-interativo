// API pública do registro do aluno (docs/regras-de-negocio.md §10 e §12).
export {
  CHAVE_LOCAL_STORAGE,
  DISCIPLINAS_POR_SEMESTRE_MAX,
  DISCIPLINAS_POR_SEMESTRE_MIN,
  DISCIPLINAS_POR_SEMESTRE_PADRAO,
  FORMATO_REGISTRO,
  LIMITE_AULAS_PADRAO,
  STATUS_VALIDOS,
  VERSAO_REGISTRO,
  opcoesPadrao,
  registroVazio,
} from './tipos';
export type { OpcoesAluno, RegistroAluno, SemestrePlano, StatusDisciplina, StatusEditavel } from './tipos';
export { aprovadasDe, baseSimulacao, disciplinaDe, pertenceAoCurriculo } from './derivados';
export { definirStatus } from './status';
export { serializar } from './serializacao';
export { carregar, importar } from './importacao';
export type { ResultadoImportacao } from './importacao';
