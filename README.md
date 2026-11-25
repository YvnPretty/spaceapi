# NEXUS SPACE

Plataforma web de monitoreo y gestión de eventos espaciales mediante APIs REST.

## Desarrollo

- **Frontend:** React 19 y Vite.
- **Navegación:** React Router.
- **Estado:** React Hooks y Context API.
- **Datos científicos:** API pública de NASA (DONKI, NeoWs y APOD); Solar Monitor usa el feed oficial NOAA SWPC si DONKI no está disponible y muestra la fuente activa.
- **Configuración de NASA:** usa `DEMO_KEY` por defecto. Para evitar sus límites compartidos, crea `.env.local` con `VITE_NASA_API_KEY=tu_clave` (solicítala gratis en [api.nasa.gov](https://api.nasa.gov/)).
- **Investigaciones:** CRUD persistente en `localStorage`.
- **Diseño:** interfaz aeroespacial responsive, telemetría, visualización orbital y panel de alertas.

## Módulos

1. Mission Control.
2. Solar Monitor.
3. Asteroid Tracker.
4. Space Gallery.
5. Research Logs.
6. Alert Center.

## Ejecución local

```bash
npm install
npm run dev
```

Para crear la versión de producción:

```bash
npm run build
npm run preview
```

## Rutas

- `/` — página de bienvenida y autenticación.
- `/cockpit` y `/nexus` — centro de operaciones NEXUS SPACE.
- `/login` — inicio de sesión.
- `/registro` — registro de usuario.

## Glosario

- **API REST:** interfaz que permite obtener o modificar datos mediante peticiones HTTP.
- **APOD:** Astronomy Picture of the Day, fotografía astronómica diaria de NASA.
- **DONKI:** base de datos NASA de eventos de clima espacial.
- **NeoWs:** servicio NASA de objetos cercanos a la Tierra.
- **CRUD:** Crear, Leer, Actualizar y Eliminar registros.
- **Context API:** mecanismo de React para compartir datos entre componentes.
- **Telemetry:** mediciones operativas de los sistemas monitorizados.

Las consultas se realizan de forma independiente para que una API temporalmente caída no bloquee los demás módulos. NeoWs limita las búsquedas a siete días por solicitud.
