# AGENT.md — App de Gestión del Hogar

## 1. Resumen del proyecto

Aplicación web (adaptada también a móvil vía responsive design / PWA) para la gestión doméstica compartida entre los miembros de la casa. Incluye:

- Autenticación para restringir el acceso solo a las personas de la casa.
- Lista de la compra por tickets/fechas con autocompletado.
- Gestión de compra de muebles organizada por estancias, con metadata extraída de enlaces.
- Reparto de tareas mediante calendario mensual con drag & drop y asignación recurrente.
- Gestión de gastos con filtros y dashboard de gráficos.

## 2. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React (Vite) + React Router |
| Estilos | Tailwind CSS (mobile-first) |
| Estado | React Query (server state) + Zustand o Context (UI state) |
| Backend / DB | Supabase (Postgres + Auth + Storage + Edge Functions) |
| Drag & drop | `@dnd-kit/core` |
| Gráficos | Recharts |
| Extracción de metadata de links | Supabase Edge Function (fetch + parser OpenGraph) |
| Despliegue | Vercel / Netlify (frontend) + Supabase Cloud |

## 3. Autenticación y control de acceso

- Supabase Auth con email/password (o magic link).
- Tabla `households` (hogares) y `household_members` (relación usuario–hogar) para restringir el acceso solo a las personas invitadas a la casa.
- Row Level Security (RLS) en todas las tablas: cada fila incluye `household_id`, y las políticas solo permiten leer/escribir a los miembros de ese `household_id`.
- Alta de nuevos miembros mediante invitación (código o email) gestionada por un miembro existente — no hay registro abierto.

## 4. Modelo de datos (Supabase / Postgres)

```sql
-- Hogares y miembros
households (id, name, created_at)
household_members (id, household_id, user_id, display_name, role)

-- Lista de la compra
shopping_tickets (id, household_id, date, created_by, created_at)
shopping_items (id, ticket_id, product_name, quantity, checked, created_at)
-- product_name se usa también como fuente para el autocompletado
-- (SELECT DISTINCT product_name FROM shopping_items WHERE household_id = ...)

-- Compra de muebles
furniture_rooms (id, household_id, name)  -- salón, cocina, habitación, baño principal,
                                           -- baño invitados, despacho, terrazas
furniture_items (
  id, household_id, room_id, title, url,
  priority INT CHECK (priority BETWEEN 1 AND 5),
  image_url, description, price, site_name,
  status, created_by, created_at
)

-- Reparto de tareas
tasks (id, household_id, title, description, created_at)
task_assignments (
  id, task_id, assigned_to (user_id), date,
  is_recurring BOOLEAN, recurrence_rule (ej. "WEEKLY;BYDAY=SA"),
  completed BOOLEAN
)

-- Gastos
expenses (
  id, household_id, type, detail, amount, date,
  created_by, created_at
)
expense_types (id, household_id, name) -- catálogo editable de tipos
```

## 5. Estructura de páginas / tabs

```
/login
/app
  /compra          -> Lista de la compra
  /muebles          -> Compra de muebles
  /tareas           -> Reparto de tareas (calendario)
  /gastos           -> Gestión de gastos
```

Navegación con tabs inferiores en móvil (bottom navigation) y barra lateral o superior en escritorio.

## 6. Funcionalidad por sección

### 6.1 Lista de la compra
- Vista de "tickets" agrupados por fecha (como recibos), cada uno con su lista de productos.
- Botón "Nuevo ticket" → crea ticket con fecha (hoy por defecto, editable).
- Al añadir un producto dentro de un ticket: input con autocompletado que sugiere productos ya usados anteriormente (consulta a `shopping_items` distintos por `household_id`, filtrado por texto tecleado).
- Marcar productos como comprados (checkbox) dentro del ticket.
- Posibilidad de duplicar un ticket anterior como plantilla rápida.

### 6.2 Compra de muebles
- Tabs o acordeón por estancia: Salón, Cocina, Habitación, Baño principal, Baño invitados, Despacho, Terrazas.
- Formulario "Añadir mueble": pegar URL → llamada a Edge Function que hace scraping de metadata (Open Graph: `og:title`, `og:image`, `og:description`, precio si está disponible) y rellena automáticamente título e imagen (editable por el usuario).
- Campos manuales: título (editable), prioridad (1–5, selector tipo estrellas), estancia, notas.
- Vista en grid de tarjetas con imagen, título, prioridad y link al producto; ordenable por prioridad.

### 6.3 Reparto de tareas
- Calendario en vista mensual (librería tipo `react-big-calendar` o construido a medida sobre `@dnd-kit`).
- Panel lateral con "banco de tareas" sin asignar, arrastrables (drag & drop) a un día concreto del calendario.
- Al soltar una tarea sobre un día, modal rápido para elegir persona asignada (Vanesa / Jaime).
- Click derecho sobre una tarea → menú contextual con "Asignación rápida": permite fijar una regla de recurrencia (ej. "todos los sábados a Jaime") que genera automáticamente las instancias futuras.
- Dashboard de recuento: gráfico de tareas completadas/pendientes por persona y por semana/mes (Recharts).

### 6.4 Gestión de gastos
- Formulario de alta de gasto: tipo (selector, catálogo editable), detalle (texto libre), importe, fecha.
- Tabla de gastos con filtros combinables por tipo, rango de fechas y texto en detalle.
- Dashboard con gráficos: evolución mensual del gasto total, desglose por tipo (pie/barras), comparativa mes a mes.

## 7. Diseño responsive / móvil

- Enfoque mobile-first con Tailwind; breakpoints estándar (`sm`, `md`, `lg`).
- Navegación inferior fija en móvil, con los 4 tabs principales.
- Calendario de tareas: en móvil, vista de lista/agenda por día en lugar de grid mensual completo (o mes compacto con scroll), manteniendo drag & drop donde sea viable (o long-press como alternativa táctil).
- Considerar convertir la app en PWA (manifest + service worker) para poder "instalarla" en el móvil sin pasar por las tiendas de apps.

## 8. Fases de implementación

1. **Base del proyecto**: setup de React + Vite + Tailwind, conexión a Supabase, esquema de base de datos y RLS, autenticación y gestión de hogar/miembros.
2. **Lista de la compra**: CRUD de tickets y productos, autocompletado.
3. **Compra de muebles**: CRUD de muebles por estancia, Edge Function de extracción de metadata, prioridades.
4. **Reparto de tareas**: calendario mensual, drag & drop, asignación rápida recurrente, dashboard de recuento.
5. **Gestión de gastos**: CRUD de gastos, filtros, dashboard con gráficos.
6. **Pulido**: diseño responsive/PWA, pruebas en móvil, despliegue.

## 9. Consideraciones técnicas adicionales

- Usar Supabase Realtime (opcional) para que los cambios de un miembro (ej. marcar tarea completada) se reflejen en tiempo real en el dispositivo del otro.
- Políticas RLS deben cubrir insert/update/delete, no solo select.
- Para el scraping de metadata, cuidado con CORS: debe hacerse desde una Edge Function (servidor), nunca desde el cliente directamente.
- Validar y sanear las URLs antes de hacer el fetch en la Edge Function (evitar SSRF).1111