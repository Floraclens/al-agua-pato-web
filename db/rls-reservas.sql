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
-- Corta la exposición de teléfono, email, total, sena, metodo_pago,
-- nombre y estado. Calendario, returning del insert e invitación siguen
-- funcionando sin tocar código.
-- (Dejá la policy "Lectura publica de calendario" USING(true) como está:
--  ahora es inofensiva porque las columnas quedan limitadas por el GRANT.)
REVOKE SELECT ON public.reservas FROM anon;
GRANT SELECT (id, fecha, turno, nombre_cumpleanero, edad_cumple)
  ON public.reservas TO anon;

-- Límite de A: todavía deja nombre_cumpleanero/edad_cumple (nombre y edad de
-- los chicos) leíbles en masa por anon, porque la invitación los necesita.
-- Es una mejora fuerte, pero NO es "solo fecha/turno". Para eso -> Opción B.


-- --- OPCIÓN B (objetivo real "solo fecha/turno" + cierra C3) ----------
--  REQUIERE CAMBIO DE CÓDIGO. Se hace en dos sub-pasos.

--  B.1 — SEGURO de correr ya (no rompe nada): token + función de invitación.
--        Agrega un token no adivinable y una función que devuelve SOLO los
--        campos de la invitación, por token (reemplaza al id secuencial).
-- ---------------------------------------------------------------------
-- ALTER TABLE public.reservas
--   ADD COLUMN IF NOT EXISTS invitacion_token uuid NOT NULL DEFAULT gen_random_uuid();
-- CREATE UNIQUE INDEX IF NOT EXISTS reservas_invitacion_token_idx
--   ON public.reservas (invitacion_token);
--
-- CREATE OR REPLACE FUNCTION public.get_invitacion(p_token uuid)
-- RETURNS TABLE (fecha date, turno text, nombre_cumpleanero text, edad_cumple text)
-- LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
-- AS $$
--   SELECT fecha, turno, nombre_cumpleanero, edad_cumple
--   FROM public.reservas
--   WHERE invitacion_token = p_token
-- $$;
-- REVOKE ALL ON FUNCTION public.get_invitacion(uuid) FROM public;
-- GRANT EXECUTE ON FUNCTION public.get_invitacion(uuid) TO anon, authenticated;

--  B.2 — Correr SOLO DESPUÉS de actualizar el código:
--        * /admin arma la URL con invitacion_token en vez de reserva.id
--        * /invitacion/[id] usa supabase.rpc('get_invitacion', { p_token })
--        Recién ahí se aprieta anon a solo fecha/turno (+id para el returning).
--        Si corrés esto antes del cambio de código, /invitacion se ROMPE.
-- ---------------------------------------------------------------------
-- REVOKE SELECT ON public.reservas FROM anon;
-- GRANT SELECT (id, fecha, turno) ON public.reservas TO anon;


-- =====================================================================
--  ROLLBACK (si algo legítimo queda bloqueado)
-- =====================================================================
-- Parte 1:
--   GRANT SELECT ON public.reservas TO anon;
-- Parte 2:
--   DROP POLICY IF EXISTS "anon insert reserva pendiente valida" ON public.reservas;
--   DROP POLICY IF EXISTS "authenticated insert reserva pendiente valida" ON public.reservas;
--   DROP FUNCTION IF EXISTS public.reserva_insert_valida(text, date, numeric, numeric, text, text, text, text, text, text, text);
--   CREATE POLICY "Permitir inserts para todos"
--     ON public.reservas FOR INSERT TO anon WITH CHECK (true);
--   CREATE POLICY "authenticated insert libre"
--     ON public.reservas FOR INSERT TO authenticated WITH CHECK (true);


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
