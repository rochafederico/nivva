import { tests as repositorio } from './gastos-repositorio.test.js';
import { tests as resumen } from './gastos-resumen.test.js';
import { tests as copia } from './gastos-copia.test.js';
import { tests as form } from './gasto-form.test.js';
import { tests as modal } from './gasto-modal.test.js';

export const tests = [...repositorio, ...resumen, ...copia, ...form, ...modal];
