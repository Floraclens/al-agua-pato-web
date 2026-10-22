-- =====================================================================
--  AL AGUA PATO — REVERSA de db/p1-13-splinter.sql (P1 #13, 22/10/2026)
-- ---------------------------------------------------------------------
--  Deja la base como estaba el 22/10/2026 antes del cambio (leído en
--  producción ese día). Pegar entero en el SQL Editor. Un solo bloque.
--  No toca datos de reservas ni de precios.
-- =====================================================================

BEGIN;

-- 9. Invitación por id: vuelve a responder para cualquier fecha
CREATE OR REPLACE FUNCTION public.get_invitacion_by_id(p_id bigint)
RETURNS TABLE (fecha date, turno text, nombre_cumpleanero text, edad_cumple text, hora_extra boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT fecha, turno, nombre_cumpleanero, edad_cumple,
         COALESCE(extras_elegidos ILIKE '%Hora Extra%', false) AS hora_extra
  FROM public.reservas
  WHERE id = p_id
$$;

-- 8. anon recupera sus permisos de antes en reservas
GRANT UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
  ON public.reservas TO anon;

-- 7. obtener_turnos_ocupados como estaba (definer, sin search_path)
CREATE OR REPLACE FUNCTION public.obtener_turnos_ocupados(fecha_busqueda date)
RETURNS TABLE(turno text)
LANGUAGE sql SECURITY DEFINER
AS $function$
SELECT turno FROM reservas WHERE fecha = fecha_busqueda;
$function$;
ALTER FUNCTION public.obtener_turnos_ocupados(date) RESET search_path;

-- 6. search_path sin fijar
ALTER FUNCTION public.precio_base_minimo(date, boolean) RESET search_path;
ALTER FUNCTION public.reserva_insert_valida(text, date, numeric, numeric, text, text, text, text, text, text, text)
  RESET search_path;

-- 5. Trigger del historial: EXECUTE para todos, como venía por defecto
GRANT EXECUTE ON FUNCTION public.precios_registrar_cambio() TO public;

-- 4. Políticas como estaban (true). Las de reservas no tenían WITH CHECK:
--    se recrean para dejarlo exactamente igual.
DROP POLICY "Permitir actualizar reservas a admin" ON public.reservas;
CREATE POLICY "Permitir actualizar reservas a admin" ON public.reservas
  AS PERMISSIVE FOR UPDATE TO authenticated USING (true);

DROP POLICY "Permitir eliminar reservas a admin" ON public.reservas;
CREATE POLICY "Permitir eliminar reservas a admin" ON public.reservas
  AS PERMISSIVE FOR DELETE TO authenticated USING (true);

ALTER POLICY "precios update authenticated" ON public.precios
  USING (true) WITH CHECK (true);

-- 10. Regla «nadie» (se va igual con la tabla; explícito por si se revierte solo esto)
DROP POLICY IF EXISTS "nadie por la API" ON private.admins;

-- 1-3. Fuera la función, la tabla de admins y el schema
DROP FUNCTION private.es_admin();
DROP TABLE private.admins;
DROP SCHEMA private;

COMMIT;

-- Verificación: debe dar 0 filas
--   SELECT nspname FROM pg_namespace WHERE nspname = 'private';
