// Después de guardar, la lista se dibuja de nuevo y el botón que abrió la ventana desaparece:
// el foco pasa al control nuevo con el mismo nombre o, si ya no está, al botón +.
const ESPERA_MS = 50;
const INTENTOS = 10;

export function volverAlFoco(opener) {
    const nombre = opener?.getAttribute?.('aria-label');
    let intentos = 0;
    const revisar = () => {
        if (opener?.isConnected) {
            if (++intentos < INTENTOS) setTimeout(revisar, ESPERA_MS);
            return;
        }
        const igual = [...document.querySelectorAll('[aria-label]')].find((c) => c.getAttribute('aria-label') === nombre);
        (igual || document.getElementById('add-fab'))?.focus();
    };
    revisar();
}
