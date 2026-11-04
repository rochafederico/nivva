import { tests as gastos } from './gastos.suite.js';
import { tests as refinanciarRepositorio } from './refinanciar-repositorio.test.js';

export const tests = [...gastos, ...refinanciarRepositorio];
