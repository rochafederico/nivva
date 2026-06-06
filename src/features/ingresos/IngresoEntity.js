// src/entity/IngresoEntity.js
import { getCuotaValue } from '../../shared/database/cuotaCompatibility.js';

export class IngresoEntity {
    /**
     * @param {Object} params
     * @param {string} params.fecha
     * @param {string} params.descripcion
     * @param {number} params.cuota
     * @param {string} params.moneda
     * @param {string} [params.periodo]
     */
    constructor({ fecha, descripcion, cuota, monto, moneda, periodo } = {}) {
        this.fecha = fecha;
        this.descripcion = descripcion || '';
        this.cuota = getCuotaValue({ cuota, monto });
        this.moneda = moneda || 'ARS';
        this.periodo = periodo || (fecha ? fecha.slice(0, 7) : '');
    }
}
