import { useMemo, useReducer } from 'react';
import { aprovadasDe, baseSimulacao, type OpcoesAluno, type RegistroAluno, type StatusEditavel } from '../../dominio/aluno';
import { calcularDestaques } from './destaques';
import type { Aviso } from './arquivo';
import { mensagemAlternar, mensagemFase, mensagemStatus } from './mensagens';
import { motorDe, versaoDoRegistro } from './motorEcv';
import { aplicarFase, definir, limparStatus, mudarOpcoes } from './operacoesRegistro';
import { aplicarPlano, semestresPlanejados, type OperacaoPlano } from './operacoesPlano';
import { lerRegistroSalvo, usePersistencia } from './persistencia';

export type Modo = 'nenhum' | 'relacoes' | 'simulacao';
export type Aba = 'grade' | 'planejamento';

interface Estado {
  registro: RegistroAluno;
  selecionada: string | null;
  modo: Modo;
  aba: Aba;
  /** Depois do primeiro "Simular", os totais de disponíveis passam a ser exibidos. */
  simulou: boolean;
  /** Resultado da última importação (dispensável). */
  aviso: Aviso | null;
  /** Retorno da última ação que mexeu em várias disciplinas, com o registro anterior para "Desfazer". */
  mensagem: { texto: string; anterior: RegistroAluno } | null;
}

type Acao =
  | { tipo: 'alternar'; codigo: string; marcada: boolean }
  | { tipo: 'status'; codigo: string; status: StatusEditavel }
  | { tipo: 'fase'; fase: number; marcada: boolean }
  | { tipo: 'limparSelecao' }
  | { tipo: 'limparDestaques' }
  | { tipo: 'selecionar'; codigo: string }
  | { tipo: 'simular' }
  | { tipo: 'opcoes'; opcoes: Partial<OpcoesAluno> }
  | { tipo: 'plano'; op: OperacaoPlano }
  | { tipo: 'aba'; aba: Aba }
  | { tipo: 'importar'; registro: RegistroAluno | null; aviso: Aviso }
  | { tipo: 'fecharAviso' }
  | { tipo: 'desfazer' }
  | { tipo: 'fecharMensagem' };

const inicial = (): Estado => ({
  registro: lerRegistroSalvo(),
  selecionada: null,
  modo: 'nenhum',
  aba: 'grade',
  simulou: false,
  aviso: null,
  mensagem: null,
});

/** Novo registro + mensagem (ou nenhuma, se a ação não merece aviso). */
function com(e: Estado, novo: RegistroAluno, texto: string | null): Estado {
  return { ...e, registro: novo, mensagem: texto ? { texto, anterior: e.registro } : null };
}

/**
 * Ações que mudam o plano, as opções ou o histórico inteiro invalidam o "Desfazer" pendente: ele restauraria
 * o registro de antes (inclusive plano e opções) por cima do que o aluno fez depois.
 */
const LIMPAM_MENSAGEM: ReadonlySet<Acao['tipo']> = new Set(['opcoes', 'plano', 'importar', 'limparSelecao']);

function reducer(e: Estado, a: Acao): Estado {
  const novo = reducerBase(e, a);
  return LIMPAM_MENSAGEM.has(a.tipo) ? { ...novo, mensagem: null } : novo;
}

function reducerBase(e: Estado, a: Acao): Estado {
  const r = e.registro;
  switch (a.tipo) {
    case 'alternar': {
      const novo = definir(r, a.codigo, a.marcada ? 'aprovada' : 'nao-cursada');
      return com(e, novo, mensagemAlternar(a.codigo, a.marcada, r, novo));
    }
    case 'status':
      return com(e, definir(r, a.codigo, a.status), mensagemStatus(a.codigo, a.status));
    case 'fase': {
      const novo = aplicarFase(r, a.fase, a.marcada);
      return com(e, novo, mensagemFase(a.fase, a.marcada, r, novo));
    }
    case 'limparSelecao':
      return { ...e, registro: limparStatus(r) };
    case 'limparDestaques':
      return { ...e, selecionada: null, modo: 'nenhum' };
    case 'selecionar':
      // Clicar de novo no mesmo nome limpa; selecionar sai do modo simulação (como no original).
      return e.selecionada === a.codigo && e.modo === 'relacoes'
        ? { ...e, selecionada: null, modo: 'nenhum' }
        : { ...e, selecionada: a.codigo, modo: 'relacoes' };
    case 'simular':
      return { ...e, selecionada: null, modo: 'simulacao', simulou: true, aba: 'grade' };
    case 'opcoes':
      return { ...e, registro: mudarOpcoes(r, a.opcoes) };
    case 'plano':
      return { ...e, registro: aplicarPlano(r, a.op) };
    case 'aba':
      return { ...e, aba: a.aba };
    case 'importar':
      return { ...e, registro: a.registro ?? r, aviso: a.aviso };
    case 'fecharAviso':
      return { ...e, aviso: null };
    case 'desfazer':
      return e.mensagem ? { ...e, registro: e.mensagem.anterior, mensagem: null } : e;
    case 'fecharMensagem':
      return { ...e, mensagem: null };
  }
}

export function useEstadoAluno() {
  const [estado, dispatch] = useReducer(reducer, undefined, inicial);
  const { registro } = estado;
  usePersistencia(registro);
  const aprovadas = useMemo(() => aprovadasDe(registro), [registro]);
  // Base da simulação (respeita a opção "em andamento como aprovadas").
  const base = useMemo(() => baseSimulacao(registro), [registro]);
  const planejadas = useMemo(() => semestresPlanejados(registro), [registro]);
  // Regras de pré-requisito da versão escolhida (2020.1 ou 2028.1): tudo abaixo é recalculado ao trocar.
  const versao = versaoDoRegistro(registro.opcoes.versaoRegras);
  const motor = motorDe(versao);
  const destaques = useMemo(
    () => calcularDestaques(motor, estado.modo, estado.selecionada, base),
    [motor, estado.modo, estado.selecionada, base],
  );
  const simulacao = useMemo(() => motor.simular(base), [motor, base]);
  const progresso = useMemo(() => motor.progresso(base), [motor, base]);
  return { ...estado, versao, motor, aprovadas, base, planejadas, destaques, simulacao, progresso, dispatch };
}

export type EstadoAluno = ReturnType<typeof useEstadoAluno>;
