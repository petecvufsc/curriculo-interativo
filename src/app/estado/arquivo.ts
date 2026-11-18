import { importar, type RegistroAluno } from '../../dominio/aluno';
import { curriculo } from './motorEcv';
import { textoDoRegistro } from './persistencia';

export interface Aviso {
  tipo: 'sucesso' | 'erro';
  titulo: string;
  linhas: string[];
}

export function nomeArquivo(data: Date = new Date()): string {
  const dois = (n: number) => String(n).padStart(2, '0');
  return `curriculo-ecv-${data.getFullYear()}-${dois(data.getMonth() + 1)}-${dois(data.getDate())}.json`;
}

/** Baixa o registro como arquivo .json (Blob + a[download]). */
export function baixarRegistro(registro: RegistroAluno): void {
  const url = URL.createObjectURL(new Blob([textoDoRegistro(registro)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo();
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function lerTexto(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(String(leitor.result));
    leitor.onerror = () => reject(leitor.error);
    leitor.readAsText(arquivo);
  });
}

/** Lê e valida um arquivo escolhido pelo usuário; devolve o novo registro (se válido) e o aviso a exibir. */
export async function lerArquivoImportado(arquivo: File): Promise<{ registro: RegistroAluno | null; aviso: Aviso }> {
  try {
    const r = importar(await lerTexto(arquivo), curriculo);
    if (!r.ok) {
      return { registro: null, aviso: { tipo: 'erro', titulo: 'Não foi possível importar o arquivo.', linhas: [r.erro, 'Seus dados atuais foram mantidos.'] } };
    }
    return { registro: r.registro, aviso: { tipo: 'sucesso', titulo: 'Arquivo importado.', linhas: r.relatorio } };
  } catch {
    return { registro: null, aviso: { tipo: 'erro', titulo: 'Não foi possível ler o arquivo.', linhas: ['Seus dados atuais foram mantidos.'] } };
  }
}
