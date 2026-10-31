// PreToolUse (Edit|Write|MultiEdit): solo se toca código con spec y tareas aprobadas.
// Aprobada = mergeada en origin/main. La rama debe ser it/NNN-descripcion.
import { leerEntrada, git, ramaActual, rutaRelativa, bloquear } from './comun.mjs';

const entrada = leerEntrada();
const archivo = rutaRelativa(entrada.tool_input?.file_path);

if (!/^(src|test)\//.test(archivo)) process.exit(0);

const rama = ramaActual();
const iteracion = rama.match(/^it\/(\d{3}-[a-z0-9-]+)$/)?.[1];

if (rama === 'main') {
  bloquear('No se edita código en main. Creá la rama it/NNN-descripcion de la iteración.');
}
if (!iteracion) {
  bloquear(
    `La rama "${rama}" no es de iteración. El código solo se toca en ramas ` +
      'it/NNN-descripcion con una spec aprobada.',
  );
}

const enMain = (ruta) => git('cat-file', '-e', `origin/main:${ruta}`) !== null;
const carpeta = `specs/${iteracion}`;

if (!enMain(`${carpeta}/spec.md`)) {
  bloquear(
    `La spec ${carpeta}/spec.md no está mergeada en main. ` +
      'Hacé git fetch; si sigue sin estar, falta que un humano la apruebe.',
  );
}
if (!enMain(`${carpeta}/tareas.md`)) {
  bloquear(`Las tareas de ${carpeta} no están mergeadas en main. Primero /plan y /tareas.`);
}

process.exit(0);
