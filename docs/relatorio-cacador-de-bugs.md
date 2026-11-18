# Relatório do Caçador de Bugs — 18/11/2026

Alvo: Currículo Interativo (PET-ECV/UFSC), estado de 18/11/2026 (versão com seletor de regras 2020.1/2028.1, mover/arrastar, grade oficial e plano otimizado). `npm test` antes de começar: 394 testes passando; `npm run build` passa.
Método: testes descartáveis em `projeto/src/_cacador/` (já apagados), servidor `curriculo-dev` no navegador embutido e `curriculo-build` (para o service worker). Nenhum código do app nem dado foi alterado.

## 1. Resumo

- **15 achados: 0 críticos, 2 altos, 5 médios, 8 baixos.**
- Veredito: **quase blindado.** Não achei execução de código, vazamento de dados nem erro nas regras de pré-requisito (a grade e o plano concordam em 600 históricos aleatórios (300 por versão)). Os problemas reais estão em **robustez de dados** (arquivo importado sem limites trava a página, duas abas se sobrescrevem, importar apaga tudo sem perguntar) e em **uso offline na primeira visita**.
- Gravidade "Alta" em vez de "Crítica" nos dois primeiros porque exigem arquivo fabricado ou duas abas abertas, e porque há saída pela aba Grade / reimportação.

## 1.1 Situação das correções (atualizado em 18/11/2026, depois do relatório)

| Achado | Situação | Como foi tratado |
|---|---|---|
| B-01 Plano sem limite trava a aba | **Corrigido** | Plano limitado a 15 semestres (e 40 disciplinas por semestre) na importação, no "+ Adicionar semestre" (botão desativado com o motivo), em montar e em mover. |
| B-02 Duas abas se sobrescrevem | **Corrigido** | A aba ouve o evento `storage` e adota os dados mais novos, com aviso e "Desfazer"; os dados vindos da outra aba não são regravados (sem ping-pong). |
| B-03 Importar sem confirmação | **Corrigido** | Com dados no navegador, importar pede confirmação (diz quantas disciplinas e semestres serão substituídos); cancelar mantém tudo. |
| B-04 Offline na 1ª visita | **Corrigido** | A página manda ao service worker a lista do que já carregou (JS, CSS, fontes); conferido no build: o cache já tem JS, CSS e fonte na 1ª visita. |
| B-05 Importação sem formato/limite | **Corrigido** | Só códigos AAA9999, no máximo 500 de outro currículo, e o relatório é truncado ("e mais N avisos iguais"). |
| B-06 Montar sem resultado apaga o plano | **Corrigido** | Plano mantido e mensagem visível (também com plano vazio). |
| B-07 Gravação recusada sem aviso | **Corrigido** | Faixa de alerta com instrução de exportar. |
| B-08 Arrasto fabricado duplica | **Corrigido** | Índices precisam ser inteiros, no arrasto e na operação de mover. |
| B-09 Foco no `<body>` | **Corrigido** | Foco vai ao título do semestre ou à área principal. |
| B-10 Próximo semestre pelo mês | **A confirmar** | É só sugestão e a lista permite corrigir; depende do calendário da UFSC. |
| B-11 Grade em 2028.1, plano em 2027.2 | **Mantido (decisão D5)** | Coerente com a regra "cada semestre usa as regras do seu período"; pode confundir, mas está explicado na tela. |
| B-12 "1890/432 h-a" | **Corrigido** | "(o excedente não conta)". |
| B-13 Salvar ao esconder a aba | **Corrigido** | Também salva em `visibilitychange`. |
| B-14 Textos pequenos | **Corrigido** | Singular e rótulos curtos. |
| B-15 Docs sobre fontes | **Já correto** | A menção não existe mais nos documentos. |

Cada correção ganhou teste (`blindagem.test.tsx`, `persistencia.test.tsx`, `serializacao.test.ts`, `registrarServiceWorker.test.ts`). 417 testes passando.

## 2. O que foi tentado e resistiu

- **Injeção de HTML/script**: chaves de `status` como `<img src=x onerror=...>` e `<script>`, `atualizadoEm` com HTML, código com HTML no plano. Tudo aparece como texto (React escapa), `window.__pwn` nunca definido, nenhuma `<img>` criada. Não há `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `fetch`, `XMLHttpRequest`, `WebSocket` nem links externos no código do app.
- **`__proto__`, `constructor`, `toString` como chave de `status`**: viram códigos de "outro currículo", são listados e removidos normalmente, sem poluir protótipo (`Object.getPrototypeOf(status) === Object.prototype`).
- **Importação**: vazio, `null`, lista, número, texto, `status` como lista, plano com listas aninhadas/`null`/número, `limiteAulas` NaN/Infinity/decimal/negativo/1e21, `disciplinasPorSemestre` -1, `semestreInicial` "2027.3", "2027.1\n", `versaoRegras` "2029.1", arquivo sem os campos novos, arquivo de 30 MB inválido (rejeitado em 0,27 s), código repetido no plano. Nenhuma exceção; relatório de importação correto; ida e volta (`importar` → `serializar` → `importar`) idêntica.
- **localStorage**: texto solto, vazio, versão 0, lista JSON, `semestreInicial` inválido, `getItem`/`setItem` lançando exceção, cota cheia, armazenamento apagado com o app aberto. O app continua funcionando e se recupera (ver B-07 sobre o aviso).
- **Regras**: 300 históricos aleatórios por versão: "disponível na grade" ⇔ "sem pré-requisito faltando no plano" (0 inconsistências em 2020.1 e 2028.1). ECV2501 com INE5108 aprovada: sem erro em 2027.2, erro "falta ECV2302" em 2028.1. Grade oficial e plano otimizado de calouro começando em 2026.2, 2027.2 e 2028.1 não geram nenhum problema de pré-requisito.
- **Montagens com históricos estranhos** (tudo cursado, nada, só optativas, tudo reprovado, tudo cursando com e sem a opção, metade das obrigatórias, `disciplinasPorSemestre` 1 e 12, `limiteAulas` 1 e 1000): sem exceção e sem laço infinito.
- **Datas** simuladas: 31/10/2027 23:30 (2020.1 ainda existe, 2 opções), 01/11/2027 00:30, 31/12/2027, 01/01/2028 (só 2028.1, com o aviso de encerramento, mesmo com "2020.1" salva), 30/06 e 01/07/2026. A virada de 1/11/2027 funciona.
- **Mover/Desfazer**: mover, mover de volta, desfazer, mover e remover o semestre destino, marcar na grade depois de mover; o "Desfazer" nunca restaura um plano velho por cima de uma ação posterior. Soltar no mesmo semestre, texto/arquivo de fora, JSON inválido, `null`, índice negativo ou fora do plano: nada acontece (exceto B-08).
- **Layout**: 320, 375, 768, 1280, 1700 e 2560 px sem rolagem horizontal na grade e no planejamento; tema continua claro com o sistema em modo escuro (`prefers-color-scheme: dark` emulado: fundo e campos seguem claros).
- **Offline depois da segunda visita**: com o servidor parado, a página abre do cache, inclusive com `?x=1#abc` na URL e com as 3 fontes carregadas.
- **Rede**: nenhuma requisição além do próprio servidor (o código não tem chamadas de rede).

## 3. Achados

### B-01 Importar (ou acumular) muitos semestres trava a aba Planejamento, e o plano travado fica salvo
- **Gravidade**: Alta (trava recuperável só por reimportação ou limpando os dados do site; não chega a Crítica porque a aba Grade continua funcionando).
- **Passos**:
  1. Abrir o app. No console (ou com um arquivo `.json`) gravar `curriculo-interativo-ecv:v1` com `plano.semestres` = 1500 itens `{"codigos":["ECV2302"]}` (arquivo de 36 KB, formato válido). Equivale a importar esse arquivo em "Importar".
  2. Recarregar e abrir a aba "Planejamento".
- **Esperado**: no máximo 15 semestres (duração máxima do curso no PDF) ou uma rejeição/aviso; página responsiva.
- **Aconteceu**: com 1500 semestres a página ficou congelada por mais de 30 s (a ferramenta de inspeção estourou o tempo); com 300 semestres, 6,3 s e 111 mil nós no DOM; com 100 semestres vazios, 0,75 s para abrir e 0,4 s para cada "+ Adicionar semestre" (modo dev). `avaliarPlano` é quadrático: 3000 semestres levam 0,72 s só nessa função (domínio), e o resto do tempo é renderização de uma coluna completa por semestre. O estado fica gravado, então o congelamento se repete a cada visita à aba. A importação de 100 mil semestres é aceita em 73 ms (sem limite). "+ Adicionar semestre" também não tem limite (cheguei ao semestre "2077.1").
- **Evidência**: medições acima (`performance.now()` no navegador; `avaliarPlano` 200→13 ms, 1000→88 ms, 3000→722 ms).
- **Causa provável**: `lerPlano` em `dominio/aluno/importacao.ts` não limita o número de semestres; `adicionarSemestre` em `app/estado/operacoesPlano.ts` também não; `avaliarPlano` recalcula `baseDoSemestre` por semestre (e é chamada duas vezes, também em `ResumoIntegralizacao`).
- **Sugestão**: limitar o plano a 15 semestres (ou um teto como 20) na importação (descartando o excedente e listando no relatório) e desabilitar "+ Adicionar semestre" no limite; considerar uma base cumulativa em `avaliarPlano`.
- **Certeza**: reproduzido (navegador).

### B-02 Duas abas abertas se sobrescrevem em silêncio
- **Gravidade**: Alta (perde dados do aluno, sem aviso; exige duas abas ou janela do PWA + aba).
- **Passos**: 1) limpar o armazenamento e abrir o app em duas abas, A e B (ambas vazias). 2) Na aba A marcar "Cálculo 1" e esperar 1 s. 3) Na aba B (aberta antes, sem recarregar) marcar "Física I" e esperar 1 s. 4) Ler `localStorage`.
- **Esperado**: preservar as duas marcações, ou avisar que há outra aba com dados mais novos.
- **Aconteceu**: o armazenamento ficou só com `FSC5002`/`FSC5101` (da aba B); o `MTM3110` da aba A foi perdido. A aba B continuou mostrando "Cálculo 1" desmarcado.
- **Causa provável**: `app/estado/persistencia.ts` grava o registro inteiro do estado local e não ouve o evento `storage` nem relê o armazenamento antes de gravar.
- **Sugestão**: ouvir `storage` e recarregar o registro (ou mostrar "os dados foram alterados em outra aba. Recarregar?"); no mínimo, comparar `atualizadoEm` antes de gravar.
- **Certeza**: reproduzido (navegador, duas abas).

### B-03 "Importar" substitui todo o histórico e o plano sem confirmação e sem Desfazer
- **Gravidade**: Média.
- **Passos**: 1) Marcar algumas disciplinas e montar um plano. 2) "Importar" e escolher um arquivo válido de outro momento (ou um arquivo vazio válido).
- **Esperado**: pedir confirmação ("substituir os dados atuais?") ou permitir desfazer, já que "Limpar seleção" e "Limpar plano" pedem confirmação.
- **Aconteceu**: o registro é substituído na hora; o `localStorage` é regravado 300 ms depois com o conteúdo importado; o aviso de sucesso não tem "Desfazer" (o "Desfazer" pendente é apagado de propósito). Os dados anteriores só existem se o aluno exportou antes. (`confirm` chamado 0 vezes; armazenamento ficou com `"status": {}`.)
- **Causa provável**: `app/componentes/ArquivoRegistro.tsx` despacha `importar` direto; `reducer` em `useEstadoAluno.ts` apaga a mensagem.
- **Sugestão**: `window.confirm` quando já houver dados, ou guardar o registro anterior e oferecer "Desfazer a importação".
- **Certeza**: reproduzido (jsdom).

### B-04 Na primeira visita o app não funciona offline (JS/CSS/fontes ainda não estão no cache)
- **Gravidade**: Média (recuperável: basta uma segunda visita com internet; contradiz "uso offline depois da primeira visita").
- **Passos**: 1) `npm run build` e abrir o `curriculo-build` (porta 4173) com o service worker desregistrado e sem cache. 2) Esperar 2,5 s e listar `caches`: só existem `/`, `manifest.webmanifest` e `icones/icone-192.png`. 3) Parar o servidor e recarregar.
- **Esperado**: página funcional offline.
- **Aconteceu**: `#raiz` vazio (página em branco): `index-*.js`, CSS e fontes não estavam no cache, porque foram baixados antes de o service worker assumir o controle. Depois de uma **segunda** visita online, o cache passa a ter JS, CSS e as 3 fontes e o offline funciona (também com `?x=1#abc`).
- **Causa provável**: `public/sw.js` só pré-armazena a página, o manifesto e um ícone; os arquivos de `/assets/` só entram em cache quando passam pelo `fetch` do worker.
- **Sugestão**: depois do `install`, o app pode pedir ao worker para guardar os arquivos carregados (`performance.getEntriesByType('resource')`) ou o build pode gerar a lista de `PRECACHE` com os arquivos de `assets/`. Também falta pré-armazenar `icone-512`, favicon e `apple-touch-icon` (não foi verificado se são usados offline).
- **Certeza**: reproduzido (build + navegador).

### B-05 Importação aceita qualquer texto como "código de outro currículo", sem formato e sem limite
- **Gravidade**: Média.
- **Passos**: importar (ou gravar no armazenamento) um arquivo com `status` contendo 5000 chaves `X0`…`X4999` = `"aprovada"` (a tela "Disciplinas do currículo anterior" só aceita `AAA9999`, até 12 caracteres).
- **Esperado**: ignorar chaves que não seguem `AAA9999`, e/ou limitar a quantidade; o relatório avisa.
- **Aconteceu**: as 5000 entram e viram 5000 `<li>` na lista (mesmo com o `<details>` fechado), 15,8 mil nós, e **cada clique numa checkbox leva 0,93 s** (modo dev). Com 200 mil chaves a importação em si responde em instantes (domínio) e o relatório de importação ganha 200 mil linhas. Chaves como `__proto__`, `constructor` e `<img ...>` também entram (inofensivas: aparecem como texto e removem-se normalmente com "Remover").
- **Evidência**: `Disciplinas do currículo anterior (5000)`; clique em "Cálculo 1" = 928 ms.
- **Causa provável**: `lerStatus` em `dominio/aluno/importacao.ts` só testa se o código pertence ao currículo; a regra `FORMATO_EXTERNO` está só em `app/estado/operacoesRegistro.ts`.
- **Sugestão**: aplicar o mesmo formato (`^[A-Z]{3}\d{4}$`) na importação e limitar o relatório (por exemplo, "e mais N entradas ignoradas").
- **Certeza**: reproduzido (navegador e domínio).

### B-06 "Montar pela grade oficial" / "plano otimizado" sem resultado apaga o plano e não explica
- **Gravidade**: Média.
- **Passos**: 1) Marcar todas as obrigatórias como aprovadas e criar um plano com uma optativa (por exemplo, ECV2971 em 2027.1). 2) Planejamento → "Montar pela grade oficial" → confirmar a substituição.
- **Esperado**: a mensagem "Você já cumpriu todas as obrigatórias: não há o que planejar pela grade oficial" e, de preferência, não apagar o plano do aluno.
- **Aconteceu**: o plano (com a optativa) foi substituído por vazio e a tela só mostra "Nenhum semestre no plano…". A mensagem existe no código, mas `VisaoPlanejamento` só a exibe se `origem && !vazio`, e o plano ficou vazio, então ela nunca aparece. O mesmo com "Montar plano otimizado" quando nada cabe (importando `limiteAulas: 1`): plano substituído por vazio, nenhuma nota.
- **Causa provável**: `app/componentes/planejamento/VisaoPlanejamento.tsx`, condição `origem && !vazio`; `completo`/`faltantes` de `montarPlano` não são usados pela interface.
- **Sugestão**: mostrar a nota mesmo com plano vazio, e não chamar `definirPlano` quando o resultado é vazio (manter o plano atual).
- **Certeza**: reproduzido (jsdom).

### B-07 Cota cheia ou armazenamento bloqueado: o aluno não é avisado de que nada foi salvo
- **Gravidade**: Média.
- **Passos**: simular `localStorage.setItem` lançando `QuotaExceededError` (ou modo privado) e marcar uma disciplina.
- **Esperado**: um aviso discreto "não foi possível salvar neste navegador; exporte seus dados".
- **Aconteceu**: o app continua normal, nenhum aviso; ao fechar a aba tudo se perde. (Texto de busca por "não foi possível salvar" na tela: ausente.)
- **Causa provável**: `gravar()` em `app/estado/persistencia.ts` engole a exceção.
- **Sugestão**: guardar o erro no estado e mostrar um aviso fixo com o botão Exportar.
- **Certeza**: reproduzido (jsdom).

### B-08 Dado arrastado com `indice` em texto duplica uma disciplina
- **Gravidade**: Baixa (exige dado de arrasto fabricado por outra página/script; o próprio app sempre manda número).
- **Passos**: plano `[["MTM3110","FSC5101"],["MTM3120"]]`; disparar `drop` no semestre 2 com o tipo `application/x-disciplina-plano` e valor `{"indice":"0","posicao":0}`.
- **Esperado**: ignorar o dado.
- **Aconteceu**: "Cálculo 1" passou a existir nos dois semestres (no 1 continua e entrou no 2), porque `op.para === op.indice` compara número com texto e a origem não é removida.
- **Causa provável**: `onDrop` em `SemestrePlanejado.tsx` e `aplicar('mover')` em `operacoesPlano.ts` não validam os tipos (`Number.isInteger`). Parte do efeito: arrastar de outra janela do próprio app usa os índices da outra janela no plano desta (**a confirmar**, não reproduzido).
- **Sugestão**: validar `Number.isInteger(indice)` e `posicao` no `onDrop`.
- **Certeza**: reproduzido (jsdom, com dado fabricado).

### B-09 Foco do teclado vai para o `<body>` depois de remover, mover ou desfazer
- **Gravidade**: Baixa (acessibilidade).
- **Passos**: no Planejamento, focar "Remover Cálculo 1 do semestre 1" e ativar; ou escolher "Mover para…" ou ativar "Desfazer".
- **Esperado**: o foco vai para um elemento próximo (o próximo cartão, o título do semestre, a mensagem).
- **Aconteceu**: `document.activeElement` é `BODY` nos três casos; quem navega por teclado/leitor de tela volta ao topo da página a cada ação.
- **Causa provável**: o elemento focado é desmontado.
- **Sugestão**: devolver o foco ao título do semestre ou ao botão seguinte.
- **Certeza**: reproduzido (navegador).

### B-10 Primeiro semestre sugerido pelo calendário pula semestres que ainda não começaram
- **Gravidade**: Baixa (a confirmar com o calendário da UFSC; o doc já chama de "sugestão").
- **Passos**: simular a data 01/01/2028 e depois 01/07/2026; abrir o Planejamento e "+ Adicionar semestre" sem escolher o primeiro semestre.
- **Aconteceu**: em 01/01/2028 o primeiro semestre é "2028.2" (o 2028.1 ainda não começou); em 01/07/2026 é "2027.1" (o 2026.2 ainda não começou). A lista de escolha traz o semestre anterior, então dá para corrigir.
- **Causa provável**: `proximoSemestreSugerido` usa só o mês (jan–jun → `.2`, jul–dez → `.1` do ano seguinte).
- **Certeza**: reproduzido; o "certo" é **a confirmar**.

### B-11 Depois de 01/11/2027 a grade usa 2028.1, mas o plano ainda trata 2027.2 e anteriores com a 2020.1
- **Gravidade**: Baixa (a confirmar).
- **Observação**: com a data de 2028-01-01 o aviso diz "A versão 2020.1 foi encerrada em novembro de 2027", e a nota do planejamento continua dizendo que "até 2027.2 valem os atuais". Quem escolher "2027.2" como primeiro semestre depois da data de corte vê a grade com regras novas e o plano com regras antigas. É coerente com a decisão D5, só pode confundir.
- **Certeza**: comportamento visto no código e em teste de data; se é um defeito é **a confirmar** com o PET.

### B-12 "Optativas: 1890/432 h-a" sem explicação
- **Gravidade**: Baixa.
- **Passos**: marcar todas as disciplinas do currículo como aprovadas.
- **Aconteceu**: painel mostra "Optativas: 1890/432 h-a" com a barra em 100%; o geral limita em 4.518 h-a (100,0%). Está coerente com a regra (o excedente não conta), mas a tela não diz que o excesso é descartado.
- **Sugestão**: texto "(432 h-a contam)" ou limitar o número exibido.
- **Certeza**: reproduzido.

### B-13 Salvamento depende de `pagehide` e de 300 ms; não há `visibilitychange`
- **Gravidade**: Baixa (**a confirmar**; só cheguei a reproduzir que o evento `visibilitychange` não salva antes dos 300 ms).
- **Observação**: no celular, ao trocar de app e o sistema encerrar a aba, `pagehide` pode não disparar; uma alteração feita nos últimos 300 ms se perde. `pagehide` direto salva (testado).
- **Sugestão**: também salvar em `visibilitychange` quando `document.visibilityState === 'hidden'`.

### B-14 Textos pequenos: "1 disciplinas" e opção da lista de versão cortada em 320 px
- **Gravidade**: Baixa.
- **Aconteceu**: a nota do plano otimizado diz "com 1 disciplinas por semestre" (falta o singular); em 320 px o seletor de regras mostra "Currículo 2020.1 — pré-requisitos atuais (val" (texto da opção cortado).
- **Certeza**: reproduzido.

### B-15 Documentação desatualizada: fontes
- **Gravidade**: Baixa.
- **Observação**: `docs/ACOMPANHAMENTO.md` (decisões técnicas) diz que as fontes são Barlow/Barlow Semi Condensed/IBM Plex Mono, mas `package.json` e `main.tsx` usam `@fontsource/source-sans-3`.
- **Certeza**: reproduzido (leitura dos arquivos).

## 4. O que não deu para testar

- **`npm audit`**: tentei, mas o ambiente bloqueou o comando (acesso externo; a tarefa só permitia o servidor local). Dependências de produção: `react` e `react-dom` ^19.3.1 e `@fontsource/source-sans-3`; o restante é só desenvolvimento. Rodar `npm audit` fora desta sessão.
- **Diálogos nativos (`confirm`)** no navegador embutido: ficam suprimidos (retornam `false`); os fluxos com confirmação foram testados em jsdom com `confirm` simulado.
- **Arrasto HTML5 real** com mouse: só os eventos `drop`/`dragover` em jsdom (o autor já testou no navegador).
- **Leitor de tela, `forced-colors`, `prefers-reduced-motion`, impressão (não há CSS `@media print`) e zoom de 200%/400%**: não consegui emular; 320 px sem rolagem horizontal é um bom substituto do zoom de 400%.
- **Diálogos Ajuda/Sobre com Esc e foco**: o jsdom não implementa o `cancel` do `<dialog>`; já há teste do autor.
- **Atualização do service worker com versão antiga em cache**: não simulei uma segunda compilação. Pelo código, a navegação é "rede primeiro" e os arquivos de `assets/` têm hash, então a versão nova deve aparecer ao reabrir online; o cache só cresce (arquivos antigos não são apagados até trocar `VERSAO`), o que é baixo risco.
- **Download do `.json` (`URL.revokeObjectURL` com `setTimeout(…, 0)`)** em Safari/Firefox antigos: não testado.
- **Fuso diferente / 31/12 às 23:59**: só datas simuladas no fuso local do aparelho; `hojeIso` usa o fuso local por desenho.
- **Edge/Firefox/Safari**: só o navegador embutido (Chromium).

## 5. Resultado de `npm audit`

Não rodou (ver seção 4).
