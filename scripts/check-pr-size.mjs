// Verifica los límites de tamaño definidos en .sdd/limits.json.
// Compara el árbol de trabajo (incluye cambios sin commitear y archivos nuevos)
// contra el punto donde la rama se separó de la base.
// Uso: SDD_BASE=origin/main node scripts/check-pr-size.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const limites = JSON.parse(readFileSync('.sdd/limits.json', 'utf8'));
const esCodigo = new RegExp(limites.archivosDeCodigo);
const ignorados = limites.ignorados.map((p) => new RegExp(p));
const esIgnorado = (f) => ignorados.some((re) => re.test(f));

const base = process.env.SDD_BASE || 'origin/main';
const mergeBase = git('merge-base', base, 'HEAD');

function contarLineas(texto) {
  if (!texto) return 0;
  return texto.split('\n').length - (texto.endsWith('\n') ? 1 : 0);
}

function lineasEnBase(archivo) {
  try {
    return contarLineas(git('show', `${mergeBase}:${archivo}`) + '\n');
  } catch {
    return null; // el archivo no existía en la base
  }
}

const cambios = new Map(); // archivo -> { lineas, borrado }
for (const fila of git('diff', '--no-renames', '--numstat', mergeBase).split('\n')) {
  if (!fila) continue;
  const [agregadas, borradas, archivo] = fila.split('\t');
  const binario = agregadas === '-';
  cambios.set(archivo, { lineas: binario ? 0 : +agregadas + +borradas, borrado: false });
}
for (const fila of git('diff', '--no-renames', '--name-status', '--diff-filter=D', mergeBase).split('\n')) {
  if (!fila) continue;
  cambios.get(fila.split('\t')[1]).borrado = true;
}
for (const archivo of git('ls-files', '--others', '--exclude-standard').split('\n')) {
  if (!archivo) continue;
  cambios.set(archivo, { lineas: contarLineas(readFileSync(archivo, 'utf8')), borrado: false });
}

const errores = [];
let totalArchivos = 0;
let totalLineas = 0;

for (const [archivo, { lineas, borrado }] of cambios) {
  if (esIgnorado(archivo)) continue;
  totalArchivos += 1;
  if (!borrado) totalLineas += lineas; // borrar un archivo entero no suma líneas

  if (borrado || !esCodigo.test(archivo) || !existsSync(archivo)) continue;
  const actuales = contarLineas(readFileSync(archivo, 'utf8'));
  const max = limites.maxLineasPorArchivoDeCodigo;
  if (actuales <= max) continue;
  const previas = lineasEnBase(archivo);
  if (previas === null) {
    errores.push(`${archivo}: archivo nuevo con ${actuales} líneas (máximo ${max}).`);
  } else if (actuales > previas) {
    errores.push(`${archivo}: ya excedía ${max} líneas y creció de ${previas} a ${actuales}. Solo puede achicarse.`);
  }
}

// Los cambios a las reglas van en un PR solo, para que nunca queden escondidos.
// No aplica al PR que crea las reglas (la base todavía no tiene limits.json).
const esRegla = (f) => /^(\.sdd\/|scripts\/check-pr-size\.mjs$|\.github\/workflows\/)/.test(f);
const reglas = [...cambios.keys()].filter(esRegla);
if (reglas.length && lineasEnBase('.sdd/limits.json') !== null) {
  console.log(`⚠ Este PR cambia reglas: ${reglas.join(', ')}`);
  const otros = [...cambios.keys()].filter((f) => !esRegla(f) && !esIgnorado(f));
  if (otros.length) {
    errores.push(`Cambia reglas y además otros archivos (${otros.join(', ')}). Las reglas van en un PR solo.`);
  }
}

if (totalArchivos > limites.maxArchivosPorPR) {
  errores.push(`El cambio toca ${totalArchivos} archivos (máximo ${limites.maxArchivosPorPR}).`);
}
if (totalLineas > limites.maxLineasCambiadasPorPR) {
  errores.push(`El cambio suma ${totalLineas} líneas (máximo ${limites.maxLineasCambiadasPorPR}).`);
}

console.log(`Base: ${base} · ${totalArchivos} archivos · ${totalLineas} líneas cambiadas`);
if (errores.length) {
  console.error('\nLímites excedidos. Partí el cambio en PRs más chicos:\n');
  for (const e of errores) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log('✓ Dentro de los límites.');
