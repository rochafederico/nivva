---
description: Paso 2 — plan técnico y tareas de una spec aprobada
argument-hint: <NNN>
---

Prepará el plan y las tareas de la iteración $ARGUMENTS.

1. `git fetch origin`. Verificá que `specs/$ARGUMENTS-*/spec.md` exista en
   `origin/main`. Si no está, pará: la spec no está aprobada. Trabajá
   siempre sobre la última versión de `origin/main`: si se mergeó un cambio
   a la spec después de crear tu rama, rebaseá y revisá el plan.
2. Si la spec tiene preguntas abiertas, referencias técnicas o un criterio
   que no se puede implementar o probar, pará y explicá qué falta. Se
   resuelve con un PR a la spec; **este PR nunca cambia el contenido de la
   spec**, solo su campo `estado`.
3. Leé la spec, la constitución, `docs/sdd/learnings.md` y el código que
   vas a tocar. Medí las líneas actuales de cada archivo con `wc -l`.
4. Rama `it/NNN-descripcion-plan` desde `origin/main`.
5. Completá `plan.md` y `tareas.md` desde `docs/sdd/plantillas/`.
   - Cada tarea entra en un PR: 10 archivos, 200 líneas, archivos de
     código de 100 líneas o menos.
   - Si hay que tocar un archivo que ya pasa de 100 líneas, las primeras
     tareas lo refactorizan: extraen la parte que se va a cambiar a
     archivos nuevos de 100 líneas o menos, sin cambiar comportamiento.
     Cada tarea que toque ese archivo lo deja con menos líneas que antes.
   - Cada criterio de aceptación queda cubierto por al menos una tarea,
     citado con el número que tiene en la spec mergeada.
   - Para cada criterio de accesibilidad, elegí la técnica del W3C (ver
     `docs/sdd/accesibilidad.md`) y anotala en la sección del plan. Acá sí
     van HTML, roles y atributos ARIA.
   - Máximo 8 tareas.
6. Cambiá el estado de la spec a `aprobada` en el mismo PR.
7. Corré `node scripts/check-pr-size.mjs` y abrí el PR. No lo mergees.

Terminá diciendo que, cuando mergee, el siguiente paso es `/implementar NNN`.
