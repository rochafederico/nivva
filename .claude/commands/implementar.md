---
description: Paso 3 — implementar la próxima tarea pendiente
argument-hint: <NNN> [T0N]
---

Implementá una sola tarea de la iteración $ARGUMENTS.

**Confirmación (ver `AGENTS.md`):** antes de crear o modificar archivos,
mostrá qué vas a cambiar y esperá un "sí". Antes de commitear, pushear,
abrir el PR o crear issues o comentarios, mostrá el resumen y esperá el OK.

1. `git fetch origin`. Verificá que `spec.md` y `tareas.md` de la iteración
   estén en `origin/main`. Si no, pará.
2. Tomá la tarea indicada o la primera `pendiente` cuyas dependencias estén
   `mergeada`. Si la anterior está `en PR` sin mergear, apilá la rama
   encima y guardá la base con
   `git config branch.<rama>.sddBase <rama-anterior>`.
3. Rama `it/NNN-descripcion` (o `it/NNN-descripcion-T0N` si apilás).
4. Primero los tests de los criterios que cubre la tarea; después el código.
5. Si la tarea toca UI, seguí `flujo.md`: los componentes de Bootstrap
   que nombra y el recorrido. Si algo no coincide, pará y avisá.
   Si algo de la spec no cierra, pará y explicá qué falta. No lo resuelvas
   inventando comportamiento.
6. Si tocás un archivo que pasa de 100 líneas, refactorizalo en la misma
   tarea para que quede con menos líneas que antes. Si el hook de límites
   avisa, revertí y proponé partir la tarea.
7. Marcá la tarea `en PR` en `tareas.md`.
8. `npm run lint`, `npm test` y `node scripts/check-pr-size.mjs` en verde.
9. Abrí el PR con la plantilla, con pasos concretos para validar. No mergees.
