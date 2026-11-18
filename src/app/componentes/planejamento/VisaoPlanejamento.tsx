import { useEffect, useId, useMemo, useState } from 'react';
import { SEMESTRES_MAX_PLANO } from '../../../dominio/aluno/tipos';
import { avaliarPlano, montarGradeOficial, montarPlano } from '../../../dominio/planejamento';
import type { EstadoAluno } from '../../estado/useEstadoAluno';
import { PrimeiroSemestre } from './PrimeiroSemestre';
import { QuantidadePorSemestre } from './QuantidadePorSemestre';
import { ResumoDoPlano } from './ResumoDoPlano';
import { SemestrePlanejado } from './SemestrePlanejado';
import { ROTULO_SUGESTAO } from './textosPlano';

const CHAVE_AJUDA_VISTA = 'curriculo-interativo:ajuda-planejamento-vista';

function lerJaViu(): boolean {
  try {
    return localStorage.getItem(CHAVE_AJUDA_VISTA) === '1';
  } catch {
    return false;
  }
}

export function VisaoPlanejamento({ e }: { e: EstadoAluno }) {
  const { registro, dispatch, motorDoSemestre } = e;
  const idSugestao = useId();
  const avaliacao = useMemo(() => avaliarPlano(motorDoSemestre, registro), [motorDoSemestre, registro]);
  const vazio = registro.plano.semestres.length === 0;
  const noLimite = registro.plano.semestres.length >= SEMESTRES_MAX_PLANO;
  const [jaViu, setJaViu] = useState(lerJaViu);
  useEffect(() => {
    if (vazio || jaViu) return;
    setJaViu(true);
    try {
      localStorage.setItem(CHAVE_AJUDA_VISTA, '1');
    } catch {
      /* sem armazenamento (modo privado): a ajuda só volta a abrir nesta visita */
    }
  }, [vazio, jaViu]);

  const limpar = () => {
    if (vazio || window.confirm('Remover todos os semestres do plano?')) {
      dispatch({ tipo: 'plano', op: { tipo: 'limpar' } });
      setOrigem(null);
    }
  };

  // De onde veio o plano montado automaticamente (some ao limpar ou ao refazer): diz a fase de partida da grade oficial
  const [origem, setOrigem] = useState<string | null>(null);

  const montar = () => {
    if (!vazio && !window.confirm('Substituir o plano atual por um plano otimizado, montado do zero até o fim do curso?')) return;
    const { semestres, completo, faltantes } = montarPlano(motorDoSemestre, registro);
    const q = registro.opcoes.disciplinasPorSemestre;
    // Nada montado (tudo cumprido, ou nada coube nos limites): mantém o plano atual e explica, em vez de apagá-lo
    if (semestres.length === 0) {
      setOrigem(
        faltantes.length === 0
          ? 'Você já cumpriu todas as obrigatórias: não há o que planejar. Seu plano foi mantido.'
          : 'Nada coube nos limites atuais (créditos por semestre e disciplinas por semestre). Seu plano foi mantido.',
      );
      return;
    }
    dispatch({ tipo: 'plano', op: { tipo: 'definirPlano', semestres } });
    setOrigem(
      `Plano otimizado, com ${q} ${q === 1 ? 'disciplina' : 'disciplinas'} por semestre: sugestão da ferramenta, não considera a oferta de turmas. Com mais disciplinas por semestre, o curso termina antes.` +
        (completo ? '' : ` O plano chegou ao limite de ${SEMESTRES_MAX_PLANO} semestres e ainda faltam ${faltantes.length} obrigatórias.`),
    );
  };

  const montarOficial = () => {
    if (!vazio && !window.confirm('Substituir o plano atual por um plano montado pela grade oficial, a partir da sua fase?')) return;
    const { semestres, faseAtual, completo, faltantes } = montarGradeOficial(motorDoSemestre, registro);
    if (semestres.length === 0) {
      setOrigem(
        faseAtual === null
          ? 'Você já cumpriu todas as obrigatórias: não há o que planejar pela grade oficial. Seu plano foi mantido.'
          : 'Nada coube nos limites atuais (créditos por semestre). Seu plano foi mantido.',
      );
      return;
    }
    dispatch({ tipo: 'plano', op: { tipo: 'definirPlano', semestres } });
    setOrigem(
      `Grade oficial a partir da ${faseAtual}ª fase (a ferramenta deduziu a sua fase pelo que você marcou). Cada semestre traz as obrigatórias de uma fase; as que ficaram para trás entram junto com a primeira. Confira no CAGR.` +
        (completo ? '' : ` O plano chegou ao limite de ${SEMESTRES_MAX_PLANO} semestres e ainda faltam ${faltantes.length} obrigatórias.`),
    );
  };

  return (
    <section className="planejamento" aria-labelledby="titulo-planejamento">
      <h2 id="titulo-planejamento">Planejamento de semestres</h2>
      {/* Aberto só para quem ainda não montou nenhum plano; fecha ao criar o primeiro semestre e não volta a abrir sozinho */}
      <details className="como-funciona" open={vazio && !jaViu}>
        <summary>Como funciona o planejamento</summary>
        <div className="como-funciona-corpo">
          <p>
            Serve para montar a sua matrícula dos próximos semestres <strong>antes</strong> de fazê-la: você escolhe as
            disciplinas de cada semestre e o app confere se dá para cursá-las.
          </p>
          <ol>
            <li>
              Diga <strong>quantas disciplinas</strong> quer por semestre e escolha o <strong>primeiro semestre</strong> do
              plano (por exemplo, 2027.1). Os seguintes são nomeados em sequência.
            </li>
            <li>
              Clique em <strong>Montar pela grade oficial</strong> para seguir as fases do currículo a partir da sua fase, ou
              em <strong>Montar plano otimizado</strong> para o app propor os semestres que mais destravam o curso, ou em{' '}
              <strong>+ Adicionar semestre</strong> para montar um a um. Em cada semestre, use <strong>Sugerir</strong> ou a
              busca de disciplinas, que mostra quantas outras cada uma libera.
            </li>
            <li>
              Para mudar uma disciplina de semestre, <strong>arraste</strong> o cartão para outro semestre ou use{' '}
              <strong>Mover para…</strong> (que também serve a teclado e celular). O app mostra se faltou pré-requisito e dá
              para desfazer.
            </li>
            <li>
              O medidor de cada semestre mostra os créditos entre 16 e 30, e o app avisa se falta pré-requisito. O que está
              no semestre 1 já conta para liberar disciplinas do semestre 2.
            </li>
            <li>No topo da página, a barra de integralização mostra quanto do curso você terá concluído ao fim do plano.</li>
          </ol>
          <p className="muted">
            É só uma simulação, e fica salva neste navegador. Ela não faz a matrícula: confirme sempre no CAGR.
          </p>
        </div>
      </details>
      {/* A nota fala das sugestões: só faz sentido quando já há semestres (e botões "Sugerir") */}
      {!vazio && (
        <p id={idSugestao} className="muted nota-sugestao">
          {ROTULO_SUGESTAO}
        </p>
      )}
      <div className="plano-controles">
        <QuantidadePorSemestre
          quantidade={registro.opcoes.disciplinasPorSemestre}
          onMudar={(disciplinasPorSemestre) => dispatch({ tipo: 'opcoes', opcoes: { disciplinasPorSemestre } })}
        />
        <PrimeiroSemestre
          inicio={e.inicioPlano}
          onMudar={(semestreInicial) => dispatch({ tipo: 'opcoes', opcoes: { semestreInicial } })}
        />
      </div>
      <div className="plano-botoes">
        <button type="button" className="botao primario" onClick={montarOficial}>
          Montar pela grade oficial
        </button>
        <button type="button" className="botao" onClick={montar}>
          Montar plano otimizado
        </button>
        <button
          type="button"
          className="botao"
          disabled={noLimite}
          title={noLimite ? `O plano tem no máximo ${SEMESTRES_MAX_PLANO} semestres (duração máxima do curso)` : undefined}
          onClick={() => dispatch({ tipo: 'plano', op: { tipo: 'adicionarSemestre' } })}
        >
          + Adicionar semestre
        </button>
        <button type="button" className="botao perigo" onClick={limpar}>
          Limpar plano
        </button>
      </div>
      <p className="muted nota-versao-plano">
        Cada semestre usa os pré-requisitos do seu período: até 2027.2 valem os atuais e, a partir de 2028.1, os novos
        (ECV2501, ECV2505, ECV2704 e ECV2932).
      </p>
      {origem && (
        <p className="nota-origem" role="status">
          {origem}
        </p>
      )}
      <ResumoDoPlano avaliacao={avaliacao} semestreInicial={e.inicioPlano} />
      {vazio ? (
        <p className="muted">
          Nenhum semestre no plano. Use &quot;Montar pela grade oficial&quot;, &quot;Montar plano otimizado&quot; ou &quot;+ Adicionar
          semestre&quot; para começar.
        </p>
      ) : (
        <ol className="semestres">
          {avaliacao.semestres.map((s) => (
            <SemestrePlanejado key={s.numero} e={e} semestre={s} idSugestao={idSugestao} />
          ))}
        </ol>
      )}
    </section>
  );
}
