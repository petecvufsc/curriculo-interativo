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
import { MIDIA_GAVETA_DIREITA, MIDIA_GAVETA_LATERAL, MIDIA_PAINEL_AO_LADO, useMidia } from './estado/useMidia';

/** A dica "Seu resumo… ficam em Resumo e ações" aparece uma vez por navegador. */
const CHAVE_DICA_PAINEL = 'curriculo-interativo:dica-painel-vista';
function lerDicaVista(): boolean {
  try {
    return localStorage.getItem(CHAVE_DICA_PAINEL) === '1';
  } catch {
    return false;
  }
}
function gravarDicaVista() {
  try {
    localStorage.setItem(CHAVE_DICA_PAINEL, '1');
  } catch {
    // Sem armazenamento a dica volta na próxima visita; nada mais muda.
  }
}

export function App() {
  const e = useEstadoAluno();
  const [dialogo, setDialogo] = useState<'ajuda' | 'sobre' | null>(null);
  // Abaixo de 1620 px o painel não cabe ao lado da grade (10 colunas com nomes inteiros) e vira gaveta.
  const aoLado = useMidia(MIDIA_PAINEL_AO_LADO, true);
  const gavetaLateral = useMidia(MIDIA_GAVETA_LATERAL, true);
  const gavetaDireita = useMidia(MIDIA_GAVETA_DIREITA, true);
  const emGaveta = !aoLado;
  const [painelAberto, setPainelAberto] = useState(false);
  const aberta = emGaveta && painelAberto;
  const focarPainel = useRef(false);
  const [dicaVista, setDicaVista] = useState(lerDicaVista);
  const dispensarDica = () => {
    setDicaVista(true);
    gravarDicaVista();
  };

  const abrirPainel = (focar: boolean) => {
    focarPainel.current = focar;
    setPainelAberto(true);
    if (!dicaVista) dispensarDica();
  };
  // Ao fechar, o foco volta para o controle que abre a gaveta e está visível (a aba da borda, no computador com
  // mouse, ou o botão da barra), depois de renderizar.
  const devolverFoco = useRef(false);
  // Por 220 ms depois de fechar, a gaveta continua desenhada ("saindo") para deslizar para fora junto com a aba.
  const [saindo, setSaindo] = useState(false);
  const temporizadorSaida = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(temporizadorSaida.current), []);
  const fechar = (devolver: boolean) => {
    devolverFoco.current = devolver;
    setPainelAberto(false);
    setSaindo(true);
    clearTimeout(temporizadorSaida.current);
    temporizadorSaida.current = setTimeout(() => setSaindo(false), 220);
  };
  const fecharPainel = () => fechar(true);

  useEffect(() => {
    if (aberta && focarPainel.current) {
      focarPainel.current = false;
      document.getElementById('painel')?.focus({ preventScroll: true });
    }
    if (!aberta && devolverFoco.current) {
      devolverFoco.current = false;
      const alca = document.getElementById('alca-painel');
      const visivel = alca && getComputedStyle(alca).display !== 'none';
      (visivel ? alca : document.getElementById('botao-painel'))?.focus();
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
    const nova = e.selecionada && e.selecionada !== selecionadaAntes.current;
    selecionadaAntes.current = e.selecionada;
    if (!nova || !emGaveta || !gavetaLateral) return;
    setPainelAberto(true);
    // Quem viu a gaveta abrir já sabe que ela existe: a dica de primeira visita não volta.
    setDicaVista(true);
    gravarDicaVista();
    // De 768 a 1099 px a gaveta ocupa a metade de baixo da tela: rola a página para a disciplina clicada ficar acima dela.
    if (!gavetaDireita) {
      const cartao = document.querySelector<HTMLElement>(`#painel-grade [data-codigo="${e.selecionada}"]`);
      const r = cartao?.getBoundingClientRect();
      if (r && (r.top < 80 || r.bottom > window.innerHeight * 0.42)) window.scrollBy({ top: r.top - 90 });
    }
  }, [e.selecionada, emGaveta, gavetaLateral, gavetaDireita]);

  // Esc fecha a gaveta mesmo com o foco na grade (a gaveta não é modal), desde que nenhum diálogo esteja aberto.
  useEffect(() => {
    if (!aberta) return;
    const tecla = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape' && !document.querySelector('dialog[open]')) {
        fechar(!!document.getElementById('painel')?.contains(document.activeElement));
      }
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [aberta]);

  return (
    <div className={aberta ? 'app painel-aberto' : 'app'}>
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
      <BarraAcoes
        e={e}
        painelAberto={aberta}
        onAlternarPainel={() => (aberta ? fecharPainel() : abrirPainel(true))}
        avisarDetalhe={!gavetaLateral}
        mostrarDica={emGaveta && !dicaVista && !aberta}
        onDispensarDica={dispensarDica}
      />
      {/* Aba presa à gaveta (como a seta do painel do Google Maps): em computador com mouse, de 1100 a 1619 px, é o
          único controle da gaveta (o botão da barra e o "Fechar" de dentro somem pelo CSS). Fechada, fica na borda da
          tela com "‹ Resumo e ações"; aberta, desliza junto com a gaveta, fica presa à borda esquerda dela e vira
          "› Fechar". Não muda de tamanho ao passar o mouse, só de cor. Fora dessa faixa some e vale o botão da barra. */}
      {emGaveta && gavetaDireita && (
        <button
          type="button"
          id="alca-painel"
          className="alca-painel"
          aria-expanded={aberta}
          aria-controls="painel"
          onClick={() => (aberta ? fecharPainel() : abrirPainel(true))}
        >
          <span className="alca-seta" aria-hidden="true">
            {aberta ? '›' : '‹'}
          </span>
          <span className="alca-painel-vertical">{aberta ? 'Fechar' : 'Resumo e ações'}</span>
        </button>
      )}
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
        <PainelLateral e={e} gaveta={emGaveta ? { aberta, saindo: saindo && !aberta, onFechar: fecharPainel } : undefined} />
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
