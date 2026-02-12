# Manual Técnico del Frontend - Agent Center V1

El frontend es una Single Page Application (SPA) construida con JavaScript Vanilla moderno, organizada en módulos ES6 y empaquetada con Webpack.

## Estructura de Módulos (`public/js/modules/`)

### 1. Núcleo
- **`main.js`**: Punto de entrada. Inicializa la app, gestiona el login y enruta al usuario según su rol (Admin/Agent).
- **`state.js`**: "Store" centralizado. Almacena el token de usuario, datos cargados, filtros activos e historial de sesión.
- **`config.js`**: Constantes globales (ej. URL base de la API).

### 2. Funcionalidad por Rol
- **`admin.js`**: Contiene TODA la lógica del panel de administración.
    - Renderizado de tablas (`Vanilla-DataTables`).
    - Gestión de modales (crear usuario, cargar leads).
    - Gráficos (Chart.js) y listeners de eventos de admin.
- **`agent.js`**: Lógica de la interfaz del agente.
    - Navegación entre leads (Siguiente/Anterior).
    - Lógica de disposición y guardado de resultados.
    - Manejo de callbacks y filtros locales.

### 3. Utilidades
- **`auth.js`**: Funciones puras para realizar login/logout contra la API.
- **`socket.js`**: Configuración del cliente Socket.io. Escucha eventos como `dashboardUpdate` para refrescar datos en tiempo real.
- **`utils.js`**: Helpers genéricos (formato de fechas, notificaciones `Toastify`, toggle de tema oscuro).
- **`form.js`**: Lógica específica para el modal de formulario de venta "Lead Form".

## Flujo de Desarrollo

1. **Edición**: Se modifican los archivos en `public/js/modules/`.
2. **Compilación**: Se debe ejecutar `npm run build` tras cualquier cambio.
    - Webpack toma `main.js` y sus importaciones.
    - Aplica ofuscación de código (seguridad).
    - Genera `public/js/dist/bundle.js`.
3. **Despliegue**: El `index.ejs` solo referencia al `bundle.js`, nunca a los módulos individuales directamente.

## Seguridad en Frontend
- **Anti-Debugging**: Se bloquean atajos de teclado (F12) y clic derecho en `main.js`.
- **Ofuscación**: El código final es ilegible para dificultar la ingeniería inversa de la lógica de negocio.
