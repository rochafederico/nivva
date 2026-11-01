# Constitución de Nivva

Principios que ninguna spec, plan o tarea puede romper. Cambiarlos requiere
un PR propio que solo modifique este archivo.

## Producto

1. **Los datos no salen del navegador.** Todo se guarda en IndexedDB
   (con fallback a localStorage). Nada de backend ni envío de datos de
   deudas o ingresos a terceros.
2. **Claridad antes que funciones.** Cada pantalla responde rápido cuánto
   debo, cuánto entra y qué vence. Lo que no ayuda a eso necesita una
   spec que lo justifique.
3. **Mobile primero.** Toda UI se diseña y prueba primero en pantalla chica.
4. **Accesible: WCAG 2.2 nivel AA.** Toda UI nueva o modificada lo
   cumple. Cómo verificarlo en `docs/sdd/accesibilidad.md`.
5. **Copy con la voz de Nivva.** Textos según `docs/wiki/04-Voz-y-tono.md`,
   `05-Glosario.md` y `06-CTAs.md`. Se usa "cuota", no "monto".

## Técnica

6. **Sin frameworks.** JavaScript moderno, Web Components con
   `customElements.define` en light DOM y Bootstrap encapsulado en
   `src/shared/ui/bootstrap/`.
7. **Organización por feature.** Cada feature vive en `src/features/<nombre>/`
   con su entidad, modelo, repositorio, componentes y casos de uso. Lo
   compartido va en `src/shared/`.
8. **Archivos chicos.** Máximo 100 líneas por archivo de código; un archivo,
   una responsabilidad.
9. **Comunicación por eventos.** Entre componentes, `EventBus` y eventos
   personalizados; sin estado global centralizado.
10. **Errores explícitos.** Los repositorios rechazan con `Error` y quien
    llama los maneja y muestra un mensaje al usuario.
11. **Dependencias nuevas solo con spec.** Agregar un paquete requiere que
    la spec o el plan lo justifique.

## Calidad

12. **Todo comportamiento tiene test.** Tests en `test/` con `happy-dom` y
    `fake-indexeddb`; cada criterio de aceptación tiene al menos un test.
13. **CI en verde siempre.** Lint, tests, tamaño y validación humana.
14. **Nada de comportamiento sin spec.** Si no está en una spec aprobada,
    no se implementa.
