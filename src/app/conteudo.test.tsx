// @vitest-environment jsdom
// Conteúdo pedido pelo usuário: intercâmbios fora do app e explicação do planejamento.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { optativas } from './estado/motorEcv';

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

describe('optativas sem intercâmbio', () => {
  it('a lista de optativas não tem as disciplinas de intercâmbio (inscrição só pela coordenação)', () => {
    render(<App />);
    expect(screen.queryByText(/Intercâmbio/)).toBeNull();
    expect(optativas.some((d) => /^ECV297[1-4]$/.test(d.codigo))).toBe(false);
    // as demais optativas continuam
    expect(screen.getByText('Construção Pré-Fabricada')).toBeTruthy();
    expect(screen.getByText('Atividades Complementares')).toBeTruthy();
  });

  it('o planejamento também não oferece intercâmbio', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole('tab', { name: 'Planejamento' }));
    await u.click(screen.getByRole('button', { name: '+ Adicionar semestre' }));
    const sem = within(screen.getByRole('listitem', { name: /^Semestre 1/ }));
    await u.click(sem.getByText('+ Adicionar disciplina'));
    await u.type(sem.getByRole('searchbox', { name: 'Buscar disciplina para o semestre 1' }), 'Intercâmbio');
    expect(sem.queryByRole('button', { name: /Intercâmbio/ })).toBeNull();
    expect(sem.getByText('Nenhuma disciplina disponível com esse texto.')).toBeTruthy();
  });

  it('os totais de optativas disponíveis não incluem intercâmbio', async () => {
    const u = userEvent.setup();
    render(<App />);
    const painel = screen.getByRole('complementary', { name: 'Resumo e ações' });
    await u.click(within(painel).getByRole('button', { name: 'Simular' }));
    // Sem histórico: optativas sem pré-requisito = ECV2905 (54 h-a) + ECV2906 (108 h-a) = 162 h-a e 9 créditos
    expect(screen.getByText('Optativas: 162 h-a · 9 créditos')).toBeTruthy();
  });
});

describe('explicação do planejamento', () => {
  it('a aba Planejamento tem um "Como funciona" com os passos', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole('tab', { name: 'Planejamento' }));
    expect(screen.getByText('Como funciona o planejamento')).toBeTruthy();
    expect(screen.getByText(/antes/, { selector: 'strong' })).toBeTruthy();
    expect(screen.getByText(/Ela não faz a matrícula: confirme sempre no CAGR/)).toBeTruthy();
  });
});

describe('retorno das ações', () => {
  const caixa = (nome: string) => screen.getByLabelText(`Marcar ${nome} como cursada`) as HTMLInputElement;

  it('avisa quando a cascata marca outras disciplinas e permite desfazer', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(caixa('Análise Estrutural I'));
    const aviso = screen.getByRole('status');
    expect(aviso.textContent).toMatch(/Marquei também 5 pré-requisitos de Análise Estrutural I/);
    expect(caixa('Física I').checked).toBe(true);

    await u.click(within(aviso).getByRole('button', { name: 'Desfazer' }));
    expect(caixa('Análise Estrutural I').checked).toBe(false);
    expect(caixa('Física I').checked).toBe(false);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('não avisa quando só a própria disciplina muda', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(caixa('Física I'));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('o "Desfazer" some quando o plano muda (senão restauraria o plano antigo)', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(caixa('Análise Estrutural I'));
    expect(screen.getByRole('button', { name: 'Desfazer' })).toBeTruthy();
    await u.click(screen.getByRole('tab', { name: 'Planejamento' }));
    await u.click(screen.getByRole('button', { name: '+ Adicionar semestre' }));
    expect(screen.queryByRole('button', { name: 'Desfazer' })).toBeNull();
  });
});

describe('orientação na tela', () => {
  it('a grade explica os dois gestos do cartão e mostra a legenda sem rolar', () => {
    render(<App />);
    expect(screen.getByText(/Marque a/)).toBeTruthy();
    expect(screen.getByRole('list', { name: 'Legenda de destaques' })).toBeTruthy();
    // Só as seis cores do programa original; Cursada, Cursando, Reprovada e Planejada não entram na legenda
    const legenda = within(screen.getByRole('list', { name: 'Legenda de destaques' }));
    expect(legenda.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Selecionada', 'Pré-requisito direto', 'Pré-requisito indireto', 'Tranca diretamente', 'Tranca indiretamente', 'Disponível',
    ]);
    for (const fora of [/Cursad/, /Cursando/, /Reprovada/, /Planejada/, /alternativa/]) expect(legenda.queryByText(fora)).toBeNull();
  });

  it('Ajuda e Sobre ficam no cabeçalho', () => {
    render(<App />);
    const topo = screen.getByRole('banner');
    expect(within(topo).getByRole('button', { name: 'Ajuda' })).toBeTruthy();
    expect(within(topo).getByRole('button', { name: 'Sobre' })).toBeTruthy();
  });

  it('o "Como funciona" do planejamento vem aberto com o plano vazio e fecha ao criar o semestre', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole('tab', { name: 'Planejamento' }));
    const detalhes = screen.getByText('Como funciona o planejamento').closest('details')!;
    expect(detalhes.open).toBe(true);
    // Sem plano, o resumo do topo convida a montar um (em vez de repetir o progresso atual)
    expect(screen.getByText(/Monte um plano abaixo para ver quanto do curso/)).toBeTruthy();
    await u.click(screen.getByRole('button', { name: '+ Adicionar semestre' }));
    expect(detalhes.open).toBe(false);
    expect(screen.getByText(/Ao fim do plano:/)).toBeTruthy();
  });

  it('remover um semestre com disciplinas pede confirmação', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole('tab', { name: 'Planejamento' }));
    await u.click(screen.getByRole('button', { name: '+ Adicionar semestre' }));
    await u.click(screen.getByRole('button', { name: 'Sugerir disciplinas para o semestre 1' }));
    const original = window.confirm;
    let perguntou = '';
    window.confirm = (m?: string) => { perguntou = m ?? ''; return false; };
    await u.click(screen.getByRole('button', { name: 'Remover o semestre 1' }));
    window.confirm = original;
    expect(perguntou).toMatch(/Remover o semestre 1/);
    expect(screen.getByRole('heading', { name: 'Semestre 1 (próximo)' })).toBeTruthy();
  });
});

describe('integralização do curso (%)', () => {
  const caixa = (nome: string) => screen.getByLabelText(`Marcar ${nome} como cursada`) as HTMLInputElement;
  const barra = () => screen.getByRole('progressbar', { name: 'Integralização do curso' });

  it('mostra 0 % de 4.518 h-a no começo, na grade e no planejamento', async () => {
    const u = userEvent.setup();
    render(<App />);
    expect(screen.getByText('0,0%')).toBeTruthy();
    expect(screen.getByText('0 de 4.518 h-a')).toBeTruthy();
    expect(barra().getAttribute('aria-valuenow')).toBe('0');
    await u.click(screen.getByRole('tab', { name: 'Planejamento' }));
    expect(screen.getByText('0,0%')).toBeTruthy();
  });

  it('sobe ao marcar disciplinas: Física I (72 h-a) = 1,6 %', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(caixa('Física I'));
    expect(screen.getByText('1,6%')).toBeTruthy();
    expect(screen.getByText('72 de 4.518 h-a')).toBeTruthy();
    expect(barra().getAttribute('aria-valuetext')).toBe('1,6% do curso integralizado');
  });

  it('a barra fixa do celular também mostra o percentual', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(caixa('Física I'));
    expect(within(screen.getByRole('navigation', { name: 'Ações rápidas' })).getByText('1,6% integralizado')).toBeTruthy();
  });

  it('não soma as optativas além das 432 h-a (limite do curso)', async () => {
    const u = userEvent.setup();
    render(<App />);
    // Marca a fase 1 a 10 (todas as obrigatórias) e 9 optativas de 54 h-a (486 h-a, 54 a mais que o exigido)
    for (let f = 1; f <= 10; f++) await u.click(screen.getByLabelText(`Marcar todas as disciplinas obrigatórias da ${f}ª Fase`));
    const optativas = ['Construção Pré-Fabricada', 'Instalações Prediais Especiais', 'Métodos de elementos Finitos', 'Projeto de Estruturas em Concreto Armado', 'Projeto de Estruturas de Pontes', 'Estabilidade de Taludes', 'Obras de terra', 'Tecnologia de Concretos', 'Projeto de Fundações'];
    for (const n of optativas) await u.click(caixa(n));
    expect(screen.getByText('100,0%')).toBeTruthy();
  });
});
