// Lee y guarda las listas opcionales de una copia de seguridad.
export function leerLista(data, clave) {
    return data[clave] || data.data?.[clave] || [];
}

export async function importarLista(items, agregar) {
    let importados = 0;
    let errores = 0;
    for (const item of items) {
        try {
            await agregar(item);
            importados++;
        } catch (error) {
            console.error('Error al importar:', item, error);
            errores++;
        }
    }
    return { importados, errores };
}
