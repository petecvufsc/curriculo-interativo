import type { TotaisHoras } from '../../dominio/regras';
import type { EstadoAluno } from '../estado/useEstadoAluno';
import { ArquivoRegistro } from './ArquivoRegistro';
import { BarraProgresso } from './BarraProgresso';
import { DetalheDisciplina } from './DetalheDisciplina';
import { DisciplinasExternas } from './DisciplinasExternas';

function Totais({ rotulo, t }: { rotulo: string; t: TotaisHoras }) {
  return (
    <li>
      {rotulo}: {t.horasAula} h-a · {t.aulasSemanais} créditos
    </li>
  );
}

/** Abaixo de 1620 px o painel vira gaveta: fechada, some da tela e do teclado (`inert`); aberta, tem o botão Fechar. */
export interface Gaveta {
  aberta: boolean;
  onFechar: () => void;
}

export function PainelLateral({ e, gaveta }: { e: EstadoAluno; gaveta?: Gaveta }) {
  const { simulacao: s, progresso: p, dispatch } = e;
  const limparSelecao = () => {
    // Os dados agora ficam salvos no navegador: pede confirmação antes de apagar.
    if (window.confirm('Limpar todas as disciplinas marcadas (inclusive as de outro currículo)? O plano de semestres é mantido.'))
      dispatch({ tipo: 'limparSelecao' });
  };
  const classe = ['painel', gaveta && 'gaveta', gaveta?.aberta && 'aberta'].filter(Boolean).join(' ');
  return (
    <aside
      id="painel"
      className={classe}
      aria-label="Resumo e ações"
      tabIndex={-1}
      inert={gaveta ? !gaveta.aberta : undefined}
      onKeyDown={(ev) => {
        if (gaveta?.aberta && ev.key === 'Escape') {
          ev.stopPropagation();
          gaveta.onFechar();
        }
      }}
    >
      {gaveta && (
        <div className="gaveta-topo">
          <p className="gaveta-titulo">Resumo e ações</p>
          <button type="button" className="botao pequeno" onClick={gaveta.onFechar}>
            Fechar <span aria-hidden="true">×</span>
          </button>
        </div>
      )}
      {/* Só aparece depois de "Simular": antes disso não há nada a mostrar, e a dica fica junto do botão */}
      <section aria-labelledby="titulo-disponiveis" aria-live="polite" hidden={!e.simulou}>
        <h2 id="titulo-disponiveis">Disciplinas disponíveis</h2>
        <ul className="totais">
          <Totais rotulo="Obrigatórias" t={s.totaisDisponiveis.obrigatorias} />
          <Totais rotulo="Optativas" t={s.totaisDisponiveis.optativas} />
        </ul>
      </section>
      <section aria-labelledby="titulo-cursadas">
        <h2 id="titulo-cursadas">Disciplinas cursadas</h2>
        <ul className="totais">
          <li>Obrigatórias: {s.totaisCursadas.obrigatorias} h-a</li>
          <li>Optativas: {s.totaisCursadas.optativas} h-a</li>
        </ul>
      </section>
      <section aria-labelledby="titulo-progresso">
        <h2 id="titulo-progresso">Progresso da integralização</h2>
        <BarraProgresso id="prog" rotulo="Obrigatórias" p={p.obrigatorias} />
        <BarraProgresso id="prog" rotulo="Optativas" p={p.optativas} />
      </section>
      <div className="botoes">
        {!e.simulou && <p className="muted dica-simular">Clique em &quot;Simular&quot; para ver o que você já pode cursar.</p>}
        <button type="button" className="botao primario" onClick={() => dispatch({ tipo: 'simular' })}>
          Simular
        </button>
        <button type="button" className="botao" onClick={() => dispatch({ tipo: 'limparDestaques' })}>
          Limpar destaques
        </button>
        {/* Apaga o histórico salvo: estilo de perigo e afastado do botão inofensivo ao lado */}
        <button type="button" className="botao perigo largura-total" onClick={limparSelecao}>
          Limpar seleção
        </button>
      </div>
      <label className="opcao">
        <input
          type="checkbox"
          checked={e.registro.opcoes.cursandoComoAprovada}
          onChange={(ev) => dispatch({ tipo: 'opcoes', opcoes: { cursandoComoAprovada: ev.target.checked } })}
        />
        <span>Considerar disciplinas em andamento como aprovadas</span>
      </label>
      <DisciplinasExternas e={e} />
      <ArquivoRegistro e={e} />
      <DetalheDisciplina e={e} />
    </aside>
  );
}
