---
description: Paso 2 — plan técnico y tareas de una spec aprobada
argument-hint: <NNN>
---

Prepará el plan y las tareas de la iteración $ARGUMENTS.

1. `git fetch origin`. Verificá que `specs/$ARGUMENTS-*/spec.md` exista en
   `origin/main`. Si no está, pará: la spec no está aprobada.
2. Si la spec tiene preguntas abiertas, pará y pedí que se resuelvan
   primero con un PR a la spec.
3. Leé la spec, la constitución, `docs/sdd/learnings.md` y el código que
   vas a tocar. Medí las líneas actuales de cada archivo con `wc -l`.
4. Rama `it/NNN-descripcion-plan` desde `origin/main`.
5. Completá `plan.md` y `tareas.md` desde `docs/sdd/plantillas/`.
   - Cada tarea entra en un PR: 10 archivos, 200 líneas, archivos de
     código de 100 líneas o menos.
   - Si hay que tocar un archivo que ya pasa de 100 líneas, la primera
     tarea lo achica o extrae la parte que se va a cambiar.
   - Cada criterio de aceptación queda cubierto por al menos una tarea.
   - Máximo 8 tareas.
6. Cambiá el estado de la spec a `aprobada` en el mismo PR.
7. Corré `node scripts/check-pr-size.mjs` y abrí el PR. No lo mergees.

Terminá diciendo que, cuando mergee, el siguiente paso es `/implementar NNN`.
