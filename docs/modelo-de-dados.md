# Modelo de dados do currículo

Os currículos são arquivos JSON versionados em `src/dominio/curriculos/`. Não existe banco de dados: o currículo é público, raramente muda e é mais fácil de revisar como texto no git.

| Arquivo | Origem | Uso |
|---|---|---|
| `ecv-2020-1.json` | PDF oficial 2020.1 (`referencias/documentação/`) | **Fonte de verdade** (decisão D1) |
| `ecv-programa-original.json` | Gerado de `docs/engenharia-reversa/disciplinas_programa_original.csv` | Somente testes de paridade |

## Estrutura

```jsonc
{
  "id": "ecv-2020-1",
  "curso": "201 - Engenharia Civil",
  "curriculo": "20201",
  "fonte": "CURRICULO_ENGENHARIA_CIVIL_20201.pdf (SeTIC/UFSC, emitido em 11/11/2026)",
  "integralizacao": {
    "obrigatoriasHA": 3402,       // h-a de disciplinas obrigatórias
    "optativasHA": 432,           // optativas + Atividades Complementares (até 54 h-a)
    "complementaresMaxHA": 54,
    "estagioHA": 540,
    "projetoIntegradorHA": 144,
    "totalHA": 4518,
    "aulasSemanais": { "min": 16, "max": 30 },
    "semestres": { "min": 10, "max": 15 }
  },
  "vagasOptativasPorFase": { "8": 4, "9": 4 },   // linhas "Optativa I..VIII" do PDF
  "disciplinas": [
    {
      "codigo": "MTM3120",
      "nome": "Cálculo 2",
      "tipo": "obrigatoria",            // "obrigatoria" | "optativa"
      "grupo": "fase",                  // "fase" | "optativas" | "atividades-complementares"
      "fase": 2,                        // 1..10; null para optativas
      "horasAula": 72,                  // coluna H/A
      "aulasSemanais": 4,               // coluna Aulas (= "créditos" no programa original)
      "preRequisitos": [["MTM3101"], ["MTM3110"]],
      "equivalentes": [["MTM3102", "MTM3111"], ["MTM3111", "MTM5162"]],
      "conjunto": [],                   // coluna Conjunto (correquisitos)
      "preCH": null,                    // coluna Pré CH
      "alertas": []                     // inconsistências da fonte, em texto
      // opcional: "somenteCoordenacao": true  // inscrição só pela coordenação (ex.: intercâmbio); o app oculta
    }
  ]
}
```

### Expressões de pré-requisito e equivalência: OU de grupos E

`preRequisitos` é uma lista de **alternativas** (OU). Cada alternativa é uma lista de códigos que precisam **todos** ter sido cumpridos (E). É a forma normal disjuntiva, idêntica à notação do PDF:

| PDF | JSON |
|---|---|
| (vazio) | `[]` (sem pré-requisito) |
| `FSC5101` | `[["FSC5101"]]` |
| `(EGR5213 eh EGR5604)` | `[["EGR5213", "EGR5604"]]` |
| `(MTM3101 ou MTM3110)` | `[["MTM3101"], ["MTM3110"]]` |
| `(A eh B) ou (C eh D)` | `[["A", "B"], ["C", "D"]]` |

Os códigos que não pertencem a este currículo (ex.: MTM3101, do currículo 1991.1) são mantidos, porque podem aparecer no histórico de alunos migrados.

`equivalentes` usa a mesma forma: cumprir **todas** as disciplinas de uma alternativa equivale a cumprir esta disciplina.

### Disciplinas só da coordenação

`somenteCoordenacao: true` marca as que o aluno não pode planejar. Os quatro Intercâmbios Internacionais (ECV2971 a ECV2974) têm essa marca, por decisão do usuário: a inscrição é feita pela coordenação e aparecer na lista confundiria. Os dados continuam fiéis ao PDF; `curriculoParaAluno` (`src/dominio/curriculos/paraAluno.ts`) as remove antes de criar o motor do app, então elas não entram nas listas, nos totais, nas sugestões nem no planejamento.

### Disciplinas fora do limite de créditos

`foraDoLimiteDeAulas: true` (hoje só o estágio, ECV2000) marca a disciplina cujas aulas semanais não entram no limite de créditos do semestre. O PDF continua registrado como está (30 aulas); só o planejamento as ignora na soma. Ver [regras §11](regras-de-negocio.md), decisão D3.

## Regras do validador

1. Códigos únicos, no formato `AAA9999`.
2. Pré-requisitos que apontam para códigos fora do currículo geram aviso, não erro. `conjunto` e `preCH` preenchidos geram erro, porque o motor ainda não os suporta (ver `regras-de-negocio.md`, seção 9).
3. Nenhuma disciplina pode ser pré-requisito de si mesma, nem de forma indireta (sem ciclos).
4. Fase 1–10 para obrigatórias; `null` para optativas.
5. As somas de horas por categoria são comparadas com `integralizacao` e exibidas.
