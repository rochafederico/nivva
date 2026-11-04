// Devuelve localStorage si se puede escribir; null si no (ej. Safari privado).
export function localStorageDisponible() {
    try {
        const ls = globalThis.localStorage;
        if (!ls) return null;
        ls.setItem('__nivva_chk', '1');
        ls.removeItem('__nivva_chk');
        return ls;
    } catch {
        return null;
    }
}
