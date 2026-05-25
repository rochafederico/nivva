import { trackEvent } from '../../../shared/observability/index.js';
import { deleteDeuda } from '../deudaRepository.js';

export async function deleteDeudaWithTrackingUseCase(id) {
    const deletedMontos = await deleteDeuda(id);
    trackEvent('delete_debt_completed', {
        flow: 'delete_debt',
        status: 'completed',
        deudaId: id,
        deletedMontos
    });
}
