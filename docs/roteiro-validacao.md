# Roteiro de validação: programa original × app novo

Arquivo **gerado** por `npm run gerar-roteiro-validacao`. Não edite à mão.

**Objetivo:** confirmar, no programa original instalado, que a engenharia reversa reproduz exatamente o comportamento dele. A coluna "Original (esperado)" foi calculada pela tradução literal do código descompilado (`src/dominio/regras/paridade/oraculoOriginal.ts`). Se o original mostrar algo diferente, a tradução está errada em algum ponto: anote o que apareceu na tela.

A coluna "App novo" é informativa. Ela usa o **currículo oficial 2020.1** (decisão D1), então diferenças ali são **esperadas** e explicadas em [divergencias-original-vs-pdf.md](divergencias-original-vs-pdf.md).

**Como usar:**
1. Abra o Currículo Interativo original.
2. Antes de **cada** cenário, clique em "Limpar Seleção" e em "Limpar Disciplinas".
3. Marque ☐ → ☑ quando conferir e anote divergências no fim.

Os nomes seguem o cadastro interno do original; o rótulo na tela pode ter pequenas diferenças de grafia (ex.: "Cálculo I"/"Cálculo 1").


## Cenário 1 — Calouro (nada marcado)

**Clique em "Simular". O original deve mostrar:**

| Campo do painel | Original (esperado) | Confere? | App novo (PDF 2020.1) |
|---|---|---|---|
| Disponíveis — Obrigatórias | 648 h ou 36 créditos | ☐ | 594 h-a · 33 créditos |
| Disponíveis — Optativas | 0 h ou 0 créditos | ☐ | 270 h-a · 15 créditos |
| Cursadas — Obrigatórias | 0 h | ☐ | 0 h-a |
| Cursadas — Optativas | 0 h | ☐ | 0 h-a |

Disciplinas em **verde-escuro** no original (12): Introdução à Engenharia Civil (ECV2101); Representação Gráfica Espacial (EGR5213); Desenho Técnico I (EGR5604); Física I (FSC5101); Cálculo I (MTM3110); Química Geral Experimental A (QMC5125); Química Geral (QMC5138); Introdução à Mecânica das Estruturas (ECV2201); Introdução à Ciência da Computação (INE5201); Álgebra Linear (MTM3121); Geologia de Engenharia (ECV2303); Expressão Oral e Escrita (ECV2704). ☐ confere

Diferença esperada no app novo: a mais → Atividades Complementares (ECV2905); Atividades Extensionistas (ECV2906); Intercâmbio Internacional I (ECV2971); Intercâmbio Internacional IV (ECV2974); a menos → Expressão Oral e Escrita (ECV2704).


## Cenário 2 — Marcar só "Concreto Armado I" (6ª fase)

**Marque a caixa de "Concreto Armado I".** O original deve marcar sozinho, além dela, 9 disciplinas: Análise Estrutural I (ECV2401); Estática para Engenharia Civil (ECV2302); Introdução à Mecânica das Estruturas (ECV2201); Física I (FSC5101); Cálculo 2 (MTM3120); Cálculo I (MTM3110); Mecânica dos Sólidos I (ECV2404); Ações e Segurança nas Estruturas (ECV2501); Estatística e Probabilidade para Ciências Exatas (INE5108). ☐ confere

**Clique em "Simular". O original deve mostrar:**

| Campo do painel | Original (esperado) | Confere? | App novo (PDF 2020.1) |
|---|---|---|---|
| Disponíveis — Obrigatórias | 738 h ou 41 créditos | ☐ | 612 h-a · 34 créditos |
| Disponíveis — Optativas | 108 h ou 6 créditos | ☐ | 378 h-a · 21 créditos |
| Cursadas — Obrigatórias | 594 h | ☐ | 594 h-a |
| Cursadas — Optativas | 0 h | ☐ | 0 h-a |

Disciplinas em **verde-escuro** no original (15): Introdução à Engenharia Civil (ECV2101); Representação Gráfica Espacial (EGR5213); Desenho Técnico I (EGR5604); Química Geral Experimental A (QMC5125); Química Geral (QMC5138); Física II (FSC5002); Física Experimental I (FSC5122); Introdução à Ciência da Computação (INE5201); Álgebra Linear (MTM3121); Geologia de Engenharia (ECV2303); Cálculo 3 (MTM3103); Mecânica dos Sólidos II (ECV2505); Expressão Oral e Escrita (ECV2704); Elaboração de Planta de Valores Genérico (ECV2941); Engenharia de Avaliações (ECV2942). ☐ confere

Diferença esperada no app novo: a mais → Atividades Complementares (ECV2905); Atividades Extensionistas (ECV2906); Intercâmbio Internacional I (ECV2971); Intercâmbio Internacional IV (ECV2974); a menos → Mecânica dos Sólidos II (ECV2505); Expressão Oral e Escrita (ECV2704).


## Cenário 3 — Fim da 4ª fase (caixas das fases 1 a 4)

**Marque as caixas dos cabeçalhos "1ª Fase" a "4ª Fase".** Total marcado: 30 disciplinas. ☐ confere

**Clique em "Simular". O original deve mostrar:**

| Campo do painel | Original (esperado) | Confere? | App novo (PDF 2020.1) |
|---|---|---|---|
| Disponíveis — Obrigatórias | 864 h ou 48 créditos | ☐ | 828 h-a · 46 créditos |
| Disponíveis — Optativas | 648 h ou 36 créditos | ☐ | 864 h-a · 48 créditos |
| Cursadas — Obrigatórias | 1800 h | ☐ | 1800 h-a |
| Cursadas — Optativas | 0 h | ☐ | 0 h-a |

Disciplinas em **verde-escuro** no original (27): Urbanismo (ARQ5515); Ações e Segurança nas Estruturas (ECV2501); Estradas I (ECV2502); Física das Construções (ECV2503); Materiais de Construção II (ECV2504); Mecânica dos Sólidos II (ECV2505); Mecânica dos Solos I (ECV2506); Cálculo Numérico em Computadores (INE5202); Engenharia de Tráfego (ECV2603); Instalações Prediais I (ECV2604); Hidrologia (ENS5102); Expressão Oral e Escrita (ECV2704); Instalações Prediais II (ECV2706); Saneamento (ENS5106); Obras de Engenharia e Impacto Ambiental (ECV2902); Ferramentas Computacionais Aplicadas à Engenharia Civil (ECV2812); Aeroportos, Portos e Vias Navegáveis (ECV2831); Geotecnologias para Engenharia (ECV2841); Sistemas Globais de Navegação por Satélite54 (ECV2843); Tópicos Especiais de Topografia (ECV2844); Materiais não Convencionais Sustentáveis (ECV2911); Sustentabilidade em Edificações (ECV2913); Planejamento de Transportes (ECV2932); Elaboração de Planta de Valores Genérico (ECV2941); Engenharia de Avaliações (ECV2942); Fotointerpretação Aplicada à Engenharia (ECV2943); Sistema de Informações Geográficas (ECV2944). ☐ confere

Diferença esperada no app novo: a mais → Atividades Complementares (ECV2905); Atividades Extensionistas (ECV2906); Intercâmbio Internacional I (ECV2971); Intercâmbio Internacional IV (ECV2974); a menos → Planejamento de Transportes (ECV2932).


## Cenário 4 — A partir do cenário 3, desmarcar "Física I"

**Refaça o cenário 3 (sem limpar) e desmarque a caixa de "Física I".** O original deve desmarcar sozinho (7 além dela): Física II (FSC5002); Física Experimental I (FSC5122); Estática para Engenharia Civil (ECV2302); Fenômenos de Transportes (EMC5425); Análise Estrutural I (ECV2401); Mecânica dos Sólidos I (ECV2404); Hidráulica (ENS5101). ☐ confere

**Clique em "Simular". O original deve mostrar:**

| Campo do painel | Original (esperado) | Confere? | App novo (PDF 2020.1) |
|---|---|---|---|
| Disponíveis — Obrigatórias | 504 h ou 28 créditos | ☐ | 396 h-a · 22 créditos |
| Disponíveis — Optativas | 648 h ou 36 créditos | ☐ | 864 h-a · 48 créditos |
| Cursadas — Obrigatórias | 1242 h | ☐ | 1242 h-a |
| Cursadas — Optativas | 0 h | ☐ | 0 h-a |

Disciplinas em **verde-escuro** no original (21): Física I (FSC5101); Urbanismo (ARQ5515); Ações e Segurança nas Estruturas (ECV2501); Estradas I (ECV2502); Materiais de Construção II (ECV2504); Cálculo Numérico em Computadores (INE5202); Engenharia de Tráfego (ECV2603); Expressão Oral e Escrita (ECV2704); Obras de Engenharia e Impacto Ambiental (ECV2902); Ferramentas Computacionais Aplicadas à Engenharia Civil (ECV2812); Aeroportos, Portos e Vias Navegáveis (ECV2831); Geotecnologias para Engenharia (ECV2841); Sistemas Globais de Navegação por Satélite54 (ECV2843); Tópicos Especiais de Topografia (ECV2844); Materiais não Convencionais Sustentáveis (ECV2911); Sustentabilidade em Edificações (ECV2913); Planejamento de Transportes (ECV2932); Elaboração de Planta de Valores Genérico (ECV2941); Engenharia de Avaliações (ECV2942); Fotointerpretação Aplicada à Engenharia (ECV2943); Sistema de Informações Geográficas (ECV2944). ☐ confere

Diferença esperada no app novo: a mais → Atividades Complementares (ECV2905); Atividades Extensionistas (ECV2906); Intercâmbio Internacional I (ECV2971); Intercâmbio Internacional IV (ECV2974); a menos → Ações e Segurança nas Estruturas (ECV2501); Expressão Oral e Escrita (ECV2704); Planejamento de Transportes (ECV2932).


## Cenário 5 — Relações de "Mecânica dos Sólidos II"

**Clique no nome "Mecânica dos Sólidos II". O original deve pintar:**

| Cor no original | Disciplinas (esperado) | Confere? | App novo |
|---|---|---|---|
| Azul (selecionada) | Mecânica dos Sólidos II | ☐ | igual |
| Verde (pré-requisito) | Análise Estrutural I (ECV2401); Mecânica dos Sólidos I (ECV2404) | ☐ | Análise Estrutural I (ECV2401); Mecânica dos Sólidos I (ECV2404); Equações Diferenciais Ordinárias (MTM3131) |
| Verde-claro (pré-requisito indireto) | Estática para Engenharia Civil (ECV2302); Introdução à Mecânica das Estruturas (ECV2201); Física I (FSC5101); Cálculo 2 (MTM3120); Cálculo I (MTM3110) | ☐ | Estática para Engenharia Civil (ECV2302); Cálculo 2 (MTM3120); Álgebra Linear (MTM3121); Introdução à Mecânica das Estruturas (ECV2201); Física I (FSC5101); Cálculo I (MTM3110) |
| Vermelho (trancada diretamente) | Análise Estrutural II (ECV2601); Tópicos Especiais em Mecânica dos Sólidos (ECV2924) | ☐ | Análise Estrutural II (ECV2601); Tópicos Especiais em Mecânica dos Sólidos (ECV2924) |
| Laranja (trancada indiretamente) | Estruturas Metálicas e de Madeira (ECV2703); TCC: Projeto Integrador I (ECV2903); Estágio Profissionalizante Supervisionado (ECV2001); TCC: Projeto Integrado II (ECV2002); Projeto de Estruturas em Madeira (ECV2921); Projeto de Estruturas em Aço (ECV2922); Métodos de elementos Finitos (ECV2821) | ☐ | Estruturas Metálicas e de Madeira (ECV2703); Métodos de elementos Finitos (ECV2821); TCC: Projeto Integrador I (ECV2903); Projeto de Estruturas em Madeira (ECV2921); Projeto de Estruturas em Aço (ECV2922); Estágio Profissionalizante Supervisionado (ECV2000); TCC: Projeto Integrado II (ECV2002) |


## Cenário 6 — Relações de "Análise Estrutural II" (defeito conhecido do original)

No original, a cor depende da ordem do laço: **Análise Estrutural I** é pré-requisito **direto**, mas deve aparecer em **verde-claro** (indireto). O app novo corrige isso. Se o original mostrar verde-escuro, a tradução do laço está errada.

**Clique no nome "Análise Estrutural II". O original deve pintar:**

| Cor no original | Disciplinas (esperado) | Confere? | App novo |
|---|---|---|---|
| Azul (selecionada) | Análise Estrutural II | ☐ | igual |
| Verde (pré-requisito) | Mecânica dos Sólidos II (ECV2505); Álgebra Linear (MTM3121) | ☐ | Análise Estrutural I (ECV2401); Mecânica dos Sólidos II (ECV2505); Álgebra Linear (MTM3121) |
| Verde-claro (pré-requisito indireto) | Análise Estrutural I (ECV2401); Estática para Engenharia Civil (ECV2302); Introdução à Mecânica das Estruturas (ECV2201); Física I (FSC5101); Cálculo 2 (MTM3120); Cálculo I (MTM3110); Mecânica dos Sólidos I (ECV2404) | ☐ | Estática para Engenharia Civil (ECV2302); Mecânica dos Sólidos I (ECV2404); Equações Diferenciais Ordinárias (MTM3131); Introdução à Mecânica das Estruturas (ECV2201); Física I (FSC5101); Cálculo 2 (MTM3120); Cálculo I (MTM3110) |
| Vermelho (trancada diretamente) | Estruturas Metálicas e de Madeira (ECV2703); Métodos de elementos Finitos (ECV2821) | ☐ | Estruturas Metálicas e de Madeira (ECV2703); Métodos de elementos Finitos (ECV2821) |
| Laranja (trancada indiretamente) | TCC: Projeto Integrador I (ECV2903); Estágio Profissionalizante Supervisionado (ECV2001); TCC: Projeto Integrado II (ECV2002); Projeto de Estruturas em Madeira (ECV2921); Projeto de Estruturas em Aço (ECV2922) | ☐ | TCC: Projeto Integrador I (ECV2903); Projeto de Estruturas em Madeira (ECV2921); Projeto de Estruturas em Aço (ECV2922); Estágio Profissionalizante Supervisionado (ECV2000); TCC: Projeto Integrado II (ECV2002) |


## Divergências encontradas

| Cenário | Campo | Esperado | Apareceu no original |
|---|---|---|---|
|  |  |  |  |
