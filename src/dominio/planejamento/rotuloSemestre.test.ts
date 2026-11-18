import { describe, expect, it } from 'vitest';
import { proximoSemestreSugerido, rotuloSemestre, semestreValido } from '.';

describe('semestreValido', () => {
  it.each(['2027.1', '2027.2', '1999.1', '2100.2'])('%s é válido', (s) => expect(semestreValido(s)).toBe(true));
  it.each(['2027.3', '2027.0', '27.1', '2027', '2027.11', ' 2027.1', '2027-1', 'abc', ''])('"%s" é inválido', (s) =>
    expect(semestreValido(s)).toBe(false),
  );
});

describe('rotuloSemestre', () => {
  it('conta de meio em meio ano a partir do início', () => {
    expect([1, 2, 3, 4, 5].map((k) => rotuloSemestre('2027.1', k))).toEqual(['2027.1', '2027.2', '2028.1', '2028.2', '2029.1']);
    expect([1, 2, 3].map((k) => rotuloSemestre('2027.2', k))).toEqual(['2027.2', '2028.1', '2028.2']);
  });

  it('sem início válido ou com k inválido, devolve null', () => {
    expect(rotuloSemestre(null, 1)).toBeNull();
    expect(rotuloSemestre('abc', 1)).toBeNull();
    expect(rotuloSemestre('2027.1', 0)).toBeNull();
  });
});

describe('proximoSemestreSugerido', () => {
  it('até junho: o segundo semestre do ano; de julho em diante: o primeiro do ano seguinte', () => {
    expect(proximoSemestreSugerido(new Date(2026, 0, 15))).toBe('2026.2'); // janeiro
    expect(proximoSemestreSugerido(new Date(2026, 5, 30))).toBe('2026.2'); // junho
    expect(proximoSemestreSugerido(new Date(2026, 6, 1))).toBe('2027.1'); // julho
    expect(proximoSemestreSugerido(new Date(2026, 10, 17))).toBe('2027.1'); // novembro
  });
});
