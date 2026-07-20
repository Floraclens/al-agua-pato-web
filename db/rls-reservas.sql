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
--  Validación de precio + estado + sanidad en el INSERT anónimo.
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

-- --- Paso 2: policy de INSERT con validación ---------------------------
DROP POLICY IF EXISTS "Permitir inserts para todos" ON public.reservas;

CREATE POLICY "anon insert reserva pendiente valida"
ON public.reservas
FOR INSERT
TO anon
WITH CHECK (
  -- anon solo puede crear reservas PENDIENTES (no auto-confirmarse)
  estado = 'pendiente'

  -- Piso de precio según el tipo de reserva.
  -- El 🎓 al inicio de nombre_cumpleanero marca "egresadito" (lo escribe la app,
  -- components/resumen-reserva.tsx). Emoji exacto: U+1F393 (F0 9F 8E 93), sin
  -- selector de variación. OJO: es señal client-controlled -> defensa en
  -- profundidad, no garantía (ver comentario al pie).
  -- Factor 0.85 = margen por debajo del 10% de descuento real, para no
  -- rechazar por redondeos/promos. Subilo a 0.90 si querés más estricto.
  AND total > 0
  AND total >= public.precio_base_minimo(
        fecha,
        coalesce(nombre_cumpleanero, '') LIKE '🎓%'
      ) * 0.85

  -- Invariante robusto: un egresadito solo puede ser en Nov o Dic
  AND NOT (
        coalesce(nombre_cumpleanero, '') LIKE '🎓%'
        AND EXTRACT(MONTH FROM fecha) NOT IN (11, 12)
      )

  -- Seña coherente: seña normal (350000) o abonando totalidad (= total)
  AND sena >= 350000
  AND sena <= total

  -- Sanidad / anti-abuso (estos textos van a WhatsApp e invitación sin sanitizar)
  AND char_length(nombre) BETWEEN 2 AND 80
  AND telefono ~ '^[0-9+()\-\s]{8,20}$'
  AND (email IS NULL OR email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
  AND char_length(coalesce(nombre_cumpleanero, '')) <= 120
  AND char_length(coalesce(edad_cumple, '')) <= 40
  AND char_length(coalesce(extras_elegidos, '')) <= 500
  AND char_length(coalesce(metodo_pago, '')) <= 80
);

-- (Opcional) Si la admin alguna vez inserta reservas a mano desde el panel,
-- descomentá esto para que el rol autenticado no quede atado al piso estricto:
-- CREATE POLICY "authenticated insert libre"
-- ON public.reservas FOR INSERT TO authenticated WITH CHECK (true);


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
--   CREATE POLICY "Permitir inserts para todos"
--     ON public.reservas FOR INSERT TO anon WITH CHECK (true);


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
