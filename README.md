# Currículo Interativo — Engenharia Civil UFSC

Ferramenta do PET Engenharia Civil (PET-ECV/UFSC) para ajudar estudantes a planejar a matrícula. Ela mostra a grade do curso, os pré-requisitos e as disciplinas que o estudante já pode cursar.

É uma reconstrução, como aplicação web, do programa desktop original. As regras seguem o **currículo oficial 2020.1**.

> Estado: **funcional, ainda não publicado**. Etapas 0–4 concluídas:
> - dados, motor de regras e interface do programa original;
> - situação no histórico, planejamento de semestres, salvamento e exportação;
> - uso offline e instalação no celular.
>
> Também passou por revisão de acessibilidade e ganhou identidade visual própria ("prancha técnica"). Faltam a validação lado a lado com o programa original e a publicação online. O andamento está em [docs/ACOMPANHAMENTO.md](docs/ACOMPANHAMENTO.md).

## Documentação
- [Auditoria do programa original](docs/01-auditoria-e-diagnostico.md)
- [Modelo de dados do currículo](docs/modelo-de-dados.md)
- [Divergências entre o programa original e o PDF 2020.1](docs/divergencias-original-vs-pdf.md) (gerado)
- [Acompanhamento e decisões](docs/ACOMPANHAMENTO.md)
- [Regras de negócio](docs/regras-de-negocio.md) · [Interface](docs/interface.md) · [Revisão de acessibilidade](docs/acessibilidade.md)
- [Roteiro de validação com o programa original](docs/roteiro-validacao.md) (gerado)
- [Publicar na internet (GitHub Pages + site do PET)](docs/publicacao.md)

## Gerar a versão para publicação
```bash
npm run build      # gera a pasta dist/ (site estático)
npm run preview    # serve a pasta dist/ localmente para conferência
```

## Requisitos
- Node.js 20 LTS ou mais recente

## Executar localmente
```bash
cd projeto
npm install
npm run dev
```

## Testes e validação dos dados
```bash
npm test
npm run validar-curriculos
```
