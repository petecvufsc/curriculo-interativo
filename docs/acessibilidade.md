# Revisão de acessibilidade

Data: 17/11/2026. Critérios: WCAG 2.2 nível AA, seguindo os roteiros das skills `accessibility` (Addy Osmani, MIT) e `accessibility-review` (Anthropic): contraste, teclado, leitor de tela, alvos de toque, zoom. As medições foram feitas no navegador com o app em execução, por script, nos temas claro e escuro e em quatro estados (repouso, relações, simulação com status, planejamento).

## Achados e correções

| # | Achado (antes) | Critério | Correção | Depois |
|---|---|---|---|---|
| 1 | Cerca de 200 alvos de clique com 17–18 px de altura (checkboxes e nomes) | 2.5.8 (24 px) | Caixas de 22 px com rótulo clicável de 28 px; nomes com 28 px; no toque, 44 px | 0 alvos abaixo de 24 px no mouse; 0 abaixo de 44 px no toque |
| 2 | `id` duplicado nos diálogos: o "Sobre" era anunciado como "Ajuda" | 4.1.2 | `useId` por diálogo | Sem ids repetidos; teste automatizado |
| 3 | Cerca de 200 paradas de Tab antes do painel, sem atalho | 2.4.1 | Dois atalhos "Pular para…", com destinos focáveis | Testado com Tab e Enter |
| 4 | Selo "Planejada" a 4,50:1 no tema escuro (no limite) | 1.4.3 | Nova paleta, medida em todos os estados | Pior caso 5,2:1 |
| 5 | Texto secundário sobre hachura a 3,4:1 (descoberto no redesenho) | 1.4.3 | Texto em tinta plena nos cartões hachurados | Sem falhas |
| 6 | Dez `<header>` repetidos poluíam as regiões do leitor de tela | 1.3.1 | `<div>` nos cabeçalhos de fase | Regiões: header, main, aside, footer, nav |
| 7 | Painel ao lado em 1440 px quebrava palavras no meio | 1.4.4, legibilidade | Painel ao lado só a partir de 1700 px | Só 2 palavras hifenizadas |

## O que já estava certo (conferido)

- Contraste de texto em todos os estados, claro e escuro: nenhuma falha em cerca de 400 a 730 textos por estado.
- Foco visível com teclado real (contorno de 3 px); abas com setas, Home e End; diálogos modais com Esc e retorno do foco.
- Nome acessível em todo botão, caixa e aba; idioma `pt-BR`; título da página.
- Reflow a 320 px (400% de zoom) e a 720 px (200%): sem rolagem horizontal.
- Informação nunca só por cor: o nome do destaque vem escrito no selo. (Os símbolos e a hachura da primeira versão foram retirados a pedido do usuário; o texto continua.)

## Limites desta revisão

- **Não houve teste com leitor de tela real** (NVDA, VoiceOver). Os nomes e as regiões foram verificados pela árvore de acessibilidade e por testes, mas a experiência de uso fica por validar.
- O contraste foi calculado por script próprio, sem o axe ou o Lighthouse; vale rodar uma dessas ferramentas antes da publicação.
- O modo de alto contraste do Windows (`forced-colors`) tem tratamento mínimo e não foi testado.

## Testes automatizados

`src/app/acessibilidade.test.tsx` cobre os atalhos e seus destinos, a ausência de ids repetidos, o nome de cada diálogo, o nome acessível de todos os controles, os títulos das fases e os destinos focáveis. Contraste e tamanho dos alvos dependem de CSS, que o jsdom não aplica; ficam registrados aqui.

## Atualização: versão sóbria (17/11/2026)

Depois do redesenho para a linha sóbria (sem hachura, sem fontes de título), as medições foram refeitas nos dois temas e em seis estados (repouso com aviso, relações, simulação com status, detalhe "Cursando", planejamento vazio e com semestre):

- **Contraste de texto:** uma falha encontrada e corrigida (selo "Pré-requisito indireto", 3,96:1, agora 5,05:1). Pior caso atual: 5,05:1 no tema claro e 5,23:1 no escuro.
- **Nomes sem quebra:** zero palavras estouradas em 320, 800, 1100, 1280, 1366, 1440 e 1920 px. A fonte do nome varia de 11,8 a 14,5 px (em 1366 px fica em torno de 11,8 px; não há mínimo de tamanho na WCAG, mas é o ponto mais fraco para leitura).
- **Alvos de toque no celular:** nenhum abaixo de 44 px; nenhum abaixo de 24 px em nenhuma tela.
- **Painel ao lado:** a partir de 1620 px (o valor de 1700 px citado acima era da versão anterior). Abaixo disso, gaveta não modal: botão com `aria-expanded`/`aria-controls`, foco levado à gaveta ao abrir pelo botão e devolvido ao fechar, Esc fecha, `inert` quando fechada.
- **Orientação (revisão de UX/UI):** dica dos dois gestos do cartão, legenda completa acima da grade, Ajuda e Sobre no cabeçalho, aviso `role="status"` com Desfazer quando a cascata mexe em várias disciplinas.
- **Ainda não testado:** leitor de tela real, axe/Lighthouse e modo de alto contraste do Windows.
