import { aprovadasDe, definirStatus, type OpcoesAluno, type RegistroAluno, type StatusEditavel } from '../../dominio/aluno';
import { motorDe, porCodigo, versaoDoRegistro } from './motorEcv';

/** Motor da versão de regras aplicada ao registro hoje (a escolhida; 2028.1 depois do fim da 2020.1). */
export const motorDoRegistro = (registro: RegistroAluno) => motorDe(versaoDoRegistro(registro.opcoes.versaoRegras));

export function definir(registro: RegistroAluno, codigo: string, status: StatusEditavel): RegistroAluno {
  return definirStatus(motorDoRegistro(registro), registro, codigo, status);
}

/** Checkbox da fase: aplica `motor.marcarFase` e traduz a diferença em mudanças de status (com cascata). */
export function aplicarFase(registro: RegistroAluno, fase: number, marcada: boolean): RegistroAluno {
  const motor = motorDoRegistro(registro);
  const antes = aprovadasDe(registro);
  const depois = motor.marcarFase(antes, fase, marcada);
  let novo = registro;
  for (const c of depois) if (!antes.has(c)) novo = definirStatus(motor, novo, c, 'aprovada');
  for (const c of antes) {
    if (!depois.has(c) && aprovadasDe(novo).has(c)) novo = definirStatus(motor, novo, c, 'nao-cursada');
  }
  return novo;
}

/** "Limpar seleção": zera os status (inclusive os de outro currículo); plano e opções permanecem. */
export function limparStatus(registro: RegistroAluno): RegistroAluno {
  return { ...registro, status: {} };
}

export function mudarOpcoes(registro: RegistroAluno, parcial: Partial<OpcoesAluno>): RegistroAluno {
  return { ...registro, opcoes: { ...registro.opcoes, ...parcial } };
}

const FORMATO_EXTERNO = /^[A-Z]{3}\d{4}$/;

/** Normaliza o texto digitado: maiúsculas, sem espaços ("mtm 3101" vira "MTM3101"). */
export function normalizarCodigo(texto: string): string {
  return texto.replace(/\s+/g, '').toUpperCase();
}

/** Mensagem de erro para um código de outro currículo, ou null se puder ser adicionado. */
export function erroCodigoExterno(codigo: string, registro: RegistroAluno): string | null {
  if (!FORMATO_EXTERNO.test(codigo)) return 'Código inválido. Use o formato AAA9999 (por exemplo, MTM3101).';
  if (porCodigo.has(codigo)) return `${codigo} pertence ao currículo atual: marque-a na grade.`;
  if (registro.status[codigo]) return `${codigo} já foi adicionada.`;
  return null;
}

/** Códigos aprovados que não pertencem ao currículo atual. */
export function codigosExternos(registro: RegistroAluno): string[] {
  return Object.keys(registro.status)
    .filter((c) => !porCodigo.has(c))
    .sort();
}
