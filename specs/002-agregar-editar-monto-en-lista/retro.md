# 002 — Retro

Respuestas cortas y concretas. Si no aplica, "nada".

**Pruebas a mano:** el humano confirmó en la conversación de la retro la
revisión de T08 y la prueba de T03 en el teléfono. No quedaron registradas en
#280 ni en #274.

1. **Spec ambigua:** faltaban a dónde va el foco si al eliminar otro monto le
   tocaba al ⋮ del monto abierto (lo marcó Codex en #270, se resolvió en
   #271), el nombre del grupo de un monto nuevo (#270 usó `Monto nuevo`, que
   la spec no define) y los mensajes por campo y el foco al guardar sin
   montos (aclarados antes del plan en #258).
2. **Correcciones en review:** la única corrección humana visible fue la
   maqueta en PC de T01 (#268, `992d91f`). Codex encontró una flecha del flujo
   contra el criterio 9 (#261) y los tests rotos de la respuesta 5.
3. **Tamaño:** todas entraron, pero T01 y T02 quedaron en 199 de 200 líneas.
   Dividir la conexión en T03, T04 y T05 sirvió; a cambio, `DebtForm` tuvo
   código sin uso entre T04 y T06.
4. **Estimación:** T01 180 → 199, T02 180 → 199, T05 150 → 169 y T08 130 → 92.
5. **Errores repetidos del agente:** dos veces hubo tests rotos por el
   `stepMismatch` de happy-dom (#268 y #277). Esas sesiones no pudieron
   instalar dependencias: se pusheó sin correr los tests y los encontró la CI
   o Codex. Además, en T01 el código se escribió antes que los tests.
6. **Plan:** no previó `MontoForm` en T02, `montosListaAcciones` en T03 ni
   pasar `numero` al monto abierto (se sumó a T03 y T04 durante T01). Decía que
   T03 era el primer cambio visible, pero fue T01. `deudas.test.js` quedó en
   1315 líneas contra unas 1120 previstas; `DebtForm`, en 356 contra unas 380.
7. **Divergencias:** nada.

## Aprendizajes

- El check `validado` sigue sin ser obligatorio: #276 se mergeó con el check
  en rojo. Pasa a [2] y se promueve.
- Sigue sin promover el [2] de la 001: tarea de UI exige `flujo.md` y
  validación mobile.
- Tests con campos numéricos: `stepMismatch` de happy-dom, dos veces. [2] y
  se promueve.
- Una sesión sin dependencias no puede cumplir "tests en verde antes del PR".
- Lo que una spec deja afuera va a un issue, no a un número de iteración: la
  coma decimal, la fecha y la moneda quedaron sin dueño porque la 003 pasó a
  ser gastos diarios (#273). Ahora están en #282.
- El wireframe solo cubre 320 px, y el problema de T01 apareció en PC.
- Un bug de `main` en medio de una iteración no tiene camino en el flujo
  (#269 tocó código sin tarea).
- Las casillas del DoD no se marcan con "pendiente" (#274).
