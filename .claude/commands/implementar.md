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
   `git config branch.<rama>.sddBase <rama-anterior>`. No apiles sobre una
   tarea que cambia lo que ve la persona hasta que el humano la pruebe: un
   ajuste a la spec obliga a rehacer todas las de arriba. Tampoco apiles
   sobre un PR de ajuste a la spec sin mergear.
3. Rama `it/NNN-descripcion` (o `it/NNN-descripcion-T0N` si apilás).
4. Primero los tests de los criterios que cubre la tarea; después el código.
   Para enviar un formulario con campos numéricos, el test emite `form:submit`
   en su `app-form` con los valores: happy-dom marca `stepMismatch` y el
   envío nativo no pasa (como `refinanciar-form` y `montos`).
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
   Si está apilado, la descripción dice su base y el orden de merge: primero
   la base, después este. Al mergear la base se borra su rama, para que este
   PR pase a apuntar a `main` antes de mergearlo.
10. Antes de pedir `validado`, respondé cada comentario de la revisión
    automática: corregido (con el commit) o por qué no aplica. Lo que no se
    corrige en la tarea va a un issue.
