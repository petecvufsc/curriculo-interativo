// API pública do motor de regras (docs/regras-de-negocio.md).
export { criarMotor } from './motor';
export { criarIndice } from './indice';
export type { Indice, Aresta } from './indice';
export { cumprida, requisitosAtendidos, situacao } from './cumprimento';
export { preRequisitos, dependentes } from './grafo';
export { marcar, desmarcar, marcarFase } from './cascata';
export { simular, progresso } from './simulacao';
export type {
  Aprovadas,
  Motor,
  ProgressoCategoria,
  RelacaoGrafo,
  ResultadoProgresso,
  ResultadoSimulacao,
  Situacao,
  TotaisHoras,
} from './tiposMotor';
