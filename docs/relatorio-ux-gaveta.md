# Relatório: o painel em gaveta é fácil de achar?

Data: 19/11/2026. Revisão feita no navegador embutido, sem alterar o código. Telas medidas: 1366x768, 1536x864, 1100x800, 768x1024 e 375x812.

## Resumo (5 linhas)

1. A queixa do dono procede. O botão "Resumo e ações" é branco, com borda fina, em uma barra branca. O "Simular" ao lado, verde, chama muito mais atenção e leva o olho para o lado errado.
2. O nome do botão não diz o que tem dentro. O aluno novo não sabe que ali moram Exportar, Importar, Limpar e o progresso por obrigatórias e optativas.
3. Em 768 px a gaveta cobre mais da metade da tela e **esconde a própria disciplina que o aluno acabou de clicar**. Em 1100 px cobre 36%, e as disciplinas que a escolhida "libera" (nas fases à direita) ficam escondidas.
4. Boa notícia: o que importa fica visível sem abrir nada (Simular e a porcentagem). Nenhum nome de disciplina foi cortado e não há rolagem horizontal em nenhuma das cinco larguras.
5. Recomendação: manter a gaveta, mas torná-la óbvia (alça sempre visível na borda, botão com destaque e ícone, dica na primeira visita) e, no tablet, deixar a grade se ajustar em vez de ser coberta. Detalhes na seção 3.

## 1. O que foi medido

| Tela | Barra | Botão "Resumo e ações" | Gaveta (largura / parte da tela coberta) | Colunas da grade visíveis sem gaveta | O que o aluno vê sem rolar |
|---|---|---|---|---|---|
| 1366x768 | fixa no topo, 61 px, branca | 132x44 px, branco, borda cinza fina, no canto direito | 400 px / 29% | 10 | Cabeçalho, barra, "Integralização", "Regras de pré-requisitos". A grade só começa em y=526 (68% da altura), então aparece só o topo dela |
| 1536x864 | igual | igual | 400 px / 26% | 10 (sobram 193 px livres) | Igual, grade começa em y=526 (61% da altura) |
| 1100x800 | igual | igual | 400 px / 36% | 8 (duas fases quebram para a segunda linha) | Igual |
| 768x1024 | igual | igual | 400 px / 52% | 3 colunas | Igual |
| 375x812 | fixa embaixo, 61 px (7,5% da altura) | 255x44 px, largura quase total | sobe de baixo, 690 px / 85% da altura | 1 coluna | Cabeçalho, progresso, regras e legenda. A grade começa em y=795 (abaixo da dobra). A barra embaixo aparece bem |

### O que chama atenção e o que não chama

- **Notebook e tablet (768 a 1619 px):** o botão tem 44 px de altura (bom para toque), mas é branco sobre branco. Cor da borda: cinza médio, contraste cerca de 4:1 contra o fundo. Não tem ícone nem seta. Fica sozinho, na ponta direita, longe do "Simular" (que está à esquerda). Quem olha da esquerda para a direita vê "Simular" e a porcentagem e nem chega ao botão.
- **Celular:** a barra de baixo é clara e o botão é largo. Aqui a descoberta é razoável. Ponto fraco: a porcentagem "X% integralizado" **some** na barra do celular (medi largura 0), então o aluno não vê o progresso sem abrir a gaveta ou voltar ao topo.
- **Rótulo muda de nome:** ao escolher uma disciplina, o botão passa a dizer "Detalhes: Estática para Engenharia Civil". É útil, mas some a palavra "Resumo" e "ações". No celular o texto longo é cortado com reticências (medi 267 px de texto em 253 px de caixa), o que fere a regra dos nomes inteiros.
- **O título da gaveta confunde:** ela se chama "Resumo e ações", mas, quando abre pelo clique em uma disciplina, já aparece rolada até "Disciplina selecionada". O aluno vê o detalhe, sem ver o resumo, e não sabe que há mais coisas acima.
- **Duplicação:** "Integralização do curso" (0,0%) aparece na página e de novo na barra e na gaveta. Três lugares para o mesmo número.

### O que a gaveta cobre e os destaques

- **1366 px:** a gaveta começa em x=951. Cobre as fases 8, 9 e 10 e o cabeçalho. Se o aluno escolhe uma disciplina da 1ª ou 2ª fase, o que ela "libera" costuma estar nas fases 5 a 9, parte coberta. Destaques à esquerda continuam legíveis (verdes e vermelhos medidos na tela, sem perda de cor).
- **1100 px:** começa em x=685. Cobre da metade da 5ª fase em diante. Testei com "Estática para Engenharia Civil" (3ª fase): os pré-requisitos (esquerda) aparecem bem, mas as que ela tranca (6ª e 7ª fases, em vermelho e laranja) ficam atrás da gaveta, embora o painel as liste por escrito.
- **768 px:** a gaveta começa em x=353 (mede 400 de 753). A disciplina clicada estava entre x=514 e 720: **100% coberta**. O aluno clica e a disciplina some debaixo da gaveta. Falha mais séria da revisão.
- **Celular:** a gaveta não abre sozinha ao clicar (decisão do código). O aluno precisa tocar na barra de baixo. Aceitável, mas o botão com o nome da disciplina é a única pista disso.

### Primeira visita

O aluno novo vê: cabeçalho verde, barra com Simular e "0,0% integralizado", cartão de progresso, cartão de regras de pré-requisitos, abas e a legenda. Nada diz "há mais coisas aqui". Exportar e Importar (dados do aluno) ficam dentro da gaveta; quem quiser levar os dados para outro aparelho precisa adivinhar que o botão "Resumo e ações" guarda isso. Não existe dica de primeira visita.

### Restrição das 10 colunas (medida)

- Uma coluna de fase precisa de 125 px, com 6 px entre colunas: 10 colunas = 10x125 + 9x6 = **1304 px**, mais a margem de 12 px de cada lado = **1328 px**.
- Em 1366 px o navegador usa 15 px para a barra de rolagem, sobrando 1351 px. **Folga real: 23 px.**
- Em 1536 px a folga é de 193 px; em 1620 px o painel fixo de 290 px cabe.
- Abaixo de 1328 px a grade já cai para 9 ou menos colunas e quebra linha (em 1100 px são 8 colunas e duas fases ficam na segunda linha). Isso já acontece hoje.

## 2. Prova rápida no navegador (CSS temporário, nada salvo no projeto)

Em 1366x768 injetei uma alça verde vertical fixa na borda direita, com o texto "Resumo e ações" girado, 28 px de largura e 170 px de altura, centrada na altura da tela.

- **Sem reservar espaço (a alça só fica por cima):** 10 colunas mantidas, nenhum nome cortado (0 de 96 nomes com excesso), sem rolagem horizontal. A alça cobre os 12 px de margem direita e 16 px da última coluna. Medi o texto mais à direita em x=1330 e o início da alça em x=1323: sobreposição de no máximo 7 px, sobre a coluna da 10ª fase, que tem poucas disciplinas.
- **Reservando 44 px de espaço (padding à direita):** **quebra o layout**. A grade passou de 10 para 9 colunas e a 10ª fase caiu para a segunda linha. Ou seja, em 1366 px um trilho largo de 44 px não cabe sem sobrepor.
- Conclusão: em 1366 px cabe uma alça de até uns 24 a 28 px por cima da margem. Um trilho com ícones e números (48 a 56 px) só cabe sem sobrepor a partir de cerca de **1400 px** de largura útil.

A captura da prova ficou salva pelo navegador no ambiente do revisor; o código do projeto não foi alterado.

## 3. Alternativas

### A. Manter a gaveta, mas torná-la óbvia (alça + botão destacado + dica)

**Como funciona:** três mudanças pequenas que somam.
1. Uma alça verde fixa na borda direita (28 a 32 px de largura, 120 a 160 px de altura), com seta e ícone, texto vertical curto ("Resumo"). Ao passar o mouse, ela se alarga (cerca de 120 px) e mostra "Resumo e ações"; ao clicar, abre a gaveta. No toque, só o clique, sem hover.
2. O botão da barra passa a ser verde sólido (ou verde contornado e grosso), com ícone de painel, e ganha mini-resumo: "Resumo e ações · 12% · 3 em andamento".
3. Na primeira visita, uma dica de uma linha, uma vez só, apontando para a alça: "Seu resumo, Exportar e Importar ficam aqui", com botão "Entendi" (guardado no navegador).

**Prós:**
- Mexe pouco: o painel, o foco e os testes continuam iguais.
- A alça cabe em 1366 px por cima da margem (provado).
- Atende o pedido do dono ("algo que ao passar o mouse expanda") sem dependência do mouse.
- A dica resolve a primeira visita.

**Contras:**
- Hover não existe no toque; a alça precisa ser compreensível só pelo visual (ícone + rótulo curto).
- A alça fica por cima de 16 px da última coluna em 1366 px. Em 1100 px a alça cobre a coluna 8 (a grade ocupa a largura toda), com sobreposição de poucos pixels; é preciso testar.
- Texto girado é menos legível. Preferir ícone + rótulo curto horizontal sobre uma "aba" de 36 px.
- Não resolve a gaveta cobrindo a disciplina clicada em 768 px.

**Acessibilidade:**
- Teclado: a alça deve ser um botão real, com o mesmo `aria-expanded` e `aria-controls`, na ordem de foco logo após a grade ou junto da barra; foco visível.
- Toque: alvo mínimo de 44x44 px (altura de 120 px resolve).
- Hover: o texto expandido também aparece no foco do teclado. Não depender só do hover.
- Leitor de tela: manter um único botão com nome acessível; a alça não duplica o botão da barra se for o mesmo controle (usar um só ou marcar o outro `aria-hidden`).

**Esforço:** P a M.

### B. Trilho lateral estreito, sempre visível, com ícones e números

**Como funciona:** uma faixa de 48 a 56 px, fixa na borda direita, com 4 ícones: progresso (com a porcentagem), Simular, Exportar/Importar e Detalhe da disciplina (com ponto de aviso quando há uma escolhida). Passar o mouse expande o trilho para cerca de 300 px, empurrando ou cobrindo a grade. Clicar fixa aberto.

**Prós:**
- Mostra números sem abrir nada.
- Fica claro que existe um painel e quais são as funções.
- Muito parecido com editores e redes sociais; o público já conhece.

**Contras:**
- Não cabe em 1366 px sem cobrir coluna: o trilho de 48 px precisa de largura útil de cerca de 1400 px; em 1366 px quebraria a grade para 9 colunas (testado) ou cobriria 48 px da 10ª fase.
- Abaixo de 1100 px não sobra espaço; no celular não faz sentido (trilho de 48 px em 375 px é 13% da largura).
- Ícones sozinhos exigem aprendizado; o rótulo só aparece ao passar o mouse, que não existe no toque.
- Dois modos de expansão (hover e clique) podem confundir e causam "pulos" na grade se ela se reajustar.

**Acessibilidade:** exige `aria-expanded`, rótulos em todos os ícones (não só tooltip), foco visível e Esc para fechar. No toque, o ícone abre direto o painel (sem hover). Expansão por hover isolada é um problema conhecido de WCAG 1.4.13 (conteúdo ao passar o mouse precisa poder ser dispensado e permanecer visível).

**Esforço:** M a G, pois muda o layout em três faixas de largura.

### C1. Sem gaveta: barra superior com as ações principais + detalhe como cartão flutuante

**Como funciona:**
- A barra do topo mostra direto: Simular, Limpar destaques, "X% integralizado" (com barra pequena) e um menu "Dados" com Exportar e Importar. As opções raras ("considerar cursando como aprovada", "currículo anterior", "Limpar seleção") ficam em um menu "Mais" ou em um popover.
- O detalhe da disciplina vira um cartão flutuante (popover) perto da disciplina clicada, de 320 a 360 px, com seta apontando para ela. No celular, vira uma folha de baixo.

**Prós:**
- Quase tudo fica visível sem esconder nada.
- O detalhe aparece ao lado do que foi clicado e não cobre a grade toda.
- Resolve o caso de 768 px, em que a gaveta cobre a disciplina.

**Contras:**
- Posicionar um cartão flutuante sem cobrir os destaques que ele explica é difícil; a grade tem 10 colunas e o cartão cobre vizinhas.
- A barra fica cheia em 768 a 1100 px; precisa de um menu "Mais".
- Muda muito código (popover, posicionamento, foco, Esc, tabulação).
- Cobre os destaques ao lado do cartão (mesmo problema de hoje, em menor escala).

**Acessibilidade:** popover não modal exige gerenciar o foco e o Esc; ponteiro e teclado funcionam, mas a posição "perto do clique" quebra no zoom de 200% e em telas pequenas. Hover não é necessário.

**Esforço:** G.

### C2. Sem gaveta flutuante: painel recolhível que empurra a grade

**Como funciona:** o painel fica ao lado da grade, mas recolhível. Fechado: some e a grade usa a largura toda. Aberto (a partir de ~1100 px): a grade se reorganiza para as colunas restantes (por exemplo 8 colunas em 1100 px, 7 em 1000 px), com rolagem normal, em vez de ser coberta. Abaixo de 768 px continua a folha de baixo.

**Prós:**
- A gaveta deixa de cobrir a disciplina clicada: a grade se ajusta.
- Mantém o texto e a ordem de leitura naturais; sem trilho nem hover.

**Contras:**
- A grade de 10 colunas já não cabe sozinha abaixo de 1328 px; com 400 px a menos, ela cai para 5 ou 6 colunas e as fases quebram para outras linhas (a rolagem vertical aumenta bastante).
- Abrir e fechar mexe com a posição de todos os cartões (o aluno "perde o lugar").
- Pouca vantagem em 1366 px: a grade passa de 10 para 7 colunas.

**Acessibilidade:** boa (não há conteúdo coberto, nem hover). Cuidado: o reflow muda o foco visual; manter o foco no botão.

**Esforço:** M.

### D. (Extra, barata) Detalhe da disciplina embaixo da grade em vez de na gaveta, só em 768 a 1100 px

**Como funciona:** nesta faixa (tablet e notebook pequeno), o clique no nome da disciplina rola até uma faixa fixa de 200 a 260 px na base da tela com o resumo (nome, situação, falta, "libera"), com botão "Ver tudo", que abre a gaveta completa. A gaveta passa a servir só para Resumo, Exportar e Importar.

**Prós:** a grade continua visível e o aluno lê as informações principais sem trocar de contexto; evita o caso do 768 px.
**Contras:** ocupa de 25 a 30% da altura; duplica parte do conteúdo.
**Acessibilidade:** boa, sem hover; precisa de `aria-live` ou foco claro.
**Esforço:** M.

## 4. Recomendação

**Fazer a alternativa A, com um ajuste de C2 apenas para 768 a 1100 px (ou a D), e deixar o trilho (B) como segunda fase, só para telas largas (acima de 1400 px).**

Por quê:
- É o que resolve a queixa do dono com menos risco: a descoberta é um problema de **sinalização**, não de arquitetura. O botão está invisível por ser branco sobre branco, sem ícone, longe do "Simular" e sem dizer o que tem dentro.
- A prova mostrou que uma alça cabe em 1366 px sem cortar nenhum nome; o trilho largo (B), não.
- O hover ajuda quem usa mouse, mas não existe no toque. Por isso tudo precisa funcionar com um clique, e o hover é só um bônus.
- O problema mais grave (a gaveta cobrindo a disciplina clicada em 768 px) pede uma correção própria e pequena, independente da sinalização.

### Ordem de implementação

1. **Botão da barra mais visível** (P): fundo verde sólido ou borda verde de 2 px, ícone, texto "Resumo e ações" mais mini-resumo ("12%"). Hoje é branco sobre branco. Mantém o `aria-expanded`.
2. **Corrigir o 768 px** (P): abaixo de 900 px, abrir a gaveta no detalhe só se a disciplina clicada não ficar coberta; senão, rolar a grade para deixar a disciplina visível à esquerda da gaveta (`scrollIntoView`), ou reduzir a gaveta para `min(340px, 45vw)`.
3. **Mostrar a porcentagem na barra do celular** (P): hoje o `barra-resumo` some (largura 0 medida). Pode ser "X%" curto ao lado do botão.
4. **Alça na borda direita de 1100 a 1619 px** (M): botão de 28 a 32 px de largura, ícone + rótulo curto, que se alarga ao passar o mouse e ao receber foco; clique abre a gaveta (mesmo estado). Se a prova de 1100 px mostrar sobreposição com nomes, usar a alça só a partir de 1280 px.
5. **Dica de primeira visita** (P): uma linha com seta apontando para a alça ou o botão, com "Entendi", guardada no navegador. Texto: "Aqui ficam seu resumo, Exportar e Importar (levar seus dados)."
6. **Rótulo único e título coerente** (P): título da gaveta "Resumo e ações" fixo; abrir sempre pelo topo e mostrar o detalhe em uma faixa fixa "Disciplina selecionada: …" com atalho "Ver detalhe". Evita abrir já rolada no meio.
7. **Opcional, depois:** trilho (B) acima de 1400 px e/ou a faixa inferior (D) em 768 a 1100 px.

## 5. Outros pontos vistos (fora do tema, para registro)

- Em 1366x768 a primeira tela mostra 68% de cabeçalho, barra, progresso e regras; a grade, que é o centro da ferramenta, começa em y=526. Sugestão (P): reduzir o cartão de regras a uma linha (o texto sobre 2028.1 pode ir para "Ver o que muda") e juntar "Integralização" com a barra do topo, para a grade subir cerca de 150 px.
- Em 1100 px a grade fica com 8 colunas e duas fases caem para a segunda linha (já ocorre hoje; é consequência da regra de 125 px por coluna).
- Mensagens de "Disciplina selecionada" no foco: ao clicar no nome, o foco continua em `<body>` (medi `document.activeElement = BODY`). Por decisão do código "sem tirar o foco da grade", mas o foco acaba no corpo da página. Para quem usa teclado ou leitor de tela, convém devolver o foco ao nome clicado.

## 6. O que não deu para testar

- O gesto de passar o mouse não pode ser medido de verdade (a prova usou só CSS e clique); a animação da alça ao expandir não foi simulada.
- Toque real em celular e tablet: só emulação de tamanho.
- A dica de primeira visita e o trilho com ícones não foram prototipados (só descritos).
- Leitor de tela real (NVDA/VoiceOver) e teclado: só o que o código mostra; não repeti a revisão de acessibilidade completa, que já está em `relatorio-ux-ui.md`.
