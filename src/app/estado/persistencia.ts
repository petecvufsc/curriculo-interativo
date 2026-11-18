import { useEffect, useRef } from 'react';
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

function gravar(registro: RegistroAluno): void {
  try {
    window.localStorage.setItem(CHAVE_LOCAL_STORAGE, textoDoRegistro(registro));
  } catch {
    // Cota cheia ou armazenamento indisponível: ignora.
  }
}

/** Salva o registro a cada mudança (com atraso de 300 ms); ao fechar a página ou desmontar, salva na hora. */
export function usePersistencia(registro: RegistroAluno): void {
  const salvo = useRef(registro);
  const atual = useRef(registro);
  atual.current = registro;

  useEffect(() => {
    if (registro === salvo.current) return;
    const t = setTimeout(() => {
      gravar(registro);
      salvo.current = registro;
    }, ATRASO_MS);
    return () => clearTimeout(t);
  }, [registro]);

  useEffect(() => {
    const salvarAgora = () => {
      if (atual.current === salvo.current) return;
      gravar(atual.current);
      salvo.current = atual.current;
    };
    window.addEventListener('pagehide', salvarAgora);
    return () => {
      window.removeEventListener('pagehide', salvarAgora);
      salvarAgora();
    };
  }, []);
}
