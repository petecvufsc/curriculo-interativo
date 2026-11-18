import { useState } from 'react';
import { Abas } from './componentes/Abas';
import { BarraAcoes } from './componentes/BarraAcoes';
import { Dialogo } from './componentes/Dialogo';
import { GradeDisciplinas } from './componentes/GradeDisciplinas';
import { Legenda } from './componentes/Legenda';
import { MensagemAcao } from './componentes/MensagemAcao';
import { PainelLateral } from './componentes/PainelLateral';
import { ResumoIntegralizacao } from './componentes/ResumoIntegralizacao';
import { SeletorVersao } from './componentes/SeletorVersao';
import { VisaoPlanejamento } from './componentes/planejamento/VisaoPlanejamento';
import { TextoAjuda, TextoSobre } from './componentes/Textos';
import { formatarDataIso } from './estado/formato';
import { useEstadoAluno } from './estado/useEstadoAluno';

export function App() {
  const e = useEstadoAluno();
  const [dialogo, setDialogo] = useState<'ajuda' | 'sobre' | null>(null);
  return (
    <div className="app">
      <a className="pular" href="#conteudo">
        Pular para as disciplinas
      </a>
      <a className="pular" href="#painel">
        Pular para o resumo e as ações
      </a>
      <header className="topo">
        <img className="topo-logo" src={`${import.meta.env.BASE_URL}icones/icone-192.png`} alt="" width="40" height="40" />
        <div className="topo-titulo">
          <h1>Currículo Interativo — Engenharia Civil UFSC</h1>
          <p>Última atualização: {formatarDataIso(__ATUALIZADO_EM__)} · PET Engenharia Civil UFSC</p>
        </div>
        <div className="topo-acoes">
          <button type="button" className="botao-topo" onClick={() => setDialogo('ajuda')}>
            Ajuda
          </button>
          <button type="button" className="botao-topo" onClick={() => setDialogo('sobre')}>
            Sobre
          </button>
        </div>
      </header>
      <div className="corpo">
        <main className="principal" id="conteudo" tabIndex={-1}>
          {e.naoSalvou && (
            <p className="aviso aviso-erro aviso-armazenamento" role="alert">
              <strong>Não foi possível salvar neste navegador</strong> (armazenamento cheio, bloqueado ou janela privativa). O que
              você fizer agora se perde ao fechar a página. Use &quot;Exportar (.json)&quot; para guardar seus dados.
            </p>
          )}
          <ResumoIntegralizacao e={e} />
          <SeletorVersao e={e} />
          <Abas aba={e.aba} onMudar={(aba) => e.dispatch({ tipo: 'aba', aba })} />
          <MensagemAcao e={e} />
          <div role="tabpanel" id="painel-grade" aria-labelledby="aba-grade" hidden={e.aba !== 'grade'}>
            {e.aba === 'grade' && (
              <>
                <p className="dica">
                  Clique no <strong>nome</strong> de uma disciplina para ver seus pré-requisitos e o que ela libera. Marque a{' '}
                  <strong>caixa</strong> das que você já cursou.
                </p>
                <Legenda />
                <GradeDisciplinas e={e} />
              </>
            )}
          </div>
          <div role="tabpanel" id="painel-planejamento" aria-labelledby="aba-planejamento" hidden={e.aba !== 'planejamento'}>
            {e.aba === 'planejamento' && <VisaoPlanejamento e={e} />}
          </div>
        </main>
        <PainelLateral e={e} />
      </div>
      <footer className="rodape">
        <p>
          Baseado no currículo oficial 2020.1 (UFSC/SeTIC). Confira sempre no CAGR; esta ferramenta pode conter erros.
        </p>
      </footer>
      {e.aba === 'grade' && <BarraAcoes e={e} />}
      <Dialogo aberto={dialogo === 'ajuda'} titulo="Ajuda" onFechar={() => setDialogo(null)}>
        <TextoAjuda />
      </Dialogo>
      <Dialogo aberto={dialogo === 'sobre'} titulo="Sobre" onFechar={() => setDialogo(null)}>
        <TextoSobre />
      </Dialogo>
    </div>
  );
}
