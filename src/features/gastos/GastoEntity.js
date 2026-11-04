// src/features/gastos/GastoEntity.js
export class GastoEntity {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {string} params.descripcion
     * @param {number} params.monto
     * @param {string} params.moneda
     * @param {string} params.fecha  // yyyy-mm-dd
     */
    constructor({ id, descripcion, monto, moneda, fecha } = {}) {
        if (id != null) this.id = id; // sin id, lo genera el almacén
        this.descripcion = descripcion || '';
        this.monto = monto;
        this.moneda = moneda || 'ARS';
        this.fecha = fecha;
        this.periodo = fecha ? fecha.slice(0, 7) : '';
    }
}
