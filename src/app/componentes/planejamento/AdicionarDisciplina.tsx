import { useId, useMemo, useState } from 'react';
import { impactoDe } from '../../../dominio/planejamento';
import { textoCreditos } from '../../estado/creditos';
import { motor, porCodigo } from '../../estado/motorEcv';

interface Props {
  /** "semestre 2" ou "semestre 2 (2027.2)": usado nos nomes acessíveis. */
  nomeSemestre: string;
  /** Códigos que podem ser adicionados (vindos de `disponiveisNoSemestre`). */
  codigos: string[];
  onAdicionar: (codigo: string) => void;
}

const SEM_BUSCA = 6;
const COM_BUSCA = 12;

/** Minúsculas e sem acento: "Álgebra" casa com "algebra". */
const normalizar = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

interface Opcao {
  codigo: string;
  nome: string;
  creditos: string;
  optativa: boolean;
  libera: number;
  fase: number;
}

/**
 * Busca de disciplina para o semestre. Sem texto, mostra as que mais liberam outras do curso; com texto,
 * filtra por nome ou código. As obrigatórias vêm antes das optativas.
 */
export function AdicionarDisciplina({ nomeSemestre, codigos, onAdicionar }: Props) {
  const id = useId();
  const [busca, setBusca] = useState('');

  const opcoes = useMemo<Opcao[]>(() => {
    const lista: Opcao[] = [];
    for (const codigo of codigos) {
      const d = porCodigo.get(codigo);
      if (!d) continue;
      lista.push({
        codigo,
        nome: d.nome,
        creditos: textoCreditos(d),
        optativa: d.tipo === 'optativa',
        libera: impactoDe(motor, codigo),
        fase: d.fase ?? 99,
      });
    }
    return lista.sort(
      (a, b) =>
        Number(a.optativa) - Number(b.optativa) || b.libera - a.libera || a.fase - b.fase || a.nome.localeCompare(b.nome, 'pt-BR'),
    );
  }, [codigos]);

  const termo = normalizar(busca.trim());
  const filtradas = termo ? opcoes.filter((o) => normalizar(`${o.nome} ${o.codigo}`).includes(termo)) : opcoes;
  const limite = termo ? COM_BUSCA : SEM_BUSCA;
  const mostradas = filtradas.slice(0, limite);

  return (
    <details className="adicionar">
      <summary>+ Adicionar disciplina</summary>
      <div className="adicionar-corpo">
        <label htmlFor={id}>Buscar disciplina para o {nomeSemestre}</label>
        <input
          id={id}
          className="campo"
          type="search"
          placeholder="Nome ou código (ex.: cálculo, ECV2302)"
          value={busca}
          onChange={(ev) => setBusca(ev.target.value)}
          autoComplete="off"
        />
        {mostradas.length === 0 ? (
          <p className="muted">{termo ? 'Nenhuma disciplina disponível com esse texto.' : 'Nenhuma disciplina disponível para este semestre.'}</p>
        ) : (
          <ul className="adicionar-lista" aria-label={`Disciplinas disponíveis para o ${nomeSemestre}`}>
            {mostradas.map((o) => (
              <li key={o.codigo}>
                <button
                  type="button"
                  className="adicionar-opcao"
                  aria-label={`Adicionar ${o.nome} ao ${nomeSemestre}`}
                  onClick={() => onAdicionar(o.codigo)}
                >
                  <span className="adicionar-nome">{o.nome}</span>
                  <span className="adicionar-meta">
                    {o.codigo} · {o.creditos}
                    {o.optativa && <span className="adicionar-tag">Optativa</span>}
                    {o.libera > 0 && <span className="impacto">libera {o.libera}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {filtradas.length > mostradas.length && (
          <p className="muted adicionar-mais">
            Mostrando {mostradas.length} de {filtradas.length}
            {termo ? '. Refine a busca.' : ', as que mais liberam outras do curso. Digite para buscar as demais.'}
          </p>
        )}
        <span className="oculto-visualmente" role="status">
          {filtradas.length} {filtradas.length === 1 ? 'disciplina encontrada' : 'disciplinas encontradas'}
        </span>
      </div>
    </details>
  );
}
