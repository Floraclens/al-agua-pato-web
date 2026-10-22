-- =====================================================================
--  AL AGUA PATO — P1 #13 (Splinter / Security Advisor), 22/10/2026
-- ---------------------------------------------------------------------
--  Aplicar MANUALMENTE en el SQL Editor de Supabase, en un solo bloque
--  (BEGIN/COMMIT: si algo falla, no queda nada a medias).
--  Reversa lista para pegar: db/p1-13-splinter-reversa.sql
--
--  Qué cambia:
--   1. Lista de admins (private.admins) + chequeo private.es_admin().
--      Schema `private`: NO expuesto por la API (PostgREST expone public y
--      graphql_public), así la función no se puede llamar como RPC y no
--      suma avisos del linter.
--   2. Las 3 políticas «always true» (reservas UPDATE/DELETE, precios
--      UPDATE) pasan a exigir es_admin().
--   3. precios_registrar_cambio (trigger): sin EXECUTE para nadie de la API.
--   4. search_path fijo en obtener_turnos_ocupados, reserva_insert_valida y
--      precio_base_minimo (mismo resultado).
--   5. obtener_turnos_ocupados pasa a SECURITY INVOKER (mismo resultado:
--      anon ya puede leer fecha/turno). La app no la usa.
--   6. anon pierde en `reservas` permisos que no usa (UPDATE, DELETE,
--      TRUNCATE, REFERENCES, TRIGGER, MAINTAIN). Conserva INSERT (formulario)
--      y SELECT (id, fecha, turno) (calendario).
--   7. get_invitacion_by_id (temporal, links numéricos viejos) solo responde
--      para fiestas de hoy en adelante (hora de Argentina). Se borra igual
--      desde el 14/12/2026.
--
--  Regla de permisos (nota 1 del método): todo objeto nuevo arranca con
--  REVOKE ALL de public, anon y authenticated ANTES de cualquier GRANT.
-- =====================================================================

BEGIN;

-- --- 1. Schema privado ---------------------------------------------------
CREATE SCHEMA private;
REVOKE ALL ON SCHEMA private FROM public, anon, authenticated;
-- USAGE solo para authenticated: lo necesitan las políticas al evaluar
-- private.es_admin(). Sin esto, la clienta no podría editar reservas.
GRANT USAGE ON SCHEMA private TO authenticated;

-- --- 2. Tabla de admins: RLS activo, sin políticas, sin grants -----------
CREATE TABLE private.admins (
  user_id    uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  creado_en  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE private.admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.admins FROM public, anon, authenticated;
-- (sin GRANT y sin políticas: nadie la lee ni la escribe por la API)

-- Las 2 cuentas del panel. Sin escribir los mails en el repo: son todas
-- las de @alaguapato.com, y se exige que sean exactamente 2.
INSERT INTO private.admins (user_id)
SELECT id FROM auth.users WHERE email LIKE '%@alaguapato.com';

DO $$
BEGIN
  IF (SELECT count(*) FROM private.admins) <> 2 THEN
    RAISE EXCEPTION 'Se esperaban 2 admins y hay %', (SELECT count(*) FROM private.admins);
  END IF;
END $$;

-- --- 3. Chequeo de admin ------------------------------------------------
-- SECURITY DEFINER porque authenticated no puede leer la tabla.
-- search_path vacío: todo va con su schema escrito.
CREATE FUNCTION private.es_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM private.admins WHERE user_id = (SELECT auth.uid())
  )
$$;
REVOKE ALL ON FUNCTION private.es_admin() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.es_admin() TO authenticated;

-- --- 4. Políticas «a admin» que chequean de verdad ----------------------
-- (SELECT ...) alrededor: Postgres la evalúa una vez por consulta, no por fila.
ALTER POLICY "Permitir actualizar reservas a admin" ON public.reservas
  USING ((SELECT private.es_admin()))
  WITH CHECK ((SELECT private.es_admin()));

ALTER POLICY "Permitir eliminar reservas a admin" ON public.reservas
  USING ((SELECT private.es_admin()));

ALTER POLICY "precios update authenticated" ON public.precios
  USING ((SELECT private.es_admin()))
  WITH CHECK ((SELECT private.es_admin()));

-- --- 5. Trigger del historial de precios: nadie lo llama por la API -----
-- Postgres no chequea EXECUTE al disparar un trigger, solo al crearlo.
REVOKE ALL ON FUNCTION public.precios_registrar_cambio() FROM public, anon, authenticated;

-- --- 6. search_path fijo (todas sus referencias ya llevan schema) -------
ALTER FUNCTION public.precio_base_minimo(date, boolean) SET search_path = '';
ALTER FUNCTION public.reserva_insert_valida(text, date, numeric, numeric, text, text, text, text, text, text, text)
  SET search_path = '';

-- --- 7. obtener_turnos_ocupados: invoker + search_path fijo -------------
-- Mismo resultado. Conserva sus permisos actuales (CREATE OR REPLACE no los toca).
CREATE OR REPLACE FUNCTION public.obtener_turnos_ocupados(fecha_busqueda date)
RETURNS TABLE(turno text)
LANGUAGE sql SECURITY INVOKER SET search_path = ''
AS $function$
SELECT turno FROM public.reservas WHERE fecha = fecha_busqueda;
$function$;

-- --- 8. anon: fuera los permisos que no usa en reservas ----------------
REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
  ON public.reservas FROM anon;

-- --- 9. Invitación por id (temporal): solo fiestas de hoy en adelante ---
CREATE OR REPLACE FUNCTION public.get_invitacion_by_id(p_id bigint)
RETURNS TABLE (fecha date, turno text, nombre_cumpleanero text, edad_cumple text, hora_extra boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT fecha, turno, nombre_cumpleanero, edad_cumple,
         COALESCE(extras_elegidos ILIKE '%Hora Extra%', false) AS hora_extra
  FROM public.reservas
  WHERE id = p_id
    AND fecha >= (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date
$$;

-- --- 10. (agregado 22/10, después del linter) Regla explícita «nadie» --------
-- Sin esto el linter marca «RLS Enabled No Policy» en private.admins. No cambia
-- nada: la tabla sigue sin permisos para anon/authenticated, y es_admin() la lee
-- como dueña (postgres), que no pasa por RLS.
CREATE POLICY "nadie por la API" ON private.admins
  AS PERMISSIVE FOR ALL TO public USING (false) WITH CHECK (false);

COMMIT;


-- =====================================================================
--  PERMISOS REALES (correr después del COMMIT; solo lectura)
-- =====================================================================
--   SELECT 'tabla private.admins' AS objeto,
--          'rls=' || c.relrowsecurity || ' acl=' || coalesce(c.relacl::text, '(null)')
--          || ' politicas=' || (SELECT count(*) FROM pg_policies WHERE schemaname='private') AS detalle
--   FROM pg_class c WHERE c.oid = 'private.admins'::regclass
--   UNION ALL
--   SELECT 'funcion private.es_admin()',
--          'secdef=' || p.prosecdef || ' cfg=' || coalesce(array_to_string(p.proconfig, ';'), 'NINGUNO')
--          || ' acl=' || coalesce(p.proacl::text, '(null)')
--   FROM pg_proc p WHERE p.oid = 'private.es_admin()'::regprocedure
--   UNION ALL
--   SELECT 'schema private', coalesce(n.nspacl::text, '(null)') FROM pg_namespace n WHERE n.nspname = 'private'
--   UNION ALL
--   SELECT 'admins cargados', count(*)::text FROM private.admins;
--   UNION ALL
--   SELECT 'quedan permisos que se sacaron (todo false)',
--          has_table_privilege('anon','public.reservas','UPDATE') || ',' ||
--          has_table_privilege('anon','public.reservas','DELETE') || ',' ||
--          has_table_privilege('anon','public.reservas','TRUNCATE') || ',' ||
--          has_function_privilege('anon','public.precios_registrar_cambio()','EXECUTE') || ',' ||
--          has_function_privilege('authenticated','public.precios_registrar_cambio()','EXECUTE') || ',' ||
--          has_function_privilege('anon','private.es_admin()','EXECUTE')
--   UNION ALL
--   SELECT 'search_path ' || p.proname, coalesce(array_to_string(p.proconfig, ';'), 'NINGUNO') || ' secdef=' || p.prosecdef
--   FROM pg_proc p WHERE p.pronamespace = 'public'::regnamespace
--     AND p.proname IN ('obtener_turnos_ocupados','reserva_insert_valida','precio_base_minimo');


-- =====================================================================
--  PRUEBAS (no guardan nada: terminan en un error a propósito y todo se
--  deshace). La reserva de prueba es en 2099 y nunca llega a existir.
-- =====================================================================
--   DO $$
--   DECLARE
--     v_id bigint; v_id2 bigint; v_admin uuid; v_vieja bigint; n int; r text := '';
--     v_total numeric; v_sena numeric;
--   BEGIN
--     SELECT user_id INTO v_admin FROM private.admins LIMIT 1;
--     -- una fiesta que ya pasó: de prueba (la base no guarda fiestas viejas)
--     INSERT INTO public.reservas (fecha, turno, metodo_pago, total, sena, extras_elegidos, nombre, telefono, estado)
--     VALUES ('2000-01-04', '1er Turno (12:00 - 16:00)', 'Transferencia', 1000000, 350000, 'Ninguno', 'PRUEBA P1-13 VIEJA', '3843000000', 'pendiente')
--     RETURNING id INTO v_vieja;
--     -- montos válidos con los precios que haya HOY (por si la admin los cambió)
--     SELECT max(valor) * 2 INTO v_total FROM public.precios WHERE grupo = 'turnos';
--     v_sena := public.precio('sena');
--
--     -- a) visitante (anon): reserva por el formulario, calendario, invitación
--     SET LOCAL ROLE anon;
--     INSERT INTO public.reservas (fecha, turno, metodo_pago, total, sena, extras_elegidos, nombre, telefono, estado)
--     VALUES ('2099-01-04', '1er Turno (12:00 - 16:00)', 'Transferencia', v_total, v_sena, 'Ninguno', 'PRUEBA P1-13', '3843000000', 'pendiente')
--     RETURNING id INTO v_id;
--     r := r || ' anon_insert=ok';
--     r := r || ' anon_turnos=' || (SELECT count(*) FROM public.obtener_turnos_ocupados('2099-01-04'));
--     r := r || ' anon_calendario=' || (SELECT count(*) FROM public.reservas WHERE fecha = '2099-01-04');
--     r := r || ' anon_invitacion_futura=' || (SELECT count(*) FROM public.get_invitacion_by_id(v_id));
--     r := r || ' anon_invitacion_pasada=' || (SELECT count(*) FROM public.get_invitacion_by_id(v_vieja));
--     BEGIN
--       UPDATE public.reservas SET estado = 'senado' WHERE id = v_id; r := r || ' anon_update=PERMITIDO';
--     EXCEPTION WHEN insufficient_privilege THEN r := r || ' anon_update=denegado';
--     END;
--     RESET ROLE;
--
--     -- b) usuario con sesión que NO es admin: puede reservar por el formulario
--     --    (caso «admin logueada en otra pestaña»), pero no modificar ni borrar
--     PERFORM set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid(), 'role', 'authenticated')::text, true);
--     SET LOCAL ROLE authenticated;
--     INSERT INTO public.reservas (fecha, turno, metodo_pago, total, sena, extras_elegidos, nombre, telefono, estado)
--     VALUES ('2099-01-04', '2do Turno (18:30 - 22:30)', 'Transferencia', v_total, v_sena, 'Ninguno', 'PRUEBA P1-13 B', '3843000000', 'pendiente')
--     RETURNING id INTO v_id2;
--     r := r || ' noadmin_insert=ok';
--     UPDATE public.reservas SET estado = 'senado' WHERE id = v_id;      GET DIAGNOSTICS n = ROW_COUNT; r := r || ' noadmin_update=' || n;
--     DELETE FROM public.reservas WHERE id = v_id;                       GET DIAGNOSTICS n = ROW_COUNT; r := r || ' noadmin_delete=' || n;
--     UPDATE public.precios SET valor = valor WHERE clave = 'animacion'; GET DIAGNOSTICS n = ROW_COUNT; r := r || ' noadmin_precio=' || n;
--     RESET ROLE;
--
--     -- c) admin: sí puede (y el historial de precios se sigue llenando)
--     PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
--     SET LOCAL ROLE authenticated;
--     UPDATE public.reservas SET estado = 'senado' WHERE id = v_id;             GET DIAGNOSTICS n = ROW_COUNT; r := r || ' admin_update=' || n;
--     UPDATE public.precios SET valor = valor + 1000 WHERE clave = 'animacion'; GET DIAGNOSTICS n = ROW_COUNT; r := r || ' admin_precio=' || n;
--     DELETE FROM public.reservas WHERE id IN (v_id, v_id2);                    GET DIAGNOSTICS n = ROW_COUNT; r := r || ' admin_delete=' || n;
--     RESET ROLE;
--     r := r || ' historial_trigger=' || (SELECT count(*) FROM public.precios_historial WHERE clave = 'animacion' AND usuario_id = v_admin AND cambiado_en = now());
--
--     RAISE EXCEPTION 'RESULTADO (se deshace todo):%', r;
--   END $$;
--   Esperado: anon_insert=ok anon_turnos=1 anon_calendario=1
--             anon_invitacion_futura=1 anon_invitacion_pasada=0 anon_update=denegado
--             noadmin_insert=ok noadmin_update=0 noadmin_delete=0 noadmin_precio=0
--             admin_update=1 admin_precio=1 admin_delete=2 historial_trigger=1
--   Los números de reserva que usa la prueba se saltean (el contador no vuelve atrás).
