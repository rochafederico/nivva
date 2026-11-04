import { tests as repositorio } from './gastos-repositorio.test.js';
import { tests as resumen } from './gastos-resumen.test.js';

export const tests = [...repositorio, ...resumen];
