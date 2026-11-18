# Acompanhamento do projeto

## Concluído
- 11/11/2026 — Fase 1 (auditoria): tecnologia identificada (.NET 6 WinForms), código descompilado, 94 disciplinas e regras recuperadas, comparação com o PDF 2020.1. Ver `01-auditoria-e-diagnostico.md`.

- 11/11/2026 — **Etapa 0 (preparação):** Node.js 26 LTS e Git 2.56 instalados via winget; repositório git criado (sem commits, aguardando identidade); `CLAUDE.md`, `README.md`, `package.json` (TypeScript, Vitest, tsx); binários grandes de `referencias/` fora do git.
- 11/11/2026 — **Etapa 1 (dados):**
  - `src/dominio/curriculos/ecv-2020-1.json`: 100 disciplinas transcritas do PDF, com pré-requisitos e equivalências no formato OU de grupos E.
  - `src/dominio/curriculos/ecv-programa-original.json`: 94 disciplinas, gerado a partir do CSV recuperado do original.
  - Validador (`npm run validar-curriculos`): 7 testes passando, nenhum erro. A soma das obrigatórias é 4086 h-a, igual a 3402 + 540 (estágio) + 144 (TCC) do PDF.
  - Relatório gerado: `docs/divergencias-original-vs-pdf.md`.
- 11/11/2026 — **Etapa 2 (motor de regras):**
  - `src/dominio/regras/`, conforme [regras-de-negocio.md](regras-de-negocio.md): cumprimento com equivalências, requisitos OU/E, situação com o que falta, grafo com menor distância (corrige o defeito de cor do original), cascata para marcar e desmarcar, simulação e progresso.
  - 83 testes no total, incluindo a **paridade com o original**: algoritmos portados do código descompilado, comparados disciplina por disciplina e em 300 cenários aleatórios.
  - O validador passou a rejeitar `conjunto`/`preCH` preenchidos, que o motor ainda não suporta.
- 11/11/2026 — **Etapa 3 (interface fiel):**
  - Vite + React 19 em `src/app/`, descrito em [interface.md](interface.md): grade das 10 fases, optativas, painel com totais e progresso, detalhes da disciplina (o que falta, alternativas, equivalências, alertas do PDF), legenda, Ajuda e Sobre.
  - Destaques com fundo, borda e rótulo de texto, não só cor; tema escuro; layout de celular com barra de ações fixa.
  - 92 testes passando; build de 77 kB gzip.
  - Verificado no navegador em 1440 px e 375 px, nos temas claro e escuro, sem erros no console: relações de ECV2601, cascata ao marcar ECV2302 e totais do Simular conferidos à mão (792 h-a disponíveis, 324 h-a cursadas).
- 11/11/2026 — **Etapa 4 (melhorias):**
  - **Situação no histórico:** aprovada, cursando ou reprovada, com a opção "considerar em andamento como aprovadas" e códigos de outro currículo ([regras §10](regras-de-negocio.md)).
  - **Planejamento de semestres:** avisos de requisito, de já cumprida/repetida e de 16–30 créditos; sugestão automática; integralização projetada (§11).
  - **Salvamento automático no navegador e exportar/importar `.json`,** com validação e relatório (§12).
  - **PWA:** manifesto, service worker próprio e ícones do logo do PET. O uso offline foi **testado com o servidor desligado**.
  - 216 testes. Verificado no navegador (1440 px e 375 px): status, opção "em andamento", persistência após recarregar, sugestão, aviso acima de 30 créditos e "Falta" ao tirar um pré-requisito do plano.
- 17/11/2026 — **Revisão de acessibilidade e identidade visual** (pedido do usuário: não ficar com um "layout genérico de IA"):
  - Auditoria por critérios das skills `accessibility` e `accessibility-review`; 7 achados corrigidos. Detalhes em [acessibilidade.md](acessibilidade.md).
  - Redesenho como **"prancha técnica"** de engenharia civil: eixos numerados nas fases, hachura nos indiretos, carimbo de prancha no painel, régua, tema escuro em azul heliográfico e fontes próprias. Descrito em [interface.md](interface.md).
  - 222 testes (6 novos de acessibilidade). Medido no navegador: contraste de texto sem falhas em todos os estados e nos dois temas (pior caso 5,2:1), 0 alvos abaixo de 24 px, reflow a 320 px e zoom de 200% sem rolagem horizontal.
  - O painel só fica ao lado da grade a partir de 1700 px; abaixo disso, palavras quebravam no meio.
- 17/11/2026 — **Interface sóbria, intercâmbios fora e revisão de UX/UI** (pedidos do usuário):
  - Redesenho para uma linha **sóbria, próxima do programa original** (fundo cinza, faixa verde por fase, listas simples), no lugar da "prancha técnica". Fonte única: Source Sans 3.
  - **Nenhum nome de disciplina quebra nem é hifenizado:** tamanho da fonte acompanha a largura do cartão, calculado a partir da palavra mais longa medida no navegador; zero estouros em 320, 800, 1100, 1280, 1366, 1440 e 1920 px.
  - **Decisão D2:** os Intercâmbios (ECV2971–ECV2974) saem do app (campo `somenteCoordenacao`). Isso também deixa de importar a contradição do PDF sobre o ECV2974 para o aluno.
  - **Explicação do Planejamento** dentro da aba ("Como funciona").
  - **Revisão de UX/UI** por subagente; 13 achados. Aplicados: dica dos dois gestos do cartão, legenda completa no topo, Ajuda/Sobre no cabeçalho, aviso de cascata com Desfazer, resumo na barra fixa, barra escondida no Planejamento, "Remover semestre" com confirmação, botão de perigo em "Limpar seleção", nota e projeção do plano só com semestres, "Cursando" no detalhe, "currículo anterior". Detalhe em [interface.md](interface.md).
  - 236 testes; contraste medido nos dois temas e em todos os estados (pior caso 5,05:1).
- 17/11/2026 — **Integralização em %, sugestão por quantidade e por impacto** (pedidos do usuário):
  - **Barra de integralização do curso** no topo (grade e planejamento): percentual e h-a sobre 4.518; as optativas além de 432 h-a não contam (ver [regras §8](regras-de-negocio.md)). Na aba Planejamento mostra também "Ao fim do plano". Corrige o relato "não mostrou": a projeção antiga ficava no fim da aba e só aparecia com semestres no plano.
  - **"Quantas disciplinas por semestre?"** (1 a 12, padrão 5) substitui o campo de limite de créditos. O botão Sugerir escolhe essa quantidade, **das que mais liberam outras do curso**; cada disciplina do plano mostra "libera N". O limite de 30 créditos continua como teto interno.
  - **Conflito de horário: não implementado.** O PDF do currículo não tem horários de turma; sem esses dados não há como garantir ausência de conflito. A nota da sugestão avisa isso. Ver pendências.
  - 262 testes (26 novos).
- 17/11/2026 — **Seis melhorias do UX do Planejamento** (sugeridas a partir do revisor e aprovadas pelo usuário; conflito de horário descartado, fica só o aviso):
  1. Semestres **em colunas** lado a lado.
  2. **Linhas enxutas** com × pequeno no lugar do botão "Remover" repetido.
  3. **Medidor de créditos** por semestre, com marcas em 16 e 30.
  4. **Busca de disciplina** com "libera N", no lugar da lista suspensa longa.
  5. **Montar plano até o fim** (domínio: `montarPlano`, testado nos dados oficiais) e uma linha de situação do plano.
  6. **Nome real do semestre** (2027.1…): nova opção `semestreInicial`, salva e importada com validação.
  - 318 testes. Medido no navegador: contraste nos dois temas (5,2 e 6,6; o × 7,4 e 7,7), alinhamento das colunas, e no celular uma coluna sem rolagem horizontal, com alvos de 44 px.
  - Falha de gravação transitória do sistema de arquivos durante uma edição em lote duplicou duas linhas de código; foi achada pelo verificador de tipos e corrigida.
- 17/11/2026 — **Estágio fora dos 30 créditos, legenda sóbria e site do PET** (pedidos do usuário):
  - **Decisão D3:** o estágio (30 aulas no PDF) não conta no limite de créditos do semestre; cabe com TCC II e optativas. Campo `foraDoLimiteDeAulas`. **Correção:** eu havia afirmado, na resposta anterior, que o estágio "fica sozinho no semestre"; estava errado, e o código e os testes foram corrigidos. Ver [regras §11](regras-de-negocio.md).
  - **Legenda** com só as seis cores do original; **símbolos** removidos dos selos.
  - 330 testes.
  - **Site do PET:** https://petecv.ufsc.br é **WordPress 6.8** (tema VW Education Lite; plugins Smart Slider 3 e Page Links To). A página "Downloads" lista o Currículo Interativo antigo. Nada foi alterado no site.
- 18/11/2026 — **Publicação preparada** (etapa 6): o usuário escolheu hospedar no GitHub Pages e linkar na página Downloads do site do PET.
  - Cabeçalho: "Última atualização: dd/mm/aaaa" (data do build, gravada pelo Vite), no lugar do rótulo do currículo; o currículo usado continua dito no rodapé.
  - Fluxo `projeto/.github/workflows/publicar.yml` (testa e publica no Pages) e `scripts/exportar-publicacao.mjs` (pasta limpa, 1 commit assinado pelo PET, sem `referencias/` nem a lógica descompilada; `--atualizar` para as próximas vezes). Validado em pasta limpa: 334 testes e build ok.
  - Guia passo a passo: [publicacao.md](publicacao.md). **Falta o usuário:** criar a conta e o repositório no GitHub, enviar a pasta, ligar o Pages e editar a página Downloads do WordPress.
- 18/11/2026 — **Publicado no GitHub Pages** (`petecvufsc/curriculo-interativo`, fluxo verde em 54 s) e linkado na página Downloads do site do PET (primeira linha da tabela "Currículo Interativo"). Revisão de UX/UI do app publicado (visual, só em desktop) e melhorias aplicadas a pedido do usuário:
  - **Decisão D4:** o tema é sempre o claro, mesmo com o aparelho em modo escuro (a regra `prefers-color-scheme` saiu; o conjunto escuro fica guardado atrás de `data-theme="dark"`).
  - "Como funciona o planejamento" abre só na primeira vez; depois do primeiro plano não volta a abrir sozinho (marca no navegador).
  - Campo do primeiro semestre: exemplo "Ex.: 2027.1" em cinza escuro, para não parecer desativado.
  - Painel lateral: "Disciplinas disponíveis" só aparece depois de Simular; antes, a dica fica junto do botão.
  - Alvos de toque: em telas de toque já eram de 44 a 48 px; no computador ficaram como estavam (24 px ou mais, WCAG 2.2 AA). Não medido no celular desta vez.
  - 337 testes, build ok. **Falta enviar:** `git push` na pasta de publicação.
- 18/11/2026 — **Versões das regras de pré-requisito (decisão D5).** Comunicado da Coordenação (repassado pelo CALEC; o usuário confirmou que é oficial): ECV2501, ECV2505, ECV2932 e ECV2704 ganham pré-requisitos novos, e a entrada em vigor foi **adiada de 2027.1 para 2028.1** pelo NDE e pelo Colegiado.
  - **Problema encontrado:** `ecv-2020-1.json` (transcrito do PDF) já trazia os pré-requisitos **novos**, então o app os aplicava a todos desde já, ao contrário da decisão da Coordenação.
  - **Solução:** caixa seletora "Regras de pré-requisitos" com **2020.1** (atuais, padrão) e **2028.1** (novos). Os dados do JSON ficam como estão (= 2028.1); a versão 2020.1 troca as quatro disciplinas pelos pré-requisitos antigos do comunicado (`dominio/curriculos/versoes.ts`). A escolha vai em `opcoes.versaoRegras`, é salva no navegador e exportada. Arquivos antigos, sem o campo, abrem em 2020.1.
  - Aviso na tela, na Ajuda e no seletor: "A partir de novembro de 2027, apenas a versão 2028.1 estará disponível".
  - **Fim automático da versão 2020.1:** a data de corte é `DATA_FIM_VERSAO_2020_1 = '2027-11-01'` em `dominio/curriculos/versoes.ts`. A partir dela, pela data do aparelho, o app oferece só a 2028.1 e aplica a 2028.1 mesmo a quem tinha a 2020.1 salva (o histórico não muda); o aviso passa a dizer que a 2020.1 foi encerrada. **A data é aproximada (pedido do usuário); confirmar com a Coordenação e, se mudar, editar só essa constante.** Quem tiver o aparelho com data errada vê a versão correspondente a essa data.
  - Sem regra de transição por semestre: o aluno escolhe a versão (decisão do usuário). Quem já foi aprovado não é afetado.
  - **Defeito antigo corrigido:** `serializar` gravava só 2 das opções; "disciplinas por semestre" e "primeiro semestre" se perdiam ao recarregar e ao exportar. Agora grava todas, com teste de ida e volta.
  - **O planejamento usa as regras de cada período (pedido do usuário, após a pergunta sobre um calouro planejar até o fim do curso):** cada semestre do plano é avaliado, sugerido e montado com os pré-requisitos do seu nome: até 2027.2, os atuais; de 2028.1 em diante, os novos (`versaoDoSemestre`, `MotorDoPlano`). A caixa seletora continua valendo só para a grade e a simulação.
  - **Nome do semestre obrigatório e fixo:** o "primeiro semestre do plano" deixou de ser texto livre e opcional; é uma lista (AAAA.1 / AAAA.2, do semestre anterior ao próximo do calendário até 8 depois). Sem escolha, vale o próximo do calendário, que é gravado na primeira alteração do plano (não "anda" depois). Os demais semestres são nomeados em sequência e não podem ser renomeados.
  - Aviso na coluna do primeiro semestre com os novos pré-requisitos ("A partir daqui valem os novos pré-requisitos") e nota no topo do planejamento. Nomes acessíveis dos botões voltaram a usar só o número ("semestre 3"); o nome real está no título.
  - 375 testes, build ok. Testes de interface do planejamento passaram a fixar a data (18/11/2026) para não depender do dia.
- 18/11/2026 — **Mover disciplina, grade oficial e plano otimizado** (pedido do usuário, na ordem proposta):
  - **Mover entre semestres:** botão "Mover para…" em cada disciplina do plano (aparece ao passar o mouse ou focar; sempre visível no toque) e **arrastar** o cartão para outro semestre (HTML5 nativo; no celular vale o "Mover para…"). Nova operação `mover` no plano; o app reavalia e mostra "pré-requisito faltando", sem bloquear. Aviso "movida de 2027.1 para 2027.2" com **Desfazer**. Arrasto testado no navegador de verdade.
  - **Montar pela grade oficial** (`montarGradeOficial`): cada semestre traz as obrigatórias pendentes de uma fase (fases do PDF), a partir da **fase atual** do aluno (a seguinte à mais alta fase cumprida pelo menos pela metade; deduzida, mostrada na tela). As atrasadas entram com a fase atual; grupos que passam do limite de créditos ou dependem de outra do mesmo grupo se dividem. Usa os pré-requisitos de cada período (D5). Calouro: 10 semestres, sem problemas.
  - **Plano otimizado:** o antigo "Montar plano até o fim" foi renomeado; segue a quantidade de disciplinas por semestre (padrão 5 dá 14 semestres; com 8 dá 10, como a grade oficial). Rótulo: "sugestão da ferramenta, não considera a oferta de turmas".
  - **Oferta de turmas (informação do usuário):** só as **optativas** são oferecidas de forma intercalada, em .1 ou em .2; as obrigatórias são oferecidas todo semestre. Por isso o plano otimizado não precisa respeitar paridade nas obrigatórias; o aviso diz que as optativas costumam ser só em um dos semestres. O app **não** sabe qual optativa é oferecida em qual semestre.
  - 394 testes, build ok. **Falta enviar:** `git push` na pasta de publicação.
- 18/11/2026 — **Revisões de qualidade e documentos de passagem.**
  - **Caçador de bugs** (agente Sonnet, descrição em `docs/revisores/cacador-de-bugs.md`): 15 achados (0 críticos, 2 altos, 5 médios, 8 baixos). Relatório e **situação de cada correção** em [relatorio-cacador-de-bugs.md](relatorio-cacador-de-bugs.md). Corrigidos B-01 a B-09, B-12 a B-14; B-10 e B-11 ficam a confirmar/mantidos (D5). Principais: plano limitado a 15 semestres e 40 disciplinas por semestre; duas abas não se sobrescrevem mais; importar pede confirmação; aviso quando o navegador não salva; uso offline já na 1ª visita; códigos de outro currículo só no formato AAA9999 (máx. 500).
  - **Revisor de UX/UI** (`docs/revisores/revisor-ux-ui.md`): nota "bom", 3 ajustes feitos (lista "Mover para…" na linha da disciplina no celular, rótulos curtos da caixa de versão, aviso mais curto). Relatório: [relatorio-ux-ui.md](relatorio-ux-ui.md). Contraste medido: pior caso 5,05:1.
  - **Guias:** [passagem-de-bastao.md](passagem-de-bastao.md) (como o PET mantém a ferramenta sem a gente: acessos, backup no Drive, servidor, rotina) e [guia-para-agentes-novo-curso.md](guia-para-agentes-novo-curso.md) (como um agente monta o currículo de outro curso).
  - 417 testes, build ok. **Falta:** `git push` na pasta de publicação; `npm audit` (o ambiente bloqueou; rodar fora da sessão); confirmar a data de fim da versão 2020.1 com a Coordenação.

## Decisões
- 18/11/2026, decisão D5 — **Duas versões das regras de pré-requisito do currículo 2020.1:** 2020.1 (atuais, até 2027.2) e 2028.1 (novos, a partir de 2028.1), por escolha do aluno. Fonte: comunicado oficial da Coordenação (via CALEC). Exceção à D1 (PDF como fonte única) apenas para esses quatro pré-requisitos.
- 11/11/2026, decisão D1 — **A fonte de verdade das regras é o currículo oficial PDF 2020.1.** O conjunto do programa original fica só como referência para os testes de paridade e para documentar as divergências.
  - Consequências: pré-requisitos no formato do PDF, com grupos OU de grupos E, incluindo códigos antigos (que valem para históricos de alunos migrados); estágio ECV2000 com 540 h-a; ECV2504 e ECV2604 com 54 h-a; inclusão de ECV2905, ECV2906 e ECV2971–2974.
  - Contradições internas do PDF (critério provisório, até a coordenação confirmar):
    - ECV2932 e ECV2844: vale a coluna "Pré-Requisito", que é o campo estruturado (ECV2603 e ECV2402); o texto da ementa fica registrado como alerta.
    - ECV2974: o pré-requisito aponta para a própria disciplina. Fica marcado como dado inválido e é ignorado; o validador emite um alerta. A leitura provável (ECV2973) **não** é aplicada sem confirmação.

## Pendências (aguardando decisão)
- Escopo das funcionalidades novas (status reprovada/em andamento, planejamento de vários semestres, importação de histórico).
- Confirmar contradições do PDF: ECV2932, ECV2844, ECV2974.
- Regras de integralização ainda não implementadas: aproveitamento de até 270 h-a do currículo 1991.1 (alunos migrados) e validação por extensão (ECV2906/ECV2000). Hoje o ECV2906 conta como optativa comum de 108 h-a no progresso.
- Aprovação da arquitetura (web estática Vite + React + TS + PWA).

## Problemas identificados
- O original diverge do PDF em 5 pré-requisitos e em 3 cargas horárias/códigos (seção 4 da auditoria).
- O original pinta as cores na ordem do laço, então um pré-requisito direto pode aparecer como indireto (ex.: ECV2601).
- O repositório não é um repositório git.

## Próximas tarefas
- Primeiro commit (aguardando nome e e-mail para o git).
- Etapa 5: **aguardando o usuário** executar [roteiro-validacao.md](roteiro-validacao.md) no programa original e anotar as divergências. São 6 cenários; os resultados esperados foram calculados pelo oráculo do código descompilado.
- Etapa 6: publicação (GitHub Pages ou Netlify), que exige uma conta e um repositório remoto do PET.
- **Currículo 2027.1 (novo):** o usuário informou (17/11/2026) que o cabeçalho deve mostrar 2027.1 porque o novo currículo traz mudanças. O app hoje só tem os dados do **PDF 2020.1**; trocar só o rótulo diria 2027.1 com as disciplinas e pré-requisitos do 2020.1. **Aguardando o PDF do currículo 2027.1** (provável código 20271 no CAGR; o PDF não foi baixado por falta de autorização). Depois: transcrever, validar, comparar com o 2020.1 e decidir se o app mostra os dois (aluno do 2020.1 ou do 2027.1). O formato do arquivo salvo já tem `curriculoId`, o que ajuda.
- Conflito de horário na sugestão: **descartado pelo usuário** (17/11/2026). A nota da sugestão avisa que ela não o verifica.
- Acessibilidade: teste com leitor de tela real (NVDA ou VoiceOver); rodar axe ou Lighthouse antes de publicar; testar o modo de alto contraste do Windows.
- Visual: o usuário rever a versão sóbria; ajustes são só de CSS.
- Revisão de UX/UI, itens **não** aplicados (decisão de custo/benefício): hierarquia dos selos que dobram a altura do cartão; fases recolhíveis no celular; nomes "Cursada" e "Aprovada" para o mesmo conceito; explicar "h-a" em todo lugar (só na Ajuda).
- Revisão de contraste automatizada (ex.: axe) e teste com leitor de tela.

## Decisões técnicas de baixo risco
- Um único pacote npm com as pastas `src/dominio` (TypeScript puro) e `src/app` (React), em vez de workspaces. É mais simples para novos bolsistas, e a separação continua garantida pelas pastas.
- Validação do JSON feita à mão (5 regras), sem a biblioteca zod: uma dependência a menos.
- React e Vite só serão instalados na etapa 3. Hoje existem apenas as dependências de desenvolvimento usadas de fato.
- Fontes (17/11/2026): `@fontsource/barlow`, `@fontsource/barlow-semi-condensed` e `@fontsource/ibm-plex-mono` (licença SIL OFL), só o subconjunto latino. Motivo: identidade visual própria e funcionamento offline sem depender de CDN. Custo: cerca de 14 arquivos de fonte no build, dos quais o navegador baixa só os 7 usados.
- Skills de terceiros instaladas no usuário (fora do repositório): `find-skills`, `accessibility` e `accessibility-review`. Todas lidas antes da instalação, sem scripts.

## Registro de uso de modelos
- Fase 1: sessão principal Opus 5.5; sem subagentes (investigação sequencial, dependente de cada passo anterior).
- Etapa 1: transcrição do PDF delegada a um subagente **Sonnet medium** (cerca de 115 mil tokens). O resultado foi bom, mas teve **2 erros**: ECV2803 e ECV2903 marcadas como optativas, e ECV2903 com 54 h-a em vez de 72. Os dois foram detectados pela comparação automática com o original e pelo fechamento da carga horária, e corrigidos pela sessão principal. Lição: toda transcrição precisa de verificação automática; o validador e o relatório de divergências cumprem esse papel.
- Etapa 2: especificação escrita pela sessão principal (Opus) e implementação delegada a um subagente **Sonnet high** (cerca de 137 mil tokens), que produziu código limpo e 80 testes. A revisão (Opus) corrigiu a regra `viaAlternativa`: alternativas com códigos antigos faziam pré-requisitos reais parecerem opcionais. Também foram acrescentados 3 testes.
- Etapa 3: interface delegada a um subagente **Sonnet medium** (cerca de 112 mil tokens), com 9 testes. A verificação no navegador, feita pela sessão principal, encontrou dois problemas que o subagente não viu: nomes espremidos no desktop (página de 1850 px) e painel inacessível no celular. Os dois foram corrigidos pela sessão principal. Lição: interface só está pronta depois de vista no navegador, em mais de um tamanho de tela.
- Etapa 4: especificação (§10–12), PWA e verificação feitos pela sessão principal (Opus).
  - Domínio delegado a um subagente **Sonnet high** (cerca de 150 mil tokens, 101 testes).
  - Interface delegada a um subagente **Sonnet medium** (cerca de 169 mil tokens, 23 testes).
  - A verificação no navegador corrigiu a ordem das alternativas em "Falta" (o código antigo aparecia primeiro) e a mistura dos termos "aulas" e "créditos".
- Revisão de acessibilidade e redesenho (17/11/2026): feitos pela sessão principal, que passou a rodar em **Sonnet 5.5** por escolha do usuário. Sem subagentes: o trabalho dependia da medição contínua no navegador, e repassar esse contexto custaria mais do que fazer. Nenhum uso de Opus xhigh ou Fable.
- Revisão de UX/UI (17/11/2026): subagente **Sonnet high** (cerca de 149 mil tokens, 110 chamadas de ferramenta), somente leitura. O relatório foi objetivo e verificável; a sessão principal aplicou as correções e achou um erro de projeto próprio ao testar (o "Desfazer" restauraria o plano antigo), corrigido com teste.
