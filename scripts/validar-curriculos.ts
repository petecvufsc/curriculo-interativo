// Valida todos os currículos JSON e imprime erros, avisos e totais. Termina com código 1 se houver erro.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Curriculo } from '../src/dominio/tipos';
import { validarCurriculo } from '../src/dominio/validacao/validarCurriculo';

const pasta = join(import.meta.dirname, '..', 'src', 'dominio', 'curriculos');
let falhou = false;

for (const arquivo of readdirSync(pasta).filter((f) => f.endsWith('.json'))) {
  const c = JSON.parse(readFileSync(join(pasta, arquivo), 'utf8')) as Curriculo;
  const r = validarCurriculo(c);
  console.log(`\n=== ${arquivo} (${c.disciplinas.length} disciplinas)`);
  console.log(`Obrigatórias: ${r.totais.obrigatoriasHA} h-a · Optativas (soma do rol): ${r.totais.optativasHA} h-a`);
  console.log('Por fase:', JSON.stringify(r.totais.porFase));
  if (c.integralizacao) {
    const i = c.integralizacao;
    const esperado = i.obrigatoriasHA + i.estagioHA + i.projetoIntegradorHA;
    console.log(`Esperado pelo PDF (obrigatórias + estágio + TCC): ${esperado} h-a ${esperado === r.totais.obrigatoriasHA ? '✔' : '✘ DIFERENTE'}`);
  }
  for (const e of r.erros) console.log(`  ERRO  ${e}`);
  for (const a of r.avisos) console.log(`  aviso ${a}`);
  if (r.erros.length) falhou = true;
}
process.exit(falhou ? 1 : 0);
