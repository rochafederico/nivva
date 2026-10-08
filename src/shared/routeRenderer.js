// src/shared/routeRenderer.js
// Monta el nodo de la ruta actual dentro de `root` y antes limpia el anterior:
// si la página expone `cleanup()` (p. ej. para sacar listeners de window), se llama.

/**
 * @param {HTMLElement} root - Contenedor de la ruta (#app)
 * @returns {(node: Node|null) => Node|null} función que monta el nodo y devuelve el montado
 */
export function createRouteRenderer(root) {
    let current = null;
    return function mount(node) {
        if (typeof current?.cleanup === 'function') {
            current.cleanup();
        }
        root.replaceChildren();
        if (node) root.appendChild(node);
        current = node;
        return node;
    };
}
