// Fachada do motor: índice calculado uma vez, funções puras amarradas a ele.
import type { Curriculo } from '../tipos';
import { desmarcar, marcar, marcarFase } from './cascata';
import { cumprida, requisitosAtendidos, situacao } from './cumprimento';
import { dependentes, preRequisitos } from './grafo';
import { criarIndice } from './indice';
import { progresso, simular } from './simulacao';
import type { Motor } from './tiposMotor';

/** Cria o motor para um currículo (o currículo não é modificado nem copiado). */
export function criarMotor(curriculo: Curriculo): Motor {
  const indice = criarIndice(curriculo);
  return {
    curriculo,
    cumprida: (codigo, aprovadas) => cumprida(indice, codigo, aprovadas),
    requisitosAtendidos: (codigo, aprovadas) => requisitosAtendidos(indice, codigo, aprovadas),
    situacao: (codigo, aprovadas) => situacao(indice, codigo, aprovadas),
    preRequisitos: (codigo) => preRequisitos(indice, codigo),
    dependentes: (codigo) => dependentes(indice, codigo),
    marcar: (aprovadas, codigo) => marcar(indice, aprovadas, codigo),
    desmarcar: (aprovadas, codigo) => desmarcar(indice, aprovadas, codigo),
    marcarFase: (aprovadas, fase, valor) => marcarFase(indice, aprovadas, fase, valor),
    simular: (aprovadas) => simular(indice, aprovadas),
    progresso: (aprovadas) => progresso(indice, aprovadas),
  };
}
