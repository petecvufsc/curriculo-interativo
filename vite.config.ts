import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Data da última atualização (AAAA-MM-DD, no fuso local), gravada a cada build e mostrada no cabeçalho.
const atualizadoEm = new Date().toLocaleDateString('sv-SE');

// Testes de domínio rodam em node; testes de UI (*.test.tsx) declaram
// `// @vitest-environment jsdom` no topo do arquivo.
export default defineConfig({
  define: { __ATUALIZADO_EM__: JSON.stringify(atualizadoEm) },
  // Caminhos relativos: o build funciona em qualquer subpasta (ex.: GitHub Pages em /<repositorio>/).
  base: './',
  plugins: [react()],
  test: { include: ['src/**/*.test.{ts,tsx}'] },
});
