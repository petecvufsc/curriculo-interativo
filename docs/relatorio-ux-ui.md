# Relatório de UX/UI — 18/11/2026

Alvo: Currículo Interativo (versão com seletor de regras, planejamento por período, mover/arrastar, grade oficial e plano otimizado). Revisão feita medindo no navegador embutido (servidor `curriculo-dev`), em 1500 px e 375 px (emulação de celular), com a aba Grade e a aba Planejamento (plano de 10 semestres montado pela grade oficial). Método descrito em [revisores/revisor-ux-ui.md](revisores/revisor-ux-ui.md).

## 1. Resumo

**Nota geral: bom.** Contraste e acessibilidade seguem acima do mínimo, não há rolagem horizontal em nenhuma largura testada e a interface continua sóbria. Os três pontos de melhoria apareceram nas funções mais novas e já foram corrigidos (seção 3).

## 2. O que está bom (com a medida)

- **Contraste de texto:** 358 textos medidos na grade e todos passam. O pior caso é 5,05:1 (selo "Pré-requisito indireto"); o resto do cabeçalho e dos links de pular fica em 5,23:1. O mínimo é 4,5:1.
- **Planejamento:** nenhuma falha de contraste com 10 semestres montados.
- **Rolagem horizontal:** 0 px em 375 px (grade e planejamento) e em 1500 px.
- **Alvos de toque em 375 px:** a lista de elementos clicáveis com menos de 44 px tinha só 3 itens (o link de pular, que fica fora da tela, e dois elementos internos de 1 e 26 px). Os botões, abas, caixas e a lista "Mover para…" têm 44 px ou mais.
- **Caixas de marcar:** o desenho tem 20 px, mas o alvo clicável (o rótulo inteiro, com o código) tem 72 × 28 px, acima dos 24 px do WCAG 2.2.
- **Tema:** continua claro mesmo com o sistema em modo escuro (testado pelo caçador de bugs).
- **Títulos:** um único `h1`; títulos de semestre em `h3` dentro do planejamento.

## 3. Achados

### U-01 "Mover para…" dobrava a altura de cada cartão no celular — **Média** (corrigido)
- **Onde:** planejamento, 375 px.
- **Evidência:** a lista ocupava uma linha inteira abaixo de cada disciplina (44 px a mais por cartão), tornando a rolagem de um plano de 10 semestres muito longa.
- **Correção:** em telas de toque a lista fica **na linha da disciplina**, entre o nome e o ×, com 5,75 rem de largura e 44 px de altura. Com mouse continua discreta e só aparece ao passar o mouse ou focar o cartão. **Esforço:** P.

### U-02 Texto da opção da caixa de versão cortado em 375 px e 320 px — **Média** (corrigido)
- **Onde:** seletor "Regras de pré-requisitos".
- **Evidência:** a opção mostrava "Currículo 2020.1 — pré-requisitos atuais (val" (cortada).
- **Correção:** rótulos curtos: "2020.1 — atuais (até 2027.2)" e "2028.1 — novos (a partir de 2028.1)". **Esforço:** P.

### U-03 Aviso da versão ocupava cinco linhas na primeira tela do celular — **Baixa** (corrigido)
- **Evidência:** em 375 px o quadro de regras, o resumo de integralização e o aviso empurravam as abas para baixo da primeira dobra.
- **Correção:** o texto passou de cinco para três linhas ("Valem os pré-requisitos atuais; quatro disciplinas mudam em 2028.1. A partir de novembro de 2027, apenas a versão 2028.1 estará disponível neste site."). O detalhe continua em "Ver o que muda em 2028.1". **Esforço:** P.

### Achados de acessibilidade vindos do caçador de bugs (corrigidos)
- **B-09 Foco do teclado caía no `<body>`** depois de remover, mover ou desfazer. Agora o foco vai para o título do semestre ou para a área principal.
- **B-12 "Optativas: 1890/432 h-a" sem explicação.** Agora a tela acrescenta "(o excedente não conta)".
- **B-14 "1 disciplinas"** no singular e texto da opção cortado em 320 px.

## 4. Para discutir (decisões de design)

1. **Tema escuro como opção.** A decisão foi "sempre claro". Alunos que usam o celular à noite podem preferir escuro; se o PET quiser, o conjunto escuro já existe no código (`data-theme="dark"`) e bastaria um botão.
2. **Impressão do plano.** Não há folha de estilo de impressão. Um aluno que queira imprimir o planejamento para levar à coordenação hoje imprime a tela inteira. Vale considerar um "Imprimir plano" simples.
3. **Arrastar no celular.** O arrastar nativo do navegador não é confiável em telas de toque; no celular vale o "Mover para…". Uma biblioteca de arrasto por toque resolveria, ao custo de uma dependência nova.

## 5. O que não deu para testar

- Leitor de tela de verdade (só a árvore de acessibilidade e os testes de nomes acessíveis).
- Zoom de 200% e 400% (320 px sem rolagem horizontal é um bom substituto do 400%).
- Impressão e modo de alto contraste (`forced-colors`).
- Outros navegadores além do Chromium embutido.
