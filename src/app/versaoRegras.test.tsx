// @vitest-environment jsdom
// Seletor de versão das regras de pré-requisito (decisão D5): 2020.1 (atuais) e 2028.1 (novos).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { CHAVE_LOCAL_STORAGE, registroVazio } from '../dominio/aluno/tipos';
import { fixarHoje, registroCom, semear } from './testeAuxiliar';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

const seletor = () => screen.getByRole('combobox', { name: 'Regras de pré-requisitos' }) as HTMLSelectElement;
const marcar = (nome: string) => screen.getByLabelText(`Marcar ${nome} como cursada`) as HTMLInputElement;

/** Clica no nome da disciplina na grade e devolve a seção de detalhes. */
async function abrirDetalhe(u: ReturnType<typeof userEvent.setup>, nome: string) {
  await u.click(screen.getAllByRole('button', { name: nome, pressed: false })[0]);
  return within(screen.getByRole('region', { name: 'Disciplina selecionada' }));
}

describe('seletor de versão das regras', () => {
  it('começa na versão 2020.1 e avisa que a versão 2028.1 será a única a partir de novembro de 2027', () => {
    render(<App />);
    expect(seletor().value).toBe('2020.1');
    expect(screen.getByRole('option', { name: '2020.1 — atuais (até 2027.2)' })).toBeTruthy();
    expect(screen.getByRole('option', { name: '2028.1 — novos (a partir de 2028.1)' })).toBeTruthy();
    expect(screen.getByText(/A partir de novembro de 2027, apenas a versão 2028\.1 estará disponível/)).toBeTruthy();
  });

  it('lista as quatro disciplinas que mudam, com o antes e o depois', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByText('Ver o que muda em 2028.1'));
    const itens = screen.getAllByRole('listitem').filter((li) => /ECV2(501|505|704|932)/.test(li.textContent ?? '') && /de .* para /.test(li.textContent ?? ''));
    expect(itens).toHaveLength(4);
    expect(itens.map((li) => li.textContent).join('|')).toMatch(/ECV2501.*de INE5108 para ECV2302 \+ INE5108/);
    expect(screen.getByText(/ECV2704 Expressão Oral e Escrita/).parentElement?.textContent).toMatch(/de nenhum para ECV2401 \+ ECV2402/);
  });

  it('em 2020.1 Expressão Oral e Escrita não tem pré-requisito; em 2028.1 exige as sete da 4ª fase', async () => {
    const u = userEvent.setup();
    render(<App />);
    let detalhe = await abrirDetalhe(u, 'Expressão Oral e Escrita');
    expect(detalhe.queryByText('Pré-requisitos diretos')).toBeNull();

    await u.selectOptions(seletor(), '2028.1');
    detalhe = within(screen.getByRole('region', { name: 'Disciplina selecionada' }));
    expect(detalhe.getByText('Pré-requisitos diretos')).toBeTruthy();
    for (const nome of ['Análise Estrutural I', 'Geoprocessamento', 'Materiais de Construção I', 'Mecânica dos Sólidos I', 'Sistemas de Transporte', 'Hidráulica', 'Cálculo 3'])
      expect(detalhe.getByRole('button', { name: `Selecionar ${nome}` })).toBeTruthy();
  });

  it('a troca recalcula a simulação: Expressão Oral e Escrita está disponível só em 2020.1', async () => {
    const u = userEvent.setup();
    render(<App />);
    const painel = within(screen.getByLabelText('Resumo e ações'));
    await u.click(painel.getByRole('button', { name: 'Simular' }));
    const cartao = () => document.querySelector('[data-codigo="ECV2704"]') as HTMLElement;
    expect(cartao().className).toMatch(/disponivel/);

    await u.selectOptions(seletor(), '2028.1');
    await u.click(painel.getByRole('button', { name: 'Simular' }));
    expect(cartao().className).not.toMatch(/disponivel/);
  });

  it('trocar de versão não apaga o histórico e fica salvo no navegador', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(marcar('Física I'));
    await u.selectOptions(seletor(), '2028.1');
    expect(marcar('Física I').checked).toBe(true);
    await new Promise((r) => setTimeout(r, 400)); // o salvamento tem atraso de 300 ms
    const salvo = JSON.parse(localStorage.getItem(CHAVE_LOCAL_STORAGE)!);
    expect(salvo.opcoes.versaoRegras).toBe('2028.1');
    expect(salvo.status.FSC5101).toBe('aprovada');
  });

  it('a escolha volta ao reabrir o app', async () => {
    const u = userEvent.setup();
    const primeira = render(<App />);
    await u.selectOptions(seletor(), '2028.1');
    primeira.unmount();
    render(<App />);
    expect(seletor().value).toBe('2028.1');
    expect(screen.getByText(/Você está vendo os novos pré-requisitos/)).toBeTruthy();
  });

  it('depois de novembro de 2027 a versão 2020.1 some sozinha: só a 2028.1 vale, mesmo com a 2020.1 salva', async () => {
    // Registro salvo antes do corte, na versão 2020.1
    const u0 = userEvent.setup();
    const antes = render(<App />);
    await u0.click(marcar('Física I'));
    antes.unmount();

    vi.useFakeTimers({ toFake: ['Date'], now: new Date('2027-11-02T12:00:00') });
    try {
      const u = userEvent.setup();
      render(<App />);
      expect(within(seletor()).queryByRole('option', { name: /^2020\.1/ })).toBeNull();
      expect(seletor().value).toBe('2028.1');
      expect(screen.getByText(/A versão 2020\.1 foi encerrada em novembro de 2027/)).toBeTruthy();
      expect(marcar('Física I').checked).toBe(true); // o histórico continua

      // Os pré-requisitos aplicados são os novos: Expressão Oral e Escrita exige as sete da 4ª fase
      const detalhe = await abrirDetalhe(u, 'Expressão Oral e Escrita');
      expect(detalhe.getByText('Pré-requisitos diretos')).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('antes do corte, as duas versões aparecem', () => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date('2027-10-31T12:00:00') });
    try {
      render(<App />);
      expect(within(seletor()).getAllByRole('option')).toHaveLength(2);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('planejamento: cada semestre usa as regras do seu período (decisão D5)', () => {
  beforeEach(() => {
    fixarHoje();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const primeiroSemestre = () => screen.getByRole('combobox', { name: 'Primeiro semestre do plano' });
  const sem = (nome: string) => within(screen.getByRole('listitem', { name: new RegExp(`^${nome.replace('.', '\\.')}`) }));

  /** Busca "Expressão" na lista de disciplinas do semestre `n` (rótulo `nome`) e diz se ECV2704 é oferecida. */
  async function ofereceExpressao(u: ReturnType<typeof userEvent.setup>, nome: string, n: number) {
    const s = sem(nome);
    await u.click(s.getByText('+ Adicionar disciplina'));
    await u.type(s.getByRole('searchbox', { name: `Buscar disciplina para o semestre ${n}` }), 'Expressão');
    return s.queryByRole('button', { name: `Adicionar Expressão Oral e Escrita ao semestre ${n}` }) !== null;
  }

  it('Expressão Oral e Escrita (ECV2704) é oferecida em 2027.2 (regras atuais) e não em 2028.1 (novas)', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole('tab', { name: 'Planejamento' }));
    await u.selectOptions(primeiroSemestre(), '2027.2');
    await u.click(screen.getByRole('button', { name: '+ Adicionar semestre' }));
    await u.click(screen.getByRole('button', { name: '+ Adicionar semestre' }));
    expect(await ofereceExpressao(u, '2027.2', 1)).toBe(true);
    expect(await ofereceExpressao(u, '2028.1', 2)).toBe(false);
  });

  it('avisa a virada: a nota aparece só no primeiro semestre com os novos pré-requisitos', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole('tab', { name: 'Planejamento' }));
    await u.selectOptions(primeiroSemestre(), '2027.2');
    for (let i = 0; i < 3; i++) await u.click(screen.getByRole('button', { name: '+ Adicionar semestre' }));
    const nota = /A partir daqui valem os novos pré-requisitos/;
    expect(sem('2027.2').queryByText(nota)).toBeNull();
    expect(sem('2028.1').getByText(nota)).toBeTruthy();
    expect(sem('2028.2').queryByText(nota)).toBeNull();
  });

  it('o mesmo plano com ECV2704: sem problema em 2027.2; "pré-requisito faltando" em 2028.1', () => {
    const opcoes = { ...registroVazio('x').opcoes, semestreInicial: '2027.2' };
    semear(registroCom({ opcoes, plano: { semestres: [{ codigos: ['ECV2704'] }] } }));
    const antes = render(<App />);
    return userEvent.setup().click(screen.getByRole('tab', { name: 'Planejamento' })).then(() => {
      expect(screen.queryByText(/pré-requisito faltando/)).toBeNull();
      antes.unmount();
      localStorage.clear();
      semear(registroCom({ opcoes, plano: { semestres: [{ codigos: [] }, { codigos: ['ECV2704'] }] } }));
      render(<App />);
      return userEvent.setup().click(screen.getByRole('tab', { name: 'Planejamento' }));
    }).then(() => {
      expect(screen.getByText(/1 disciplina com pré-requisito faltando/)).toBeTruthy();
    });
  });
});
