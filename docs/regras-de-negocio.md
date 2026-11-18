# Regras de negócio do motor (`src/dominio/regras/`)

Fonte das regras: PDF 2020.1 (decisão D1). Quando uma regra reproduz o programa original, a referência é R1–R5 da [auditoria](01-auditoria-e-diagnostico.md#32-regras-de-negócio-originais-código). Marcadores de origem: **[PDF]**, **[ORIGINAL]**, **[DECISÃO]** (escolha de projeto, documentada e revisável) e **[CORREÇÃO]** (difere do original de propósito).

O motor é TypeScript puro: não conhece React nem o DOM, e todas as funções são **puras** (recebem o estado e devolvem um novo valor, sem mutação).

## 1. Entrada: o que o aluno já cumpriu

O motor recebe um **conjunto de códigos aprovados** (`Set<string>`). Esse conjunto pode conter códigos que não pertencem ao currículo, como disciplinas do currículo 1991.1 vindas de um histórico.

- **Reprovada** e **em andamento** **não** entram nesse conjunto. Para as regras, as duas equivalem a "não cumprida" [PDF: o pré-requisito exige a disciplina cursada com aprovação]. Como exibir esses status é responsabilidade da interface; o motor não os conhece.
- Planejar o próximo semestre **supondo aprovação** nas disciplinas em andamento é uma simulação. A interface faz isso passando `aprovadas ∪ emAndamento` ao motor.

## 2. Disciplina cumprida (equivalências) [PDF]

`cumprida(codigo, aprovadas)` é verdadeiro se:
1. `aprovadas` contém `codigo`; **ou**
2. a disciplina pertence ao currículo e **todos** os códigos de **alguma** alternativa de `equivalentes` estão em `aprovadas`.

A equivalência é aplicada em **um único nível**, sem encadear equivalência de equivalência [DECISÃO: o PDF lista as equivalências diretas, e encadear poderia criar validações que o DAE não reconhece].

## 3. Pré-requisitos atendidos [PDF]

`requisitosAtendidos(codigo, aprovadas)`:
- expressão vazia → verdadeiro;
- senão, verdadeiro se **alguma** alternativa tiver **todos** os seus códigos cumpridos (seção 2).

Um código externo ao currículo é cumprido somente se estiver em `aprovadas`.

O ECV2974 tem a expressão vazia por causa da decisão D1 (o PDF cita a própria disciplina como pré-requisito).

## 4. Situação de cada disciplina

| Situação | Condição |
|---|---|
| `cumprida` | `cumprida(codigo)` |
| `disponivel` | não cumprida e `requisitosAtendidos` |
| `bloqueada` | não cumprida e requisitos não atendidos |

Para uma disciplina `bloqueada`, o motor informa **o que falta**: para cada alternativa, os códigos ainda não cumpridos. A interface usa isso para explicar o bloqueio, por exemplo "faltam ECV2401 e ECV2505".

A fase **não** é uma regra de bloqueio [ORIGINAL R5 e PDF: a fase é só uma recomendação]. A interface pode ordenar ou filtrar por fase.

## 5. Grafo de dependências (visualização, original R1)

Arestas: para cada disciplina D e cada código P **do currículo** em qualquer alternativa de pré-requisito de D, existe a aresta P → D. Códigos externos não entram no grafo.

- `preRequisitos(codigo)` devolve um mapa `código → distância`, calculado por **busca em largura** sobre as arestas invertidas. Distância 1 é pré-requisito **direto**; distância ≥ 2 é **indireto**.
- `dependentes(codigo)` devolve um mapa `código → distância`, por busca em largura sobre as arestas. Distância 1 é "tranca diretamente"; distância ≥ 2 é "tranca indiretamente".
- A **menor distância vence** [CORREÇÃO]. No original, a cor dependia da ordem do laço. Por exemplo, ao clicar em ECV2601, o ECV2401 aparecia como indireto embora seja direto. Os **conjuntos** de disciplinas são os mesmos do original; só a classificação direto/indireto é corrigida.
- `viaAlternativa` [DECISÃO]: a relação P → D recebe `true` quando P **não está em todos os ramos** de D. **Ramos** são as alternativas formadas só por códigos do currículo; se não houver nenhuma, contam todas as alternativas.
  - Exemplo: MTM3120 = (MTM3101) ou (MTM3110). O único ramo do currículo é MTM3110, então MTM3110 **não** aparece como opcional. A alternativa com código antigo só importa para alunos migrados.
  - Nas relações indiretas, vale a bandeira do primeiro caminho mais curto encontrado.
  - Isso evita que a interface apresente como obrigatório algo que é opcional, e vice-versa.

## 6. Marcar e desmarcar com cascata (original R2 e R3)

`marcar(aprovadas, codigo)` [ORIGINAL R2 + DECISÃO para o OU] devolve um novo conjunto com `codigo` e, se os requisitos de `codigo` não estiverem atendidos, também os pré-requisitos dele, recursivamente:
- se os requisitos já estão atendidos, nada mais é adicionado;
- senão, escolhe a **primeira alternativa formada só por códigos do currículo** (o ramo do currículo 2020.1) e marca recursivamente cada código dela;
- se nenhuma alternativa for formada só por códigos do currículo, marca apenas o próprio `codigo`.

`desmarcar(aprovadas, codigo)` [ORIGINAL R3 generalizado para o OU] remove `codigo` e repete até estabilizar: remove toda disciplina **do currículo** cujos requisitos **estavam atendidos antes** e deixaram de estar. Os códigos externos nunca são removidos automaticamente.
- Uma disciplina que já estava marcada sem os seus requisitos (quebra de pré-requisito, §9) não é apagada quando o aluno desmarca outra disciplina sem relação com ela [DECISÃO].
- Se um pré-requisito continua cumprido por equivalência, os dependentes ficam marcados. O mesmo vale para `marcar`: não acrescenta o que já está coberto por equivalência (consequência de §2 e §3).
- Com dados só de E, o resultado é idêntico à cascata recursiva do original.

`marcarFase(aprovadas, fase, valor)` aplica `marcar` ou `desmarcar` a todas as obrigatórias da fase [ORIGINAL R4].

## 7. Simulação (original R5)

`simular(aprovadas)` devolve:
- a lista de disciplinas `disponivel`;
- **disponíveis**: soma de `horasAula` e `aulasSemanais` das disponíveis, separadas em obrigatórias e optativas [ORIGINAL: os rótulos "h" e "créditos" correspondem a H/A e Aulas];
- **cursadas**: soma de `horasAula` das disciplinas do currículo `cumprida`, separadas em obrigatórias e optativas.

As somas de disponíveis **não** representam um semestre viável. É o mesmo comportamento do original, e o limite de 30 aulas semanais fica para o planejador (etapa 4).

## 8. Progresso de integralização [PDF, p. 16]

`progresso(aprovadas)`, comparado com `integralizacao`:
- obrigatórias cumpridas (h-a) em relação a `obrigatoriasHA + estagioHA + projetoIntegradorHA`;
- optativas: soma das optativas cumpridas, com ECV2905 (Atividades Complementares) limitada a `complementaresMaxHA`, em relação a `optativasHA`.

**Integralização geral (%)** [DECISÃO, etapa 5]: `progresso(...).geral` soma as obrigatórias cumpridas com as optativas cumpridas **limitadas a `optativasHA` (432 h-a)**; o excesso de optativas não conta. O total é `obrigatoriasHA + estagioHA + projetoIntegradorHA + optativasHA` = **4518 h-a**, o mesmo total mínimo do PDF. `percentual = cumpridasHA / totalHA × 100`, no máximo 100. Sem `integralizacao` no currículo, total e percentual são `null`.

As regras de transição para alunos migrados (até 270 h-a do currículo 1991.1) e de extensão (ECV2906/ECV2000) **não** estão implementadas. Ver a pendência em ACOMPANHAMENTO.

## 10. Status do aluno por disciplina (etapa 4) [DECISÃO, novidade em relação ao original]

Cada disciplina tem um destes status: `nao-cursada` (padrão, ausente do registro), `aprovada`, `cursando` ou `reprovada`. Códigos de outro currículo (ex.: MTM3101) podem ser registrados como `aprovada`, para atender alunos migrados.

| Status | Efeito nas regras |
|---|---|
| `aprovada` | Entra em `aprovadas` (seção 1). |
| `cursando` | Não satisfaz pré-requisito no semestre atual. Na simulação e no planejamento, conta como aprovada **somente** se a opção "Considerar disciplinas em andamento como aprovadas" estiver ligada (padrão: ligada). |
| `reprovada` | Igual a `nao-cursada` para as regras. É só um registro do histórico, exibido na interface. |

- A cascata de `marcar`/`desmarcar` (seção 6) altera **somente** o status `aprovada`:
  - `marcar` torna aprovados os pré-requisitos que faltam, sobrescrevendo `nao-cursada` e `reprovada`;
  - `desmarcar` muda para `nao-cursada` os dependentes aprovados que perderam o requisito.
- Os status `cursando` nunca são alterados automaticamente.

## 11. Planejamento de semestres (etapa 4) [DECISÃO, novidade]

O plano é uma lista ordenada de semestres futuros, e cada semestre é uma lista de códigos do currículo. A base de cada semestre `k` é:

`base(k) = aprovadas ∪ (cursando, se a opção estiver ligada) ∪ disciplinas dos semestres 1..k-1 do plano`

Para cada semestre, o motor informa:

| Verificação | Tipo | Regra |
|---|---|---|
| Requisito não atendido | **erro** | A disciplina não tem os requisitos atendidos com `base(k)`; o motor diz o que falta (seção 4). |
| Já cumprida | **erro** | A disciplina já está cumprida em `base(k)`, ou aparece em mais de um semestre do plano. |
| Fora do currículo | **erro** | Código que não pertence ao currículo. |
| Acima do máximo | aviso | Soma de `aulasSemanais` acima de `integralizacao.aulasSemanais.max` (30) [PDF]. |
| Abaixo do mínimo | aviso | Soma de `aulasSemanais` abaixo de `integralizacao.aulasSemanais.min` (16) [PDF]. A UFSC admite exceções, por isso é aviso e não erro. |
| Correquisitos | — | Não verificados: o campo `conjunto` está vazio em todo o PDF (seção 9). |

O plano também informa a **integralização projetada**: o `progresso` (seção 8) calculado com tudo o que está cumprido ou planejado.

**Sugestão de semestre** [DECISÃO; heurística identificada como sugestão, nunca como regra oficial]. `sugerirSemestre(base, limiteAulas, quantidade)` percorre as **obrigatórias** disponíveis com `base` nesta ordem:
1. **mais dependentes** (total, diretos e indiretos, seção 5): é o **impacto**, quantas outras disciplinas do curso ela libera;
2. menor fase;
3. código.

Cada disciplina é adicionada enquanto houver menos de `quantidade` (opção do aluno, `disciplinasPorSemestre`, de 1 a 12, padrão 5) e se ainda couber em `limiteAulas` (padrão 30, o máximo do PDF). A que não cabe nos créditos é pulada e as seguintes continuam sendo tentadas. Optativas nunca são sugeridas automaticamente, porque a escolha é do aluno.

- Até a versão anterior a ordem era "menor fase primeiro". Mudou a pedido do usuário: o que mais "destranca" o curso vem antes, mesmo de fase maior.
- **Montar o plano até o fim** (`montarPlano`): repete a sugestão semestre a semestre, a partir do histórico, até cobrir todas as obrigatórias. O que entra em um semestre conta como cumprido para os seguintes. Para quando as obrigatórias acabam, quando nada mais cabe, ou em 15 semestres (duração máxima do curso no PDF). Devolve `completo` e as `faltantes`. Ignora o plano atual (a interface pede confirmação antes de substituí-lo). Não escolhe optativas: faltam 432 h-a, e a escolha é do aluno. De um histórico vazio, com 7 disciplinas por semestre, cobre as 62 obrigatórias, com o estágio no mesmo semestre do TCC II e de outras disciplinas (ver "Estágio" abaixo). Com 1 por semestre não cabe em 15 semestres, e o resultado informa o que ficou de fora.
- **Montar pela grade oficial** (`montarGradeOficial`; botão "Montar pela grade oficial"): cada semestre traz as obrigatórias **pendentes** de uma fase do currículo (campo `fase` do PDF), em ordem. Começa na **fase atual**: a seguinte à mais alta fase cujas obrigatórias o aluno já cumpriu em pelo menos metade (sem nenhuma, a 1ª). As obrigatórias de fases anteriores que ficaram para trás ("atrasadas") entram **junto com a fase atual**. Fases já cumpridas são puladas. Um grupo que passa de `limiteAulas` (o estágio não conta) ou que tem uma disciplina dependente de outra do mesmo grupo é dividido em semestres seguidos, e cada semestre usa os pré-requisitos do seu período (D5). Não escolhe optativas e ignora o plano atual. É uma heurística de apoio: a "fase atual" é deduzida do que foi marcado, e a tela a mostra. Um calouro obtém 10 semestres sem nenhum problema de pré-requisito.
- **Oferta de turmas** [informado pelo usuário]: só as **optativas** são oferecidas de forma intercalada, em .1 ou em .2; as obrigatórias são oferecidas todo semestre. O app **não sabe** qual optativa é oferecida em qual semestre e **não considera a oferta**: toda sugestão (Sugerir, plano otimizado e grade oficial) é rotulada "sugestão da ferramenta, não considera a oferta de turmas".
- **Mover disciplina entre semestres** (operação `mover` do plano): tira a disciplina de um semestre e a põe no fim de outro; mesmo semestre ou destino inexistente não muda nada. Não bloqueia: o plano é reavaliado e mostra "pré-requisito faltando" se for o caso. Por arrasto (mouse) ou por "Mover para…" (teclado, toque); a ação tem aviso com "Desfazer".
- **Estágio fora do limite de créditos** [DECISÃO D3, informada pelo usuário]: o PDF dá ao estágio (ECV2000) 30 aulas semanais, equivalentes às 540 h-a, mas ele é feito fora da sala de aula e os alunos o cursam junto com o TCC II e, às vezes, com uma optativa. Por isso a disciplina tem `foraDoLimiteDeAulas: true`: suas 30 aulas **não entram** na soma de créditos do semestre (16 a 30), nem na sugestão (`sugerirSemestre`), e semestre com estágio **não gera aviso de "abaixo do mínimo"**. As **horas-aula** (540) continuam somando nas horas do semestre e na integralização. O aviso de "acima do máximo" continua valendo para as demais disciplinas.
- **Versão das regras de pré-requisito** (`opcoes.versaoRegras`, decisão D5): `"2020.1"` (padrão; pré-requisitos atuais, até 2027.2) ou `"2028.1"` (novos, a partir de 2028.1). Só quatro disciplinas diferem (fonte: comunicado oficial da Coordenação, via CALEC, 18/11/2026):
  - ECV2501: INE5108 → INE5108 e ECV2302.
  - ECV2505: ECV2401 e ECV2404 → ECV2401, ECV2404 e MTM3131.
  - ECV2932: ECV2405 → ECV2603.
  - ECV2704: sem pré-requisito → as sete obrigatórias da 4ª fase (ECV2401, ECV2402, ECV2403, ECV2404, ECV2405, ENS5101, MTM3103).
  A escolha (e o fim automático da 2020.1 em 1/11/2027) vale para a **grade e a simulação**. Ausente ou inválido volta a 2020.1.
  **No planejamento, cada semestre usa as regras do seu período**, pelo nome do semestre: até 2027.2, as atuais; de 2028.1 em diante, as novas. Por isso o primeiro semestre do plano é obrigatório (AAAA.1 ou AAAA.2, escolhido numa lista; sem escolha, o próximo do calendário) e os demais seguem em sequência, sem renomear. O que entra num semestre conta como cumprido para os seguintes, e a sugestão e a montagem do plano também usam as regras do semestre em que a disciplina cairia.
- **Nome do semestre** (`opcoes.semestreInicial`, "AAAA.1" ou "AAAA.2"): obrigatório na interface (lista, sem texto livre). O semestre `k` do plano recebe o nome contado de meio em meio ano (2027.1, 2027.2, 2028.1…) e o nome define quais pré-requisitos valem nele (decisão D5). Arquivos antigos sem o campo usam o próximo semestre do calendário.
- **A sugestão não verifica conflito de horário nem a oferta do semestre.** O currículo (PDF) não traz horários de turma, e sem esses dados é impossível garantir que não há conflito. A interface avisa isso na nota da sugestão.

## 12. Registro salvo e arquivo exportado (etapa 4)

```jsonc
{
  "formato": "curriculo-interativo-ecv",
  "versao": 1,
  "curriculoId": "ecv-2020-1",
  "atualizadoEm": "2026-11-11T15:00:00.000Z",
  "status": { "ECV2101": "aprovada", "MTM3101": "aprovada", "FSC5002": "cursando", "MTM3120": "reprovada" },
  "plano": { "semestres": [ { "codigos": ["ECV2201", "FSC5122"] } ] },
  "opcoes": { "cursandoComoAprovada": true, "limiteAulas": 30, "disciplinasPorSemestre": 5, "semestreInicial": "2027.1", "versaoRegras": "2020.1" }
}
```

- O mesmo formato é usado no `localStorage` (chave `curriculo-interativo-ecv:v1`) e no arquivo exportado (`.json`).
- A importação valida o arquivo e **nunca aplica dados parcialmente inválidos sem avisar**:
  - `formato` diferente, `versao` desconhecida ou JSON malformado: rejeita o arquivo com uma mensagem clara.
  - `curriculoId` diferente: rejeita.
  - Status inválido: ignora a entrada e lista o problema no relatório de importação.
  - Código no plano que não pertence ao currículo: remove do plano e lista no relatório.
  - Código desconhecido no `status`: aceita como código de outro currículo e informa no relatório.
- Os dados ficam **só no navegador do aluno**. Não há servidor nem envio de dados.

## 9. Fora do motor (registrado para não ser esquecido)

- **Correquisitos (`conjunto`) e `preCH`**: estão vazios em todo o PDF 2020.1. Para não ignorar esses campos em silêncio, o validador passa a rejeitar valores não vazios até que o motor os suporte.
- **Quebra de pré-requisito** (autorização da coordenação): não modelada. A interface pode permitir marcar sem cascata.
