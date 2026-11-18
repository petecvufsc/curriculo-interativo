// Serialização e importação do registro (§12), currículo fictício (id "teste").
import { describe, expect, it } from 'vitest';
import type { Curriculo } from '../tipos';
import { curriculoFicticio } from '../regras/curriculoFicticio.fixture';
import { carregar, importar, registroVazio, serializar } from '.';
import { DATA_FIXA, reg } from './registro.fixture';

const curriculo: Curriculo = curriculoFicticio();

function valido(extra: Record<string, unknown> = {}): string {
  return JSON.stringify({
    formato: 'curriculo-interativo-ecv',
    versao: 1,
    curriculoId: 'teste',
    atualizadoEm: DATA_FIXA,
    status: { TST0001: 'aprovada', TST0002: 'cursando', TST0003: 'reprovada' },
    plano: { semestres: [{ codigos: ['TST0004', 'TST0009'] }] },
    opcoes: { cursandoComoAprovada: false, limiteAulas: 24, disciplinasPorSemestre: 4, semestreInicial: '2027.1' },
    ...extra,
  });
}

function aceito(texto: string) {
  const r = importar(texto, curriculo, DATA_FIXA);
  if (!r.ok) throw new Error(`esperava sucesso: ${r.erro}`);
  return r;
}

describe('serializar', () => {
  it('gera JSON com 2 espaços e a ordem de campos do §12', () => {
    const texto = serializar(reg({ status: { TST0001: 'aprovada' }, plano: [['TST0002']] }));
    expect(texto).toContain('\n  "formato": "curriculo-interativo-ecv",');
    expect(Object.keys(JSON.parse(texto))).toEqual([
      'formato', 'versao', 'curriculoId', 'atualizadoEm', 'status', 'plano', 'opcoes',
    ]);
  });
});

describe('importar: rejeições (§12)', () => {
  it('JSON malformado', () => {
    const r = importar('{ não é json', curriculo);
    expect(r).toEqual({ ok: false, erro: expect.stringContaining('JSON') });
  });

  it('JSON válido que não é objeto', () => {
    expect(importar('[1,2]', curriculo).ok).toBe(false);
    expect(importar('null', curriculo).ok).toBe(false);
    expect(importar('42', curriculo).ok).toBe(false);
  });

  it('formato diferente ou ausente', () => {
    const r = importar(valido({ formato: 'outro' }), curriculo);
    expect(r).toEqual({ ok: false, erro: expect.stringContaining('Formato') });
    expect(importar(valido({ formato: undefined }), curriculo).ok).toBe(false);
  });

  it('versão desconhecida', () => {
    const r = importar(valido({ versao: 2 }), curriculo);
    expect(r).toEqual({ ok: false, erro: expect.stringContaining('Versão') });
    expect(importar(valido({ versao: '1' }), curriculo).ok).toBe(false);
  });

  it('currículo diferente', () => {
    const r = importar(valido({ curriculoId: 'ecv-programa-original' }), curriculo);
    expect(r).toEqual({ ok: false, erro: expect.stringContaining('ecv-programa-original') });
  });
});

describe('importar: aceitação e relatório (§12)', () => {
  it('arquivo íntegro: registro igual ao do arquivo e relatório vazio', () => {
    const r = aceito(valido());
    expect(r.relatorio).toEqual([]);
    expect(r.registro).toEqual({
      formato: 'curriculo-interativo-ecv', versao: 1, curriculoId: 'teste', atualizadoEm: DATA_FIXA,
      status: { TST0001: 'aprovada', TST0002: 'cursando', TST0003: 'reprovada' },
      plano: { semestres: [{ codigos: ['TST0004', 'TST0009'] }] },
      opcoes: { cursandoComoAprovada: false, limiteAulas: 24, disciplinasPorSemestre: 4, semestreInicial: '2027.1', versaoRegras: '2020.1' },
    });
  });

  it('status inválido: entrada ignorada e relatada, as demais ficam', () => {
    const r = aceito(valido({ status: { TST0001: 'aprovada', TST0002: 'talvez', TST0003: 7, TST0004: 'nao-cursada' } }));
    expect(r.registro.status).toEqual({ TST0001: 'aprovada' });
    expect(r.relatorio).toHaveLength(3);
    expect(r.relatorio.join('\n')).toMatch(/TST0002/);
    expect(r.relatorio.join('\n')).toMatch(/TST0003/);
    expect(r.relatorio.join('\n')).toMatch(/TST0004/);
  });

  it('código desconhecido no status: aceito como de outro currículo e relatado', () => {
    const r = aceito(valido({ status: { MTM3101: 'aprovada' } }));
    expect(r.registro.status).toEqual({ MTM3101: 'aprovada' });
    expect(r.relatorio).toHaveLength(1);
    expect(r.relatorio[0]).toContain('MTM3101');
  });

  it('código desconhecido só é aceito como aprovada (§10): cursando é ignorado e relatado', () => {
    const r = aceito(valido({ status: { MTM3101: 'cursando' } }));
    expect(r.registro.status).toEqual({});
    expect(r.relatorio).toHaveLength(1);
  });

  it('código do plano fora do currículo: removido e relatado, posição dos semestres preservada', () => {
    const r = aceito(valido({ plano: { semestres: [{ codigos: ['TST0001', 'XXX0000'] }, { codigos: ['YYY1111'] }, { codigos: [] }] } }));
    expect(r.registro.plano.semestres).toEqual([{ codigos: ['TST0001'] }, { codigos: [] }, { codigos: [] }]);
    expect(r.relatorio).toHaveLength(2);
    expect(r.relatorio[0]).toContain('XXX0000');
    expect(r.relatorio[1]).toContain('YYY1111');
  });

  it('código não textual no plano é removido e relatado', () => {
    const r = aceito(valido({ plano: { semestres: [{ codigos: ['TST0001', 5, null] }] } }));
    expect(r.registro.plano.semestres).toEqual([{ codigos: ['TST0001'] }]);
    expect(r.relatorio).toHaveLength(2);
  });

  it('semestre malformado vira vazio e é relatado', () => {
    const r = aceito(valido({ plano: { semestres: [{ codigos: 'TST0001' }, 3] } }));
    expect(r.registro.plano.semestres).toEqual([{ codigos: [] }, { codigos: [] }]);
    expect(r.relatorio).toHaveLength(2);
  });

  it('campos ausentes usam padrões e são relatados (nunca silencioso)', () => {
    const r = aceito(valido({ status: undefined, plano: undefined, opcoes: undefined, atualizadoEm: undefined }));
    expect(r.registro).toEqual(registroVazio('teste', DATA_FIXA));
    expect(r.relatorio).toHaveLength(4);
  });

  it('opções inválidas voltam ao padrão com relato', () => {
    const r = aceito(valido({ opcoes: { cursandoComoAprovada: 'sim', limiteAulas: 0 } }));
    expect(r.registro.opcoes).toEqual({ cursandoComoAprovada: true, limiteAulas: 30, disciplinasPorSemestre: 5, semestreInicial: null, versaoRegras: '2020.1' });
    expect(r.relatorio).toHaveLength(2);
  });

  it('código "__proto__" no status não corrompe o objeto', () => {
    const r = aceito('{"formato":"curriculo-interativo-ecv","versao":1,"curriculoId":"teste","atualizadoEm":"x","status":{"__proto__":"aprovada"},"plano":{"semestres":[]},"opcoes":{"cursandoComoAprovada":true,"limiteAulas":30}}');
    expect(Object.keys(r.registro.status)).toEqual(['__proto__']);
  });
});

describe('ida e volta serializar -> importar', () => {
  it('preserva o registro e não gera relatório', () => {
    const original = reg({
      status: { TST0001: 'aprovada', TST0002: 'cursando', TST0003: 'reprovada' },
      plano: [['TST0004'], [], ['TST0005', 'TST0007']],
      cursandoComoAprovada: false,
      limiteAulas: 27,
    });
    const r = aceito(serializar(original));
    expect(r.registro).toEqual(original);
    expect(r.relatorio).toEqual([]);
    expect(serializar(r.registro)).toBe(serializar(original));
  });

  it('todas as opções, com valores diferentes do padrão, sobrevivem à ida e volta (regressão: só 2 eram gravadas)', () => {
    const original = reg({
      cursandoComoAprovada: false,
      limiteAulas: 27,
      disciplinasPorSemestre: 3,
      semestreInicial: '2028.1',
      versaoRegras: '2028.1',
    });
    const r = aceito(serializar(original));
    expect(r.registro.opcoes).toEqual(original.opcoes);
    expect(r.relatorio).toEqual([]);
  });

  it('código externo aprovado sobrevive à ida e volta (com relato informativo)', () => {
    const original = reg({ status: { OLD1001: 'aprovada' } });
    const r = aceito(serializar(original));
    expect(r.registro).toEqual(original);
    expect(r.relatorio).toHaveLength(1);
  });
});

describe('carregar (localStorage, tolerante)', () => {
  it('texto válido: devolve o registro', () => {
    expect(carregar(valido(), curriculo, DATA_FIXA).status.TST0001).toBe('aprovada');
  });

  it('ausente, malformado, outro formato, versão ou currículo: registro vazio', () => {
    const vazio = registroVazio('teste', DATA_FIXA);
    for (const texto of [null, undefined, '', '{x', valido({ formato: 'x' }), valido({ versao: 9 }), valido({ curriculoId: 'z' })]) {
      expect(carregar(texto, curriculo, DATA_FIXA)).toEqual(vazio);
    }
  });
});

describe('opcoes.disciplinasPorSemestre (§11, §12)', () => {
  const arquivo = (opcoes: string) =>
    `{"formato":"curriculo-interativo-ecv","versao":1,"curriculoId":"teste","atualizadoEm":"x","status":{},"plano":{"semestres":[]},"opcoes":${opcoes}}`;

  it('arquivo antigo, sem o campo: usa o padrão (5) sem reclamar', () => {
    const r = aceito(arquivo('{"cursandoComoAprovada":true,"limiteAulas":30}'));
    expect(r.registro.opcoes.disciplinasPorSemestre).toBe(5);
    expect(r.relatorio.some((l) => l.includes('disciplinasPorSemestre'))).toBe(false);
  });

  it('valor válido (1 a 12) é mantido', () => {
    expect(aceito(arquivo('{"cursandoComoAprovada":true,"limiteAulas":30,"disciplinasPorSemestre":3}')).registro.opcoes.disciplinasPorSemestre).toBe(3);
    expect(aceito(arquivo('{"cursandoComoAprovada":true,"limiteAulas":30,"disciplinasPorSemestre":12}')).registro.opcoes.disciplinasPorSemestre).toBe(12);
  });

  it.each(['0', '13', '2.5', '"cinco"', 'null'])('valor inválido (%s) volta ao padrão e é relatado', (v) => {
    const r = aceito(arquivo(`{"cursandoComoAprovada":true,"limiteAulas":30,"disciplinasPorSemestre":${v}}`));
    expect(r.registro.opcoes.disciplinasPorSemestre).toBe(5);
    expect(r.relatorio.some((l) => l.includes('disciplinasPorSemestre'))).toBe(true);
  });
});

describe('opcoes.versaoRegras (decisão D5)', () => {
  const arquivo = (opcoes: string) =>
    `{"formato":"curriculo-interativo-ecv","versao":1,"curriculoId":"teste","atualizadoEm":"x","status":{},"plano":{"semestres":[]},"opcoes":${opcoes}}`;
  const base = '"cursandoComoAprovada":true,"limiteAulas":30';

  it('arquivo antigo, sem o campo: 2020.1 (atual), sem reclamar', () => {
    const r = aceito(arquivo(`{${base}}`));
    expect(r.registro.opcoes.versaoRegras).toBe('2020.1');
    expect(r.relatorio.some((l) => l.includes('versaoRegras'))).toBe(false);
  });

  it('"2020.1" e "2028.1" são mantidas', () => {
    expect(aceito(arquivo(`{${base},"versaoRegras":"2028.1"}`)).registro.opcoes.versaoRegras).toBe('2028.1');
    expect(aceito(arquivo(`{${base},"versaoRegras":"2020.1"}`)).registro.opcoes.versaoRegras).toBe('2020.1');
  });

  it.each(['"2027.1"', '"2030.1"', '2028.1', 'null', 'true'])('valor inválido (%s) volta a 2020.1 e é relatado', (v) => {
    const r = aceito(arquivo(`{${base},"versaoRegras":${v}}`));
    expect(r.registro.opcoes.versaoRegras).toBe('2020.1');
    expect(r.relatorio.some((l) => l.includes('versaoRegras'))).toBe(true);
  });
});

describe('opcoes.semestreInicial (§11, §12)', () => {
  const arquivo = (opcoes: string) =>
    `{"formato":"curriculo-interativo-ecv","versao":1,"curriculoId":"teste","atualizadoEm":"x","status":{},"plano":{"semestres":[]},"opcoes":${opcoes}}`;
  const base = '"cursandoComoAprovada":true,"limiteAulas":30';

  it('arquivo antigo, sem o campo: null, sem reclamar', () => {
    const r = aceito(arquivo(`{${base}}`));
    expect(r.registro.opcoes.semestreInicial).toBeNull();
    expect(r.relatorio.some((l) => l.includes('semestreInicial'))).toBe(false);
  });

  it('"2027.1" e "2030.2" são mantidos; null também, sem aviso', () => {
    expect(aceito(arquivo(`{${base},"semestreInicial":"2027.1"}`)).registro.opcoes.semestreInicial).toBe('2027.1');
    expect(aceito(arquivo(`{${base},"semestreInicial":"2030.2"}`)).registro.opcoes.semestreInicial).toBe('2030.2');
    const r = aceito(arquivo(`{${base},"semestreInicial":null}`));
    expect(r.registro.opcoes.semestreInicial).toBeNull();
    expect(r.relatorio.some((l) => l.includes('semestreInicial'))).toBe(false);
  });

  it.each(['"2027.3"', '"27.1"', '"2027"', '"abc"', '2027.1', 'true'])('valor inválido (%s) vira null e é relatado', (v) => {
    const r = aceito(arquivo(`{${base},"semestreInicial":${v}}`));
    expect(r.registro.opcoes.semestreInicial).toBeNull();
    expect(r.relatorio.some((l) => l.includes('semestreInicial'))).toBe(true);
  });
});
