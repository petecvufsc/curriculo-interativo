// Monta uma pasta LIMPA só com o site, pronta para enviar ao GitHub (repositório público).
//
// O que ela leva: o conteúdo de projeto/ (código, testes, documentação, fluxo de publicação).
// O que NÃO leva: node_modules, dist, o material de referência (pasta referencias/ fica fora de projeto/),
// o histórico de commits (a pasta nasce com um único commit, assinado pelo PET) e, por padrão, a pasta
// docs/engenharia-reversa (lógica descompilada do programa antigo; use --com-engenharia-reversa para levá-la).
//
// Uso (dentro de projeto/):
//   node scripts/exportar-publicacao.mjs                 cria a pasta (primeira vez)
//   node scripts/exportar-publicacao.mjs --atualizar     depois de publicado: copia as mudanças e faz um novo commit,
//                                                         mantendo o histórico (basta "git push" em seguida)
//   opções: [--saida=<pasta>] [--com-engenharia-reversa] [--refazer]
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const raiz = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const opcao = (nome) => args.find((a) => a.startsWith(`--${nome}=`))?.split('=')[1];
const comEngenhariaReversa = args.includes('--com-engenharia-reversa');
const refazer = args.includes('--refazer');
const atualizar = args.includes('--atualizar');
const saida = resolve(opcao('saida') ?? join(raiz, '..', '..', 'curriculo-interativo-publicacao'));
const MARCA = '.exportado-por-script';

const MANTER = new Set(['.git', 'node_modules', 'dist', MARCA]);
if (atualizar) {
  if (!existsSync(join(saida, '.git')) || !existsSync(join(saida, MARCA))) {
    console.error(`${saida} não é uma pasta criada por este script. Rode antes, sem --atualizar, para criá-la.`);
    process.exit(1);
  }
  // Apaga o conteúdo antigo (menos o histórico do git) para que arquivos removidos também saiam.
  for (const nome of readdirSync(saida)) if (!MANTER.has(nome)) rmSync(join(saida, nome), { recursive: true, force: true });
} else if (existsSync(saida)) {
  if (!refazer) {
    console.error(`A pasta ${saida} já existe. Use --refazer para recriá-la (só apaga pastas criadas por este script).`);
    process.exit(1);
  }
  if (!existsSync(join(saida, MARCA))) {
    console.error(`${saida} não foi criada por este script (falta ${MARCA}): não vou apagá-la.`);
    process.exit(1);
  }
  rmSync(saida, { recursive: true, force: true });
}
mkdirSync(saida, { recursive: true });

const IGNORAR = new Set(['node_modules', 'dist', 'coverage', '.vite', '.git']);
cpSync(raiz, saida, {
  recursive: true,
  filter: (origem) => {
    const rel = origem.slice(raiz.length).replaceAll('\\', '/').replace(/^\//, '');
    if (IGNORAR.has(basename(origem))) return false;
    if (!comEngenhariaReversa && rel === 'docs/engenharia-reversa') return false;
    return true;
  },
});
writeFileSync(join(saida, MARCA), 'Pasta gerada por scripts/exportar-publicacao.mjs. Pode ser recriada com --refazer.\n');

const git = (...a) => spawnSync('git', a, { cwd: saida, encoding: 'utf8' });
const autor = ['-c', 'user.name=PET Engenharia Civil UFSC', '-c', 'user.email=petecv@contato.ufsc.br'];
if (!atualizar) {
  const r = git('init', '-b', 'main');
  if (r.status !== 0) throw new Error(`git init falhou: ${r.stderr}`);
}
git('add', '-A');
const mudou = git('status', '--porcelain').stdout.trim() !== '';
if (atualizar && !mudou) {
  console.log('Nada mudou desde o último commit. Não há o que enviar.');
  process.exit(0);
}
const mensagem = atualizar
  ? `Atualização de ${new Date().toLocaleDateString('pt-BR')}`
  : 'Currículo Interativo — Engenharia Civil UFSC (versão web do PET-ECV)';
const c = git(...autor, 'commit', '-q', '-m', mensagem);
if (c.status !== 0) throw new Error(`git commit falhou: ${c.stderr}`);

const arquivos = readdirSync(saida, { recursive: true }).length;
console.log(`Pasta pronta: ${saida}`);
console.log(atualizar ? 'Novo commit criado (autor: PET Engenharia Civil UFSC). Agora: git push' : `${arquivos} itens, 1 commit (autor: PET Engenharia Civil UFSC).`);
if (!comEngenhariaReversa) console.log('docs/engenharia-reversa NÃO foi incluída (use --com-engenharia-reversa para levá-la).');
console.log('\nPróximos passos: veja docs/publicacao.md (criar o repositório vazio no GitHub e enviar esta pasta).');
