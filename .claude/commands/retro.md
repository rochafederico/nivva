---
description: Paso 4 — cerrar la iteración y registrar aprendizajes
argument-hint: <NNN>
---

Cerrá la iteración $ARGUMENTS.

1. `git fetch origin`. Verificá que todas las tareas estén mergeadas en
   `origin/main`. Si falta alguna, listala y pará.
2. Revisá los PRs de la iteración con `gh pr list --search "NNN" --state merged`
   y sus comentarios de review: ahí están las correcciones del humano.
3. Completá `specs/NNN-descripcion/retro.md` desde la plantilla.
4. Pasá cada aprendizaje a `docs/sdd/learnings.md`:
   - Si ya existe uno equivalente, sumale 1 y agregá la iteración.
   - Si es nuevo, agregalo con `[1]`.
5. Para cada aprendizaje que llegue a `[2]`, proponé en la respuesta a qué
   regla se promueve (constitución, plantilla, `AGENTS.md` o hook). La
   promoción se hace en un PR aparte, no en este.
6. Cambiá el estado de la spec a `implementada`.
7. Corré `node scripts/check-pr-size.mjs` y abrí el PR. No lo mergees.
