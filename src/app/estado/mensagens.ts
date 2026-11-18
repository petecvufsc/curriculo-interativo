// Retorno visível das ações que mudam várias disciplinas de uma vez (cascata) ou que o aluno
// não veria acontecer (o detalhe fica longe da grade). Texto puro: sem React.
import { aprovadasDe, type RegistroAluno, type StatusEditavel } from '../../dominio/aluno';
import { porCodigo } from './motorEcv';

const nome = (codigo: string) => porCodigo.get(codigo)?.nome ?? codigo;
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

const ROTULO_STATUS: Record<StatusEditavel, string> = {
  'nao-cursada': 'não cursada',
  aprovada: 'aprovada',
  cursando: 'cursando',
  reprovada: 'reprovada',
};

/** Marcar ou desmarcar uma disciplina: só avisa quando a cascata mexeu em outras. */
export function mensagemAlternar(codigo: string, marcada: boolean, antes: RegistroAluno, depois: RegistroAluno): string | null {
  const a = aprovadasDe(antes);
  const d = aprovadasDe(depois);
  const mudaram = marcada ? [...d].filter((c) => !a.has(c)) : [...a].filter((c) => !d.has(c));
  const outras = mudaram.filter((c) => c !== codigo).length;
  if (outras === 0) return null;
  return marcada
    ? `Marquei também ${plural(outras, 'pré-requisito', 'pré-requisitos')} de ${nome(codigo)}.`
    : `Desmarquei também ${plural(outras, 'disciplina que dependia', 'disciplinas que dependiam')} de ${nome(codigo)}.`;
}

/** Marcar ou desmarcar a fase inteira. */
export function mensagemFase(fase: number, marcada: boolean, antes: RegistroAluno, depois: RegistroAluno): string | null {
  const a = aprovadasDe(antes);
  const d = aprovadasDe(depois);
  const n = marcada ? [...d].filter((c) => !a.has(c)).length : [...a].filter((c) => !d.has(c)).length;
  if (n === 0) return null;
  const acao = marcada ? 'marcada' : 'desmarcada';
  const quantas = n === 1 ? `1 disciplina ${acao}` : `${n} disciplinas ${acao}s`;
  return marcada ? `${quantas} na ${fase}ª Fase, com os pré-requisitos.` : `${quantas} na ${fase}ª Fase e nas que dependiam delas.`;
}

/** Mudança de situação no histórico (o bloco de detalhes costuma ficar fora da tela, longe do cartão). */
export function mensagemStatus(codigo: string, status: StatusEditavel): string {
  return `${nome(codigo)}: situação alterada para ${ROTULO_STATUS[status]}.`;
}
