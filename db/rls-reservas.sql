-- =====================================================================
--  AL AGUA PATO — RLS + validación server-side para la tabla `reservas`
-- ---------------------------------------------------------------------
--  Aplicar MANUALMENTE en el SQL Editor de Supabase, por bloques.
--  NO ejecutar todo de una: leé las notas de cada parte.
--
--  Fuente de verdad de precios: lib/config-reservas.ts
--    -> Si cambian PRECIOS o PRECIOS_EGRESADITOS, actualizá
--       precio_base_minimo() en la PARTE 2.
--
--  Supuestos de tipos de columna: `fecha` es DATE, `total`/`sena` numéricos.
--    -> Si `fecha` es TEXT, usá `fecha::date` donde se le pasa a las funciones.
-- =====================================================================


-- =====================================================================
--  PARTE 2  (aplicar PRIMERO — no rompe nada, blinda la escritura)
--  Validación de precio + estado + sanidad en el INSERT, para anon Y
--  authenticated (ver nota del Paso 4 sobre por qué authenticated también
--  necesita esta validación, no un WITH CHECK (true) "de confianza").
-- =====================================================================

-- (idempotente; RLS ya debería estar activo porque hay policies)
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- --- Paso 1: piso de precio base, según temporada y tipo de reserva -----
-- Espeja PRECIOS y PRECIOS_EGRESADITOS de lib/config-reservas.ts.
-- Usa el MÍNIMO por temporada para no rechazar reservas legítimas.
-- Ignora feriados a propósito (usa el piso de la temporada), lo que además
-- evita arrastrar el problema de feriados-hardcodeados-2026 a la base.
CREATE OR REPLACE FUNCTION public.precio_base_minimo(p_fecha date, p_es_egresadito boolean)
RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    -- Egresaditos: tabla propia, 1.1M fijo (solo Nov–Dic)
    WHEN p_es_egresadito THEN 1100000
    -- Cumpleaños: mínimo por temporada (espeja determinarTemporada)
    WHEN (EXTRACT(MONTH FROM p_fecha) = 12 AND EXTRACT(DAY FROM p_fecha) >= 15)
      OR EXTRACT(MONTH FROM p_fecha) BETWEEN 1 AND 3 THEN 970000   -- temporada alta
    WHEN EXTRACT(MONTH FROM p_fecha) BETWEEN 4 AND 8 THEN 700000   -- temporada baja
    ELSE 970000                                                     -- temporada media
  END;
$$;

-- --- Paso 2: función compartida de validación de un insert -------------
-- Única fuente de verdad para "¿esta fila de reserva es válida?". La usan
-- AMBAS policies de INSERT (anon y authenticated) para no duplicar el mismo
-- WITH CHECK gigante en dos lugares que puedan divergir con el tiempo (el
-- mismo problema de duplicación que ya existe entre app/reservar/page.tsx y
-- app/egresaditos/page.tsx en el código de la app).
CREATE OR REPLACE FUNCTION public.reserva_insert_valida(
  p_estado text,
  p_fecha date,
  p_total numeric,
  p_sena numeric,
  p_nombre text,
  p_telefono text,
  p_email text,
  p_nombre_cumpleanero text,
  p_edad_cumple text,
  p_extras_elegidos text,
  p_metodo_pago text
) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT
    -- solo se puede crear una reserva PENDIENTE (no auto-confirmarse)
    p_estado = 'pendiente'

    -- Piso de precio según el tipo de reserva.
    -- El 🎓 al inicio de nombre_cumpleanero marca "egresadito" (lo escribe
    -- la app, components/resumen-reserva.tsx). Emoji exacto: U+1F393
    -- (F0 9F 8E 93), sin selector de variación. OJO: es señal
    -- client-controlled -> defensa en profundidad, no garantía (ver nota
    -- al pie del archivo).
    -- Factor 0.85 = margen por debajo del 10% de descuento real, para no
    -- rechazar por redondeos/promos. Subilo a 0.90 si querés más estricto.
    AND p_total > 0
    AND p_total >= public.precio_base_minimo(
          p_fecha,
          coalesce(p_nombre_cumpleanero, '') LIKE '🎓%'
        ) * 0.85

    -- Invariante robusto: un egresadito solo puede ser en Nov o Dic
    AND NOT (
          coalesce(p_nombre_cumpleanero, '') LIKE '🎓%'
          AND EXTRACT(MONTH FROM p_fecha) NOT IN (11, 12)
        )

    -- Seña coherente: seña normal (350000) o abonando totalidad (= total)
    AND p_sena >= 350000
    AND p_sena <= p_total

    -- Sanidad / anti-abuso (estos textos van a WhatsApp e invitación sin
    -- sanitizar)
    AND char_length(p_nombre) BETWEEN 2 AND 80
    AND p_telefono ~ '^[0-9+()\-\s]{8,20}$'
    AND (p_email IS NULL OR p_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
    AND char_length(coalesce(p_nombre_cumpleanero, '')) <= 120
    AND char_length(coalesce(p_edad_cumple, '')) <= 40
    AND char_length(coalesce(p_extras_elegidos, '')) <= 500
    AND char_length(coalesce(p_metodo_pago, '')) <= 80
$$;

-- --- Paso 3: policy de INSERT para anon ---------------------------------
DROP POLICY IF EXISTS "Permitir inserts para todos" ON public.reservas;
DROP POLICY IF EXISTS "anon insert reserva pendiente valida" ON public.reservas;

CREATE POLICY "anon insert reserva pendiente valida"
ON public.reservas
FOR INSERT
TO anon
WITH CHECK (
  public.reserva_insert_valida(
    estado, fecha, total, sena, nombre, telefono, email,
    nombre_cumpleanero, edad_cumple, extras_elegidos, metodo_pago
  )
);

-- --- Paso 4: policy de INSERT para authenticated ------------------------
-- APLICADA EN PRODUCCIÓN (2026-07-20), reemplazando una versión anterior
-- SIN validación ("authenticated insert libre", WITH CHECK (true)).
--
-- Por qué existe: NO porque el panel /admin cree reservas -- confirmado por
-- grep en todo el repo que app/admin/page.tsx solo hace SELECT/UPDATE/DELETE
-- sobre `reservas`, nunca INSERT. El único INSERT del repo es
-- components/resumen-reserva.tsx, compartido por /reservar y /egresaditos.
-- Ese código público corre bajo rol "authenticated" (en vez de "anon")
-- cuando el navegador tiene una sesión de Supabase Auth activa -- por
-- ejemplo, la admin logueada en /admin en OTRA pestaña del mismo navegador.
-- Síntoma para reconocerlo: warning "Multiple GoTrueClient instances
-- detected" en la consola del navegador, y el error "new row violates
-- row-level security policy for table reservas" con datos 100% válidos
-- (porque no existía NINGUNA policy de INSERT para authenticated).
--
-- Por eso esta policy NO es "confío en quien esté logueado, sin control" --
-- es el mismo formulario público, ejecutándose accidentalmente con otro
-- rol, y debe cumplir las mismas reglas anti-fraude que anon. Si en el
-- futuro el panel necesita un insert manual real (p. ej. "cargar reserva a
-- mano"), se decide en ese momento si esa reserva debe seguir estas mismas
-- reglas de negocio o si hace falta una policy nueva y explícita para ese
-- caso puntual -- no antes.
DROP POLICY IF EXISTS "authenticated insert libre" ON public.reservas;

CREATE POLICY "authenticated insert reserva pendiente valida"
ON public.reservas
FOR INSERT
TO authenticated
WITH CHECK (
  public.reserva_insert_valida(
    estado, fecha, total, sena, nombre, telefono, email,
    nombre_cumpleanero, edad_cumple, extras_elegidos, metodo_pago
  )
);


-- =====================================================================
--  PARTE 1 — Limitar qué COLUMNAS ve el rol anónimo
--  (RLS es por fila; las columnas se controlan con GRANT/REVOKE)
-- =====================================================================

-- --- OPCIÓN A (interina, SQL puro, NO rompe nada) ---------------------
-- APLICADA EN PRODUCCIÓN (2026-07-20). Verificado funcionando después del
-- cambio: calendario de disponibilidad, invitación digital
-- (/invitacion/[id]) y una reserva nueva de prueba — los tres OK.
-- Corta la exposición de teléfono, email, total, sena, metodo_pago,
-- nombre y estado. Calendario, returning del insert e invitación siguen
-- funcionando sin tocar código.
-- (Se dejó la policy "Lectura publica de calendario" USING(true) como
--  estaba: ahora es inofensiva porque las columnas quedan limitadas por
--  el GRANT.)
REVOKE SELECT ON public.reservas FROM anon;
GRANT SELECT (id, fecha, turno, nombre_cumpleanero, edad_cumple)
  ON public.reservas TO anon;

-- Límite de A: dejaba nombre_cumpleanero/edad_cumple leíbles en masa por anon.
-- SUPERADO por la Opción B (abajo): la invitación pasa a un RPC por token y el
-- GRANT de anon se aprieta a (id, fecha, turno). La línea GRANT de arriba queda
-- como registro histórico del paso interino.


-- --- OPCIÓN B (objetivo real "solo fecha/turno" + cierra C3) ----------
--  APLICADA EN PRODUCCIÓN (2026-07-20). Reemplaza el id secuencial de la URL de
--  invitación por un token uuid no adivinable, servido por funciones SECURITY
--  DEFINER. Va con cambio de código (app/admin/page.tsx + app/invitacion/[id]/
--  page.tsx). Migración de links viejos: coexistencia temporal por id hasta el
--  2026-12-13 (max(fecha) de las reservas al momento del corte).

--  B.1 — Bloque aditivo (no rompe nada): token + índice + RPCs.
-- ---------------------------------------------------------------------
ALTER TABLE public.reservas
  ADD COLUMN IF NOT EXISTS invitacion_token uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS reservas_invitacion_token_idx
  ON public.reservas (invitacion_token);

-- RPC por token (PERMANENTE) — sirve la invitación por token no adivinable
CREATE OR REPLACE FUNCTION public.get_invitacion(p_token uuid)
RETURNS TABLE (fecha date, turno text, nombre_cumpleanero text, edad_cumple text)
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT fecha, turno, nombre_cumpleanero, edad_cumple
  FROM public.reservas
  WHERE invitacion_token = p_token
$$;
REVOKE ALL ON FUNCTION public.get_invitacion(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_invitacion(uuid) TO anon, authenticated;

-- RPC por id (TEMPORAL, coexistencia) — mantiene vivos los links numéricos ya
-- compartidos por WhatsApp. BORRAR a partir del 2026-12-14 (pasada la última
-- fiesta con link viejo: max(fecha) = 2026-12-13). Ver CLEANUP más abajo.
CREATE OR REPLACE FUNCTION public.get_invitacion_by_id(p_id bigint)
RETURNS TABLE (fecha date, turno text, nombre_cumpleanero text, edad_cumple text)
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT fecha, turno, nombre_cumpleanero, edad_cumple
  FROM public.reservas
  WHERE id = p_id
$$;
REVOKE ALL ON FUNCTION public.get_invitacion_by_id(bigint) FROM public;
GRANT EXECUTE ON FUNCTION public.get_invitacion_by_id(bigint) TO anon, authenticated;

--  B.2 — Apretar el GRANT. Correr SOLO DESPUÉS de deployar el código nuevo
--        (que lee la invitación por los RPC de arriba). Si se corre antes,
--        /invitacion se rompe (el código viejo hace select directo de
--        nombre_cumpleanero). Cierra la cosecha masiva de nombres/edades.
-- ---------------------------------------------------------------------
REVOKE SELECT ON public.reservas FROM anon;
GRANT SELECT (id, fecha, turno) ON public.reservas TO anon;

--  CLEANUP (a partir del 2026-12-14): los links numéricos viejos ya no hacen falta.
--    DROP FUNCTION IF EXISTS public.get_invitacion_by_id(bigint);
--    + quitar la rama de id numérico en app/invitacion/[id]/page.tsx


-- =====================================================================
--  PARTE 3 — I1: anti doble-venta + expiración de pendientes abandonadas
--  APLICADA EN PRODUCCIÓN (2026-07-20).
--  ACTUALIZACIÓN 2026-07-22: el paso (3) de expiración automática fue
--  REVERTIDO a pedido de la clienta — el borrado de pendientes viejas es
--  manual desde el panel admin. Los pasos (0)-(2) siguen aplicados: son la
--  garantía anti doble-venta y NO deben tocarse.
-- =====================================================================

-- (0) Hygiene: el default era 'Pendiente' (mayúscula), nunca usado; la app
--     siempre manda 'pendiente'. Se alinea para evitar un footgun futuro.
ALTER TABLE public.reservas ALTER COLUMN estado SET DEFAULT 'pendiente';

-- (1) Slot canónico GENERADO desde `turno`. La DB lo calcula sola en insert Y
--     update (backfillea las filas existentes al crear la columna). La app NO lo
--     manda. Modelo: día doble-fijo = 2 slots (turno_1/turno_2); día flexible =
--     1 slot ('unico', exclusivo del día).
ALTER TABLE public.reservas
  ADD COLUMN IF NOT EXISTS slot text GENERATED ALWAYS AS (
    CASE
      WHEN turno LIKE '1er Turno%' THEN 'turno_1'
      WHEN turno LIKE '2do Turno%' THEN 'turno_2'
      ELSE 'unico'
    END
  ) STORED;

-- (2) Índice único PARCIAL: 1 reserva ACTIVA por (fecha, slot). Es la garantía
--     real contra la doble venta (race entre chequeo y confirmación). La
--     cláusula WHERE excluye 'expirado': hoy es letra muerta (ese estado ya no
--     se usa, ver abajo) pero es inocua, y dejarla evita recrear el índice en
--     producción sin necesidad.
CREATE UNIQUE INDEX IF NOT EXISTS reservas_fecha_slot_activa_uidx
  ON public.reservas (fecha, slot)
  WHERE estado IS DISTINCT FROM 'expirado';

-- (3) REVERTIDO (2026-07-22) — Expiración automática de pendientes (48 h).
--     La clienta prefiere decidir manualmente cuándo borrar una reserva vieja
--     desde el panel, igual que maneja sus finanzas. Se ejecutó:
--       SELECT cron.unschedule('expirar-reservas-pendientes');
--       UPDATE public.reservas SET estado = 'pendiente'
--         WHERE id = 109 AND estado = 'expirado';  -- única real afectada
--     La extensión pg_cron queda instalada (sin jobs). El estado 'expirado'
--     ya no lo produce nadie; el calendario de disponibilidad volvió a contar
--     todas las reservas de la fecha sin filtrar por estado.


-- =====================================================================
--  ROLLBACK (si algo legítimo queda bloqueado)
-- =====================================================================
-- Parte 1:
--   GRANT SELECT ON public.reservas TO anon;
-- Opción B (invitaciones por token):
--   DROP FUNCTION IF EXISTS public.get_invitacion(uuid);
--   DROP FUNCTION IF EXISTS public.get_invitacion_by_id(bigint);
--   ALTER TABLE public.reservas DROP COLUMN IF EXISTS invitacion_token;
--   (y revertir app/admin + app/invitacion al select directo por id)
-- Parte 2:
--   DROP POLICY IF EXISTS "anon insert reserva pendiente valida" ON public.reservas;
--   DROP POLICY IF EXISTS "authenticated insert reserva pendiente valida" ON public.reservas;
--   DROP FUNCTION IF EXISTS public.reserva_insert_valida(text, date, numeric, numeric, text, text, text, text, text, text, text);
--   CREATE POLICY "Permitir inserts para todos"
--     ON public.reservas FOR INSERT TO anon WITH CHECK (true);
--   CREATE POLICY "authenticated insert libre"
--     ON public.reservas FOR INSERT TO authenticated WITH CHECK (true);
-- Parte 3 (I1) — el cron ya fue des-schedulado el 2026-07-22; para revertir
-- lo que QUEDA aplicado (índice + slot):
--   DROP INDEX IF EXISTS public.reservas_fecha_slot_activa_uidx;
--   ALTER TABLE public.reservas DROP COLUMN IF EXISTS slot;


-- =====================================================================
--  NOTA — límite del piso por tipo (defensa en profundidad, no garantía)
-- ---------------------------------------------------------------------
--  El tipo de reserva lo declara el cliente (el 🎓 lo escribe la app). El
--  server no puede deducir "es egresadito" solo desde `fecha`, porque en
--  Nov/Dic conviven cumples (970k) y egresaditos (1.1M). Un atacante que
--  quiera subpagar un egresadito puede omitir el 🎓 y caer al piso de
--  cumpleaños. Contra a favor: sin el 🎓 la reserva se guarda/mostraría como
--  cumpleaños normal -> desajuste VISIBLE para la clienta al confirmar por
--  WhatsApp. Blindaje real (a futuro): columna `tipo` estructurada + validada
--  y extras guardados como números para validar el total exacto.
-- =====================================================================
