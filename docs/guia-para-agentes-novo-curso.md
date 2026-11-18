# Guia para agentes: montar um Currículo Interativo para outro curso

**Para quem é:** um agente de IA (ou uma pessoa) que recebeu o pedido "o curso de X quer um currículo interativo como o da Engenharia Civil". Este documento é autossuficiente: lendo-o, você sabe o que construir, o que pedir, o que nunca fazer e como provar que está pronto.

**Origem:** a ferramenta nasceu como o *Currículo Interativo* do PET Engenharia Civil UFSC (reconstrução web de um programa .NET antigo). O que está aqui foi aprendido construindo-a, incluindo os erros. Os documentos de apoio ficam em `projeto/docs/` do repositório de referência: `regras-de-negocio.md` (todas as regras, com a origem), `modelo-de-dados.md` (JSON do currículo), `acessibilidade.md`, `interface.md`, `ACOMPANHAMENTO.md` (decisões D1 a D5 e problemas encontrados) e `publicacao.md`.

---

## 0. Como usar este guia (leia isto primeiro)

1. Leia o guia inteiro **antes** de escrever código.
2. Cumpra a **seção 2 (regras invioláveis)**. Se um pedido do responsável conflitar com ela, **pare e pergunte**.
3. Reúna as **entradas** da seção 4. Sem o documento oficial do currículo, **não comece**.
4. Siga o **roteiro** da seção 8, na ordem. Cada etapa termina com testes passando.
5. Antes de entregar, passe pela **seção 13** (lista de pronto).

Princípio que vale para tudo: **a ferramenta ajuda o aluno a planejar; quem manda é o documento oficial do curso e o CAGR/sistema acadêmico.** Você nunca decide regra acadêmica.

---

## 1. O que é a ferramenta (e o que ela não é)

**É:** um site estático (sem servidor, sem banco de dados, sem login) que mostra a grade de um curso, as relações entre as disciplinas (o que é pré-requisito de quê), o que o aluno já pode cursar, quanto do curso ele já cumpriu e um **planejador de semestres** até a formatura.

**Não é:** sistema de matrícula, sistema de notas, fonte oficial de regra, nem coletor de dados. Ele **não** consulta o sistema da universidade, **não** sabe a oferta de turmas nem horários, e **não** envia nada de ninguém a lugar nenhum.

**Princípios de desenho (não negociáveis):**
- **Privacidade por construção:** todo dado do aluno fica no navegador dele (`localStorage`) e em arquivos que ele mesmo exporta. Sem servidor, sem análise de acesso, sem formulário, sem login. Isso dispensa tratar dados pessoais e é o motivo de a ferramenta poder ser publicada em hospedagem gratuita.
- **Rastreabilidade:** toda regra vem de um documento oficial e tem a origem registrada em `docs/`. Onde o documento é ambíguo ou contraditório, isso fica **registrado como alerta**, não "resolvido" em silêncio.
- **Domínio puro e testado:** as regras vivem em TypeScript **sem React e sem DOM**, com testes. A interface só mostra o que o motor calcula.
- **Honestidade na tela:** o site diz que "pode conter erros" e manda **conferir no sistema oficial**. Sugestões automáticas são rotuladas como sugestão da ferramenta.

---

## 2. Regras invioláveis (o que **não** pode)

### 2.1 Sobre regras e dados
1. **Não invente regra acadêmica.** Pré-requisito, carga horária, equivalência, créditos mínimos e máximos, o que conta como optativa: tudo vem do documento oficial do curso (PDF do currículo, resolução, comunicado da coordenação). Se não está lá, **pergunte**; não deduza.
2. **Fonte única e declarada.** O arquivo do currículo diz de onde veio (`fonte`: documento, órgão, data de emissão). Mudanças posteriores (comunicados) entram como **alteração com data de vigência e origem**, nunca por edição silenciosa.
3. **Contradição ou ambiguidade na fonte = alerta, não decisão sua.** Exemplo real: a coluna "pré-requisito" dizia uma coisa e a ementa dizia outra. Foi transcrita a coluna estruturada, o alerta ficou gravado no dado (`alertas`) e a dúvida foi levada à coordenação. Faça igual.
4. **Dados de exemplo são identificados como exemplo.** Nunca apresente dado fictício como oficial. Se precisar de um currículo de teste, o `id`, o `fonte` e a tela devem dizer **"exemplo"**.
5. **Não use o programa antigo (se houver) como fonte de regra.** Ele serve, no máximo, para testes de comparação ("paridade"). A fonte de verdade é o documento oficial.
6. **Não "corrija" o documento oficial.** Se achar um erro nele, registre em `docs/divergencias` e avise o responsável.

### 2.2 Sobre privacidade e segurança
7. **Nada de servidor, banco, login, cookies de rastreamento, análise de acesso, fontes ou scripts de terceiros que façam requisição por conta própria.** Fontes são empacotadas no site (`@fontsource`), não carregadas de CDN.
8. **Nunca** coloque em arquivo do projeto: senhas, tokens, chaves de API, códigos de recuperação, dados de alunos reais, e-mails pessoais.
9. **Todo texto que o aluno controla** (arquivo importado, código digitado de outra disciplina, nome de semestre) **nunca** pode virar HTML. Use sempre o escape normal do React; proibido `dangerouslySetInnerHTML` com dado do usuário.
10. **Importação de arquivo** valida tudo (formato, versão, tipos, códigos, limites de tamanho) e **nunca aplica dado parcialmente inválido sem avisar**.

### 2.3 Sobre identidade e publicação
11. **Não se passe por outra instituição.** Use o nome do curso e do grupo que pediu (por exemplo, "PET Biologia"), mas **não** use brasões, logotipos oficiais ou o nome da universidade como se o site fosse oficial dela sem autorização. Registre quem é o responsável pela manutenção.
12. **Licença:** não escolha uma licença sozinho. O padrão é "sem licença" (todos os direitos reservados) até o responsável decidir com a instituição.
13. **Não publique** (no GitHub, em hospedagem ou em qualquer lugar) sem pedido e confirmação explícita do responsável. O endereço publicado **não pode mudar depois**, porque os dados dos alunos ficam ligados a ele.

### 2.4 Sobre qualidade
14. **Nenhuma funcionalidade é "pronta" sem testes passando.** Nem "quase pronta".
15. **Nunca** apresente porcentagens, totais ou carga horária que você não consiga reproduzir a partir do documento oficial.
16. **Não esconda disciplina do aluno sem decisão registrada** (por exemplo, "somente coordenação" é decisão do responsável, anotada).

---

## 3. Funcionalidades

### 3.1 Obrigatórias (o núcleo; todo curso precisa)
| Funcionalidade | O que faz |
|---|---|
| **Grade por fase/semestre** | Colunas por fase, cartões com nome completo (**nunca cortado nem hifenizado**), código e caixa "já cursei". Optativas em seção própria. |
| **Relações ao clicar no nome** | Destaca pré-requisitos diretos/indiretos e o que a disciplina "tranca" direta/indiretamente. Menor distância vence. Seis cores no máximo, sempre com texto, nunca só cor. |
| **Marcar com cascata** | Marcar uma disciplina marca os pré-requisitos; desmarcar desmarca os dependentes. Caixa por fase. "Desfazer" quando a cascata mexeu em outras. |
| **Simular** | Mostra o que o aluno já pode cursar (todos os pré-requisitos cumpridos) e totais de horas e créditos. |
| **Situação no histórico** | Não cursada / aprovada / cursando / reprovada; opção "considerar cursando como aprovada". Disciplinas de currículo anterior por código. |
| **Integralização** | % do curso cumprido (barra sempre visível), com o teto das optativas, e projeção ao fim do plano. |
| **Planejador de semestres** | Semestres com nome real (obrigatório, no padrão da instituição), medidor de créditos com faixa, aviso de pré-requisito faltando, "Sugerir" (por quantas disciplinas liberam), montar plano até o fim, **grade oficial a partir da fase atual**, mover/arrastar disciplina entre semestres com "Desfazer". |
| **Salvar** | Automático no navegador; **Exportar/Importar (.json)** para trocar de aparelho. |
| **Uso offline e instalável** | PWA (manifest + service worker). |
| **Ajuda e Sobre** | Texto de como usar, quem desenvolveu, contato e aviso de que pode conter erros. |
| **Cabeçalho com "Última atualização: dd/mm/aaaa"** | Data do build. Mostra ao aluno que o site está vivo. |

### 3.2 Obrigatórias de qualidade (não são "extras")
- **Acessibilidade WCAG 2.2 AA** medida (contraste, alvos de toque de 44 px em tela de toque, teclado completo, nomes acessíveis, `role="meter"` nos medidores, links de pular, diálogos com foco). Alternativa a qualquer arrastar (WCAG 2.5.7): existe "Mover para…".
- **Responsivo:** uma coluna sem rolagem horizontal no celular; painel lateral só em telas largas.
- **Tema claro sempre** (decisão do PET; se outro curso quiser modo escuro, é decisão dele).
- **Testes**: seção 10.

### 3.3 Opcionais (só se o curso precisar e o responsável aprovar)
- **Versões das regras por período** (como o PET-ECV: pré-requisitos antigos até certo semestre, novos depois; seletor + fim automático por data; no planejamento, cada semestre usa as regras do seu período). Só use se o curso **tiver** uma mudança com data de vigência. Ver `src/dominio/curriculos/versoes.ts`.
- **Disciplinas só da coordenação** (`somenteCoordenacao`): escondidas do aluno (ex.: intercâmbio), por decisão registrada.
- **Disciplina fora do limite de créditos** (`foraDoLimiteDeAulas`): ex.: estágio que não conta no máximo de créditos do semestre, por decisão registrada.

### 3.4 O que **não** construir
- Conflito de **horário** e oferta de turmas (a ferramenta não tem esses dados e **não deve fingir** que tem). Em vez disso, rotule: *"sugestão da ferramenta, não considera a oferta de turmas"*.
- Conta de usuário, ranking, comparação entre alunos, qualquer coisa social.
- Qualquer chamada de rede em tempo de uso (exceto carregar o próprio site).
- "Previsão de nota", "chance de aprovação" e afins.

---

## 4. Entradas: o que pedir ao responsável **antes** de começar

Se faltar algo da lista **obrigatória**, pare e peça. Não prossiga com "provavelmente é assim".

### Obrigatório
1. **O documento oficial do currículo** (PDF ou página do sistema acadêmico), com código, nome, carga horária, créditos, fase/semestre, pré-requisitos e equivalências de **cada** disciplina, e a **integralização** (horas obrigatórias, optativas, complementares, estágio, TCC, total).
2. **Quem é o responsável** pela ferramenta (nome do grupo, contato) e **quem confere** os dados (coordenação).
3. **Nome do curso, da universidade/campus e do grupo** para o cabeçalho e o "Sobre", e o **padrão de nome de semestre** da instituição (UFSC: `AAAA.1` e `AAAA.2`).
4. **Formato do código de disciplina** da instituição (UFSC: três letras e quatro dígitos, `AAA9999`).
5. **Faixa de créditos por semestre** (mínimo e máximo) e **duração** (mínima e máxima em semestres), conforme o documento.
6. **Onde será publicado** e quem mantém a conta (ver `passagem-de-bastao.md`).

### Perguntas que mudam a modelagem (faça todas)
- Os semestres/fases são **numerados** (1º ao 10º) ou o curso é por **módulos, eixos ou blocos**?
- **Existe pré-requisito formal?** (Alguns cursos quase não têm.)
- Há pré-requisito por **carga horária mínima cumprida** ("só cursa o estágio com X horas")? *(Ainda não suportado, ver 7.3.)*
- Há **correquisito** (disciplinas "em conjunto")? *(Ainda não suportado.)*
- **Optativas** têm grupos/eixos com mínimo de horas por grupo? Quantas optativas por fase?
- Há atividades complementares, extensão, estágio, TCC, internato: contam **horas** no total? Têm **teto**? Contam no limite de créditos do semestre?
- Existe **mais de um currículo ativo** (alunos de currículos antigos convivendo)? Como migram?
- Há disciplinas **só da coordenação** ou **sob autorização** que não devem aparecer no plano?
- Houve **mudança de regra com data futura** (comunicado)?

---

## 5. Arquitetura (copie, não reinvente)

Use o repositório do PET-ECV como **molde**: copie a pasta `projeto/` (sem `node_modules`, sem `dist`, sem os dados do ECV) e troque os dados. Pilha: **TypeScript + React 19 + Vite + Vitest + Testing Library (jsdom)**, PWA com service worker próprio, publicação em GitHub Pages por GitHub Actions (que **roda os testes antes de publicar**).

```
projeto/
  src/dominio/            TypeScript PURO (sem React, sem DOM)
    tipos.ts              Disciplina, Curriculo, Integralizacao
    curriculos/           <id>.json (o currículo), paraAluno.ts, versoes.ts (opcional)
    regras/               motor: cumprida, requisitos, grafo, cascata, simulação, progresso
    aluno/                registro (status, plano, opções), importar/exportar, validações
    planejamento/         avaliar plano, sugerir, montar, grade oficial, nomes de semestre
    validacao/            validador de currículo
  src/app/                interface (React): componentes, estado, estilos (CSS), testes de tela
  scripts/                validar-curriculos.ts, exportar-publicacao.mjs
  public/                 manifest, sw.js, ícones
  docs/                   documentação (obrigatória, ver seção 11)
  .github/workflows/      publicar.yml (testa e publica)
```

**Regra de ouro da arquitetura:** `src/dominio/` não importa de `src/app/`, nem de `react`, nem usa `window`/`document`. Se precisar de data ou armazenamento, receba por parâmetro.

---

## 6. Modelo de dados do currículo

Um arquivo JSON por currículo, em `src/dominio/curriculos/`. Estrutura completa em `modelo-de-dados.md`. Resumo:

```jsonc
{
  "id": "bio-2019-1",                       // único; aparece nos arquivos exportados
  "curso": "Ciências Biológicas",
  "curriculo": "20191",
  "fonte": "Currículo oficial ... (órgão, data de emissão)",   // OBRIGATÓRIO
  "integralizacao": {                       // do documento oficial; null se o curso não tiver
    "obrigatoriasHA": 0, "optativasHA": 0, "complementaresMaxHA": 0,
    "estagioHA": 0, "projetoIntegradorHA": 0, "totalHA": 0,
    "aulasSemanais": { "min": 16, "max": 30 },
    "semestres": { "min": 8, "max": 14 }
  },
  "vagasOptativasPorFase": {},
  "disciplinas": [{
    "codigo": "BIO1001", "nome": "Biologia Celular",
    "tipo": "obrigatoria",                  // "obrigatoria" | "optativa"
    "grupo": "fase",                        // "fase" | "optativas" | "atividades-complementares"
    "fase": 1,                              // número; null para optativas
    "horasAula": 72, "aulasSemanais": 4,    // H/A e créditos (aulas por semana)
    "preRequisitos": [["BIO0001"], ["BIO0002", "BIO0003"]],   // OU de grupos E
    "equivalentes": [],                     // mesma forma
    "conjunto": [], "preCH": null,          // ainda não suportados: devem ficar vazios
    "alertas": []                           // contradições/dúvidas da fonte, em texto
  }]
}
```

**Expressões de pré-requisito = "OU de grupos E"** (forma normal disjuntiva): `[["A"],["B","C"]]` significa "A, **ou** (B **e** C)". Vazio `[]` = sem pré-requisito. Códigos que **não** estão no currículo (de currículos antigos) são mantidos: valem para alunos migrados.

**Mapeamento do documento para o JSON:** `(A eh B) ou (C eh D)` → `[["A","B"],["C","D"]]`. Se o documento usa notação própria, escreva a tabela de tradução em `docs/modelo-de-dados.md` do novo curso.

---

## 7. Regras do motor (resumo) e pontos de generalização

### 7.1 Regras (detalhes e origem em `regras-de-negocio.md`)
- **Cumprida:** está nas aprovadas **ou** todos os códigos de alguma alternativa de `equivalentes` estão (um nível só, sem encadear).
- **Pré-requisitos atendidos:** vazio → sim; senão, alguma alternativa com **todos** cumpridos.
- **Situação:** cumprida / disponível / bloqueada (com o que falta). **A fase não bloqueia**; é recomendação.
- **Relações:** pré-requisitos diretos/indiretos e dependentes por busca em largura; **menor distância vence**; "alternativa" quando a relação depende de um ramo OU.
- **Cascata:** marcar traz os pré-requisitos (primeira alternativa formada só por códigos do currículo); desmarcar remove dependentes que perderam o requisito.
- **Status:** aprovada entra no conjunto; cursando só conta se a opção estiver ligada; reprovada = não cursada.
- **Integralização:** obrigatórias (+ estágio e projeto integrador) + optativas **limitadas** ao teto; o excedente de optativas não conta; percentual até 100.
- **Plano:** `base(k)` = aprovadas ∪ (cursando, se a opção) ∪ semestres anteriores do plano; avisos de carga (mínimo/máximo de créditos, só em semestre com disciplina); repetida, já cumprida, fora do currículo.

### 7.2 O que é **específico do ECV** e precisa ser trocado (lista exata)
Ao copiar o molde, troque **somente** estes pontos e rode os testes:

| Onde | O que trocar |
|---|---|
| `src/dominio/curriculos/<arquivo>.json` | O currículo novo (substitui `ecv-2020-1.json`). |
| `src/app/estado/motorEcv.ts` | O `import` do JSON; `fases = Array.from({length: 10}...)` (número de fases do curso). |
| `src/dominio/planejamento/gradeOficial.ts` | `const FASES = 10` (número de fases). |
| `src/dominio/planejamento/rotuloSemestre.ts` | Padrão de nome de semestre (`AAAA.1`/`AAAA.2`) se a instituição usar outro. |
| `src/dominio/validacao/validarCurriculo.ts` | `FORMATO_CODIGO` (regex `AAA9999`) e a faixa de fases (`1` a `10`, mensagem incluída). `scripts/validar-curriculos.ts` e `scripts/comparar-curriculos.ts` apontam para os arquivos do ECV: aponte para o novo. |
| `src/dominio/regras/simulacao.ts` | Já trata atividades complementares pelo `grupo: "atividades-complementares"` e pelo teto `complementaresMaxHA`; só o **comentário** cita o código ECV2905. Se o curso não tiver complementares, deixe o grupo sem disciplinas. |
| `src/dominio/curriculos/versoes.ts` | Específico do ECV (quatro disciplinas, datas). **Apague** se o novo curso não tiver versões de regras; senão, reescreva com as alterações dele e a fonte. |
| `src/app/App.tsx` | Título, subtítulo, rodapé ("Baseado no currículo oficial ..."). |
| `src/app/componentes/Textos.tsx` | Textos de Ajuda e Sobre (nome do grupo, contato, sistema oficial: CAGR é da UFSC). |
| `index.html`, `public/manifest.webmanifest`, `public/sw.js`, `package.json` | Nome, descrição, ícones e o nome do cache (`curriculo-ecv-${VERSAO}` no `sw.js`). Para forçar a limpeza do cache nos aparelhos dos alunos depois de uma publicação com problema, troque `VERSAO`. |
| `src/dominio/aluno/tipos.ts` | `FORMATO_REGISTRO` e `CHAVE_LOCAL_STORAGE`: troque (ex.: `curriculo-interativo-bio`) para **não colidir** com outro curso no mesmo domínio. |
| `src/**/*.test.*` | Os testes com dados oficiais do ECV (`dadosOficiais.test.ts`, `estagio.test.ts`, etc.) **não servem**: reescreva com os dados do novo curso (ver seção 10). |
| `.github/workflows/publicar.yml` | Normalmente nada; confira o `node-version`. |

### 7.3 Variações de curso e como tratá-las
| Situação | Hoje | O que fazer |
|---|---|---|
| **Sem pré-requisitos** (todos `[]`) | Funciona. A "grade" vira só uma lista por fase/módulo e o planejamento sugere pela ordem da fase. | Esconda/reduza a visão de relações (não há o que destacar) **só com decisão do responsável**. |
| **Curso por módulos/eixos/blocos** (em vez de fases) | Mapeie módulo → `fase` (número) e use o **nome** do módulo no título da coluna. | Se a numeração não representar uma ordem, **não** use "grade oficial por fase" sem confirmar. |
| **Mais de 10 fases** (ex.: 12 semestres) | Suportado se trocar `FASES` e `fases` (7.2). | Ajuste os testes e a duração (`semestres`). |
| **Pré-requisito por carga horária mínima** (`preCH`) | **Não suportado.** O validador **rejeita** `preCH` preenchido para não ignorar em silêncio. | Implemente no motor **com testes** antes de aceitar o campo: `requisitosAtendidos` passa a receber o total de horas cumpridas; documente em `regras-de-negocio.md`. |
| **Correquisitos** (`conjunto`) | **Não suportado**; validador rejeita. | Implemente com testes (marcar junto, plano aceitando no mesmo semestre) e documente. |
| **Optativas por grupo** com mínimo de horas por grupo | Não modelado (só um teto total de optativas). | Estenda `integralizacao` com grupos e mínimos, implemente o cálculo e a tela, com testes. |
| **Atividades complementares/extensão** com teto | Modelado só para uma disciplina de complementares com `complementaresMaxHA`. | Generalize por `grupo` e registre o teto no dado. |
| **Estágio/internato** que não conta no limite de créditos | `foraDoLimiteDeAulas: true` (decisão do responsável, registrada). | Se houver várias, funciona por disciplina. |
| **Disciplinas anuais** (duram dois semestres) | Não modeladas. | **Pergunte**; pode exigir tratar como duas disciplinas ou estender o plano. |
| **Alunos em currículos antigos** | Códigos antigos aceitos nos pré-requisitos e no histórico; **regras de aproveitamento de horas não estão implementadas**. | Registre como pendência; não invente a regra de transição. |
| **Oferta intercalada** (só em .1 ou só em .2) | O app **não sabe**. Informação do PET-ECV: só as optativas são intercaladas. | Rotule as sugestões como "não considera a oferta de turmas" e avise sobre optativas. |

**Direito, Medicina, Biologia e outros:** a diferença quase sempre está em (a) poucos ou nenhum pré-requisito formal, (b) horas mínimas e atividades complementares com tetos, (c) internato/estágio longos e (d) número de semestres. Trate cada uma pela tabela acima e **pergunte o que faltar**; não copie suposições do ECV.

---

## 8. Roteiro (na ordem; cada etapa termina com testes passando)

**Etapa 0 — Preparação.** Crie uma pasta nova a partir do molde (seção 5), troque os pontos de 7.2 que não dependem de dados, rode `npm install`, `npm test`, `npm run build`. Crie `docs/ACOMPANHAMENTO.md` com data, responsável e a **lista de perguntas abertas** (seção 4).

**Etapa 1 — Auditoria do documento.** Leia o PDF inteiro. Anote: número de fases, tipos de disciplina, estrutura de pré-requisitos (há OU? códigos antigos?), integralização, casos estranhos. Escreva `docs/auditoria.md` do novo curso. **Pare e pergunte** o que a seção 4 listou como "muda a modelagem".

**Etapa 2 — Transcrição do currículo para JSON.**
- Transcreva **todas** as disciplinas, não só as que parecem importantes. Faça em lotes (por fase) e **confira cada lote contra o documento** (segunda leitura, de preferência por outro agente/pessoa).
- Mantenha `alertas` para cada ambiguidade. Pré-requisito apontando para a própria disciplina, ciclos, contradição entre colunas: **alerta, não correção**.
- Preencha `fonte` e `integralizacao` com os números **do documento**, não somados por você.

**Etapa 3 — Validação dos dados.** Rode o validador (`npm run validar-curriculos`). Ele confere: códigos únicos e no formato, ausência de ciclos, fases válidas, `conjunto` e `preCH` vazios, somas de horas por categoria **comparadas** com a integralização. **Toda divergência de soma** é um erro seu de transcrição ou uma ambiguidade do documento: investigue **antes** de seguir. *(No ECV, o validador pegou duas disciplinas marcadas como optativas por engano e uma carga horária errada.)*

**Etapa 4 — Motor.** Com o currículo validado, o motor do molde já funciona. Escreva os **testes com dados oficiais** (seção 10). Se o curso exige algo da tabela 7.3 que o motor não tem, implemente **com testes** e documente em `regras-de-negocio.md` com a marca **[DECISÃO]** e o motivo.

**Etapa 5 — Interface.** Troque títulos e textos (7.2). Confira a grade: nomes **inteiros**, sem hifenização, em 1440, 1280, 1024, 768 e 375 px. Confira a legenda (seis cores, com texto). Confira o planejador com um histórico real fornecido pelo responsável.

**Etapa 6 — Acessibilidade e revisões.** Rode a auditoria de acessibilidade (contraste medido por script, teclado completo, leitor de tela nos nomes, alvos de toque). Rode as duas revisões da seção 12 (UX/UI e caçador de bugs) e **corrija** o que acharem.

**Etapa 7 — Conferência humana.** Gere o **roteiro de validação** (lista de casos para a coordenação conferir contra o sistema oficial: "com estas disciplinas marcadas, o sistema deve mostrar X disponível"). O responsável executa e devolve divergências. **Não publique antes disto.**

**Etapa 8 — Publicação (só com pedido explícito).** Siga `publicacao.md`: repositório **público e vazio**, Pages com origem "GitHub Actions", pasta de exportação limpa (**sem** material de referência, sem histórico com e-mails pessoais), endereço **definitivo** definido antes de divulgar. Entregue ao responsável `passagem-de-bastao.md` adaptado ao novo curso.

---

## 9. Transcrição de PDF: armadilhas conhecidas (do ECV)

- **Texto de tabela de PDF quebra linha e perde colunas.** Leia o PDF renderizado e o texto extraído; se divergirem, vale o que se vê.
- **Tipo da disciplina (obrigatória/optativa) e horas** foram os campos mais errados na primeira transcrição. Confira contra a soma de horas da integralização.
- **Nomes iguais com códigos diferentes** (Cálculo 1 e equivalentes antigos) e **códigos antigos** nos pré-requisitos: mantenha ambos; o antigo vale para o aluno migrado.
- **Ementa × coluna estruturada** podem discordar. Registre `alertas`; use a coluna estruturada e **pergunte**.
- **Comunicados posteriores** (mudança de pré-requisito com data futura) **não** alteram o PDF. Entram como versão com data de vigência e **fonte do comunicado**.
- **Pré-requisito circular ou para si mesmo**: erro de cadastro. Marque como inválido, ignore no motor e **registre** (a leitura provável **não** é aplicada sem confirmação).

---

## 10. Testes obrigatórios (critério de "pronto")

Mínimo, todos passando em `npm test`:

1. **Motor** com o **currículo real** (não só fixtures): para uma amostra de disciplinas, pré-requisitos diretos e indiretos, dependentes, situação, equivalências, cascata de marcar e desmarcar, simulação e progresso. Inclua os casos de borda do documento (OU, códigos antigos, equivalências).
2. **Dados:** cada disciplina tem código válido, fase coerente, pré-requisitos apontando para códigos existentes (ou antigos conhecidos), sem ciclos, soma de horas igual à integralização.
3. **Plano:** avaliação por semestre (requisito faltando, repetida, já cumprida, fora do currículo, carga acima/abaixo), sugerir (ordem por impacto, respeito ao limite), montar até o fim (completo, sem problemas), **grade oficial** (calouro e aluno com atrasadas) e mover entre semestres.
4. **Registro:** ida e volta (exportar/importar) com **todas** as opções diferentes do padrão; arquivo antigo sem campos novos; entradas hostis (tipos errados, códigos inexistentes, `__proto__`, tamanhos absurdos).
5. **Interface:** marcar/desmarcar, relações ao clicar, simular, desfazer, plano (adicionar, remover, sugerir, mover, arrastar), nome de semestre obrigatório, persistência e restauração, importação com relatório.
6. **Acessibilidade:** nomes acessíveis únicos, diálogos, `role="meter"`, ordem de foco; contraste medido (≥ 4,5:1 para texto).
7. **Datas:** testes que dependem de "hoje" **fixam a data** (`vi.useFakeTimers({toFake:['Date']})`) para não quebrarem com o calendário.
8. **Regressão de tudo que já deu problema** (cada bug corrigido ganha um teste).

**Não aceite** "os testes passam" se eles só testam o que você mesmo escreveu sem os dados oficiais.

---

## 11. Documentação obrigatória (no repositório do novo curso)

- `README.md` (o que é, comandos, requisitos).
- `docs/ACOMPANHAMENTO.md` (concluído, pendências, **decisões numeradas com data e origem**, problemas, **registro de uso de modelos de IA caros**).
- `docs/modelo-de-dados.md`, `docs/regras-de-negocio.md` (cada regra com a marca **[FONTE: documento]**, **[DECISÃO]** ou **[CORREÇÃO]**).
- `docs/auditoria.md`, `docs/acessibilidade.md`, `docs/interface.md`.
- `docs/publicacao.md` e `docs/passagem-de-bastao.md` (para o grupo manter sem você).
- `docs/relatorio-cacador-de-bugs.md` (último relatório).
- `CLAUDE.md` (ou equivalente) na raiz, com as regras invioláveis da seção 2.

---

## 12. Revisões antes de entregar

1. **Revisor de UX/UI** (visual, medido): nomes inteiros, contraste, alvos, teclado, celular, o que um aluno **desatento** não entende. Meça no navegador, não "ache". A descrição desse agente está em `docs/revisores/revisor-ux-ui.md` (e em `.claude/agents/revisor-ux-ui.md`); ele entrega `docs/relatorio-ux-ui.md`.
2. **Caçador de bugs** (adversarial): um agente que age como usuário tentando **quebrar** a ferramenta (importação hostil, armazenamento corrompido, datas, planos enormes, arrastar coisas de fora, duas abas, offline) e escreve um relatório com passos de reprodução e gravidade. A descrição desse agente está em `docs/revisores/cacador-de-bugs.md` (e em `.claude/agents/cacador-de-bugs.md`); ele entrega `docs/relatorio-cacador-de-bugs.md`. Corrija os achados **Críticos e Altos** antes de publicar.
3. **Coordenação do curso** confere os dados e o roteiro de validação.

Registre cada revisão no `ACOMPANHAMENTO.md` (data, quem, o que achou, o que foi corrigido).

---

## 13. Lista de pronto (marque tudo antes de entregar)

- [ ] Li o guia inteiro e a seção 2 foi cumprida.
- [ ] O currículo tem `fonte`, `integralizacao` do documento e `alertas` para cada dúvida.
- [ ] O validador passa e **toda** divergência de soma foi explicada.
- [ ] `npm test` e `npm run build` passam (mostre a saída).
- [ ] Os testes usam **os dados oficiais do novo curso**, não os do ECV.
- [ ] Nada do ECV ficou: grep por `ECV`, `Engenharia Civil`, `PET-ECV`, `CAGR` (se não for UFSC) e `curriculo-interativo-ecv`.
- [ ] Nenhuma chamada de rede em uso; nenhum script ou fonte de terceiros; nenhum dado de aluno ou segredo no repositório.
- [ ] Acessibilidade medida; celular sem rolagem horizontal; nomes de disciplina inteiros.
- [ ] Revisor de UX/UI e caçador de bugs rodados; Críticos e Altos corrigidos.
- [ ] A coordenação conferiu o roteiro de validação.
- [ ] Sugestões automáticas rotuladas como "sugestão da ferramenta, não considera a oferta de turmas".
- [ ] Site diz "pode conter erros; confira no sistema oficial".
- [ ] `passagem-de-bastao.md` pronto e a **passagem foi ensaiada** com quem vai manter.
- [ ] Nada foi publicado sem pedido explícito do responsável; o **endereço é definitivo**.

---

## 14. Como conversar com o responsável

- **Pergunte, não suponha**: "o documento diz A na coluna e B na ementa; qual vale?" é melhor que escolher.
- **Diga o que NÃO está pronto** ao entregar, com o mesmo destaque do que está.
- **Mostre números verificáveis** (saída dos testes, contagem de disciplinas, soma de horas) em vez de "está tudo certo".
- **Corrija-se em voz alta** quando errar (aconteceu no ECV: uma afirmação sobre o estágio estava errada; foi dito, corrigido e testado).
- **Não prometa** o que a ferramenta não faz (horário, oferta, matrícula).
- Registre **cada decisão do responsável** com data no `ACOMPANHAMENTO.md` (D1, D2, ...), incluindo o motivo.

---

## 15. Prompt inicial sugerido para o agente

> Você vai montar o Currículo Interativo do curso **[NOME]** da **[UNIVERSIDADE]**, para o grupo **[GRUPO]**. Leia `projeto/docs/guia-para-agentes-novo-curso.md` por inteiro e `projeto/docs/regras-de-negocio.md`. Não escreva código antes de: (1) receber o documento oficial do currículo, (2) me fazer as perguntas da seção 4 do guia e (3) eu responder. Siga o roteiro da seção 8, não invente regra acadêmica, não publique nada sem eu pedir, e ao fim apresente a lista de pronto (seção 13) marcada, com a saída dos testes.
