import { tests as gastos } from './gastos.suite.js';
import { tests as refinanciarRepositorio } from './refinanciar-repositorio.test.js';
import { tests as refinanciarMenu } from './refinanciar-menu.test.js';
import { tests as refinanciarCampos } from './refinanciar-campos.test.js';

export const tests = [...gastos, ...refinanciarRepositorio, ...refinanciarMenu, ...refinanciarCampos];
