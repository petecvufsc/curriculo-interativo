// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { CHAVE_LOCAL_STORAGE, serializar } from '../dominio/aluno';
import { nomeArquivo } from './estado/arquivo';
import { armazenamentoFalso, caixa, registroCom } from './testeAuxiliar';

beforeEach(() => {
  vi.stubGlobal('localStorage', armazenamentoFalso());
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const arquivo = (texto: string, nome = 'dados.json') => new File([texto], nome, { type: 'application/json' });

describe('persistência no localStorage', () => {
  it('salva ao mudar e restaura ao montar de novo', async () => {
    const u = userEvent.setup();
    const { unmount } = render(<App />);
    await u.click(caixa('ECV2302'));
    unmount();
    expect(localStorage.getItem(CHAVE_LOCAL_STORAGE)).toContain('"ECV2302": "aprovada"');

    render(<App />);
    expect(caixa('ECV2302').checked).toBe(true);
    expect(caixa('MTM3110').checked).toBe(true);
    expect(caixa('ECV2401').checked).toBe(false);
  });

  it('salva depois de 300 ms sem desmontar', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const u = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
      render(<App />);
      await u.click(caixa('ECV2101'));
      expect(localStorage.getItem(CHAVE_LOCAL_STORAGE)).toBeNull();
      await vi.advanceTimersByTimeAsync(400);
      expect(localStorage.getItem(CHAVE_LOCAL_STORAGE)).toContain('ECV2101');
    } finally {
      vi.useRealTimers();
    }
  });

  it('funciona sem localStorage (modo privado)', async () => {
    const proibido = () => {
      throw new Error('SecurityError');
    };
    vi.stubGlobal('localStorage', { getItem: proibido, setItem: proibido, removeItem: proibido, clear: proibido });
    const u = userEvent.setup();
    const { unmount } = render(<App />);
    await u.click(caixa('ECV2302'));
    expect(caixa('ECV2302').checked).toBe(true);
    expect(() => unmount()).not.toThrow();
  });

  it('dado salvo inválido é ignorado', () => {
    localStorage.setItem(CHAVE_LOCAL_STORAGE, '{lixo');
    render(<App />);
    expect(caixa('ECV2302').checked).toBe(false);
  });
});

describe('importar e exportar', () => {
  it('importa um arquivo válido, substitui o registro e mostra o relatório', async () => {
    const u = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<App />);
    await u.click(caixa('ECV2401'));
    const texto = serializar(registroCom({ status: { ECV2101: 'aprovada', XYZ1234: 'aprovada' } }));
    await u.upload(screen.getByLabelText('Importar'), arquivo(texto));

    // A leitura do arquivo é assíncrona: espera o relatório (antes dele ainda está o aviso da marcação anterior)
    const aviso = (await screen.findByText(/Arquivo importado/)).closest('[role=status]') as HTMLElement;
    // Importar invalida o "Desfazer" pendente da marcação anterior: só o relatório fica na tela
    expect(screen.queryByRole('button', { name: 'Desfazer' })).toBeNull();
    expect(aviso.textContent).toMatch(/Arquivo importado/);
    expect(aviso.textContent).toMatch(/XYZ1234 não pertence ao currículo/);
    expect(caixa('ECV2101').checked).toBe(true);
    expect(caixa('ECV2401').checked).toBe(false);

    await u.click(within(aviso).getByRole('button', { name: 'Fechar aviso' }));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('arquivo inválido mostra o erro e mantém os dados atuais', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(caixa('ECV2101'));
    await u.upload(screen.getByLabelText('Importar'), arquivo('{"formato":"outro"}'));
    const erro = await screen.findByRole('alert');
    expect(erro.textContent).toMatch(/Formato desconhecido/);
    expect(caixa('ECV2101').checked).toBe(true);

    await u.upload(screen.getByLabelText('Importar'), arquivo('isto não é json'));
    expect((await screen.findByRole('alert')).textContent).toMatch(/JSON válido/);
    expect(caixa('ECV2101').checked).toBe(true);
  });

  it('Exportar baixa curriculo-ecv-AAAA-MM-DD.json', async () => {
    const u = userEvent.setup();
    const criar = vi.fn(() => 'blob:falso');
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: criar, revokeObjectURL: vi.fn() }));
    const nomes: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      nomes.push(this.download);
    });
    render(<App />);
    await u.click(caixa('ECV2101'));
    await u.click(screen.getByRole('button', { name: 'Exportar (.json)' }));
    expect(nomes).toHaveLength(1);
    expect(nomes[0]).toMatch(/^curriculo-ecv-\d{4}-\d{2}-\d{2}\.json$/);
    const blob = (criar.mock.calls[0] as unknown as [Blob])[0];
    expect(blob.type).toBe('application/json');
  });

  it('nomeArquivo usa a data local', () => {
    expect(nomeArquivo(new Date(2026, 0, 5))).toBe('curriculo-ecv-2026-01-05.json');
  });

  it('com dados no navegador, importar pede confirmação; cancelar mantém tudo (B-03)', async () => {
    const u = userEvent.setup();
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<App />);
    await u.click(caixa('ECV2401'));
    const texto = serializar(registroCom({ status: { ECV2101: 'aprovada' } }));
    await u.upload(screen.getByLabelText('Importar'), arquivo(texto));
    expect(await screen.findByText(/Importação cancelada/)).toBeTruthy();
    expect(confirmar).toHaveBeenCalledTimes(1);
    expect(String(confirmar.mock.calls[0][0])).toMatch(/SUBSTITUIR os dados deste navegador \(\d+ disciplinas marcadas\)/);
    expect(caixa('ECV2401').checked).toBe(true);
    expect(caixa('ECV2101').checked).toBe(false); // nada do arquivo foi aplicado
  });

  it('sem dados no navegador, importar não pergunta nada', async () => {
    const u = userEvent.setup();
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<App />);
    await u.upload(screen.getByLabelText('Importar'), arquivo(serializar(registroCom({ status: { ECV2101: 'aprovada' } }))));
    expect(await screen.findByText(/Arquivo importado/)).toBeTruthy();
    expect(confirmar).not.toHaveBeenCalled();
    expect(caixa('ECV2101').checked).toBe(true);
  });
});

describe('duas abas, armazenamento recusado e salvar ao esconder (achados B-02, B-07 e B-13)', () => {
  /** Simula a OUTRA aba gravando: o navegador dispara `storage` só nas demais. */
  function outraAbaGrava(texto: string) {
    localStorage.setItem(CHAVE_LOCAL_STORAGE, texto);
    window.dispatchEvent(new StorageEvent('storage', { key: CHAVE_LOCAL_STORAGE, newValue: texto }));
  }

  it('quando outra aba grava, esta adota os dados mais novos e avisa (não sobrescreve em silêncio)', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(caixa('ECV2101'));
    await act(async () => outraAbaGrava(serializar(registroCom({ status: { FSC5101: 'aprovada' } }))));
    expect(screen.getByText('Os dados foram atualizados em outra aba deste navegador.')).toBeTruthy();
    expect(caixa('FSC5101').checked).toBe(true);
    expect(caixa('ECV2101').checked).toBe(false);
  });

  it('os dados vindos da outra aba não são regravados (sem ping-pong entre as abas)', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(caixa('ECV2101'));
    const gravar = vi.spyOn(localStorage, 'setItem');
    await act(async () => outraAbaGrava(serializar(registroCom({ status: { FSC5101: 'aprovada' } }))));
    const aposTroca = gravar.mock.calls.length; // 1 = a gravação da própria "outra aba" no teste
    await new Promise((r) => setTimeout(r, 450));
    expect(gravar.mock.calls.length).toBe(aposTroca);
  });

  it('"Desfazer" mantém os dados desta aba', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(caixa('ECV2101'));
    await act(async () => outraAbaGrava(serializar(registroCom({ status: { FSC5101: 'aprovada' } }))));
    await u.click(screen.getByRole('button', { name: 'Desfazer' }));
    expect(caixa('ECV2101').checked).toBe(true);
    expect(caixa('FSC5101').checked).toBe(false);
  });

  it('apagar o armazenamento em outra aba (valor nulo) não apaga o que está na tela', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(caixa('ECV2101'));
    await act(async () => void window.dispatchEvent(new StorageEvent('storage', { key: CHAVE_LOCAL_STORAGE, newValue: null })));
    expect(caixa('ECV2101').checked).toBe(true);
  });

  it('se o navegador recusa a gravação, o aluno é avisado e pode exportar', async () => {
    const u = userEvent.setup();
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('cheio', 'QuotaExceededError');
    });
    render(<App />);
    expect(screen.queryByText(/Não foi possível salvar neste navegador/)).toBeNull();
    await u.click(caixa('ECV2101'));
    expect(await screen.findByText(/Não foi possível salvar neste navegador/)).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toMatch(/Exportar \(\.json\)/);
  });

  it('ao esconder a aba (celular), salva na hora, sem esperar os 300 ms', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(caixa('ECV2101'));
    expect(localStorage.getItem(CHAVE_LOCAL_STORAGE)).toBeNull();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(localStorage.getItem(CHAVE_LOCAL_STORAGE)).toContain('ECV2101');
  });
});
