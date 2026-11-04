let siguiente = 0;

export function uiModalPlantilla() {
    siguiente += 1;
    const tituloId = `modal-title-${siguiente}`;
    return `
        <div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="${tituloId}" aria-modal="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="${tituloId}"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body"></div>
                </div>
            </div>
        </div>
        `;
}
