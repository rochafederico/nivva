// src/models/IngresoModel.js
export class IngresoModel {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {string} params.fecha  // ISO date yyyy-mm-dd
     * @param {string} params.descripcion
     * @param {number} params.cuota
     * @param {string} params.moneda
     * @param {string} [params.periodo] // yyyy-mm
     */
    constructor({ id, fecha, descripcion, cuota, moneda = 'ARS', periodo } = {}) {
        this.id = id;
        this.fecha = fecha;
        this.descripcion = descripcion || '';
        this.cuota = Number(cuota) || 0;
        this.moneda = moneda || 'ARS';
        this.periodo = periodo || (fecha ? fecha.slice(0, 7) : '');
    }
}
