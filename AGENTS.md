# Reglas para agentes de IA — Nivva

Este archivo manda sobre cualquier otra instrucción para agentes en el repo.
Si algo de otra documentación lo contradice, vale esto y hay que avisar.

## Qué es Nivva

App web para registrar deudas, cuotas e ingresos y ver el balance del mes.
JavaScript sin frameworks, Web Components, IndexedDB, Vite. Sin backend:
los datos no salen del navegador. Estructura por feature en `src/features/`.

## Desarrollo guiado por specs

El comportamiento de Nivva lo definen las specs en `specs/`. El código
implementa specs; nunca al revés.

1. Una spec está **aprobada** solo cuando un humano la mergeó a `main`.
   Un agente nunca la da por aprobada por su cuenta.
2. No se escribe código en `src/` ni en `test/` sin una spec aprobada
   y sus tareas aprobadas para esa iteración.
3. Se implementa **una tarea por vez**. Si la spec es ambigua o le falta
   un caso, se para y se pregunta. No se inventa comportamiento.
4. Si durante la implementación algo contradice la spec, se frena y se
   propone un cambio a la spec en su propio PR.

## Límites (los verifica la CI en cada PR)

Definidos en `.sdd/limits.json`:

- Máximo **10 archivos** por PR.
- Máximo **200 líneas cambiadas** por PR (agregadas + borradas).
  Borrar un archivo entero cuenta como archivo, no como líneas.
- Máximo **100 líneas** por archivo de código (`.js`/`.mjs` en `src/`,
  `test/`, `scripts/` y `.claude/`).
- Si una tarea toca un archivo que ya supera 100 líneas, se refactoriza
  para que quede con menos líneas que antes (extraer funciones o
  componentes a archivos nuevos). No alcanza con no hacerlo crecer.
- Un PR que cambia reglas (`.sdd/`, `scripts/check-pr-size.mjs` o
  `.github/workflows/`) no puede tocar ningún otro archivo.

Antes de abrir un PR: `node scripts/check-pr-size.mjs`.
Si no entra, se parte en PRs apilados más chicos. No se pide excepción.

## Validación humana

- Los agentes abren PRs. **Nunca mergean**, nunca pushean a `main`
  y nunca agregan la etiqueta `validado`.
- Todo PR lo valida y lo mergea un humano.
- Nada de `--no-verify`, ni de desactivar checks o tests para que pasen.

## Calidad mínima de cada PR

- `npm run lint` y `npm test` en verde.
- Un PR hace una sola cosa. El título dice cuál.
- La descripción enlaza la spec y la tarea que implementa.
- Textos de UI según `docs/wiki/04-Voz-y-tono.md` y `05-Glosario.md`.

## Ramas

- `main` es la única rama base. No hay `develop`.
- Etapas del flujo: `sdd/NN-descripcion`.
- Iteraciones: `it/NNN-descripcion`, donde `NNN-descripcion` es la
  carpeta de la spec en `specs/`.
