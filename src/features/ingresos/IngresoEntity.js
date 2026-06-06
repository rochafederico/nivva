// src/entity/IngresoEntity.js
export class IngresoEntity {
    /**
     * @param {Object} params
     * @param {string} params.fecha
     * @param {string} params.descripcion
     * @param {number} params.cuota
     * @param {string} params.moneda
     * @param {string} [params.periodo]
     */
    constructor({ fecha, descripcion, cuota, moneda, periodo } = {}) {
        this.fecha = fecha;
        this.descripcion = descripcion || '';
        this.cuota = cuota;
        this.moneda = moneda || 'ARS';
        this.periodo = periodo || (fecha ? fecha.slice(0, 7) : '');
    }
}
