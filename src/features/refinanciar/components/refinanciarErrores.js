// Validación de la refinanciación: qué le falta a cada campo.
import { fechaValida } from '../../gastos/components/gastoFormErrores.js';
import { leerCuotas } from '../planCuotas.js';

export function refinanciarErrores({ moneda, cuotas, primerVencimiento, adelanto, fechaAdelanto } = {}) {
    const errores = {};
    if (!moneda) errores.moneda = 'Seleccioná una moneda.';
    if (!leerCuotas(cuotas)) errores.cuotas = 'Escribí de 1 a 120 cuotas mayores a 0, separadas por coma y sin punto de miles.';
    if (!fechaValida(primerVencimiento)) errores.primerVencimiento = 'Ingresá una fecha válida.';
    if (String(adelanto ?? '').trim() !== '') {
        if (!(Number(adelanto) > 0)) errores.adelanto = 'Ingresá un adelanto mayor a 0.';
        if (!fechaValida(fechaAdelanto)) errores.fechaAdelanto = 'Ingresá una fecha válida.';
    }
    return errores;
}
