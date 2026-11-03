# Aprendizajes

Los escribe `/retro` y los lee `/spec` antes de empezar cada iteración.

Formato: `- [veces] aprendizaje accionable (iteraciones donde apareció)`

Cuando uno llega a **2**, se promueve a regla en la constitución, una
plantilla, `AGENTS.md` o un hook, en un PR propio, y se borra de acá.
Este archivo se mantiene corto: si pasa de 30 entradas, toca limpieza.

## Activos

- [1] Defecto del flujo, ya corregido: la spec incluía detalles técnicos
  (HTML, ARIA, funciones, campos de datos) porque la plantilla pedía
  "Cómo se cumple" en accesibilidad y nada lo prohibía. Ahora la spec es
  solo funcional y la técnica va al plan. En la retro de 001 alcanzó
  (#248 y #255 salieron sin técnica): no hace falta check. (001)
- [2] La interacción se vio recién al usar la app en el teléfono y se
  cambió después de implementarla: #248 (interruptor y menú ⋮), #255
  (interruptor sin texto visible) y el menú desalineado en T08. Ahora el
  plan incluye `flujo.md`, pero la 001 no lo tuvo. **Promover** a un
  check: tarea de UI en `tareas.md` exige `flujo.md` con wireframe, y la
  primera tarea de UI se valida en el preview mobile antes de seguir. El
  lienzo recorrible de `/plan` adelanta la validación, pero no reemplaza
  este check. (001)
- [1] Un PR apilado se mergea después de su base, nunca antes: T07 entró
  dentro de T06 y #246 llegó a `main` con 360 líneas. (001)
- [1] Defecto del flujo: 7 PRs de la 001 se mergearon sin `validado`.
  El check tiene que ser obligatorio en la protección de `main`. (001)
- [1] Si la spec cambia después del plan, el mismo cambio actualiza
  `plan.md`: después de #248 y #255 quedó describiendo otra fila. (001)
- [1] Los tests eligen opciones de menú por su texto, no por su
  posición: cambiar el orden del menú rompió tests en #247 y #254. (001)
- [1] `check-pr-size` se corre como paso aparte y se respeta su
  resultado: encadenado con el commit dejó pasar un push fuera de
  límites en #254. (001)
- [1] `bootstrap.md` tiene que decir que `dropdown-menu-end` necesita
  `data-bs-popper` cuando no se usa el JavaScript de Bootstrap. (001)

## Promovidos

| Aprendizaje | Promovido a | PR |
|---|---|---|
