# Interface web (`src/app/`)

React 19 + Vite, CSS puro com custom properties. O domínio (`src/dominio`) não importa React; a UI só consulta o motor (`criarMotor`) e nunca reimplementa regras. O único currículo usado é `ecv-2020-1.json`.

## Estrutura

- `main.tsx`, `App.tsx`: entrada e composição (cabeçalho, grade, painel, rodapé, diálogos).
- `estado/motorEcv.ts`: currículo, motor, índices por código/fase, `rotuloCodigo`.
- `estado/useEstadoAluno.ts`: hook com `useReducer`. Estado: `registro` (`RegistroAluno`: status + plano + opções), `selecionada`, `modo` (`nenhum | relacoes | simulacao`), `aba` (`grade | planejamento`), `simulou`, `aviso` (resultado da importação). Derivados (memo): `aprovadas` (`aprovadasDe`), `base` (`baseSimulacao`, respeita `opcoes.cursandoComoAprovada`), `planejadas` (código → semestre), `destaques`, `simulacao`, `progresso` (os três últimos usam `base`).
- `estado/operacoesRegistro.ts` (status, checkbox de fase traduzido em `definirStatus`, limpar status, opções, validação de código externo), `estado/operacoesPlano.ts` (operações puras sobre `plano.semestres`), `estado/persistencia.ts` (`localStorage`), `estado/arquivo.ts` (exportar/importar).
- `estado/destaques.ts`: mapa código → destaque (tipo + `alternativa`) a partir do motor, e os rótulos dos selos.
- `componentes/`: `GradeDisciplinas` (colunas de fase + optativas), `CartaoDisciplina`, `PainelLateral` (totais, barras, botões, opção, externas, arquivo), `DetalheDisciplina`, `SituacaoHistorico`, `DisciplinasExternas`, `ArquivoRegistro`, `BarraProgresso`, `Abas`, `planejamento/*` (`VisaoPlanejamento`, `SemestrePlanejado`, `AdicionarDisciplina`, `MedidorCreditos`, `PrimeiroSemestre`, `QuantidadePorSemestre`, `ResumoDoPlano`, `textosPlano`), `Legenda`, `Dialogo` (`<dialog>` nativo), `Textos` (Ajuda e Sobre).
- `estilos/`: `tokens.css` (cores e fontes, claro e escuro), `base.css` (página, controles, diálogos), `grade.css` (fases, cartões, selos), `painel.css`, `planejamento.css`; `index.css` só importa os cinco, nessa ordem.
- `App.test.tsx`, `situacao.test.tsx`, `persistencia.test.tsx`, `planejamento.test.tsx` (auxiliares em `testeAuxiliar.ts`): testes de UI (jsdom por `// @vitest-environment jsdom`; os testes de domínio continuam em node).

## Comportamento

- Checkbox do cartão → `definirStatus(..., "aprovada" | "nao-cursada")` (cascata do motor, `docs/regras-de-negocio.md` §10). Checkbox da fase → `marcarFase`; fica marcado quando todas as obrigatórias da fase estão marcadas e indeterminado quando só algumas.
- Clicar no nome → modo relações (`preRequisitos`/`dependentes`; distância 1 = direto). Clicar de novo ou "Limpar destaques" limpa.
- "Simular" → modo simulação (disponíveis destacadas). Os totais de disponíveis só aparecem depois do primeiro "Simular" e depois acompanham as marcações; selecionar uma disciplina sai do modo, os totais ficam. Totais de cursadas e barras de progresso são sempre visíveis.
- Detalhe: tipo, fase, h-a, créditos, situação, "Falta: … / ou: …" para bloqueadas, pré-requisitos e equivalências com "e"/"ou" (códigos fora do currículo marcados "(currículo anterior)"), alertas em estilo de aviso e listas clicáveis de relações.

## Identidade visual: sóbria, na linha do programa original

Depois de uma primeira versão estilizada ("prancha técnica", com malha, hachuras e sombras duras), o usuário pediu uma interface **mais limpa, sóbria e profissional, que remetesse à versão antiga**. A versão atual mantém a estrutura do programa original e melhora alguns pontos:

| Mantido do original | Melhorado |
|---|---|
| Fundo cinza-claro neutro | Verde institucional (#0E7B5F) só nas faixas de título e nas ações principais |
| Uma faixa verde por fase, com a caixa de "marcar a fase" à esquerda do título | A caixa mostra o estado parcial (alguns marcados) |
| Listas simples de disciplinas, sem molduras pesadas | Cada disciplina tem o código e uma caixa "cursada" com área de clique de 28 px |
| Cores com o mesmo significado: azul (selecionada), verde (pré-requisito), vermelho e laranja (trancadas), verde-escuro (disponível) | Cada destaque também tem um **selo com o nome escrito** ("Pré-requisito direto"…), sem símbolos e sem depender só da cor |
| Painel de totais e botões à direita, legenda no rodapé | Barras de progresso da integralização, detalhes da disciplina e explicação do que falta |
| Tela fixa de 10 colunas | Responsivo; tema escuro neutro |

**Tipografia:** Source Sans 3 (pesos 400, 600 e 700), empacotada no app (licença SIL OFL, só o subconjunto latino, funciona offline), pacote npm `@fontsource/source-sans-3`. É uma humanista neutra, parecida com a Segoe UI do original, e estreita o bastante para os nomes caberem.

### Nomes de disciplina nunca quebram nem são hifenizados

Pedido do usuário. O tamanho do nome **acompanha a largura do cartão** (`font-size: clamp(11.5px, (100cqw − 4px) / 8.7, 14.5px)`, em `grade.css`), e a largura mínima da coluna (125 px) garante que a palavra mais longa caiba inteira. A medida vem do navegador: a palavra mais longa ("Geoprocessamento") ocupa **8,29 vezes** o tamanho da fonte; o divisor 8,7 dá cerca de 5 % de folga. `hyphens: none` e `overflow-wrap: normal` impedem qualquer quebra no meio. Medição em 320, 800, 1100, 1280, 1366, 1440 e 1920 px: **nenhuma palavra estoura**; a fonte varia de 11,8 a 14,5 px.

Limite conhecido: em telas de 1366 px o nome fica em torno de 11,8 px para manter as 10 fases em uma linha, como no original; em 1440 px, 12,6 px; em telas estreitas, 14,5 px.

## Tokens (`estilos/tokens.css`)

Superfícies e texto (`--fundo`, `--superficie`, `--superficie-2`, `--texto`, `--texto-suave`, `--borda`, `--borda-forte`, `--foco`), faixa e ação principal (`--faixa-bg`, `--primario-bg`, `--primario-tx`) e, por destaque, cor forte (`--sel`, `--pre`, `--pre2`, `--tr`, `--tr2`, `--disp`), tinta de fundo (`--*-tinta`) e texto do selo (`--*-tx`). O tema escuro redefine os tokens por `prefers-color-scheme`.

## Acessibilidade

A revisão completa, com medições e correções, está em [acessibilidade.md](acessibilidade.md). Resumo do que a interface garante:

- Significado nunca só pela cor: fundo, barra lateral e selo com o nome do destaque escrito.
- Relação via alternativa: borda tracejada e selo "alternativa".
- O nome da disciplina é `<button aria-pressed>`; as caixas têm rótulo próprio, inclusive a de cada fase.
- Atalhos "Pular para as disciplinas" e "Pular para o resumo e as ações", porque a grade tem cerca de 200 paradas de Tab.
- Alvos de clique de 24 px ou mais no mouse e de 44 px ou mais no toque.
- Contraste de texto medido em todos os estados, nos dois temas: o pior caso é 5,2:1 (mínimo AA: 4,5:1).
- Foco visível, diálogos em `<dialog>` modal (Esc fecha, o foco volta à origem), `prefers-reduced-motion` e `forced-colors` respeitados.

## Layout

A página nunca tem rolagem horizontal.

| Largura | Layout |
|---|---|
| ≥ 1620 px | 10 colunas e painel lateral de 290 px, fixo (sticky) à direita. |
| 1100–1619 px | Até 10 colunas (mínimo de 125 px cada; margem direita de 31 px reservada para a aba, e as 10 colunas ainda cabem em 1366 px). Painel em **gaveta à direita** (340 px). Com a gaveta aberta, a página reserva 352 px à direita (nada fica coberto) e, de 1362 px para cima, a grade mantém as 10 colunas e **rola na horizontal** dentro do próprio espaço. |
| 768–1099 px | Fases em grade que quebra linha, em ordem; barra no topo; gaveta que **sobe de baixo** (até 55% da altura) e a página rola para a disciplina clicada ficar acima dela. Sem aba. |
| < 768 px | Fases empilhadas, margem de 16 px; barra fixa **embaixo** e painel em gaveta que **sobe de baixo** (até 85% da altura). |

**Gaveta do painel (< 1620 px).** Antes o painel caía para depois da grade inteira e, em notebooks (1366–1536 px), ficava escondido. Revisões: [relatorio-ux-gaveta.md](relatorio-ux-gaveta.md) e [relatorio-ux-gaveta-2.md](relatorio-ux-gaveta-2.md). Agora:
- **Um controle por aparelho.** Em computador com mouse (`hover: hover` e `pointer: fine`), de 1100 a 1619 px, quem abre a gaveta é a **aba verde da borda direita** (30 × 184 px, ícone e "Resumo e ações" na vertical); o botão da barra some. Ao passar o mouse **ou focar pelo teclado**, a aba **não muda de forma** (mudar de forma sob o cursor fazia piscar) e um rótulo "Abrir resumo e ações" desliza para fora dela, à esquerda, em 180 ms; o rótulo faz parte do botão (passar o mouse nele mantém, clicar nele abre) e some com 150 ms de atraso. Esc recolhe o rótulo. Durações e curva vêm dos tokens `--dur-rapida`, `--dur-media` e `--curva-saida`. É um botão de verdade (`aria-expanded`, `aria-controls`), na ordem de Tab logo após a barra. Em telas de toque (inclusive tablets grandes) e abaixo de 1100 px, a aba some e vale o botão verde **"Resumo e ações"** da barra (contornado, com ícone; no celular, com uma disciplina escolhida, vira "Ver detalhe da disciplina").
- **Dica de primeira visita:** um balão ligado ao controle visível ("Seu resumo, Exportar, Importar e o detalhe das disciplinas ficam em Resumo e ações"), com "Entendi". Some de vez (guardado no navegador) ao clicar em "Entendi" ou quando a gaveta abre pela primeira vez.
- **Gaveta aberta em notebook:** a página, o cabeçalho e a barra reservam a largura da gaveta, então nada fica por baixo dela (inclusive o "Desfazer" do aviso de ação). A grade rola na horizontal (1362–1619 px); na barra, **setas** ◀ ▶ (44 px) rolam três fases por vez e dizem "Fases 4 a 10 de 10"; as bordas da grade esmaecem do lado em que há mais fases; o Tab até uma disciplina meio escondida a traz inteira à vista. A roda horizontal do mouse e Shift+roda também rolam. Enquanto a gaveta está aberta, o "Simular" da barra dá lugar às setas (o da gaveta basta).
- No celular a barra mostra a porcentagem curta ("12%").
- Em notebook e tablet (≥ 768 px), **clicar no nome de uma disciplina abre a gaveta já no detalhe dela**, sem tirar o foco da grade. No celular, não abre sozinha (cobriria a grade). No detalhe, "↑ Ver o resumo" leva ao topo da gaveta.
- A gaveta **não é modal**: a grade segue clicável (escolher outra disciplina atualiza o detalhe).
- Fecha com **Fechar**, com **Esc** (com o foco na gaveta ou na grade) ou pelo botão da barra; o foco volta ao controle visível (aba ou botão). Fechada, fica fora da tela e do teclado (`inert`).
- O atalho "Pular para o resumo e as ações" abre a gaveta.
- Os pontos de corte ficam em `src/app/estado/useMidia.ts` e precisam bater com `base.css` e `painel.css`.

- **Cabeçalho:** título, **Ajuda** e **Sobre** (antes ficavam no fim do painel, a mais de 1500 px do topo).
- **Acima da grade (aba Grade):** uma linha que explica os dois gestos do cartão ("clique no **nome** para ver pré-requisitos; marque a **caixa** das que você já cursou") e a **legenda**, com as mesmas seis cores do programa original (Selecionada, Pré-requisito direto e indireto, Tranca diretamente e indiretamente, Disponível), sem símbolos. Sai do rodapé, onde ninguém a via. Cursada, Cursando, Reprovada, Planejada e "alternativa" não entram na legenda: já vêm escritos nos próprios cartões.
- **Aviso de ação:** quando marcar ou desmarcar mexe em várias disciplinas ("Marquei também 19 pré-requisitos de…"), ou quando se muda a situação no histórico, um aviso acompanha a rolagem e oferece **Desfazer**. O desfazer some se o plano, as opções ou o histórico inteiro mudarem depois, porque restauraria o registro antigo por cima.
- **Cartão:** o nome ocupa a largura toda; a caixa fica na linha do código, logo abaixo. As horas-aula ficam nos detalhes e nos totais.
- **Barra de ações (< 1620 px):** "Simular" (só na aba Grade), o percentual integralizado e o botão que abre a gaveta do painel. No topo de 768 a 1619 px; embaixo no celular.
- **Botões do painel:** "Limpar seleção" tem estilo de perigo e fica afastado de "Limpar destaques" (um apaga o histórico, o outro só tira as cores). "Remover semestre" pede confirmação quando há disciplinas.
- **Zoom de 200% e reflow a 320 px:** sem rolagem horizontal.

## Integralização do curso (%)

Um resumo fixo no topo da página (grade e planejamento) mostra "**39,8% integralizado — 1.800 de 4.518 h-a**" com uma barra. Na aba Planejamento, a barra ganha um trecho hachurado com o que o plano acrescenta e a linha "Ao fim do plano: 45,8% (+6,0 pontos)"; com o plano vazio, o resumo convida a montar um. Na barra fixa do celular, aparece "% integralizado". O cálculo é do domínio (`progresso().geral`, [regras §8](regras-de-negocio.md)).

## Planejamento

A aba traz um "Como funciona o planejamento", **aberto enquanto o plano está vazio** e fechado depois.

**Controles**
- **Quantas disciplinas por semestre?** (1 a 12, padrão 5): quantas o botão Sugerir escolhe, começando pelas que mais liberam outras do curso.
- **Primeiro semestre do plano** (opcional, "2027.1"): dá nome real aos semestres (2027.1, 2027.2, 2028.1…). Formato inválido mostra o erro e não muda nada.
- **Montar plano até o fim:** propõe todos os semestres até cobrir as obrigatórias. Pede confirmação se já houver um plano.
- **+ Adicionar semestre** e **Limpar plano** (estilo de perigo).
- Uma linha de **situação do plano**: número de semestres (e o intervalo, se houver nome), "Cobre todas as obrigatórias", "Faltam 432 h-a de optativas, que você escolhe" e quantas disciplinas estão com pré-requisito faltando.

**Cada semestre é uma coluna** (até 300 px de largura, lado a lado, quebrando de linha quando falta espaço; uma coluna no celular):
- título e botões em duas linhas, iguais em todas as colunas;
- **medidor de créditos** com marcas nos limites do PDF (16 e 30), o texto da faixa ("Dentro da faixa de 16 a 30 créditos", "Abaixo do mínimo…", "Acima do máximo…") e `role="meter"`;
- **linhas enxutas:** nome, código, créditos e "libera N" (quantas outras disciplinas dependem dela), com um **×** pequeno para remover (nome acessível completo: "Remover <nome> do semestre n");
- **+ Adicionar disciplina:** busca por nome ou código, sem diferenciar acentos nem maiúsculas. Sem texto, mostra as 6 que mais liberam outras do curso; com texto, até 12. Obrigatórias antes das optativas (com etiqueta "Optativa").

**Sem conflito de horário:** a nota da sugestão diz que ela não verifica horários nem a oferta do semestre.

## Etapa 4: situação, persistência e planejamento

Regras: `regras-de-negocio.md` §10 (status), §11 (planejamento) e §12 (registro). A UI só chama as APIs de `src/dominio/aluno` e `src/dominio/planejamento`.

### Situação no histórico
- No bloco "Disciplina selecionada": `role="radiogroup"` "Situação no histórico" com radios nativos (as setas do teclado trocam a opção): Não cursada · Aprovada · Cursando · Reprovada. O item marcado é preenchido e recebe "✓" (não depende só de cor). Aciona `definirStatus`.
- Cartões: caixa marcada = aprovada; selos de texto "Cursando", "Reprovada" e "Planejada (S<n>)" (tokens `--selo-cursando`, `--selo-reprovada`, `--selo-planejada`, texto branco, com variantes no tema escuro).
- Painel: caixa "Considerar disciplinas em andamento como aprovadas" (`opcoes.cursandoComoAprovada`). Simulação, destaques e progresso usam `baseSimulacao(registro)`.
- `<details>` "Disciplinas de outro currículo": código `AAA9999` (maiúsculas, espaços ignorados), validação com mensagem em `role="alert"`; códigos do currículo atual e repetidos são recusados. A lista tem "Remover". Entram como status `aprovada` e satisfazem alternativas e equivalências.

### Persistência
- `lerRegistroSalvo()` (inicialização do reducer) usa `carregar()`; dado ausente ou inválido vira registro vazio. `usePersistencia` grava com atraso de 300 ms em `CHAVE_LOCAL_STORAGE`, e na hora ao desmontar ou em `pagehide`. Todo acesso ao `localStorage` está em `try/catch`: sem armazenamento (modo privado), o app funciona e só não lembra. `atualizadoEm` é carimbado ao gravar e ao exportar.
- "Exportar (.json)": `serializar()` em Blob + `a[download]`, arquivo `curriculo-ecv-AAAA-MM-DD.json` (data local).
- "Importar": `<input type="file" accept=".json,application/json">` dentro de um rótulo com aparência de botão (foco visível via `:focus-within`). Se válido, substitui o registro e mostra as linhas do relatório; se inválido, mostra o erro (`role="alert"`) e mantém os dados. O aviso tem "Fechar aviso".
- "Limpar seleção" pede `window.confirm` e apaga só o status (inclusive de outro currículo); o plano é mantido. "Limpar plano" (no planejamento) também confirma quando há semestres.

### Abas e planejamento
- Abas "Grade" | "Planejamento" no topo da área principal (`role="tablist"`, setas, Home e End; só o painel ativo é montado). "Simular" (painel e barra de ações) volta para a Grade.
- Planejamento: limite de créditos (1–40, `opcoes.limiteAulas`), "+ Adicionar semestre", "Limpar plano" e, por semestre ("Semestre 1 (próximo)", "Semestre 2", …): lista com remover, problemas de `avaliarPlano` em texto ("Falta: A e B" / "ou: C" com nomes, "Já cumprida", "Repetida no plano", "Fora do currículo"), total "N créditos · H h-a", avisos ("Acima do máximo de 30 créditos", "Abaixo do mínimo de 16 créditos"), "Sugerir" (`sugerirSemestre` sobre `baseDoSemestre`, com confirmação se o semestre não está vazio) e um `<select>` agrupado (Obrigatórias por fase, Optativas) alimentado por `disponiveisNoSemestre`, mais o botão "Adicionar". A sugestão é rotulada como automática e para conferir com a coordenação e o CAGR.
- "Integralização projetada ao fim do plano": as mesmas barras do painel (`BarraProgresso`) com `progressoProjetado`.
- Celular (375 px): semestres em coluna única, controles quebram linha, sem rolagem horizontal; a barra de ações fixa continua valendo.
## Diferenças em relação ao original

- Fontes 13 px+ (original: 6–7 pt); selos de texto no lugar de cores de texto; checkbox de fase indeterminado; classificação direto/indireto pela menor distância (correção do motor); indicação de "alternativa"; detalhe com situação, "faltantes", equivalências e alertas; barras de progresso; modais acessíveis; tema escuro; interface responsiva.
- Dados exclusivamente do PDF 2020.1 (decisão D1), não do programa original.
