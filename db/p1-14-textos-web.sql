-- =====================================================================
--  AL AGUA PATO — P1 #14 de la propuesta: textos editables (23/10/2026)
-- ---------------------------------------------------------------------
--  Aplicar MANUALMENTE en el SQL Editor de Supabase, en un solo bloque
--  (BEGIN/COMMIT: si algo falla, no queda nada a medias).
--  Reversa lista para pegar: db/p1-14-textos-web-reversa.sql
--
--  Qué cambia:
--   1. Tabla nueva public.textos_web (clave, texto): textos cortos de la
--      web que edita la admin desde /admin. Hoy una sola fila: «tarjeta»
--      (lo que dice la opción Tarjeta en el método de pago).
--   2. Lectura pública; UPDATE solo de la columna `texto` y solo para
--      admins (private.es_admin(), de la P1 #13). Sin INSERT ni DELETE
--      desde la app: las claves las define este archivo.
--
--  No toca reservas ni precios. La web funciona con o sin esta tabla: si
--  no existe, la opción Tarjeta dice «Solo tarjetas bancarizadas».
--
--  Regla de permisos (nota 1 del método): todo objeto nuevo arranca con
--  REVOKE ALL de public, anon y authenticated ANTES de cualquier GRANT.
-- =====================================================================

BEGIN;

-- --- 1. Tabla -------------------------------------------------------------
CREATE TABLE public.textos_web (
  clave      text PRIMARY KEY,
  texto      text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT textos_web_largo CHECK (char_length(btrim(texto)) BETWEEN 1 AND 300)
);

INSERT INTO public.textos_web (clave, texto) VALUES
  ('tarjeta', 'Solo tarjetas bancarizadas');

-- --- 2. Permisos ------------------------------------------------------------
ALTER TABLE public.textos_web ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.textos_web FROM public, anon, authenticated;
GRANT SELECT ON public.textos_web TO anon, authenticated;
GRANT UPDATE (texto) ON public.textos_web TO authenticated;

CREATE POLICY "textos_web lectura publica"
  ON public.textos_web FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "textos_web update admin"
  ON public.textos_web FOR UPDATE TO authenticated
  USING ((SELECT private.es_admin()))
  WITH CHECK ((SELECT private.es_admin()));

-- --- 3. updated_at al editar -------------------------------------------------
CREATE FUNCTION public.textos_web_tocar()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.textos_web_tocar() FROM public, anon, authenticated;

CREATE TRIGGER textos_web_tocar_trg
  BEFORE UPDATE ON public.textos_web
  FOR EACH ROW EXECUTE FUNCTION public.textos_web_tocar();

COMMIT;


-- =====================================================================
--  VERIFICACIÓN (después del COMMIT; solo lee)
-- =====================================================================
--   SELECT clave, texto FROM public.textos_web;          -- 1 fila: tarjeta
--   SELECT relrowsecurity FROM pg_class WHERE oid = 'public.textos_web'::regclass;  -- true
--   SELECT has_table_privilege('anon', 'public.textos_web', 'UPDATE'),          -- false
--          has_column_privilege('authenticated', 'public.textos_web', 'texto', 'UPDATE'),  -- true
--          has_column_privilege('authenticated', 'public.textos_web', 'clave', 'UPDATE'),  -- false
--          has_table_privilege('authenticated', 'public.textos_web', 'INSERT');        -- false


-- =====================================================================
--  PRUEBAS (no guardan nada: terminan en un error a propósito y todo se
--  deshace). No usan reservas.
-- =====================================================================
--   DO $$
--   DECLARE
--     v_admin uuid; n int; r text := '';
--   BEGIN
--     SELECT user_id INTO v_admin FROM private.admins LIMIT 1;
--
--     -- a) visitante (anon): lee, no edita
--     SET LOCAL ROLE anon;
--     r := r || ' anon_lee=' || (SELECT count(*) FROM public.textos_web WHERE clave = 'tarjeta');
--     BEGIN
--       UPDATE public.textos_web SET texto = 'X' WHERE clave = 'tarjeta'; r := r || ' anon_update=PERMITIDO';
--     EXCEPTION WHEN insufficient_privilege THEN r := r || ' anon_update=denegado';
--     END;
--     RESET ROLE;
--
--     -- b) con sesión pero NO admin: no edita
--     PERFORM set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid(), 'role', 'authenticated')::text, true);
--     SET LOCAL ROLE authenticated;
--     UPDATE public.textos_web SET texto = 'X' WHERE clave = 'tarjeta'; GET DIAGNOSTICS n = ROW_COUNT; r := r || ' noadmin_update=' || n;
--     RESET ROLE;
--
--     -- c) admin: edita; texto vacío rechazado; INSERT denegado
--     PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
--     SET LOCAL ROLE authenticated;
--     UPDATE public.textos_web SET texto = 'Prueba' WHERE clave = 'tarjeta'; GET DIAGNOSTICS n = ROW_COUNT; r := r || ' admin_update=' || n;
--     BEGIN
--       UPDATE public.textos_web SET texto = '   ' WHERE clave = 'tarjeta'; r := r || ' vacio=PERMITIDO';
--     EXCEPTION WHEN check_violation THEN r := r || ' vacio=rechazado';
--     END;
--     BEGIN
--       INSERT INTO public.textos_web (clave, texto) VALUES ('otra', 'x'); r := r || ' admin_insert=PERMITIDO';
--     EXCEPTION WHEN insufficient_privilege THEN r := r || ' admin_insert=denegado';
--     END;
--     RESET ROLE;
--
--     RAISE EXCEPTION 'RESULTADO (se deshace todo):%', r;
--   END $$;
--   Esperado: anon_lee=1 anon_update=denegado noadmin_update=0
--             admin_update=1 vacio=rechazado admin_insert=denegado
