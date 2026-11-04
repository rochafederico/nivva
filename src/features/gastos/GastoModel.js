// src/features/gastos/GastoModel.js
export class GastoModel {
    constructor({ id, descripcion, monto, moneda = 'ARS', fecha } = {}) {
        this.id = id;
        this.descripcion = descripcion || '';
        this.monto = Number(monto) || 0;
        this.moneda = moneda || 'ARS';
        this.fecha = fecha;
        this.periodo = fecha ? fecha.slice(0, 7) : '';
    }
}
