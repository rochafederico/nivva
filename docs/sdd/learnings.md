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
- [3] La interacción se vio recién al usar la app en el teléfono y se
  cambió después de implementarla: #248 (interruptor y menú ⋮), #255
  (interruptor sin texto visible) y el menú desalineado en T08. Ahora el
  plan incluye `flujo.md`, pero la 001 no lo tuvo. **Promover** a un
  check: tarea de UI en `tareas.md` exige `flujo.md` con wireframe, y la
  primera tarea de UI se valida en el preview mobile antes de seguir. El
  lienzo recorrible de `/plan` adelanta la validación, pero no reemplaza
  este check. (001, 003)
- [2] Un PR apilado se mergea después de su base, nunca antes: T07 entró
  dentro de T06 y #246 llegó a `main` con 360 líneas; #288 a #291 entraron en
  una rama intermedia. **Promover** a `/implementar`: indicar cada base y el
  orden de merge. (001, 003)
- [2] Defecto del flujo: 7 PRs de la 001 se mergearon sin `validado`, y
  #276 de la 002 con el check en rojo. **Promover:** el check tiene que ser
  obligatorio en la protección de `main`, que hoy no exige ninguno. (001, 002)
- [1] Si la spec cambia después del plan, el mismo cambio actualiza
  `plan.md`: después de #248 y #255 quedó describiendo otra fila. (001)
- [1] Los tests eligen opciones de menú por su texto, no por su
  posición: cambiar el orden del menú rompió tests en #247 y #254. (001)
- [1] `check-pr-size` se corre como paso aparte y se respeta su
  resultado: encadenado con el commit dejó pasar un push fuera de
  límites en #254. (001)
- [1] `bootstrap.md` tiene que decir que `dropdown-menu-end` necesita
  `data-bs-popper` cuando no se usa el JavaScript de Bootstrap. (001)
- [2] Los tests que cargan un campo numérico fallan en happy-dom por
  `stepMismatch`: pasó en #268 y #277. **Promover** a una regla en
  `AGENTS.md` o a un helper de test. (002)
- [2] Defecto del flujo: una sesión sin dependencias no puede cumplir "tests
  en verde antes del PR" de `/implementar`. #268, #270, #274 y #276 a #280 se
  pushearon sin correrlos. El comando tiene que decir qué hacer. En la 003
  sirvieron los PRs en draft con la CI. **Promover** a `/implementar`. (002, 003)
- [1] Lo que una spec deja afuera va a un issue, no a un número de iteración:
  la coma decimal, la fecha y la moneda quedaron sin dueño cuando la 003
  pasó a ser gastos diarios. Ahora están en #282. (002)
- [1] El wireframe de `flujo.md` solo cubre 320 px: el problema de maqueta de
  T01 apareció en PC. (002)
- [2] Un bug de `main` en medio de una iteración no tiene camino en el flujo:
  #269 tocó código sin tarea y el gasto duplicado de la 003 tampoco tuvo tarea.
  **Promover:** definir un camino para arreglos chicos. (002, 003)
- [1] Las casillas del DoD no se marcan con "pendiente": #274 dio por probado
  en mobile algo que faltaba validar. (002)
- [1] Defecto del flujo: las tareas se ordenaron por capas y T01 a T05 no dejaban
  probar nada en la app. Se corrige en `sdd/20`. (003)
- [1] Defecto del flujo: el plan no contó `tareas.md` entre los archivos y T01
  no entraba. Se corrige en `sdd/20`. (003)
- [1] Los comentarios de revisión automática se resuelven antes de mergear:
  #286 y #293 dejaron dos bugs en `main`. (003)
- [1] Los tests en un navegador con Bootstrap simulado no reemplazan a la CI:
  no vieron dos fallas de happy-dom en T04 y T08. (003)

## Promovidos

| Aprendizaje | Promovido a | PR |
|---|---|---|
