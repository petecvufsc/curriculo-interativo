# Fase 1 — Auditoria e diagnóstico do "Currículo Interativo" (PET-ECV/UFSC)

Data: 11/11/2026 · Escopo: somente auditoria, nada foi implementado.

Legenda de evidência usada neste documento:

- **[CÓDIGO]**: lido no código descompilado do programa original (evidência mais forte).
- **[PDF]**: lido no currículo oficial `CURRICULO_ENGENHARIA_CIVIL_20201.pdf`.
- **[TELA]**: observado na screenshot ou no vídeo.
- **[INFERIDO]**: conclusão minha, ainda não confirmada.
- **[DESCONHECIDO]**: precisa ser investigado.

---

## 1. Inventário dos arquivos

| Caminho | Tipo real | Conteúdo |
|---|---|---|
| `referencias/instalador_original/CurriculoInterativoSetup.msi` (57 MB) | Windows Installer (OLE) | Instalador completo |
| `referencias/instalador_original/!*` (30 arquivos) | Tabelas internas do MSI extraídas | Diálogos do instalador (pt-BR), atalhos, registro. Fabricante: **PET ECV**; produto: **Currículo Interativo** |
| `referencias/instalador_original/_9ABE58…` (56 MB) | Arquivo **CAB** (MSCF) | Carga útil do MSI (8 arquivos, abaixo) |
| `referencias/instalador_original/Binary.MSVBDPCADLL` | DLL nativa | Ação customizada padrão do Visual Studio Installer |
| `referencias/instalador_original/Binary.*Bitmap/Btn`, `Icon.*.exe` | Imagens/ícone | Banner do instalador e ícone do app (`.ico`, apesar da extensão `.exe`) |
| `referencias/screenshotsvideo/interface principal.png` | PNG 1260×710 | Tela principal |
| `referencias/screenshotsvideo/funcinamento.mp4` | MP4 1270×716, 55 s | Demonstração de uso |
| `referencias/documentação/CURRICULO_ENGENHARIA_CIVIL_20201.pdf (1).PDF` | PDF, 16 páginas | Currículo oficial 2020.1 (gerado em 11/11/2026) |
| `README.txt` | vazio | — |
| `projeto/` | vazio (antes desta auditoria) | — |

Conteúdo do CAB (extraído só para leitura, em pasta temporária; **nada foi executado**):

| Arquivo | Identificação |
|---|---|
| `Currículo Interativo.exe` (138 MB) | Executável **.NET 6 single-file, self-contained, win-x86**; nome interno do projeto: `WinFormsApp2` |
| `PresentationNative_cor3.dll`, `PenImc_cor3.dll`, `wpfgfx_cor3.dll`, `D3DCompiler_47_cor3.dll`, `vcruntime140_cor3.dll` | Bibliotecas nativas do runtime .NET 6.0.22 (Microsoft) |
| `icone.ico` | Ícone do app |
| `WinFormsApp2.pdb` | Símbolos de depuração (Portable PDB) |

Dentro do executável há 440 arquivos; **só um é do PET**: `WinFormsApp2.dll` (1 MB). O resto é runtime .NET e traduções da Microsoft. Não existe banco de dados, JSON, CSV, XML ou arquivo de configuração com dados do curso. **Todos os dados estão fixos no código.**

## 2. Tecnologia original

- Linguagem C#, **Windows Forms**, .NET 6.0.22, compilado para Windows 32 bits (`win-x86`), Release.
- Janela única de tamanho fixo (1264×681, sem maximizar), fonte Segoe UI (6–12 pt).
- Três janelas: `Form1` (principal), `Ajuda`, `Sobre`.
- Sem dependências externas, sem rede, sem persistência (não salva nada em disco).
- Caminho de build no PDB indica um projeto de bolsista em `OneDrive\...\curriculo Interativo Final`.

## 3. Recuperação de código e dados

**Recuperação completa.** Com sua autorização, usei o ILSpy (`ilspycmd` 11.2, NuGet) para descompilar `WinFormsApp2.dll` em C# legível. Isso só leu o arquivo; o programa não foi executado.

Salvo no repositório (fora de `referencias/`, que segue intacta):

- `projeto/docs/engenharia-reversa/disciplinas_programa_original.csv`: as **94 disciplinas** exatamente como o programa as define (código, nome, créditos, horas, fase, optativa, pré-requisitos).
- `projeto/docs/engenharia-reversa/logica_original_Form1.cs.txt`: toda a lógica de negócio descompilada (cerca de 400 linhas).

### 3.1 Modelo de dados original [CÓDIGO]

```
Disciplina { nome, creditos, horas, semestre (1..10; vazio para optativas), optativa, label, checkbox }
UmaDisciplina { disciplina, listaPreRequisitos: List<Disciplina>, listaTrancadas (declarada, nunca usada) }
```

- Pré-requisitos são **uma lista simples, sempre cumulativa (E)**. Não existem pré-requisitos alternativos (OU), correquisitos, equivalências, carga horária mínima nem status de reprovado ou em andamento.
- 62 obrigatórias (fases 1–10) e 32 optativas (sem fase).

### 3.2 Regras de negócio originais [CÓDIGO]

| # | Ação do usuário | Comportamento exato |
|---|---|---|
| R1 | Clicar no **nome** da disciplina | Limpa os destaques, pinta a disciplina de **azul**, os pré-requisitos diretos de **verde**, os indiretos (recursivo) de **verde-claro**, as que ela tranca diretamente de **vermelho** e as que tranca indiretamente (recursivo) de **laranja**. Tudo em negrito. |
| R2 | **Marcar** uma disciplina como cursada | Marca recursivamente **todos os pré-requisitos** (diretos e indiretos). |
| R3 | **Desmarcar** uma disciplina | Desmarca recursivamente **todas as disciplinas que dependem dela**, em cascata, porque o evento é `CheckedChanged`. |
| R4 | Checkbox do cabeçalho "Nª Fase" | Marca ou desmarca todas as disciplinas da fase. Por causa de R2 e R3, a ação se propaga para outras fases. O checkbox do cabeçalho não reflete mudanças individuais. |
| R5 | **Simular** | Uma disciplina fica **disponível** (verde-escuro) se **não está marcada** e **todos os pré-requisitos diretos estão marcados**. Isso inclui disciplinas sem pré-requisito, **de qualquer fase**. Mostra a soma de horas e créditos disponíveis (obrigatórias e optativas) e as horas cursadas (obrigatórias e optativas). |
| R6 | Limpar Seleção | Desmarca todos os checkboxes. |
| R7 | Limpar Disciplinas | Remove só os destaques de cor. |
| R8 | Ajuda / Sobre | Janelas com texto fixo (contato: petecv@contato.ufsc.br, (48) 3721-9940). |

Paleta original: verde institucional `#0E7B5F` (cabeçalhos), painel lateral `#0E7B5F` com 49% de opacidade, Green, LimeGreen, Red, DarkOrange, Blue.

### 3.3 Defeitos e peculiaridades do original (devem ser documentados, não copiados sem decisão)

1. **Cor dependente da ordem (R1).** O algoritmo pinta "o último a escrever vence". Exemplo real: ao clicar em *Análise Estrutural II* (ECV2601), o ECV2401 é pré-requisito **direto**, mas aparece como **indireto** (verde-claro), porque também é pré-requisito do ECV2505. O mesmo pode ocorrer entre "trancada diretamente" e "indiretamente".
2. **Simular ignora a fase.** Disciplinas sem pré-requisito (ex.: Geologia, Expressão Oral e Escrita, Álgebra Linear) aparecem sempre como disponíveis, e o total de horas disponíveis não representa um semestre viável (não respeita o máximo de 30 aulas).
3. A recursão não tem proteção contra ciclos. Não há ciclos nos dados, mas um erro de cadastro travaria o programa.
4. Código morto: `listaTrancadas` e o `case 2` de `procuraTrancadas`.

## 4. Divergências entre o programa original e o currículo oficial 2020.1

Comparei as 94 disciplinas do programa com o PDF.

**Pré-requisitos faltando ou diferentes no original:**

| Disciplina | Programa original | PDF 2020.1 |
|---|---|---|
| ECV2501 Ações e Segurança | INE5108 | ECV2302 **e** INE5108 |
| ECV2505 Mecânica dos Sólidos II | ECV2401, ECV2404 | ECV2401, ECV2404 **e MTM3131** |
| ECV2704 Expressão Oral e Escrita | **nenhum** | ECV2401, 2402, 2403, 2404, 2405, ENS5101, MTM3103 |
| ECV2932 Planejamento de Transportes | ECV2405 | Coluna: **ECV2603**; ementa: "ECV2405" (o próprio PDF se contradiz) |
| ECV2844 Tópicos Esp. de Topografia | ECV2402 | Coluna: ECV2402; ementa: "ECV2304" (o próprio PDF se contradiz) |

**Carga horária e códigos:**

| Item | Original | PDF |
|---|---|---|
| Estágio | código **ECV2001**, 216 h, 12 cr | **ECV2000**, 540 h-a, 30 aulas |
| ECV2504 Materiais de Construção II | 72 h, 4 cr | 54 h-a, 3 aulas |
| ECV2604 Instalações Prediais I | 72 h, 4 cr | 54 h-a, 3 aulas |

**Simplificações aceitáveis, mas que precisam ser registradas.** No PDF, várias disciplinas têm pré-requisitos com OU que citam códigos antigos (ex.: ECV2302, ECV2601, MTM3120, MTM3131, MTM3103, INE5108). O original manteve apenas o ramo com códigos do currículo 2020.1. Para alunos migrados do currículo 1991.1 o resultado pode ser diferente.

**Itens do PDF ausentes no original:** optativas ECV2905 (Atividades Complementares), ECV2906 (Extensionistas), ECV2971–2974 (Intercâmbio); equivalências; regras de integralização (432 h-a de optativas, até 54 h-a de complementares, total de 4518 h-a). O PDF também tem um erro próprio: ECV2974 lista a si mesma como pré-requisito.

**Erros de digitação nos dados originais:** "Satélite54", "Planta de Valores Genérico", "TCC: Projeto Integrado II", "Métodos de elementos Finitos".

## 5. Análise da interface [TELA + CÓDIGO]

- **Layout**: grade de 10 colunas (1ª–10ª fase) com cabeçalho verde e checkbox por fase; abaixo, a faixa "Optativas" em grade de 8×4; à direita, painel com totais ("Disciplinas Disponíveis", "Disciplinas Cursadas") e os botões Limpar Seleção, Limpar Disciplinas, Simular, Ajuda e Sobre; no rodapé, a legenda de 6 cores.
- **Componentes**: cada disciplina é um checkbox ("cursada") mais um rótulo clicável ("ver relações"). São dois gestos diferentes no mesmo item, e isso não é óbvio para o usuário (a Ajuda precisa explicar).
- **Problemas de UX observados**: fonte de 6–7 pt (baixa legibilidade); significado transmitido só por cor (verde/verde-claro e vermelho/laranja são difíceis de distinguir, inclusive para daltônicos); janela fixa, sem responsividade; nenhum estado salvo, então o aluno refaz tudo a cada uso; nenhuma visualização das ligações (só cores, sem setas).
- **Vídeo**: confirma R1, R2, R5 e a janela de Ajuda. A resolução no visualizador é baixa, então ele serve só como confirmação; a fonte de verdade é o código.

## 6. Inventário preliminar de funcionalidades

| Funcionalidade | Status no original | Evidência |
|---|---|---|
| Grade curricular por fase (62 obrigatórias, 32 optativas) | Existe | CÓDIGO/TELA |
| Ver pré-requisitos diretos e indiretos de uma disciplina | Existe | CÓDIGO |
| Ver disciplinas trancadas direta e indiretamente | Existe | CÓDIGO |
| Marcar cursadas com cascata para pré-requisitos e dependentes | Existe | CÓDIGO |
| Marcar fase inteira | Existe | CÓDIGO |
| Simular disponíveis e somar horas/créditos | Existe | CÓDIGO |
| Ajuda e Sobre | Existe | CÓDIGO |
| Pré-requisitos alternativos (OU), equivalências, correquisitos | **Não existe** | CÓDIGO |
| Status reprovada / em andamento | **Não existe** | CÓDIGO |
| Importar histórico, salvar ou exportar plano | **Não existe** | CÓDIGO |
| Planejar vários semestres futuros | **Não existe** | CÓDIGO |
| Progresso de integralização (432 h optativas, etc.) | **Não existe** | CÓDIGO |

## 7. O que ainda precisa ser descoberto ou decidido

1. ✅ **Decidido em 11/11/2026: vale o PDF 2020.1** (ver D1 em `ACOMPANHAMENTO.md`). Pergunta original: **Fonte de verdade das regras (mais importante).** A nova versão deve reproduzir o original (com os 5 pré-requisitos divergentes) ou seguir o PDF 2020.1, com pré-requisitos corrigidos e grupos OU? Recomendo seguir o PDF como dado oficial e manter o conjunto "original" apenas como referência nos testes de paridade.
2. Escopo de funcionalidades novas, que não existiam no original (status reprovada/em andamento, planejamento de vários semestres, importação de histórico): entram agora ou depois?
3. Quem confirma as contradições do PDF (ECV2932, ECV2844, ECV2974)? A coordenação do curso?
4. Pré-requisitos com códigos antigos (currículo 1991.1): devemos atender alunos migrados?
5. O "Simular" deve considerar a fase e o limite de 30 aulas por semestre? O original não considera.
6. Formato do histórico para importação: o CAGR/SIGA exporta algo (PDF do histórico, CSV)? Uma amostra anonimizada ajudaria.
7. Hospedagem: o PET tem conta institucional (GitHub da UFSC, servidor do departamento)?

## 8. Proposta de arquitetura

As regras são pequenas, determinísticas e não exigem servidor. Os dados são um currículo público. Por isso, a melhor relação entre custo e benefício é **uma aplicação web estática, instalável como PWA**.

```
projeto/
  packages/
    dominio/        # TypeScript puro: modelo, motor de regras, validação. Sem React.
      curriculo/    # JSON versionado: ecv-2020-1.json (PDF) + ecv-original.json (paridade)
      regras/       # fecho de pré-requisitos, dependentes, disponibilidade, cascata, totais
      testes/       # Vitest: unitários + paridade com o programa original
  app/              # Vite + React + TypeScript (interface)
    componentes/    # grade por fase, cartão de disciplina, painel de dependências, legenda
    estado/         # estado do aluno (cursadas, status, plano)
    persistencia/   # adaptador localStorage + exportar/importar arquivo JSON
  docs/
```

Separação pedida: **UI** (`app/componentes`), **regras** (`dominio/regras`, testáveis sem interface), **modelo** (`dominio` + JSON com schema), **persistência** (adaptador trocável; hoje localStorage, amanhã uma API se necessário), **serviços** (importação de histórico, exportação).

Modelo de pré-requisito proposto: **forma normal disjuntiva** (lista de grupos OU, cada grupo com uma lista E), que é exatamente a notação do PDF: `(A eh B) ou (C eh D)`. O caso do original (apenas E) é um caso particular, então os dois conjuntos de dados cabem no mesmo motor.

## 9. Recomendação de tecnologias

| Opção | Avaliação | Decisão |
|---|---|---|
| **Vite + React + TypeScript** | Simples, rápido e muito conhecido (facilita a entrada de novos bolsistas); gera site estático | **Recomendado** |
| Next.js | SSR e rotas de servidor não são necessários; mais complexidade e hospedagem mais cara | Não |
| Electron | 100+ MB por instalação, só desktop; o PWA resolve o uso offline | Não |
| Tauri | Leve, mas exige Rust e builds por SO; ganho pequeno sobre o PWA | Não, salvo exigência de executável |
| PostgreSQL | Não há dados de usuário no servidor nem multiusuário | Não |
| SQLite | Mesmo motivo; JSON versionado no repositório é mais fácil de revisar | Não |
| Vitest (+ Testing Library) | Testes do motor de regras e da UI | Sim |
| Playwright | Testes ponta a ponta de fluxos principais | Opcional, na fase de validação |
| zod | Validar o JSON do currículo (códigos, ciclos, referências inexistentes) | Sim (pequeno) |
| React Flow (@xyflow/react) + dagre | Grafo de dependências interativo | Só na etapa da visualização, se o painel focado não bastar |

**Hospedagem**: GitHub Pages ou Netlify (gratuito). **Celular**: o PWA responsivo funciona no celular; um app nativo futuro reutilizaria o pacote `dominio`.

**Visualização**: manter a **grade por fase** como vista principal, porque é o modelo mental do aluno e reproduz o original. Melhorias: (a) ícones e textos além da cor; (b) ao selecionar uma disciplina, um **painel lateral com as cadeias** (pré-requisitos acima, dependentes abaixo, separados em diretos e indiretos); (c) linhas de conexão opcionais sobre a grade. Um grafo completo das 94 disciplinas é ilegível e não deve ser a vista padrão.

## 10. Recursos do Claude Code

| Recurso | Uso recomendado | Comentário |
|---|---|---|
| Navegador embutido (Claude Browser) | Verificar a UI rodando localmente, inclusive no tamanho de celular | Já disponível, sem custo extra |
| Skill `init` | Criar `CLAUDE.md` com as regras do projeto (não tocar em `referencias/`, comandos de teste) | Recomendado, uma vez |
| Skills `code-review` / `simplify` | Ao fim de cada etapa | Nível medium; nunca max |
| Skill `run` | Subir e conferir o app | Útil |
| Subagent Haiku (low) | Inventários, conversão do PDF para JSON (com revisão), documentação auxiliar | Barato |
| Subagent Sonnet (medium) | Componentes de UI, persistência, estrutura do projeto | Padrão de implementação |
| Subagent Sonnet (high) | Testes de paridade e casos de borda | — |
| Opus (high) | Revisão final das regras e decisões de arquitetura | Pontual |
| Fable | Não previsto | O problema não exige |
| MCPs | **Nenhum novo necessário.** GitHub via `gh` se o repositório for publicado | Gmail, Notion, Canva, Sheets etc. não têm utilidade aqui; os plugins `data:*` (BigQuery, Amplitude…) podem ser desativados para reduzir ruído |
| Agentes persistentes | Desnecessários | Projeto pequeno |

**Registro de custo desta fase.** Toda a auditoria rodou na sessão principal (Opus 5.5). Não usei subagentes porque a investigação era sequencial: cada passo dependia do anterior (MSI → CAB → bundle .NET → descompilação). Delegar exigiria repassar todo o contexto e custaria mais. **Para a implementação, recomendo trocar o modelo principal para Sonnet** (ação manual sua no seletor de modelo) e reservar Opus para revisões das regras.

## 11. Plano de execução

| Etapa | Entrega | Modelo sugerido | Critério de pronto |
|---|---|---|---|
| 0. Preparação | `git init`, `CLAUDE.md`, estrutura de pastas, README | Sonnet medium | Repositório versionado, referências intactas |
| 1. Dados | `ecv-original.json` (gerado do CSV recuperado) e `ecv-2020-1.json` (do PDF), schema e validador (ciclos, códigos inexistentes) | Haiku → revisão Sonnet high | Validador passa; diferenças documentadas em `docs/` |
| 2. Motor de regras | Fecho de pré-requisitos (E/OU), dependentes diretos e indiretos, disponibilidade, cascata, totais | Sonnet high | Testes cobrindo a lista da seção 8 do briefing + **testes de paridade** com R1–R5 |
| 3. Interface fiel | Grade por fase, optativas, painel lateral, legenda, Simular, Limpar, Ajuda e Sobre | Sonnet medium | Mesmos resultados do original nos mesmos cenários |
| 4. Melhorias aprovadas | Persistência local, exportar/importar, painel de cadeias, acessibilidade, layout de celular, (status e planejamento, se aprovados) | Sonnet medium/high | Testes e verificação no navegador |
| 5. Validação com o original | Você roda o programa original com 3–5 históricos; comparo com a nova versão | Sonnet high (+ Opus high na revisão das divergências) | Toda divergência explicada em `docs/` |
| 6. Distribuição | Build estático, deploy (GitHub Pages), instruções | Haiku/Sonnet | Link público funcionando |

**Aguardo sua aprovação** desta proposta e, principalmente, a decisão sobre a fonte de verdade das regras (seção 7, item 1) antes de iniciar a implementação.
