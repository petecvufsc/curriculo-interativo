import { ROTULOS, type TipoDestaque } from '../estado/destaques';

const ORDEM: TipoDestaque[] = [
  'selecionada',
  'pre-direto',
  'pre-indireto',
  'tranca-direto',
  'tranca-indireto',
  'disponivel',
];

export function Legenda() {
  return (
    <ul className="legenda" aria-label="Legenda de destaques">
      {ORDEM.map((t) => (
        <li key={t}>
          <span className={`selo selo-${t}`}>{ROTULOS[t]}</span>
        </li>
      ))}
    </ul>
  );
}
