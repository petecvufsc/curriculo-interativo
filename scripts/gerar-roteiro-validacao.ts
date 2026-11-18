// Gera docs/roteiro-validacao.md: cenários para executar no programa ORIGINAL, com o resultado que
// ele deve mostrar (calculado pelo oráculo = tradução literal do código descompilado) e, ao lado, o
// resultado do app novo (dados oficiais 2020.1). Rodar: npm run gerar-roteiro-validacao
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import oficialJson from '../src/dominio/curriculos/ecv-2020-1.json';
import { criarMotor } from '../src/dominio/regras';
import type { Curriculo } from '../src/dominio/tipos';
import {
  curriculoOriginal,
  desmarcarOriginal,
  marcarFaseOriginal,
  marcarOriginal,
  preRequisitosOriginal,
  simulaOriginal,
  trancadasOriginal,
  type Cor,
} from '../src/dominio/regras/paridade/oraculoOriginal';

const oficial = oficialJson as unknown as Curriculo;
const motor = criarMotor(oficial);
const nomeOriginal = new Map(curriculoOriginal.disciplinas.map((d) => [d.codigo, d.nome]));
const nomeOficial = new Map(oficial.disciplinas.map((d) => [d.codigo, d.nome]));
const ALIAS: Record<string, string> = { ECV2001: 'ECV2000' }; // estágio: código do original → PDF
const paraOficial = (s: Iterable<string>) => new Set([...s].map((c) => ALIAS[c] ?? c));
const nome = (c: string) => (nomeOriginal.get(c) ?? nomeOficial.get(c) ?? c).trim();
const lista = (cs: string[]) => (cs.length ? cs.map((c) => `${nome(c)} (${c})`).join('; ') : '—');

const md: string[] = [];
const titulo = (t: string) => md.push(`\n## ${t}\n`);

function blocoSimular(marcados: Set<string>) {
  const o = simulaOriginal(marcados);
  const n = motor.simular(paraOficial(marcados));
  const dispOrig = new Set(o.disponiveis.map((c) => ALIAS[c] ?? c));
  const dispNovo = new Set(n.disponiveis.map((d) => d.codigo));
  const so = (a: Set<string>, b: Set<string>) => [...a].filter((c) => !b.has(c));
  md.push(
    '**Clique em "Simular". O original deve mostrar:**',
    '',
    '| Campo do painel | Original (esperado) | Confere? | App novo (PDF 2020.1) |',
    '|---|---|---|---|',
    `| Disponíveis — Obrigatórias | ${o.obrig.h} h ou ${o.obrig.creditos} créditos | ☐ | ${n.totaisDisponiveis.obrigatorias.horasAula} h-a · ${n.totaisDisponiveis.obrigatorias.aulasSemanais} créditos |`,
    `| Disponíveis — Optativas | ${o.opt.h} h ou ${o.opt.creditos} créditos | ☐ | ${n.totaisDisponiveis.optativas.horasAula} h-a · ${n.totaisDisponiveis.optativas.aulasSemanais} créditos |`,
    `| Cursadas — Obrigatórias | ${o.cursObrig} h | ☐ | ${n.totaisCursadas.obrigatorias} h-a |`,
    `| Cursadas — Optativas | ${o.cursOpt} h | ☐ | ${n.totaisCursadas.optativas} h-a |`,
    '',
    `Disciplinas em **verde-escuro** no original (${o.disponiveis.length}): ${lista(o.disponiveis)}. ☐ confere`,
    '',
    `Diferença esperada no app novo: a mais → ${lista(so(dispNovo, dispOrig))}; a menos → ${lista(so(dispOrig, dispNovo))}.`,
    '',
  );
}

const cor = (m: Map<string, Cor>, c: Cor) => [...m].filter(([, v]) => v === c).map(([k]) => k);
function blocoRelacoes(codigo: string) {
  const pre = preRequisitosOriginal(codigo);
  const tr = trancadasOriginal(codigo);
  const pn = motor.preRequisitos(ALIAS[codigo] ?? codigo);
  const dn = motor.dependentes(ALIAS[codigo] ?? codigo);
  const novo = (m: typeof pn, direto: boolean) => [...m].filter(([, r]) => (r.distancia === 1) === direto).map(([k]) => k);
  md.push(
    `**Clique no nome "${nome(codigo)}". O original deve pintar:**`,
    '',
    '| Cor no original | Disciplinas (esperado) | Confere? | App novo |',
    '|---|---|---|---|',
    `| Azul (selecionada) | ${nome(codigo)} | ☐ | igual |`,
    `| Verde (pré-requisito) | ${lista(cor(pre, 'direto'))} | ☐ | ${lista(novo(pn, true))} |`,
    `| Verde-claro (pré-requisito indireto) | ${lista(cor(pre, 'indireto'))} | ☐ | ${lista(novo(pn, false))} |`,
    `| Vermelho (trancada diretamente) | ${lista(cor(tr, 'direto'))} | ☐ | ${lista(novo(dn, true))} |`,
    `| Laranja (trancada indiretamente) | ${lista(cor(tr, 'indireto'))} | ☐ | ${lista(novo(dn, false))} |`,
    '',
  );
}

// ---------------------------------------------------------------------------------------------
md.push(`# Roteiro de validação: programa original × app novo

Arquivo **gerado** por \`npm run gerar-roteiro-validacao\`. Não edite à mão.

**Objetivo:** confirmar, no programa original instalado, que a engenharia reversa reproduz exatamente o comportamento dele. A coluna "Original (esperado)" foi calculada pela tradução literal do código descompilado (\`src/dominio/regras/paridade/oraculoOriginal.ts\`). Se o original mostrar algo diferente, a tradução está errada em algum ponto: anote o que apareceu na tela.

A coluna "App novo" é informativa. Ela usa o **currículo oficial 2020.1** (decisão D1), então diferenças ali são **esperadas** e explicadas em [divergencias-original-vs-pdf.md](divergencias-original-vs-pdf.md).

**Como usar:**
1. Abra o Currículo Interativo original.
2. Antes de **cada** cenário, clique em "Limpar Seleção" e em "Limpar Disciplinas".
3. Marque ☐ → ☑ quando conferir e anote divergências no fim.

Os nomes seguem o cadastro interno do original; o rótulo na tela pode ter pequenas diferenças de grafia (ex.: "Cálculo I"/"Cálculo 1").
`);

titulo('Cenário 1 — Calouro (nada marcado)');
blocoSimular(new Set());

titulo('Cenário 2 — Marcar só "Concreto Armado I" (6ª fase)');
{
  const m = marcarOriginal(new Set(), 'ECV2602');
  md.push(
    `**Marque a caixa de "${nome('ECV2602')}".** O original deve marcar sozinho, além dela, ${m.size - 1} disciplinas: ${lista([...m].filter((c) => c !== 'ECV2602'))}. ☐ confere`,
    '',
  );
  blocoSimular(m);
}

titulo('Cenário 3 — Fim da 4ª fase (caixas das fases 1 a 4)');
let fim4 = new Set<string>();
for (const f of [1, 2, 3, 4]) fim4 = marcarFaseOriginal(fim4, f);
md.push(`**Marque as caixas dos cabeçalhos "1ª Fase" a "4ª Fase".** Total marcado: ${fim4.size} disciplinas. ☐ confere`, '');
blocoSimular(fim4);

titulo('Cenário 4 — A partir do cenário 3, desmarcar "Física I"');
{
  const m = desmarcarOriginal(fim4, 'FSC5101');
  const sairam = [...fim4].filter((c) => !m.has(c));
  md.push(
    `**Refaça o cenário 3 (sem limpar) e desmarque a caixa de "${nome('FSC5101')}".** O original deve desmarcar sozinho (${sairam.length - 1} além dela): ${lista(sairam.filter((c) => c !== 'FSC5101'))}. ☐ confere`,
    '',
  );
  blocoSimular(m);
}

titulo('Cenário 5 — Relações de "Mecânica dos Sólidos II"');
blocoRelacoes('ECV2505');

titulo('Cenário 6 — Relações de "Análise Estrutural II" (defeito conhecido do original)');
md.push(
  'No original, a cor depende da ordem do laço: **Análise Estrutural I** é pré-requisito **direto**, mas deve aparecer em **verde-claro** (indireto). O app novo corrige isso. Se o original mostrar verde-escuro, a tradução do laço está errada.',
  '',
);
blocoRelacoes('ECV2601');

md.push(`
## Divergências encontradas

| Cenário | Campo | Esperado | Apareceu no original |
|---|---|---|---|
|  |  |  |  |
`);

writeFileSync(join(import.meta.dirname, '..', 'docs', 'roteiro-validacao.md'), md.join('\n'), 'utf8');
console.log('docs/roteiro-validacao.md gerado.');
