import type { RegistroAluno, SemestrePlano } from '../../dominio/aluno';
import { CODIGOS_MAX_POR_SEMESTRE, SEMESTRES_MAX_PLANO } from '../../dominio/aluno/tipos';

export type OperacaoPlano =
  | { tipo: 'adicionarSemestre' }
  | { tipo: 'removerSemestre'; indice: number }
  | { tipo: 'limpar' }
  | { tipo: 'adicionar'; indice: number; codigo: string }
  | { tipo: 'remover'; indice: number; posicao: number }
  | { tipo: 'substituir'; indice: number; codigos: string[] }
  | { tipo: 'definirPlano'; semestres: string[][] }
  /** Move a disciplina na posição `posicao` do semestre `indice` para o fim do semestre `para`. */
  | { tipo: 'mover'; indice: number; posicao: number; para: number };

function aplicar(semestres: SemestrePlano[], op: OperacaoPlano): SemestrePlano[] {
  const trocar = (indice: number, f: (codigos: string[]) => string[]) =>
    semestres.map((s, i) => (i === indice ? { codigos: f(s.codigos) } : s));
  switch (op.tipo) {
    case 'adicionarSemestre':
      // O plano não passa da duração máxima do curso
      return semestres.length >= SEMESTRES_MAX_PLANO ? semestres : [...semestres, { codigos: [] }];
    case 'removerSemestre':
      return semestres.filter((_, i) => i !== op.indice);
    case 'limpar':
      return [];
    case 'adicionar':
      return trocar(op.indice, (c) => (c.length >= CODIGOS_MAX_POR_SEMESTRE ? c : [...c, op.codigo]));
    case 'remover':
      return trocar(op.indice, (c) => c.filter((_, i) => i !== op.posicao));
    case 'substituir':
      return trocar(op.indice, () => op.codigos);
    case 'definirPlano':
      return op.semestres.slice(0, SEMESTRES_MAX_PLANO).map((codigos) => ({ codigos: codigos.slice(0, CODIGOS_MAX_POR_SEMESTRE) }));
    case 'mover': {
      // Índices precisam ser inteiros (um dado de arrasto fabricado pode trazer texto: "0" === 0 é falso e duplicaria a disciplina)
      if (![op.indice, op.posicao, op.para].every(Number.isInteger)) return semestres;
      const codigo = semestres[op.indice]?.codigos[op.posicao];
      // Origem ou destino inexistente, destino igual à origem ou destino cheio: nada muda
      if (codigo === undefined || !semestres[op.para] || op.para === op.indice) return semestres;
      if (semestres[op.para].codigos.length >= CODIGOS_MAX_POR_SEMESTRE) return semestres;
      return semestres.map((s, i) => {
        if (i === op.indice) return { codigos: s.codigos.filter((_, p) => p !== op.posicao) };
        if (i === op.para) return { codigos: [...s.codigos, codigo] };
        return s;
      });
    }
  }
}

export function aplicarPlano(registro: RegistroAluno, op: OperacaoPlano): RegistroAluno {
  return { ...registro, plano: { semestres: aplicar(registro.plano.semestres, op) } };
}

/** Disciplina planejada → número do primeiro semestre do plano em que aparece (a partir de 1). */
export function semestresPlanejados(registro: RegistroAluno): Map<string, number> {
  const mapa = new Map<string, number>();
  registro.plano.semestres.forEach((s, i) => s.codigos.forEach((c) => mapa.has(c) || mapa.set(c, i + 1)));
  return mapa;
}
