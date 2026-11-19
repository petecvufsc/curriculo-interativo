# Segunda revisão da gaveta: rolagem da grade e botão duplicado

Data: 19/11/2026. Feito no navegador embutido, sem alterar o código do app. O CSS de teste foi injetado pelo console e removido no fim. Larguras testadas: 1366x768, 1536x864 e 1100x800.

## Resumo

1. **Rolagem horizontal só da grade (opção a) funciona e é a melhor resposta à queixa.** Com a gaveta aberta, a grade fica num contêiner que rola. Mantém as 10 colunas de 125 px, nenhum nome cortado (0 de 96), nenhuma rolagem horizontal da página.
2. **Mas ela não mostra mais colunas de uma vez.** Em 1366 px cabem 7 de 10 (com gaveta de 340 ou de 400). Em 1536 px, 8 de 10. O ganho é poder **chegar** à 9ª e à 10ª fase sem fechar a gaveta.
3. **Dois ajustes são obrigatórios para a rolagem ser usável:** setas na barra fixa (a barra de rolagem nativa fica a 1250 px do topo, fora da tela) e rolar por código quando o foco do teclado cai numa coluna só parcialmente visível (medi que o Chrome não rola nesse caso).
4. **Botão duplicado:** recomendo **um controle por tipo de aparelho**. Mouse (`hover:hover` e `pointer:fine`) de 1100 a 1619 px: só a aba da borda, que se expande ao passar o mouse ou receber foco. Toque, teclado puro em telas sem hover e abaixo de 1100 px: só o botão da barra.
5. **Problema novo, de gravidade alta:** com a gaveta aberta, o botão **Desfazer** do aviso de ação fica **coberto pela gaveta** (medi: o elemento no ponto do botão é a gaveta). Reservar a largura da gaveta resolve.

## 1. Rolagem horizontal da grade

### Como medi
Gaveta aberta, CSS temporário por variante, `scrollLeft` em 0, colunas inteiras visíveis = colunas cujo retângulo cabe entre o início do contêiner e a borda esquerda da gaveta.

### Resultados

Variantes: **base** = hoje; **a400** = reservar 412 px, grade rola; **a340** = gaveta de 340 px e reserva de 352 px, grade rola; **a320** = 320 px e 332 px; **c400** e **c340** = só reservar espaço e deixar a grade quebrar em linhas.

| Tela | Variante | Colunas inteiras à vista | Colunas cobertas pela gaveta | Altura da grade | Nomes cortados | Rolagem horizontal da página |
|---|---|---|---|---|---|---|
| 1366x768 | base (hoje) | 7 | 3 (8ª, 9ª e 10ª) | 674 px | 0 | não |
| 1366x768 | a400 | 7, e 10 px da 8ª | 0 (rola) | 700 px | 0 | não |
| 1366x768 | a340 | 7, e 58 px da 8ª | 0 (rola) | 700 px | 0 | não |
| 1366x768 | a320 | 7, e 78 px da 8ª | 0 (rola) | 700 px | 0 | não |
| 1366x768 | c400 / c340 | 10 (7 por linha, 2 linhas) | 0 | 979 / 1008 px (+45%) | 0 | não |
| 1536x864 | base | 8 | 2 (9ª em parte e 10ª) | 682 px | 0 | não |
| 1536x864 | a400 | 8 | 0 (rola) | 700 px | 0 | não |
| 1536x864 | a340 | 8, e 109 px da 9ª | 0 (rola) | 700 px | 0 | não |
| 1536x864 | a320 | **9** (por 4 px de folga, frágil) | 0 (rola) | 700 px | 0 | não |
| 1536x864 | c400 / c340 | 10 (8 por linha, 2 linhas) | 0 | 994 / 1020 px (+42%) | 0 | não |
| 1100x800 | base | 7 (a grade já quebra: 8 colunas, 2 linhas) | 3 | 971 px | 0 | não |
| 1100x800 | a400 / a340 / a320 | 5 | 0 (rola) | 700 px | 0 | não |
| 1100x800 | c400 / c340 | 10 (5 por linha, 2 linhas) | 0 | 1307 / 1349 px (+35%) | 0 | não |

Contas: 7 colunas = 7x125 + 6x6 = 911 px; 8 = 1042; 9 = 1173; 10 = 1304 (mais 12 px de margem). Para 8 colunas em 1366 px a gaveta precisaria ter cerca de 273 px, estreita demais; para 10, nenhuma gaveta cabe.

### Teste de uso

- **Mouse:** rolagem horizontal da roda sobre a grade levou `scrollLeft` de 0 a 377 (o máximo) numa ação. Shift+roda não pude simular (o simulador só envia rolagem horizontal direta), mas o Chrome converte Shift+roda no mesmo movimento. Rolagem vertical da roda sobre a grade continua rolando a página (`scrollY` 0 a 300), porque o contêiner não tem excesso vertical.
- **Barra de rolagem nativa:** fica na base do contêiner, em y=1226 a 1248 (a grade começa em y=526 e tem 700 px). **Fora da primeira tela de 768 px.** O aluno que não souber usar Shift+roda ou o touchpad não a encontra. Por isso as setas (seção 1.2).
- **Teclado, caso 1 (coluna totalmente escondida):** `focus()` num cartão da 10ª fase rolou a grade até o fim (`scrollLeft` 377) e o cartão ficou à vista. Bom.
- **Teclado, caso 2 (coluna parcialmente visível), problema real:** com Tab, o foco foi para um nome da 8ª fase, que aparecia só 78 px de 104. A grade **não rolou** (`scrollLeft` continuou 0) e o nome ficou cortado, com o anel de foco incompleto. Isso fere a WCAG 2.4.11 (foco não oculto). Com um ouvinte `focusin` que rola a fase para a vista, o `scrollLeft` foi a 35 e o nome ficou inteiro (borda direita 1010, contêiner 1019).
- **Layout não pula ao abrir:** com a gaveta em 340 px e reserva de 352 px, o topo da grade ficou em y=526, igual ao estado fechado. Com 400 px, ela desceu 21 px (o cartão de regras ganhou uma linha). As colunas não mudam de lugar, então a disciplina que o aluno acabou de clicar não se mexe. Nas variantes c (reorganizar em linhas), as fases 6 a 10 mudam de lugar ao abrir.
- **Gaveta de 300 a 340 px:** o conteúdo cabe (`scrollWidth` igual a `clientWidth` em 400, 340, 320 e 300 px; nenhum botão com texto estourado). O painel fixo de 290 px que já existe acima de 1620 px prova o mesmo.

### Comparação das opções

**(a) Reservar a largura da gaveta e rolar só a grade**
- Prós: as 10 colunas e os nomes inteiros ficam como estão. A disciplina clicada não se move. Resolve o Desfazer coberto. A grade deixa de ficar escondida atrás da gaveta; ela passa a ser alcançável. Só CSS mais um pouco de JS.
- Contras: não mostra mais colunas do que hoje em 1366 px (7 de 10). Exige indicação visual de que há mais colunas. A barra de rolagem nativa fica fora da tela. Exige o ajuste de foco do teclado.

**(b) Gaveta mais estreita (320 a 340 px), sozinha**
- Prós: simples. O conteúdo cabe.
- Contras: em 1366 px não muda nada em colunas inteiras (7); só aparece uma fatia maior da 8ª. Em 1536 px, 340 px dá 8 e 320 px dá 9 com 4 px de folga. Não resolve a queixa sozinha.

**(c) Grade em duas linhas com a gaveta aberta**
- Prós: nada fica escondido nem exige rolagem horizontal.
- Contras: a grade cresce 35% a 45% em altura e as fases deslocadas ficam longe do lugar de antes. Ao clicar uma disciplina, a gaveta abre e as fases 6 a 10 mudam de posição (o aluno perde o lugar). Quebra a leitura "fase 1 a fase 10 da esquerda para a direita".

**(d) Outras, rejeitadas**
- Gaveta que muda de lado (esquerda ou direita conforme onde o aluno clicou): o conteúdo coberto muda toda hora. Confunde mais que ajuda.
- Gaveta sem reserva, só com rolagem automática: a página não pode rolar na horizontal e o destaque de pré-requisitos ficaria coberto.

### Recomendação

**(a) com gaveta de 340 px (junto com (b)), setas na barra, esmaecimento nas bordas e rolagem por foco. Abaixo de 1362 px de largura, usar (c) em vez de (a).**

Por quê (c) abaixo de 1362 px: a grade fechada já quebra em linhas nessa faixa (em 1100 px são 8 colunas em 2 linhas). Com rolagem horizontal, abrir a gaveta faria a grade passar de 2 linhas para 1 linha de 10 colunas, um salto grande. Com reserva e quebra normal, ela só passa de 8 para 5 colunas por linha.

### Especificação para implementar

1. **Gaveta**: `width: min(340px, 92vw)` de 1100 a 1619 px (hoje 400 px).
2. **Reserva de espaço**: quando a gaveta está aberta de 1100 a 1619 px, `.corpo { padding-right: 352px }` (340 + 12). Usar uma classe no `.corpo` (por exemplo `corpo--gaveta-aberta`) colocada pelo React, em vez de `:has()`. A alça já sai de cena nesse estado. Isso também resolve o Desfazer coberto (item U2-01 abaixo).
3. **Grade que rola, só de 1362 px para cima e só com a gaveta aberta** (1362 = 12 + 1304 + 31 + 15 de barra de rolagem; é onde as 10 colunas cabem fechadas):
   ```css
   .corpo--gaveta-aberta .fases {
     grid-template-columns: repeat(10, 125px);
     overflow-x: auto; overscroll-behavior-x: contain;
     padding: 2px 2px 12px; margin: -2px; /* não cortar sombra nem anel de foco */
   }
   ```
   Fechada, nada muda (as colunas de 125 a 129 px só viram 125 px fixos ao abrir; diferença de até 4 px por coluna).
4. **Setas na barra fixa** (a barra já é fixa no topo de 768 a 1619 px e tem espaço: em 1366 px sobram cerca de 700 px livres). Mostrar só na aba Grade, com a gaveta aberta, quando `scrollWidth > clientWidth` da grade:
   - `◀` e `▶`, cada um **44 x 44 px**, com `aria-label` "Ver fases anteriores" e "Ver mais fases", desabilitados nas pontas.
   - Texto entre as setas: "Fases 1 a 7 de 10" (atualizado em evento `scroll`; texto comum, sem `aria-live`).
   - Clique: `scrollBy({left: ±393, behavior: 'smooth'})` (3 colunas: 3 x 131 px). Com `prefers-reduced-motion`, sem animação.
   - Atenção: a barra é uma grade de 3 colunas (`auto auto 1fr`). Um quarto item quebra a linha (no meu protótipo a barra foi de 61 para 113 px). Acrescentar uma coluna ou colocar as setas num `div` na coluna do meio.
5. **Esmaecimento nas bordas**: uma faixa de 24 px com gradiente do fundo da página para transparente na borda direita do contêiner quando há mais à direita, e na esquerda quando já rolou. Ligar e desligar por classe no evento `scroll`. Fica visível mesmo sem a barra nativa. Não esconder nomes: o gradiente fica só nos 24 px de borda, e a coluna seguinte já aparece cortada (a "espiada" da 8ª coluna, de 58 px em 1366 px, já ajuda).
6. **Foco do teclado** (obrigatório): no contêiner, `onFocus` (ou `focusin`):
   ```js
   const f = fases.getBoundingClientRect(), c = alvo.closest('.fase').getBoundingClientRect();
   if (c.right > f.right) fases.scrollLeft += c.right - f.right + 8;
   else if (c.left < f.left) fases.scrollLeft -= f.left - c.left + 8;
   ```
   Rolar só na horizontal evita saltos verticais. O navegador já cuida do eixo vertical.
7. **Não rolar automaticamente ao clicar numa disciplina.** O que o aluno clica já está à vista, e a gaveta não tem links que selecionem outra disciplina (conferi `PainelLateral.tsx`: só botões de ação). Rolar ao clicar moveria a disciplina que ele acabou de escolher.
8. **De 1100 a 1361 px**: só a reserva de 352 px e a quebra normal em linhas (variante c340: 5 colunas por linha, 2 linhas, 1349 px de altura). Sem setas.
9. Testar depois: planejamento com a gaveta aberta (conferi com a reserva de 352 px em 1366 px: sem rolagem horizontal da página e sem conteúdo coberto), 125% de zoom, e Safari (`overscroll-behavior-x`).

## 2. Botão da barra e alça: duas pessoas, o mesmo trabalho

### O que existe hoje (1366 px)
- Botão na barra: 162 x 44 px, texto verde-escuro (#0A5C46) sobre verde-claro: contraste 6,56:1. Borda verde 5,23:1. Rótulo claro, perto de Ajuda e Sobre, no canto onde se procura menu. É o controle com `aria-expanded`, `aria-controls`, foco e Tab.
- Alça: 28 x 100 px, borda direita, no meio da altura (y=334). Branco sobre verde: 5,23:1. Texto "Resumo" na vertical. `aria-hidden`, `tabindex=-1`. Hover só leva a 36 px e mostra um rótulo flutuante de 148 x 32 px (não medi o hover de verdade: o simulador não dispara `:hover`).
- A dica de primeira visita aponta para o botão da barra e cobre a ponta direita do cartão "Integralização" (a barra de progresso).

### Problemas da duplicidade
- Dois controles com a mesma função e aparências diferentes, em lugares distantes. O aluno não sabe se são coisas diferentes.
- A alça some quando a gaveta abre e o botão fica "pressionado" (preenchido); o par não se comporta como um só.
- A alça é invisível para leitor de tela e teclado. A duplicidade, portanto, não prejudica a acessibilidade, mas a alça "não existe" para quem não usa mouse.
- No toque (tablet com teclado ou notebook com tela de toque, 1100 a 1619 px; iPad paisagem tem 1180 e 1366 px), não há `hover`: a alça fica com 28 px de largura (abaixo de 44) e só o texto vertical "Resumo".

### Opções

**A. Só o botão da barra; tirar a alça.**
- Prós: mais simples; um controle, bem rotulado, com todo o suporte de acessibilidade.
- Contras: perde a ideia que o dono gostou (algo que expande ao passar o mouse). A barra do notebook fica com o botão distante da grade, longe de onde os olhos estão.

**B. Só a alça; tirar o botão da barra.**
- Prós: fica perto da grade e da gaveta. Dá para expandir.
- Contras: 28 px é pouco para quem nunca viu. Sem hover (toque), vira só um ícone. Se a alça for a única, tem de ser focável e anunciada. A primeira visita fica mais difícil (o botão da barra com rótulo é mais fácil de achar do que uma aba pequena no meio da borda).

**C. Fundir num só: uma aba que se expande, mostrada só onde há mouse; o botão da barra só onde não há.** (recomendada)

### Recomendação (C), comportamento exato

| Aparelho | Controle visível | Controle oculto (`display: none`, sai do Tab e do leitor de tela) |
|---|---|---|
| 1100 a 1619 px com `(hover: hover) and (pointer: fine)` | **Aba da borda** | Botão da barra |
| 1100 a 1619 px sem hover ou com toque | Botão da barra | Aba |
| 768 a 1099 px | Botão da barra | Aba (já não existe) |
| menos de 768 px | Botão da barra, embaixo | Aba |
| 1620 px ou mais | Nenhum (painel fixo) | os dois |

A escolha é por CSS (`@media`), sem JS, e os dois ficam no HTML. `display: none` tira o oculto do leitor de tela e do Tab, então **ninguém ouve dois botões**.

**A aba (mouse), especificação:**
- É um `<button>` real, na ordem de foco **logo depois da barra** (antes da grade). `aria-expanded`, `aria-controls="painel"`, `aria-label="Resumo e ações"` fixo; **tirar `aria-hidden` e `tabindex=-1`**.
- Recolhida: **28 px de largura (igual a hoje, para caber na reserva de 31 px; uma aba de 36 a 40 px tiraria a 10ª coluna em 1366 px, pois 12 + 1304 + 40 = 1356 > 1351)** e **140 px de altura** (hoje 100). Ícone de painel + texto vertical "Resumo e ações" inteiro (hoje só "Resumo"); conferir ao implementar se cabe em 140 px.
- Expandida (hover **e** `:focus-visible`): cresce para **190 px** de largura, sobrepondo a coluna 10 por pouco tempo (é um estado passageiro), com o texto horizontal "Resumo e ações" e a seta `◀`. Transição de 0,15 s, sem animação com `prefers-reduced-motion`.
- **Não depender só do hover (WCAG 1.4.13):** o foco do teclado também expande; o texto expandido pode ser dispensado com Esc e não some quando o mouse passa para ele.
- Ao clicar: abre a gaveta (foco vai para a gaveta, como hoje). Com a gaveta aberta, a aba some (como hoje), porque a gaveta tem "Fechar" e Esc.
- **Atenção ao foco de volta:** `fecharPainel()` e o Esc usam `document.getElementById('botao-painel').focus()`. Se o botão da barra estiver `display:none` na faixa do mouse, o foco **cai em `<body>`**. Fazer a função focar o controle que estiver visível (`offsetParent !== null`), ou dar o mesmo `id` à aba e deixar só um deles no DOM por `useMidia`.

**Dica de primeira visita:** trocar o alvo conforme o controle visível. Com a aba, o balão fica ao lado dela, com a ponta para a borda direita (`position: fixed; right: 44px`; abaixo de 130 px de altura útil, no topo da tela). Com o botão da barra, como hoje. Texto igual: "Seu resumo, Exportar, Importar e o detalhe das disciplinas ficam em Resumo e ações." Mover o balão de cima do cartão "Integralização" (ele cobre a ponta direita da barra de progresso) já resolve U2-06.

**Se o dono preferir o caminho mais curto:** a opção A (só o botão) é a mais segura e custa menos (apagar a alça e a reserva de 31 px; as 10 colunas ganham 31 px de folga em 1366 px, que agora é 23). Perde-se a expansão por hover.

## 3. Outros problemas encontrados

| ID | Título | Gravidade | Onde | Evidência | Correção sugerida | Esforço |
|---|---|---|---|---|---|---|
| U2-01 | **Desfazer coberto pela gaveta** | Alta | Aviso de ação (`.mensagem-acao`) com a gaveta aberta, 1100 a 1619 px | Em 1366 px, "Desfazer" está em x=1198 a 1272 e a gaveta começa em x=951; `elementFromPoint` no centro do botão devolve a gaveta. O mesmo vale para o "×". O aviso só aparece quando o aluno marca disciplinas em cascata, justo quando a gaveta costuma estar aberta | Reservar a largura da gaveta (padding-right de 352 px, seção 1). Com isso o aviso fica à esquerda dela (conferi na aba Planejamento: "Desfazer" em x≈360 e visível) | P |
| U2-02 | Colunas parcialmente visíveis não rolam com Tab | Alta (WCAG 2.4.11) | Grade em contêiner rolável (se a opção a for adotada) | Foco caiu num nome da 8ª fase com 78 px de 104 visíveis; `scrollLeft` ficou 0 | `focusin` que rola só na horizontal (seção 1, item 6). Medido com o protótipo: nome inteiro à vista | P |
| U2-03 | Barra de rolagem da grade fora da primeira tela | Média | Grade rolável | Contêiner vai de y=526 a 1248; a barra nativa está em y≈1233 a 1248, a 465 px abaixo da dobra de 768 px | Setas "Fases 1 a 7 de 10" na barra fixa e esmaecimento nas bordas (seção 1, itens 4 e 5) | M |
| U2-04 | Alça pequena no toque | Média | Alça, notebook com tela de toque e iPad paisagem (1180 e 1366 px) | 28 x 100 px, sem regra para `pointer: coarse`; a regra do projeto é 44 px no toque | Resolvido pela opção C (no toque, só o botão da barra, que já tem 44 px) | P |
| U2-05 | Gaveta abre rolada até o detalhe, sem mostrar o "Resumo" | Baixa | Gaveta aberta por clique numa disciplina | `scrollTop` 662 de 768 px; o "Resumo e ações" fica acima. Repete o ponto já dito na revisão anterior | Manter (a decisão é útil: o aluno clicou para ver o detalhe), mas mostrar um link "Voltar ao resumo" fixo no topo do detalhe. Já existe "Voltar às disciplinas" (seria o mesmo conceito invertido, hoje confuso: "Voltar às disciplinas" leva para o resumo) | P |
| U2-06 | Dica cobre o fim da barra de progresso | Baixa | Dica de primeira visita, 1366 px | O balão (340 px) fica sobre a ponta direita do cartão "Integralização"; o texto "0 de 4.518 h-a" continua visível | Posicionar junto da aba da borda (seção 2) ou deixar no máximo 300 px de largura | P |
| U2-07 | "Simular" duplicado | Baixa | Barra e gaveta | Dois botões "Simular" com o mesmo nome acessível quando a gaveta está aberta (contei 2 no DOM visível) | Tolerável (um é atalho). Se for deixar assim, a gaveta pode chamar o seu de "Simular o que posso cursar", ou o texto de ajuda do botão da gaveta ("Clique em 'Simular'…") já explica | P |
| U2-08 | Hover da alça não testado de verdade | Dúvida | Alça | O simulador não dispara `:hover`; só medi o estado recolhido e o tamanho do rótulo (148 x 32 px, que cobre até 148 px da 10ª e da 9ª fase quando aparece) | Testar com mouse real depois de mexer | P |

### Foco depois de clicar num nome (correção de uma observação anterior)
Na revisão passada escrevi que o foco ia para `<body>` depois do clique no nome. Era um artefato do teste: `.click()` por código não foca o botão. Com um clique real, **o foco fica no nome** (`document.activeElement` é o `.cartao-nome` com `aria-pressed="true"`). Está certo.

### O que está bom (com medida)
- Botão da barra: 44 px de altura, contraste do texto 6,56:1, da borda 5,23:1.
- Esc fecha a gaveta com o foco na grade, e a seleção e o foco ficam onde estavam.
- A gaveta só tem texto fora do padrão quando estreita demais (nenhum overflow até 300 px).
- Em nenhuma variante testada houve rolagem horizontal da página (0 em 18 combinações) nem nome de disciplina cortado (0 de 96).

## 4. Para discutir

- Abrir a gaveta ao clicar num nome é útil, mas ela é o motivo da queixa. Alternativa: **não abrir automaticamente** de 1100 a 1361 px (onde a gaveta cobriria mais de 36% da tela) e deixar o botão com o nome da disciplina, como no celular. Perde-se a "descoberta" de quem clica sem saber.
- Mostrar as 10 colunas e a gaveta ao mesmo tempo só é possível acima de cerca de 1700 px. Vale pensar se o painel fixo de 290 px poderia começar em 1500 px com 9 colunas visíveis e rolagem (mesmo mecanismo). Não medi.
- "Resumo e ações" é um nome genérico. "Meu resumo" ou "Resumo e dados" não são melhores com evidência; só vale trocar se houver teste com alunos.

## 5. Medidas

| Item | Valor |
|---|---|
| Coluna de fase | 125 px, vão de 6 px, 10 colunas = 1304 px |
| Largura útil em 1366 px | 1351 px (barra de rolagem de 15 px) |
| Gaveta hoje | 400 px, a partir de x=951 (1366 px), x=1121 (1536 px), x=685 (1100 px) |
| Colunas inteiras com gaveta e rolagem | 1366 px: 7. 1536 px: 8 (9 só com gaveta de 320 px). 1100 px: 5 |
| Altura da grade com quebra (c) | +35% a +45% |
| Alça | 28 x 100 px, contraste 5,23:1 |
| Botão da barra | 162 x 44 px, contraste 6,56:1 |
| Setas propostas | 44 x 44 px |
| Conteúdo da gaveta | sem estouro em 400, 340, 320 e 300 px |

## 6. O que não deu para testar

- Hover real (a alça expandindo) e Shift+roda: o simulador só rola a horizontal direta e não dispara `:hover`. Medi apenas o estado recolhido e o resultado da rolagem horizontal.
- Toque real, tablet físico e Safari/Firefox: só emulação de tamanho no Chromium.
- Leitor de tela real (NVDA, VoiceOver): só nomes e atributos.
- As setas e o esmaecimento foram prototipados só em parte (botões de 44 x 44 px e o texto "Fases 1 a 7 de 10" funcionaram; o esmaecimento e a mudança da grade da barra não).
- Plano com 15 semestres com a gaveta aberta e zoom de 200% com a opção (a).
- Estado do navegador de teste: apaguei a marca da dica de primeira visita e desfiz a marcação de 60 disciplinas feita no teste; a tela voltou a 0,0%. O viewport foi devolvido ao preset desktop e o CSS de teste foi removido.
