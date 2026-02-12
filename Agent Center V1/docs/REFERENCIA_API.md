# Referencia de API - Agent Center V1

Documentación detallada de los endpoints REST disponibles en el servidor Node.js.

## Autenticación

Todas las peticiones protegidas requieren el header:
`Authorization: Bearer <token_jwt>`

### Login
`POST /auth/login`
- **Body**: `{ "username": "...", "password": "..." }`
- **Respuesta**: Token JWT y datos del usuario.

### Registro (Admin)
`POST /auth/register`
- **Body**: `{ "username": "...", "password": "...", "email": "..." }`
- **Nota**: Crea usuarios con rol 'agent' por defecto.

---

## Módulo de Administración (`/admin`)
Requiere rol `admin`.

### Gestión de Usuarios
- `GET /admin/users` - Lista usuarios con progreso y stats diarios.
- `PUT /admin/users/:id` - Actualiza usuario (role, email, username, password, rcExtensionId).
- `DELETE /admin/users/:id` - Elimina un usuario.
- `GET /admin/users/:id/stats` - Estadísticas de un usuario (`startDate`, `endDate`).

### Gestión de Leads
- `GET /admin/leads` - Búsqueda avanzada de leads.
    - **Query params**: `disposition`, `assignedTo`, `product`, `startDate`, `endDate`, `search`, `sortBy`.
- `POST /admin/upload` - Carga masiva de CSV.
    - **Form-data**: `file` (CSV), `listName`, `customId`.
- `POST /admin/assign` - Asigna leads seleccionados a un agente.
- `POST /admin/leads/reassign` - Reasigna leads de un agente a otro.
- `DELETE /admin/leads/bulk` - Eliminación masiva de leads (requiere password admin).
- `POST /admin/leads/deduplicate/preview` - Vista previa de duplicados por teléfono.
- `POST /admin/leads/deduplicate` - Elimina duplicados manteniendo el más reciente.

### Analítica
- `GET /admin/stats` - Estadísticas globales del día actual.
- `GET /admin/ringcentral/stats` - Métricas de llamadas desde RingCentral API.

---

## Módulo de Agente (`/agent`)
Requiere rol `agent`.

### Operativa Diaria
- `GET /agent/data` - Obtiene leads asignados y guardados para la sesión.
- `POST /agent/progress` - Guarda el índice actual y actualiza el lead (disposición, notas).
- `POST /agent/stats` - Sincroniza contadores de sesión (stats locales) con el backend.
- `GET /agent/callbacks` - Lista de callbacks pendientes ordenados por fecha.
- `GET /agent/leads/:id/history` - Historial de cambios de un lead específico.
