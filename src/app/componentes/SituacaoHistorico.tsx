import type { StatusEditavel } from '../../dominio/aluno';

const OPCOES: { valor: StatusEditavel; rotulo: string }[] = [
  { valor: 'nao-cursada', rotulo: 'Não cursada' },
  { valor: 'aprovada', rotulo: 'Aprovada' },
  { valor: 'cursando', rotulo: 'Cursando' },
  { valor: 'reprovada', rotulo: 'Reprovada' },
];

interface Props {
  codigo: string;
  atual: StatusEditavel;
  onMudar: (status: StatusEditavel) => void;
}

/** Controle segmentado (radios nativos: setas do teclado trocam a opção). O item marcado também recebe "✓". */
export function SituacaoHistorico({ codigo, atual, onMudar }: Props) {
  return (
    <div className="situacao-historico">
      <span id="rotulo-situacao" className="situacao-rotulo">
        Situação no histórico
      </span>
      <div className="segmentado" role="radiogroup" aria-labelledby="rotulo-situacao">
        {OPCOES.map((o) => (
          <label key={o.valor} className="seg">
            <input
              type="radio"
              className="seg-input"
              name={`situacao-${codigo}`}
              value={o.valor}
              checked={atual === o.valor}
              onChange={() => onMudar(o.valor)}
            />
            <span className="seg-texto">{o.rotulo}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
