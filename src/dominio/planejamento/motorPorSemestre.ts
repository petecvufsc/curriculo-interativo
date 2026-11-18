// Regras por semestre do plano: cada semestre pode ter o seu motor (decisão D5: os pré-requisitos mudam em 2028.1).
import type { Motor } from '../regras';

/** Um motor para o plano inteiro, ou uma função que escolhe o motor do semestre `k` (a partir de 1). */
export type MotorDoPlano = Motor | ((k: number) => Motor);

/** Motor que vale no semestre `k` do plano. */
export function motorEm(motor: MotorDoPlano, k: number): Motor {
  return typeof motor === 'function' ? motor(k) : motor;
}
