# Atlas R&M — Explorador multiversal

Aplicación web para consultar personajes de **Rick and Morty** desde la API pública. Incluye búsqueda por nombre, filtros por estado y especie, paginación y favoritos guardados en el navegador.

## Enlaces

- Repositorio: https://github.com/SoyPolar001/proyecto-web-ia
- Aplicación: https://soypolar001.github.io/proyecto-web-ia/
- API y documentación: https://rickandmortyapi.com/documentation

## Integrantes y contribuciones

- **@SoyPolar001** — estructura inicial, diseño, integración de la API y documentación; sus avances aparecen en el historial de commits.
- **Resto del equipo:** agregar aquí nombre y usuario de GitHub. Cada integrante debe realizar commits desde su propia cuenta para que su contribución quede identificada.

En este momento el historial visible refleja una sola cuenta. La lista del equipo y las contribuciones de los demás integrantes se deben completar antes de la exposición.

## Archivos

- index.html contiene la estructura y los controles.
- style.css define el diseño adaptable y las variables de tema claro/oscuro.
- script.js consulta la API, dibuja las fichas, aplica búsqueda y filtros, pagina resultados y gestiona favoritos.

## Uso

1. Abre la aplicación en un navegador con conexión a internet.
2. Escribe un nombre y pulsa **Buscar**; también puedes filtrar por estado o especie.
3. Usa **Anterior** y **Siguiente** para recorrer las páginas de la API.
4. Pulsa el corazón de una ficha para guardarla. **Mis favoritos** muestra la selección almacenada en localStorage.
5. El botón de tema cambia entre modo claro y oscuro. La preferencia se conserva al recargar.
6. **Restablecer** limpia la búsqueda y los filtros.

La API entrega hasta 20 personajes por página. Por eso la aplicación lee results para las fichas y info para el total y la cantidad de páginas. La búsqueda por nombre y los filtros se envían como parámetros de consulta a la API.

## IA durante el desarrollo

### Tres prompts importantes

1. «Propón una estructura HTML semántica y adaptable para explorar personajes de Rick and Morty, con buscador, filtros y una cuadrícula de fichas».
2. «Explica cómo consultar la API de Rick and Morty con fetch(), enviar filtros por URL y recorrer las páginas de resultados».
3. «Sugiere una funcionalidad extra sencilla de explicar que mejore el explorador y conserve la preferencia del usuario».

### Respuesta revisada

Una primera propuesta de consulta podía presentar los resultados de una sola solicitud como si fueran todo el catálogo. La API pagina los datos y entrega hasta 20 fichas por respuesta. Se corrigió el enfoque leyendo info.pages e info.count, enviando page y agregando los controles de paginación.

### Error encontrado y solución

Una búsqueda sin coincidencias no debe mostrarse como si hubiera fallado internet. El código trata la respuesta HTTP 404 de la API como una búsqueda vacía y muestra un mensaje para cambiar los filtros. Los errores de conexión u otros estados HTTP muestran un mensaje distinto para reintentar más tarde.

### Modificación extra: tema claro y oscuro

El botón superior cambia data-theme en el elemento HTML. style.css intercambia sus variables de color y script.js guarda la elección en localStorage con la clave atlas-rm-theme, de modo que sigue igual al volver a abrir la página.

### Reflexión

La IA ayudó a organizar la interfaz y a acelerar el primer borrador. Aun así, fue necesario contrastar la estructura real de la API, probar los casos sin resultados y leer cada función para poder explicarla. La IA sirve como apoyo; las decisiones y la revisión del código también forman parte del aprendizaje.

## Guía breve para la exposición

- **¿Qué hace fetch()?** Envía una solicitud HTTP a la API y devuelve una promesa. Después se convierte la respuesta JSON en datos que JavaScript usa para crear las fichas.
- **¿Qué hacen HTML, CSS y JavaScript?** HTML organiza el contenido, CSS define su presentación y adaptación a pantallas, y JavaScript consulta datos y responde a las acciones de la persona usuaria.
- **¿Cómo funciona el buscador?** El formulario toma el texto, lo envía como parámetro name y vuelve a consultar la API desde la primera página.
- **¿Qué pasa si la API no responde?** Se muestra un aviso de conexión; si la respuesta indica que no hay coincidencias, se explica como resultado vacío.
- **¿Qué aportó la IA?** Sirvió para proponer y revisar partes del HTML, CSS y JavaScript. El equipo debe señalar qué adaptó y explicar el funcionamiento de esas partes.
- **¿Cómo se publica en GitHub Pages?** En el repositorio, abre **Settings → Pages**, elige desplegar desde la rama main y la carpeta raíz. La dirección publicada aparece ahí; el enlace de arriba debe abrir después de terminar el despliegue.

## Fuente

Datos y retratos: [The Rick and Morty API](https://rickandmortyapi.com/documentation). La aplicación consulta el servicio en tiempo real; requiere acceso a internet y puede mostrar un error temporal si el servicio no está disponible.
