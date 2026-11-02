# 001 — Retro

Respuestas cortas y concretas. Si no aplica, "nada".

1. **Spec ambigua:** el criterio 7 solo da el ejemplo de enero a febrero.
   No dice qué pasa con un día 31 si el mes siguiente tiene 30 días
   (lo marcó Codex en #239). El código lo resuelve en general (último día
   del mes), pero la spec no lo dice.
2. **Correcciones en review:** la interacción cambió dos veces después de
   implementarla, las dos al verla en el teléfono: #248 (fila compacta,
   interruptor y Editar dentro del ⋮) y #255 (interruptor sin texto
   visible). En el preview de T08 también se corrigieron la alineación
   del menú y el color del botón ⋮.
3. **Tamaño:** #246 llegó a `main` con 360 líneas porque T07 (#247) estaba
   apilado y se mergeó dentro de la rama de T06 antes que T06. El resto
   entró en los límites; #254 llegó justo a 10 archivos.
4. **Estimación:** T08 se estimó en 5 archivos y terminó en 10, por tests
   que dependían de la fila vieja (botón "Editar" aparte y posición de
   las opciones del menú).
5. **Errores repetidos del agente:** tests que eligen opciones del menú
   por posición o buscan selectores viejos (#247 y #254). Además, un
   `check-pr-size` encadenado con el commit y con la salida recortada
   dejó pasar un push fuera de límites en #254.
6. **Plan:** no tuvo `flujo.md` (la regla es posterior, #251). Quedó
   desactualizado después de #248 y #255: `plan.md` todavía habla de
   etiqueta visible, botón "Editar" y 2.5.3. No previó que
   `dropdown-menu-end` sin el JavaScript de Bootstrap necesita
   `data-bs-popper`.
7. **Divergencias:** nada.

## Aprendizajes

- La interacción se vio tarde otra vez (#255 y menú desalineado): pasa a
  [2] y se promueve.
- Spec solo funcional: #248 y #255 salieron sin técnica; alcanzó.
- Un PR apilado se mergea después de su base, nunca antes.
- El check `validado` tiene que ser obligatorio en la protección de
  `main`: 7 PRs de la 001 entraron sin la etiqueta.
- Si la spec cambia después del plan, el mismo cambio actualiza `plan.md`.
- Los tests eligen opciones de menú por su texto, no por su posición.
- `check-pr-size` se corre como paso aparte y se respeta su resultado.
- `bootstrap.md` tiene que decir que `dropdown-menu-end` necesita
  `data-bs-popper` cuando no se usa el JavaScript de Bootstrap.
