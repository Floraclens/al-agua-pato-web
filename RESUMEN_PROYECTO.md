# AL AGUA PATO — Resumen del Proyecto

Sistema de reservas online para eventos de cumpleaños/egresados con actividades acuáticas y animación. Sitio de marketing + motor de reservas + panel de administración + invitaciones digitales.

**Stack**: Next.js 16.2.4 (App Router) + React 19 + TypeScript + Tailwind v4 + Supabase (auth + DB) + Vercel (deploy automático).
**Repo**: `Floraclens/al-agua-pato-web`

> Nota: no existen migraciones SQL ni tipos generados de Supabase en el repo. El esquema de la base de datos documentado abajo está **inferido del código** (queries `supabase.from(...)`), no de un schema oficial.

---

## 1. Rutas / páginas (`app/`)

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Pública | Landing: hero en video, reseñas, servicios incluidos, galería de fotos, extras "a la carta", pasos del proceso, FAQ, CTA final con selector de tipo de evento (Cumple → `/reservar`, Egresaditos → `/egresaditos`), botones flotantes de WhatsApp y "Reservar Fecha". JSON-LD `EventVenue` para SEO. |
| `/reservar` | Pública | Formulario de reserva de cumpleaños: calendario de fecha/turno, selector de extras, datos del cliente, método de pago, resumen con cálculo de precio en vivo. |
| `/egresaditos` | Pública | Variante para eventos de fin de curso/colegios. Misma estructura que `/reservar` pero con campos obligatorios (institución, sala, turno de colegio), solo permite reservar en noviembre/diciembre, y usa una tabla de precios propia. |
| `/admin` | Protegida (Supabase Auth) | Panel de administración de Lorena (dueña). Login usuario/contraseña. Gestión de reservas: cambio de estado (pendiente → señado → completado), reprogramación de fecha/turno, eliminación, métricas de ingresos, filtros, generación de mensajes de WhatsApp prellenados (reclamo de seña / envío de invitación VIP), botón para copiar resumen mensual. Bloqueada en `robots.ts` pero sin middleware de Next.js — protección solo client-side vía sesión. |
| `/invitacion/[id]` | Pública (requiere conocer el id) | Invitación digital VIP personalizada según los datos de la reserva. 3 temas de color, exportable como imagen PNG (`html-to-image`) y compartible vía Web Share API. Detecta reservas de egresaditos por el emoji 🎓 en el nombre. |

Archivos de soporte: `app/layout.tsx` (fuentes, metadata SEO, JSON-LD, Vercel Analytics y Meta Pixel condicionados a producción), `app/robots.ts` (bloquea `/admin/`), `app/sitemap.ts` (incluye `/`, `/reservar`, `/egresaditos`).

No hay rutas bajo `app/api/`: toda la persistencia se hace directo desde el navegador contra Supabase con la anon key.

---

## 2. Componentes principales (`components/`)

- **`reservation-calendar.tsx`** — El componente más complejo. Selector de fecha + turno con disponibilidad en vivo (consulta `reservas` por fecha). Modalidad "doble turno fijo" (fines de semana/feriados en temporada media, o toda la temporada alta: Mañana 12-16h / Tarde-Noche 18:30-22:30h) vs. "turno flexible" (lunes a viernes, franjas de 4h cada 30 min). Verifica solapamiento de horarios. Soporta reprogramación (`ignoreReservaId`) y modo egresaditos (restringe a nov/dic).
- **`extras-selector.tsx`** — Grid de extras seleccionables: adultos extra, animación, hora extra, mozo adicional, Robot LED, Zancos LED, personajes a elección (~44 opciones), pileta (condicional por mes). Precios ocultos hasta que el usuario los revela.
- **`metodo-pago-selector.tsx`** — Efectivo (con opción de pagar todo con 10% OFF) / transferencia / tarjeta (20% recargo).
- **`resumen-reserva.tsx`** — Panel resumen con desglose de precio. Al confirmar: INSERT en `reservas`, abre WhatsApp con mensaje prellenado, muestra pantalla de éxito.
- **`servicios-incluidos.tsx`** — Accordion informativo de lo incluido en el paquete base (capacidad, instalaciones, mobiliario, juegos, snacks, ambientación, candy bar).
- **`photo-gallery.tsx`** — Galería de 24 fotos con autoplay y lightbox navegable por teclado.
- **`turno-selector.tsx`** — Selector auxiliar de turno (1er/2do), complementario al calendario.
- **`theme-provider.tsx`** — Wrapper de `next-themes` (disponible, sin uso visible de dark mode en la landing).
- **`components/ui/*`** — Librería shadcn/ui sobre Radix (accordion, dialog, calendar, form, table, toast/sonner, carousel, sidebar, etc.), sin lógica de negocio propia.

## 3. Hooks (`hooks/`)

- **`use-mobile.ts`** — `useIsMobile()`, detecta viewport < 768px.
- **`use-toast.ts`** — gestión de cola de toasts estilo shadcn (en la práctica, la mayoría de las notificaciones reales usan `sonner` directamente).

## 4. Lib / utilidades (`lib/`)

- **`lib/supabase/client.ts`** — único punto de acceso a Supabase (cliente browser con anon key). No hay cliente server-side ni service-role.
- **`lib/config-reservas.ts`** — "cerebro" de precios y reglas de negocio:
  - `VALOR_SENA = 350000` (ARS)
  - Descuento 10% por pago total en efectivo / recargo 20% por tarjeta
  - Lista de feriados de Argentina 2026
  - `PRECIOS`: tabla por temporada (baja/media/alta) y turno, más precios de todos los extras
  - `PRECIOS_EGRESADITOS`: tabla especial para eventos escolares
  - `HORARIOS`: franjas y modalidades por temporada
  - Funciones: `determinarTemporada()`, `esFinDeSemanaOFeriado()`, `obtenerReglasParaFecha()`, `obtenerReglasEgresaditos()`
- **`lib/turno.ts`** — tipo `Turno`, `getTurnoLabel()`, `precioTurnoKey()`.
- **`lib/validacion-reservas.ts`** — validación de negocio (fecha/turno, precio, datos completos incluyendo reglas de egresaditos).
- **`lib/utils.ts`** — `cn()` (clsx + tailwind-merge).

---

## 5. Base de datos Supabase (inferida del código)

⚠️ No hay migraciones SQL, tipos generados ni definición de RLS en el repo. Esto es lo que se pudo inferir de las queries.

### Tabla `reservas`

| Columna | Tipo inferido | Notas |
|---|---|---|
| `id` | integer (serial) | PK, usado en URL `/invitacion/{id}` |
| `fecha` | `date` (`"YYYY-MM-DD"`) | fecha del evento |
| `turno` | texto | ej. `"1er Turno (12:00 - 16:00)"` |
| `metodo_pago` | texto | `"Efectivo (Abonando Totalidad)"`, `"Tarjeta"`, `"Transferencia"` |
| `total` | numeric | precio total calculado |
| `sena` | numeric | monto de seña (o total si pagó todo) |
| `extras_elegidos` | texto | lista separada por comas |
| `nombre` | texto | contratante |
| `telefono` | texto | solo dígitos |
| `email` | texto \| null | |
| `nombre_cumpleanero` | texto \| null | en egresaditos: `"🎓 {institucion} - Sala: {sala}"` |
| `edad_cumple` | texto \| null | en egresaditos: `"Turno: {turno_colegio}"` |
| `estado` | texto | `"pendiente"` (default), `"senado"` (legado: `"confirmada"`), `"completado"` |

No hay tabla de perfiles/roles visible; la autenticación admin usa **Supabase Auth** directamente (un único usuario, login `{usuario}@alaguapato.com`).

### RLS
No se puede confirmar desde el código. Dado que INSERT/SELECT ocurren sin sesión desde `/reservar` y `/egresaditos`, es probable que la tabla tenga RLS deshabilitado o políticas públicas de lectura/escritura — **conviene verificar directamente en el dashboard de Supabase**.

---

## 6. Funcionalidades clave

1. **Landing de marketing** con video hero, reseñas, galería, servicios, FAQ y CTAs, integrada con WhatsApp Business como canal de contacto.
2. **Reservas online con calendario de disponibilidad en tiempo real**, dos flujos (cumpleaños / egresaditos) con reglas dependientes de fecha (temporada, día de semana/feriado).
3. **Motor de precios dinámico** centralizado, con descuentos/recargos según método de pago.
4. **Anti-doble-reserva**: chequeo de solapamiento de horarios antes de confirmar.
5. **Panel de administración** con gestión de estado, reprogramación, métricas y generación de mensajes de WhatsApp.
6. **Invitaciones digitales descargables** (PNG) personalizadas por reserva.
7. **Analítica y marketing**: Vercel Analytics + Meta Pixel (solo producción), SEO con JSON-LD y sitemap controlado.
8. **Confirmación de pagos 100% manual vía WhatsApp** — no hay pasarela de pago automatizada ni envío de emails.

---

## 7. Variables de entorno / integraciones

No hay `.env.example` en el repo. Variables detectadas por uso en código:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_META_PIXEL_ID` (opcional)
- `NODE_ENV`

### Dependencias clave
- **Backend/DB**: `@supabase/supabase-js` (sin ORM)
- **Calendario**: `react-day-picker`, `date-fns` (locale `es`)
- **Formularios**: `react-hook-form`, `zod` instalados pero no usados extensamente — el flujo de reserva usa estado local con validación manual
- **Imagen**: `html-to-image` (invitación digital)
- **UI**: Radix UI, `lucide-react`, Tailwind v4, `sonner`, `vaul`, `embla-carousel-react`, `recharts` (sin uso evidente), `cmdk`
- **Analítica**: `@vercel/analytics`
- **Sin integrar**: pasarela de pago (Mercado Pago/Stripe) y envío de emails (Resend/SendGrid/etc.)
