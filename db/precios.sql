-- =====================================================================
--  AL AGUA PATO — Precios editables desde /admin (ETAPA 1: solo base)
-- ---------------------------------------------------------------------
--  Aplicar MANUALMENTE en el SQL Editor de Supabase, en un solo bloque
--  (va todo dentro de BEGIN/COMMIT: si algo falla, no queda nada a medias).
--  Después correr la VERIFICACIÓN del pie.
--
--  Fuente de verdad de precios: tabla public.precios.
--  Reemplaza precio_base_minimo() y reserva_insert_valida() de
--  db/rls-reservas.sql (PARTE 2) por versiones que leen la tabla. Misma
--  firma -> las policies de INSERT de `reservas` no se tocan.
--  Con los valores cargados abajo el resultado es IDÉNTICO al actual.
-- =====================================================================

BEGIN;

-- --- 1. Tabla de precios ---------------------------------------------
CREATE TABLE IF NOT EXISTS public.precios (
  clave      text PRIMARY KEY,
  valor      numeric NOT NULL,
  tipo       text NOT NULL CHECK (tipo IN ('monto', 'porcentaje')),
  grupo      text NOT NULL CHECK (grupo IN ('turnos', 'egresaditos', 'extras', 'pagos')),
  etiqueta   text NOT NULL,
  orden      int  NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT precios_valor_entero   CHECK (valor = trunc(valor)),
  CONSTRAINT precios_monto_positivo CHECK (tipo <> 'monto' OR valor > 0),
  CONSTRAINT precios_pct_rango      CHECK (tipo <> 'porcentaje' OR valor BETWEEN 0 AND 50)
);

-- Valores = lib/config-reservas.ts al 2026-10-08. ON CONFLICT DO NOTHING:
-- re-correr este archivo NUNCA pisa precios ya editados por la admin.
-- (temporada_baja.fines_de_semana no se migra: el código nunca lo lee.)
INSERT INTO public.precios (clave, valor, tipo, grupo, etiqueta, orden) VALUES
  ('baja',             700000, 'monto', 'turnos',      'Temporada baja (1 abr – 31 ago) · todos los días',            10),
  ('media_lun_vie',   1050000, 'monto', 'turnos',      'Temporada media (1 sep – 14 dic) · lunes a viernes',          20),
  ('media_turno_1',    970000, 'monto', 'turnos',      'Temporada media · sáb/dom/feriados · Turno 1 (12:00–16:00)',  21),
  ('media_turno_2',   1050000, 'monto', 'turnos',      'Temporada media · sáb/dom/feriados · Turno 2 (18:30–22:30)',  22),
  ('alta_turno_1',     970000, 'monto', 'turnos',      'Temporada alta (15 dic – 31 mar) · Turno 1 (12:00–16:00)',    30),
  ('alta_turno_2',    1050000, 'monto', 'turnos',      'Temporada alta (15 dic – 31 mar) · Turno 2 (18:30–22:30)',    31),
  ('egre_nov_lun_vie',1100000, 'monto', 'egresaditos', 'Egresaditos 1 nov – 14 dic · lunes a viernes',                40),
  ('egre_nov_turno_1',1100000, 'monto', 'egresaditos', 'Egresaditos 1 nov – 14 dic · sáb/dom/feriados · Turno 1',     41),
  ('egre_nov_turno_2',1100000, 'monto', 'egresaditos', 'Egresaditos 1 nov – 14 dic · sáb/dom/feriados · Turno 2',     42),
  ('egre_dic_turno_1',1100000, 'monto', 'egresaditos', 'Egresaditos 15 – 31 dic · Turno 1',                           50),
  ('egre_dic_turno_2',1100000, 'monto', 'egresaditos', 'Egresaditos 15 – 31 dic · Turno 2',                           51),
  ('adulto_adicional',   7000, 'monto', 'extras',      'Adulto adicional (c/u)',                                      60),
  ('mozo_adicional',    40000, 'monto', 'extras',      'Mozo adicional (c/u)',                                        61),
  ('animacion',         90000, 'monto', 'extras',      'Animación',                                                   62),
  ('hora_extra',       300000, 'monto', 'extras',      'Hora extra',                                                  63),
  ('robot_led_1',      200000, 'monto', 'extras',      'Robot LED · 1 unidad',                                        64),
  ('robot_led_2',      350000, 'monto', 'extras',      'Robot LED · 2 unidades (precio total)',                       65),
  ('zancos_led',       200000, 'monto', 'extras',      'Zancos LED (c/u)',                                            66),
  ('personaje',        125000, 'monto', 'extras',      'Personaje (c/u)',                                             67),
  ('pileta',           250000, 'monto', 'extras',      'Acceso a la pileta (abr – ago)',                              68),
  ('sena',             350000, 'monto', 'pagos',       'Seña',                                                        80),
  ('descuento_efectivo_pct', 10, 'porcentaje', 'pagos', 'Descuento en efectivo pagando el total (%)',                 81),
  ('recargo_tarjeta_pct',     0, 'porcentaje', 'pagos', 'Recargo con tarjeta (%)',                                    82)
ON CONFLICT (clave) DO NOTHING;

-- --- 2. Permisos: lectura pública, escritura solo `valor` y solo authenticated
ALTER TABLE public.precios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "precios lectura publica" ON public.precios;
CREATE POLICY "precios lectura publica"
  ON public.precios FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "precios update authenticated" ON public.precios;
CREATE POLICY "precios update authenticated"
  ON public.precios FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Sin INSERT/DELETE para nadie de la app: las claves las define este archivo.
REVOKE ALL ON public.precios FROM anon, authenticated;
GRANT SELECT ON public.precios TO anon, authenticated;
GRANT UPDATE (valor) ON public.precios TO authenticated;

-- --- 3. Historial (lo llena un trigger; el cliente no puede escribirlo)
CREATE TABLE IF NOT EXISTS public.precios_historial (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clave          text NOT NULL REFERENCES public.precios (clave),
  valor_anterior numeric NOT NULL,
  valor_nuevo    numeric NOT NULL,
  usuario_id     uuid,
  usuario_email  text,
  cambiado_en    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS precios_historial_cambiado_en_idx
  ON public.precios_historial (cambiado_en DESC);

ALTER TABLE public.precios_historial ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "historial lectura admin" ON public.precios_historial;
CREATE POLICY "historial lectura admin"
  ON public.precios_historial FOR SELECT TO authenticated USING (true);
REVOKE ALL ON public.precios_historial FROM anon, authenticated;
GRANT SELECT ON public.precios_historial TO authenticated;

CREATE OR REPLACE FUNCTION public.precios_registrar_cambio()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  INSERT INTO public.precios_historial (clave, valor_anterior, valor_nuevo, usuario_id, usuario_email)
  VALUES (OLD.clave, OLD.valor, NEW.valor, auth.uid(), auth.jwt() ->> 'email');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS precios_historial_trg ON public.precios;
CREATE TRIGGER precios_historial_trg
  BEFORE UPDATE ON public.precios
  FOR EACH ROW WHEN (OLD.valor IS DISTINCT FROM NEW.valor)
  EXECUTE FUNCTION public.precios_registrar_cambio();

-- --- 4. Seña < turno más barato (constraint trigger, chequea el estado FINAL)
-- DEFERRED: si en una misma transacción se suben seña y turnos juntos, se
-- valida al final y no en un estado intermedio. Si la seña quedara >= a un
-- turno, TODAS las reservas sin pago total fallarían (sena <= total).
CREATE OR REPLACE FUNCTION public.precios_validar_sena()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_sena numeric;
  v_min  numeric;
BEGIN
  SELECT valor INTO v_sena FROM public.precios WHERE clave = 'sena';
  SELECT min(valor) INTO v_min FROM public.precios WHERE grupo IN ('turnos', 'egresaditos');
  IF v_sena >= v_min THEN
    RAISE EXCEPTION 'La seña (%) tiene que ser menor que el turno más barato (%).', v_sena, v_min
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS precios_sena_menor_turno ON public.precios;
CREATE CONSTRAINT TRIGGER precios_sena_menor_turno
  AFTER UPDATE ON public.precios
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION public.precios_validar_sena();

-- --- 5. Lectura de un precio: FALLA si la clave no existe (fail-closed;
--        importante porque LEAST() ignora NULLs y aprobaría en silencio)
CREATE OR REPLACE FUNCTION public.precio(p_clave text)
RETURNS numeric LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE v numeric;
BEGIN
  SELECT valor INTO v FROM public.precios WHERE clave = p_clave;
  IF v IS NULL THEN
    RAISE EXCEPTION 'Precio "%" no cargado en public.precios', p_clave;
  END IF;
  RETURN v;
END $$;
REVOKE ALL ON FUNCTION public.precio(text) FROM public;
GRANT EXECUTE ON FUNCTION public.precio(text) TO anon, authenticated;

-- --- 6. Piso de precio base: ahora lee la tabla (IMMUTABLE -> STABLE) --
-- Mínimo del régimen que aplica a la fecha. Con los valores actuales:
-- egresadito 1.1M · alta 970k · baja 700k · media 970k (= versión anterior).
CREATE OR REPLACE FUNCTION public.precio_base_minimo(p_fecha date, p_es_egresadito boolean)
RETURNS numeric LANGUAGE sql STABLE AS $$
  SELECT CASE
    WHEN p_es_egresadito
         AND EXTRACT(MONTH FROM p_fecha) = 12 AND EXTRACT(DAY FROM p_fecha) >= 15
      THEN LEAST(public.precio('egre_dic_turno_1'), public.precio('egre_dic_turno_2'))
    WHEN p_es_egresadito
      THEN LEAST(public.precio('egre_nov_lun_vie'), public.precio('egre_nov_turno_1'), public.precio('egre_nov_turno_2'))
    -- Cumpleaños: espeja determinarTemporada
    WHEN (EXTRACT(MONTH FROM p_fecha) = 12 AND EXTRACT(DAY FROM p_fecha) >= 15)
      OR EXTRACT(MONTH FROM p_fecha) BETWEEN 1 AND 3
      THEN LEAST(public.precio('alta_turno_1'), public.precio('alta_turno_2'))      -- alta
    WHEN EXTRACT(MONTH FROM p_fecha) BETWEEN 4 AND 8
      THEN public.precio('baja')                                                     -- baja
    ELSE LEAST(public.precio('media_lun_vie'), public.precio('media_turno_1'), public.precio('media_turno_2'))  -- media
  END;
$$;

-- --- 7. Validación del insert: misma firma, IMMUTABLE -> STABLE ---------
-- Únicos cambios vs rls-reservas.sql: factor del piso y seña mínima.
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
) RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT
    p_estado = 'pendiente'

    -- Piso de precio. Factor = LEAST(0.85, 0.95 - descuento%): con 10% da
    -- 0.85 (igual que antes); si la admin sube el descuento, el piso baja
    -- con él y no se rechazan pagos en efectivo legítimos. Nunca es más
    -- estricto que 0.85.
    AND p_total > 0
    AND p_total >= public.precio_base_minimo(
          p_fecha,
          coalesce(p_nombre_cumpleanero, '') LIKE '🎓%'
        ) * LEAST(0.85, 0.95 - public.precio('descuento_efectivo_pct') / 100.0)

    AND NOT (
          coalesce(p_nombre_cumpleanero, '') LIKE '🎓%'
          AND EXTRACT(MONTH FROM p_fecha) NOT IN (11, 12)
        )

    -- Seña coherente: seña vigente (tabla) o abonando totalidad (= total)
    AND p_sena >= public.precio('sena')
    AND p_sena <= p_total

    AND char_length(p_nombre) BETWEEN 2 AND 80
    AND p_telefono ~ '^[0-9+()\-\s]{8,20}$'
    AND (p_email IS NULL OR p_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
    AND char_length(coalesce(p_nombre_cumpleanero, '')) <= 120
    AND char_length(coalesce(p_edad_cumple, '')) <= 40
    AND char_length(coalesce(p_extras_elegidos, '')) <= 500
    AND char_length(coalesce(p_metodo_pago, '')) <= 80
$$;

-- --- 8. RPC para el panel (etapa 3): todo o nada + control de concurrencia
-- p_cambios = [{"clave":"animacion","valor_anterior":90000,"valor_nuevo":95000}, ...]
-- Si el valor actual no es el que la admin vio (otra pestaña lo cambió),
-- aborta TODO. Las validaciones de valores las hacen los CHECK y el trigger.
CREATE OR REPLACE FUNCTION public.actualizar_precios(p_cambios jsonb)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  c jsonb;
  n int;
BEGIN
  IF jsonb_typeof(p_cambios) <> 'array' OR jsonb_array_length(p_cambios) = 0 THEN
    RAISE EXCEPTION 'No hay cambios para guardar.';
  END IF;

  FOR c IN SELECT * FROM jsonb_array_elements(p_cambios) LOOP
    UPDATE public.precios
       SET valor = (c ->> 'valor_nuevo')::numeric
     WHERE clave = c ->> 'clave'
       AND valor = (c ->> 'valor_anterior')::numeric;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN
      RAISE EXCEPTION 'El precio "%" cambió mientras editabas. Recargá la pantalla.', c ->> 'clave';
    END IF;
  END LOOP;

  -- Dispara ya el chequeo diferido de la seña, para que el error vuelva
  -- en la respuesta de la RPC y no al COMMIT.
  SET CONSTRAINTS public.precios_sena_menor_turno IMMEDIATE;
END $$;
REVOKE ALL ON FUNCTION public.actualizar_precios(jsonb) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.actualizar_precios(jsonb) TO authenticated;

COMMIT;


-- =====================================================================
--  VERIFICACIÓN (correr después del COMMIT; no toca datos reales)
-- =====================================================================
-- a) 23 filas
--   SELECT count(*) FROM public.precios;                       -- 23
-- b) Piso idéntico al anterior (todas true)
--   SELECT public.precio_base_minimo('2026-06-10', false) = 700000  AS baja,
--          public.precio_base_minimo('2026-01-15', false) = 970000  AS alta,
--          public.precio_base_minimo('2026-09-16', false) = 970000  AS media,
--          public.precio_base_minimo('2026-11-05', true)  = 1100000 AS egre_nov,
--          public.precio_base_minimo('2026-12-20', true)  = 1100000 AS egre_dic;
-- c) Validación de insert (esperado: true, true, true, false)
--   SELECT
--     public.reserva_insert_valida('pendiente','2026-06-10',804000,350000,'María Gómez','3843123456','maria@email.com','Lucas','5','Ninguno','Transferencia') AS normal,
--     public.reserva_insert_valida('pendiente','2026-06-10',723600,723600,'María Gómez','3843123456','maria@email.com','Lucas','5','Ninguno','Efectivo (Abonando Totalidad)') AS efectivo_total,
--     public.reserva_insert_valida('pendiente','2026-11-05',1100000,350000,'María Gómez','3843123456',NULL,'🎓 Jardín X - Sala: 5','Turno: Mañana','Ninguno','Transferencia') AS egresadito,
--     public.reserva_insert_valida('pendiente','2026-06-10',804000,349999,'María Gómez','3843123456','maria@email.com','Lucas','5','Ninguno','Transferencia') AS sena_baja;
-- d) El trigger frena una seña >= turno (debe mostrar NOTICE "OK", y no
--    deja nada guardado ni en precios ni en el historial)
--   DO $$
--   BEGIN
--     SET CONSTRAINTS public.precios_sena_menor_turno IMMEDIATE;
--     UPDATE public.precios SET valor = 700000 WHERE clave = 'sena';
--     RAISE EXCEPTION 'FALLO: el trigger no frenó la seña inválida';
--   EXCEPTION WHEN check_violation THEN
--     RAISE NOTICE 'OK: %', SQLERRM;
--   END $$;
--   SELECT count(*) FROM public.precios_historial;   -- 0
-- e) Hacer una reserva real de prueba desde la web y borrarla desde /admin.


-- =====================================================================
--  ROLLBACK (vuelve exactamente al estado anterior)
-- =====================================================================
--   BEGIN;
--   -- 1) Restaurar las funciones hardcodeadas (copia de rls-reservas.sql PARTE 2)
--   CREATE OR REPLACE FUNCTION public.precio_base_minimo(p_fecha date, p_es_egresadito boolean)
--   RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
--     SELECT CASE
--       WHEN p_es_egresadito THEN 1100000
--       WHEN (EXTRACT(MONTH FROM p_fecha) = 12 AND EXTRACT(DAY FROM p_fecha) >= 15)
--         OR EXTRACT(MONTH FROM p_fecha) BETWEEN 1 AND 3 THEN 970000
--       WHEN EXTRACT(MONTH FROM p_fecha) BETWEEN 4 AND 8 THEN 700000
--       ELSE 970000
--     END;
--   $$;
--   -- + reserva_insert_valida: pegar el Paso 2 de rls-reservas.sql tal cual
--   --   (IMMUTABLE, "* 0.85", "p_sena >= 350000").
--   -- 2) Sacar lo nuevo
--   DROP FUNCTION IF EXISTS public.actualizar_precios(jsonb);
--   DROP FUNCTION IF EXISTS public.precio(text);
--   DROP TABLE IF EXISTS public.precios_historial;
--   DROP TABLE IF EXISTS public.precios;   -- arrastra los triggers
--   DROP FUNCTION IF EXISTS public.precios_registrar_cambio();
--   DROP FUNCTION IF EXISTS public.precios_validar_sena();
--   COMMIT;
