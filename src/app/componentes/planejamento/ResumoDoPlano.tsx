import { rotuloSemestre, type AvaliacaoPlano } from '../../../dominio/planejamento';
import { formatarHoras } from '../../estado/formato';

interface Props {
  avaliacao: AvaliacaoPlano;
  semestreInicial: string | null;
}

/**
 * Situação do plano em uma frase por item: quantos semestres, se cobre as obrigatórias, quanto falta de
 * optativas (que o aluno escolhe) e quantas disciplinas estão com pré-requisito faltando. Sempre
 * derivada do plano atual, então nunca fica desatualizada depois de uma edição.
 */
export function ResumoDoPlano({ avaliacao, semestreInicial }: Props) {
  const n = avaliacao.semestres.length;
  if (n === 0) return null;
  const { obrigatorias, optativas } = avaliacao.progressoProjetado;
  const faltaObrig = Math.max(0, (obrigatorias.totalHA ?? 0) - obrigatorias.cumpridasHA);
  const faltaOpt = Math.max(0, (optativas.totalHA ?? 0) - optativas.cumpridasHA);
  const comProblema = avaliacao.semestres.flatMap((s) => s.itens).filter((i) => i.problemas.length > 0).length;
  const primeiro = rotuloSemestre(semestreInicial, 1);
  const ultimo = rotuloSemestre(semestreInicial, n);

  return (
    <ul className="resumo-plano-lista" role="status" aria-label="Situação do plano">
      <li>
        <strong>{n}</strong> {n === 1 ? 'semestre' : 'semestres'}
        {primeiro && ultimo && n > 1 ? ` (${primeiro} a ${ultimo})` : primeiro ? ` (${primeiro})` : ''}
      </li>
      <li className={faltaObrig === 0 ? 'ok' : 'falta'}>
        {faltaObrig === 0 ? 'Cobre todas as obrigatórias' : `Faltam ${formatarHoras(faltaObrig)} h-a de obrigatórias no plano`}
      </li>
      <li className={faltaOpt === 0 ? 'ok' : 'falta'}>
        {faltaOpt === 0 ? 'Optativas completas' : `Faltam ${formatarHoras(faltaOpt)} h-a de optativas, que você escolhe`}
      </li>
      {comProblema > 0 && (
        <li className="erro">
          {comProblema} {comProblema === 1 ? 'disciplina com pré-requisito faltando' : 'disciplinas com pré-requisito faltando'}
        </li>
      )}
    </ul>
  );
}
