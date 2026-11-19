import { useEffect, useRef, useState } from 'react';
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
import { MIDIA_GAVETA_LATERAL, MIDIA_PAINEL_AO_LADO, useMidia } from './estado/useMidia';

export function App() {
  const e = useEstadoAluno();
  const [dialogo, setDialogo] = useState<'ajuda' | 'sobre' | null>(null);
  // Abaixo de 1620 px o painel não cabe ao lado da grade (10 colunas com nomes inteiros) e vira gaveta.
  const aoLado = useMidia(MIDIA_PAINEL_AO_LADO, true);
  const gavetaLateral = useMidia(MIDIA_GAVETA_LATERAL, true);
  const emGaveta = !aoLado;
  const [painelAberto, setPainelAberto] = useState(false);
  const aberta = emGaveta && painelAberto;
  const focarPainel = useRef(false);

  const abrirPainel = (focar: boolean) => {
    focarPainel.current = focar;
    setPainelAberto(true);
  };
  const fecharPainel = () => {
    setPainelAberto(false);
    // O foco volta para o botão que abre a gaveta (não cai no <body>).
    document.getElementById('botao-painel')?.focus();
  };

  useEffect(() => {
    if (aberta && focarPainel.current) {
      focarPainel.current = false;
      document.getElementById('painel')?.focus({ preventScroll: true });
    }
  }, [aberta]);

  // Com uma disciplina escolhida, a gaveta abre (ou fica) no detalhe dela, não no topo do painel.
  useEffect(() => {
    if (!aberta || !e.selecionada) return;
    const painel = document.getElementById('painel');
    const detalhe = painel?.querySelector<HTMLElement>('.detalhe');
    const topo = painel?.querySelector<HTMLElement>('.gaveta-topo');
    if (painel && detalhe) painel.scrollTop = Math.max(0, detalhe.offsetTop - (topo?.offsetHeight ?? 0));
  }, [aberta, e.selecionada]);

  // Notebook e tablet: escolher uma disciplina abre a gaveta no detalhe dela, sem tirar o foco da grade.
  // No celular, não: a gaveta cobriria a grade; o botão da barra passa a dizer "Detalhes: <nome>".
  const selecionadaAntes = useRef(e.selecionada);
  useEffect(() => {
    if (e.selecionada && e.selecionada !== selecionadaAntes.current && emGaveta && gavetaLateral) setPainelAberto(true);
    selecionadaAntes.current = e.selecionada;
  }, [e.selecionada, emGaveta, gavetaLateral]);

  // Esc fecha a gaveta mesmo com o foco na grade (a gaveta não é modal), desde que nenhum diálogo esteja aberto.
  useEffect(() => {
    if (!aberta) return;
    const tecla = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape' && !document.querySelector('dialog[open]')) {
        setPainelAberto(false);
        if (document.getElementById('painel')?.contains(document.activeElement)) document.getElementById('botao-painel')?.focus();
      }
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [aberta]);

  return (
    <div className="app">
      <a className="pular" href="#conteudo">
        Pular para as disciplinas
      </a>
      <a
        className="pular"
        href="#painel"
        onClick={(ev) => {
          if (!emGaveta) return;
          ev.preventDefault();
          abrirPainel(true);
        }}
      >
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
      <BarraAcoes e={e} painelAberto={aberta} onAlternarPainel={() => (aberta ? fecharPainel() : abrirPainel(true))} />
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
        <PainelLateral e={e} gaveta={emGaveta ? { aberta, onFechar: fecharPainel } : undefined} />
      </div>
      <footer className="rodape">
        <p>
          Baseado no currículo oficial 2020.1 (UFSC/SeTIC). Confira sempre no CAGR; esta ferramenta pode conter erros.
        </p>
      </footer>
      <Dialogo aberto={dialogo === 'ajuda'} titulo="Ajuda" onFechar={() => setDialogo(null)}>
        <TextoAjuda />
      </Dialogo>
      <Dialogo aberto={dialogo === 'sobre'} titulo="Sobre" onFechar={() => setDialogo(null)}>
        <TextoSobre />
      </Dialogo>
    </div>
  );
}
