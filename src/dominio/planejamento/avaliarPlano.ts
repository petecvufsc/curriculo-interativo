// Avaliação do plano de semestres (docs/regras-de-negocio.md §11).
import { disciplinaDe, type RegistroAluno } from '../aluno';
import type { Motor } from '../regras';
import { aulasNoLimite } from './aulasNoLimite';
import { baseDoSemestre } from './baseSemestre';
import type { AvaliacaoPlano, AvisoSemestre, ItemPlano, ProblemaItem, SemestreAvaliado } from './tipos';

/** Problemas de `codigo` no semestre cuja base é `base`; `vistos` = códigos já listados antes no plano (§11). */
function problemasDe(motor: Motor, codigo: string, base: Set<string>, vistos: Set<string>): ProblemaItem[] {
  if (!disciplinaDe(motor, codigo)) return [{ tipo: 'fora-do-curriculo' }];
  const problemas: ProblemaItem[] = [];
  const repetida = vistos.has(codigo);
  if (repetida) problemas.push({ tipo: 'repetida' });
  if (motor.cumprida(codigo, base)) {
    // Uma ocorrência repetida já é explicada por 'repetida' (a primeira está na base).
    if (!repetida) problemas.push({ tipo: 'ja-cumprida' });
    return problemas;
  }
  const situacao = motor.situacao(codigo, base);
  if (situacao.tipo === 'bloqueada') problemas.push({ tipo: 'requisito', faltantes: situacao.faltantes });
  return problemas;
}

/** Avisos de carga (§11): só para semestre com ao menos uma disciplina do currículo. */
function avisosDe(motor: Motor, totalAulas: number, quantidade: number, temForaDoLimite: boolean): AvisoSemestre[] {
  const limites = motor.curriculo.integralizacao?.aulasSemanais;
  if (!limites || quantidade === 0) return [];
  const avisos: AvisoSemestre[] = [];
  if (totalAulas > limites.max) avisos.push({ tipo: 'acima-maximo', limite: limites.max });
  // Semestre com estágio: o que sobra (ex.: só o TCC II) é carga leve por natureza; não avisa o mínimo.
  if (totalAulas < limites.min && !temForaDoLimite) avisos.push({ tipo: 'abaixo-minimo', limite: limites.min });
  return avisos;
}

/**
 * Avalia o plano do registro (§11). Para cada semestre `k`, confere cada disciplina contra `base(k)`:
 * fora do currículo, repetida, já cumprida ou requisito não atendido (com o que falta, §4). Soma
 * `aulasSemanais` (menos as `foraDoLimiteDeAulas`, o estágio) e `horasAula` das disciplinas do currículo e avisa acima/abaixo dos limites de
 * `integralizacao.aulasSemanais` (só em semestre não vazio). Correquisitos não são verificados (§11).
 * `progressoProjetado` = `motor.progresso` de `base ∪ todo o plano` (§8).
 *
 * AMBIGUIDADE: §11 diz "aparece em mais de um semestre" sem apontar a ocorrência errada. Leitura
 * conservadora: a primeira ocorrência (ordem de semestre e posição) é avaliada normalmente e as
 * seguintes recebem 'repetida'. Uma disciplina cumprida não recebe 'requisito' (os requisitos
 * deixam de importar), e 'ja-cumprida' não se soma a 'repetida'.
 */
export function avaliarPlano(motor: Motor, registro: RegistroAluno): AvaliacaoPlano {
  const vistos = new Set<string>();
  const semestres: SemestreAvaliado[] = registro.plano.semestres.map((semestre, i) => {
    const base = baseDoSemestre(motor, registro, i + 1);
    const itens: ItemPlano[] = [];
    let totalAulas = 0;
    let totalHorasAula = 0;
    let quantidade = 0;
    let temForaDoLimite = false;
    for (const codigo of semestre.codigos) {
      itens.push({ codigo, problemas: problemasDe(motor, codigo, base, vistos) });
      vistos.add(codigo);
      const d = disciplinaDe(motor, codigo);
      if (!d) continue;
      quantidade++;
      totalAulas += aulasNoLimite(d);
      if (d.foraDoLimiteDeAulas) temForaDoLimite = true;
      totalHorasAula += d.horasAula;
    }
    return { numero: i + 1, itens, totalAulas, totalHorasAula, avisos: avisosDe(motor, totalAulas, quantidade, temForaDoLimite) };
  });
  const tudo = baseDoSemestre(motor, registro, registro.plano.semestres.length + 1);
  return { semestres, progressoProjetado: motor.progresso(tudo) };
}
