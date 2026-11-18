import { useEffect, useRef, useState } from 'react';
import { CHAVE_LOCAL_STORAGE, carregar, serializar, type RegistroAluno } from '../../dominio/aluno';
import { curriculo } from './motorEcv';

const ATRASO_MS = 300;

/** Registro salvo neste navegador; sem `localStorage` (modo privado, bloqueado) ou com dado inválido, registro vazio. */
export function lerRegistroSalvo(): RegistroAluno {
  let texto: string | null = null;
  try {
    texto = window.localStorage.getItem(CHAVE_LOCAL_STORAGE);
  } catch {
    // Sem armazenamento: o app funciona, só não lembra dos dados.
  }
  return carregar(texto, curriculo);
}

/** Texto do registro carimbado com o instante atual (usado ao salvar e ao exportar). */
export function textoDoRegistro(registro: RegistroAluno): string {
  return serializar({ ...registro, atualizadoEm: new Date().toISOString() });
}

/** Grava o registro; devolve `false` se o navegador recusou (cota cheia, modo privado, armazenamento bloqueado). */
function gravar(registro: RegistroAluno): boolean {
  try {
    window.localStorage.setItem(CHAVE_LOCAL_STORAGE, textoDoRegistro(registro));
    return true;
  } catch {
    return false;
  }
}

/**
 * Salva o registro a cada mudança (com atraso de 300 ms); ao fechar a página, ao esconder a aba (celular) ou ao
 * desmontar, salva na hora. Devolve `naoSalvou` quando o navegador recusa a gravação, para a tela avisar.
 *
 * Duas abas: quando OUTRA aba grava, o navegador avisa (evento `storage`); então este registro é trocado pelo mais novo
 * (`aoMudarEmOutraAba`) em vez de sobrescrevê-lo em silêncio. O registro vindo da outra aba conta como já salvo,
 * para as duas abas não ficarem regravando uma a outra.
 */
export function usePersistencia(registro: RegistroAluno, aoMudarEmOutraAba: (novo: RegistroAluno) => void): { naoSalvou: boolean } {
  const salvo = useRef(registro);
  const atual = useRef(registro);
  atual.current = registro;
  const aviso = useRef(aoMudarEmOutraAba);
  aviso.current = aoMudarEmOutraAba;
  const [naoSalvou, setNaoSalvou] = useState(false);

  useEffect(() => {
    if (registro === salvo.current) return;
    const t = setTimeout(() => {
      const ok = gravar(registro);
      setNaoSalvou(!ok);
      if (ok) salvo.current = registro;
    }, ATRASO_MS);
    return () => clearTimeout(t);
  }, [registro]);

  useEffect(() => {
    const salvarAgora = () => {
      if (atual.current === salvo.current) return;
      if (gravar(atual.current)) salvo.current = atual.current;
    };
    const aoEsconder = () => {
      if (document.visibilityState === 'hidden') salvarAgora();
    };
    const aoMudarArmazenamento = (ev: StorageEvent) => {
      // Só a nossa chave, e só quando há conteúdo (apagar o armazenamento em outra aba não apaga o que está na tela)
      if (ev.key !== CHAVE_LOCAL_STORAGE || ev.newValue === null) return;
      const novo = carregar(ev.newValue, curriculo);
      salvo.current = novo; // já está salvo: não regravar
      aviso.current(novo);
    };
    window.addEventListener('pagehide', salvarAgora);
    document.addEventListener('visibilitychange', aoEsconder);
    window.addEventListener('storage', aoMudarArmazenamento);
    return () => {
      window.removeEventListener('pagehide', salvarAgora);
      document.removeEventListener('visibilitychange', aoEsconder);
      window.removeEventListener('storage', aoMudarArmazenamento);
      salvarAgora();
    };
  }, []);

  return { naoSalvou };
}
