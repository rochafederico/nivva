import '../../../shared/components/UiModal.js';
import '../../../shared/components/AppButton.js';
import '../../../shared/components/AppSpinner.js';
import { databaseNeedsCuotaMigration, migrateCuotasInDatabase } from '../../../shared/database/cuotaCompatibility.js';

export class CuotaMigrationModal extends HTMLElement {
    constructor() {
        super();
        this._resolve = null;
    }

    connectedCallback() {
        if (!this._rendered) this.render();
        this._modal = this.querySelector('ui-modal');
        this._body = this.querySelector('[data-migration-body]');
        this._actions = this.querySelector('[data-migration-actions]');
        this._status = this.querySelector('[data-migration-status]');
        this.querySelector('[data-action="migrate"]')?.addEventListener('click', () => this.#runMigration());
    }

    open() {
        this._modal = this._modal || this.querySelector('ui-modal');
        this._modal.setTitle('Actualización requerida');
        this._modal.querySelector('.btn-close')?.classList.add('d-none');
        this._modal.open();
        return new Promise((resolve) => {
            this._resolve = resolve;
        });
    }

    async #runMigration() {
        this._actions.classList.add('d-none');
        this._status.innerHTML = '<app-spinner label="Actualizando tus datos..."></app-spinner>';
        try {
            const result = await migrateCuotasInDatabase(window.db);
            this._status.innerHTML = `
                <div class="alert alert-success py-2 mb-0" role="status">
                    ✅ Datos actualizados. Migramos ${result.migratedCuotas} cuotas y ${result.migratedIngresos} ingresos al formato nuevo.
                </div>
            `;
            window.dispatchEvent(new CustomEvent('app:notify', {
                detail: { message: '✅ Datos actualizados a la nueva versión.', type: 'success' }
            }));
            setTimeout(() => {
                this._modal.close();
                this._resolve?.(result);
            }, 300);
        } catch (error) {
            console.error('Error migrando datos a cuotas:', error);
            this._status.innerHTML = `
                <div class="alert alert-danger py-2 mb-0" role="alert">
                    ❌ No pudimos actualizar tus datos. Intentá de nuevo para poder usar esta versión.
                </div>
            `;
            this._actions.classList.remove('d-none');
        }
    }

    render() {
        this._rendered = true;
        this.innerHTML = `
            <ui-modal>
                <div class="p-3 d-grid gap-3" data-migration-body>
                    <div class="alert alert-warning mb-0" role="alert">
                        <p class="fw-semibold mb-2">Necesitamos actualizar tus datos locales.</p>
                        <p class="mb-0 small">
                            Nivva ahora usa “cuotas” como término principal. Para usar esta nueva versión,
                            vamos a convertir tus datos guardados con el formato anterior al formato nuevo.
                            La información queda en este dispositivo y no se borra.
                        </p>
                    </div>
                    <div class="small text-body-secondary">
                        Esta acción es requerida y se ejecuta una sola vez.
                    </div>
                    <div class="d-flex justify-content-end gap-2" data-migration-actions>
                        <app-button variant="success" data-action="migrate">Actualizar datos</app-button>
                    </div>
                    <div data-migration-status></div>
                </div>
            </ui-modal>
        `;
    }
}

customElements.define('cuota-migration-modal', CuotaMigrationModal);

export async function promptCuotaMigrationIfNeeded(db) {
    if (!await databaseNeedsCuotaMigration(db)) return null;
    const modal = document.createElement('cuota-migration-modal');
    document.body.appendChild(modal);
    const result = await modal.open();
    setTimeout(() => modal.remove(), 500);
    return result;
}
