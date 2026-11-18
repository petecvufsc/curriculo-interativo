// Formatação de números no padrão brasileiro (vírgula decimal, ponto de milhar).
const umaCasa = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

/** 27,4 (sem o símbolo %). */
export function formatarPercentual(n: number): string {
  return umaCasa.format(n);
}

/** "2026-11-18" → "18/11/2026". Texto fora desse formato volta como veio. */
export function formatarDataIso(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

/** 4.518 */
export function formatarHoras(n: number): string {
  return inteiro.format(n);
}
