# Atlas R&M — Explorador multiversal

Aplicación web para explorar personajes de **Rick and Morty** con datos obtenidos en tiempo real desde la API pública. Incluye búsqueda, filtros, paginación, orden alfabético, tema claro/oscuro y favoritos guardados en el navegador.

## Enlaces

- **Aplicación publicada:** https://soypolar001.github.io/proyecto-web-ia/
- **Repositorio:** https://github.com/SoyPolar001/proyecto-web-ia
- **API y documentación:** https://rickandmortyapi.com/documentation
- **PR #3, orden A–Z:** https://github.com/SoyPolar001/proyecto-web-ia/pull/3
- **Issues:** [reintento ante error](https://github.com/SoyPolar001/proyecto-web-ia/issues/1) · [orden alfabético](https://github.com/SoyPolar001/proyecto-web-ia/issues/2)

## Funciones

- Muestra fichas con imagen, estado, especie, origen y género.
- Busca por nombre y filtra por estado y especie.
- Cambia de página para recorrer los resultados de la API.
- Ordena alfabéticamente la página visible o los favoritos.
- Guarda favoritos y preferencia de tema en `localStorage`.
- Se adapta a pantallas pequeñas y muestra estados de carga, resultados vacíos y errores.

## Archivos

- `index.html`: estructura y controles accesibles.
- `style.css`: estilos adaptables y temas claro/oscuro.
- `script.js`: solicitudes `fetch()`, búsqueda, filtros, paginación y favoritos.
- `README.md`: instrucciones, registro del uso de IA y guía para la exposición.

## Uso

1. Abre la aplicación publicada con conexión a internet.
2. Escribe un nombre y pulsa **Buscar**, o selecciona un estado y una especie.
3. Usa **Anterior** y **Siguiente** para recorrer las páginas.
4. Pulsa el corazón de una ficha para guardarla y abre **Mis favoritos** para consultarlos.
5. Selecciona **Nombre: A–Z** para cambiar el orden de la página o los favoritos.
6. Usa el botón de tema para cambiar entre claro y oscuro. **Restablecer** limpia la búsqueda y los filtros.

La API entrega hasta 20 personajes por página. La aplicación lee `results` para dibujar las fichas y `info.count` y `info.pages` para mostrar el total y la paginación. El nombre y los filtros se envían como parámetros de consulta.

## Uso de IA y revisión

Los siguientes prompts guía describen las tareas de IA usadas para organizar y revisar el proyecto:

1. «Propón una estructura HTML semántica y accesible para explorar personajes de Rick and Morty, con búsqueda, filtros y tarjetas adaptables».
2. «Implementa la consulta con fetch() a la API de Rick and Morty, incluyendo parámetros de búsqueda, paginación y manejo de errores».
3. «Revisa la interfaz en pantallas pequeñas y añade una función sencilla para guardar favoritos en localStorage».

### Respuesta o borrador corregido

Al revisar el borrador de la rama del PR, detectamos que faltaba la etiqueta de cierre `</html>` en `index.html`. La añadimos antes de fusionar. También conectamos el cambio del selector A–Z con el resumen de filtros para que la interfaz indicara el orden activo. La corrección está en el historial de la PR #3.

### Error y solución

Una búsqueda sin coincidencias devuelve una respuesta HTTP 404 en esta API; eso no significa que haya fallado internet. `script.js` muestra un estado de “sin coincidencias” para esa respuesta y reserva el aviso de conexión para errores de red u otros estados HTTP.

### Funciones extra

El tema claro/oscuro conserva la elección con la clave `atlas-rm-theme`. Los favoritos se almacenan con `atlas-rm-favorites`. La mejora de orden A–Z surgió del Issue #2 y se integró mediante la PR #3.

## Issues, PR y commits

- Issue #1 propone añadir un botón para reintentar la consulta si falla la API.
- Issue #2 pidió el orden alfabético y quedó resuelto al fusionar la PR #3.
- La PR #3 añade el selector de orden A–Z y adapta la interfaz para mostrarlo en móviles.
- El historial del repositorio registra los commits de estructura, estilos, integración de la API, documentación y mejora de orden.

## Integrantes y contribuciones

- **@SoyPolar001** — repositorio, estructura, diseño, integración de la API, documentación y mejora de orden; las contribuciones están en el historial del repositorio.
- **Otros integrantes:** completar con sus nombres y usuarios de GitHub. Cada persona debe registrar su propia contribución desde su cuenta para que el historial la refleje.

El historial disponible al preparar esta entrega muestra contribuciones de una sola cuenta. Esta sección debe completarse con los datos reales del equipo antes de la exposición.

## Preguntas para la exposición

- **¿Qué hace fetch()?** Envía una solicitud a la API y devuelve una promesa. La respuesta se convierte en JSON para dibujar las fichas.
- **¿Para qué sirven HTML, CSS y JavaScript?** HTML organiza el contenido, CSS define su presentación y adaptación, y JavaScript consulta los datos y responde a las acciones.
- **¿Cómo funciona la búsqueda?** Toma el texto del formulario, lo envía como parámetro `name` y consulta de nuevo desde la primera página.
- **¿Qué hace localStorage?** Conserva datos sencillos en el navegador, como los favoritos y el tema elegido, después de cerrar o recargar la página.
- **¿Cómo se publica en GitHub Pages?** En el repositorio se abre **Settings → Pages**, se seleccionan la rama `main` y la carpeta raíz, y se espera el despliegue. La dirección aparece en esa página de configuración.

## Fuente de datos

Personajes e imágenes: [The Rick and Morty API](https://rickandmortyapi.com/documentation). La aplicación requiere conexión a internet para consultar el servicio.
