// Compara o currículo oficial (PDF 2020.1) com os dados do programa original e gera docs/divergencias-original-vs-pdf.md.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Curriculo, Disciplina, ExpressaoRequisito } from '../src/dominio/tipos';

const raiz = join(import.meta.dirname, '..');
const ler = (f: string) => JSON.parse(readFileSync(join(raiz, 'src', 'dominio', 'curriculos', f), 'utf8')) as Curriculo;
const oficial = ler('ecv-2020-1.json');
const original = ler('ecv-programa-original.json');

// O original codifica o estágio como ECV2001; o PDF usa ECV2000.
const ALIAS: Record<string, string> = { ECV2001: 'ECV2000' };
const cod = (c: string) => ALIAS[c] ?? c;

const fmt = (e: ExpressaoRequisito) =>
  e.length === 0 ? '—' : e.map((g) => (g.length > 1 ? `(${g.join(' e ')})` : g[0])).join(' ou ');
const chave = (g: string[]) => [...g].map(cod).sort().join('+');

const mapaOf = new Map(oficial.disciplinas.map((d) => [d.codigo, d]));
const mapaOr = new Map(original.disciplinas.map((d) => [cod(d.codigo), d]));

const linhas: string[] = [];
const secao = (t: string, cab: string, rows: string[]) => {
  linhas.push(`\n## ${t} (${rows.length})\n`);
  if (rows.length) linhas.push(cab, ...rows);
  else linhas.push('Nenhuma.');
};

const soOficial = oficial.disciplinas.filter((d) => !mapaOr.has(d.codigo));
const soOriginal = original.disciplinas.filter((d) => !mapaOf.has(cod(d.codigo)));
const ambos = original.disciplinas.flatMap((o) => {
  const f = mapaOf.get(cod(o.codigo));
  return f ? [[o, f] as [Disciplina, Disciplina]] : [];
});

secao('Disciplinas só no PDF', '| Código | Nome | Tipo |\n|---|---|---|', soOficial.map((d) => `| ${d.codigo} | ${d.nome} | ${d.tipo} |`));
secao('Disciplinas só no original', '| Código | Nome |\n|---|---|', soOriginal.map((d) => `| ${d.codigo} | ${d.nome} |`));

secao(
  'Pré-requisitos diferentes',
  '| Código | Nome | Original | PDF 2020.1 | Observação |\n|---|---|---|---|---|',
  ambos.flatMap(([o, f]) => {
    const gOrig = chave(o.preRequisitos.flat());
    const alternativas = f.preRequisitos.map(chave);
    const igual = o.preRequisitos.length === 0 ? f.preRequisitos.length === 0 : alternativas.includes(gOrig);
    if (igual && alternativas.length <= 1) return [];
    const obs = igual
      ? 'Original = uma das alternativas do PDF (as outras usam códigos antigos ou equivalentes).'
      : '**Diverge.**';
    return [`| ${f.codigo} | ${f.nome} | ${fmt(o.preRequisitos)} | ${fmt(f.preRequisitos)} | ${obs} |`];
  }),
);

secao(
  'Carga horária, aulas, fase ou nome diferentes',
  '| Código | Campo | Original | PDF 2020.1 |\n|---|---|---|---|',
  ambos.flatMap(([o, f]) => {
    const r: string[] = [];
    if (o.codigo !== f.codigo) r.push(`| ${f.codigo} | código | ${o.codigo} | ${f.codigo} |`);
    for (const campo of ['horasAula', 'aulasSemanais', 'fase', 'tipo'] as const)
      if (o[campo] !== f[campo]) r.push(`| ${f.codigo} | ${campo} | ${o[campo]} | ${f[campo]} |`);
    if (o.nome.trim() !== f.nome.trim()) r.push(`| ${f.codigo} | nome | ${o.nome} | ${f.nome} |`);
    return r;
  }),
);

const alertas = oficial.disciplinas.filter((d) => d.alertas.length);
secao('Alertas do próprio PDF', '| Código | Alerta |\n|---|---|', alertas.flatMap((d) => d.alertas.map((a) => `| ${d.codigo} | ${a} |`)));

const cabecalho = `# Divergências: programa original × currículo oficial PDF 2020.1

Arquivo **gerado** por \`npm run comparar-curriculos\`. Não edite à mão.
Fonte de verdade: PDF 2020.1 (decisão D1). O programa original usa o código ECV2001 para o estágio, que corresponde ao ECV2000 do PDF.
`;
writeFileSync(join(raiz, 'docs', 'divergencias-original-vs-pdf.md'), cabecalho + linhas.join('\n') + '\n', 'utf8');
console.log('docs/divergencias-original-vs-pdf.md gerado.');
