-- =====================================================================
--  Invitación digital: mostrar la hora extra en el horario
--  Correr en Supabase → SQL Editor ANTES (o después, da igual) del deploy:
--  el front tolera que `hora_extra` no venga (muestra el horario base).
--
--  Cambia el tipo de retorno de los RPC (agrega hora_extra), por eso es
--  DROP + CREATE y no CREATE OR REPLACE. Todo en una transacción: si algo
--  falla, quedan las funciones viejas intactas.
--
--  Privacidad: la invitación es pública (anon). Solo se expone un booleano,
--  NO la lista de extras ni montos.
-- =====================================================================

BEGIN;

DROP FUNCTION IF EXISTS public.get_invitacion(uuid);
CREATE FUNCTION public.get_invitacion(p_token uuid)
RETURNS TABLE (fecha date, turno text, nombre_cumpleanero text, edad_cumple text, hora_extra boolean)
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT fecha, turno, nombre_cumpleanero, edad_cumple,
         COALESCE(extras_elegidos ILIKE '%Hora Extra%', false) AS hora_extra
  FROM public.reservas
  WHERE invitacion_token = p_token
$$;
REVOKE ALL ON FUNCTION public.get_invitacion(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_invitacion(uuid) TO anon, authenticated;

-- TEMPORAL (links numéricos viejos) — se borra a partir del 2026-12-14, ver rls-reservas.sql
DROP FUNCTION IF EXISTS public.get_invitacion_by_id(bigint);
CREATE FUNCTION public.get_invitacion_by_id(p_id bigint)
RETURNS TABLE (fecha date, turno text, nombre_cumpleanero text, edad_cumple text, hora_extra boolean)
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT fecha, turno, nombre_cumpleanero, edad_cumple,
         COALESCE(extras_elegidos ILIKE '%Hora Extra%', false) AS hora_extra
  FROM public.reservas
  WHERE id = p_id
$$;
REVOKE ALL ON FUNCTION public.get_invitacion_by_id(bigint) FROM public;
GRANT EXECUTE ON FUNCTION public.get_invitacion_by_id(bigint) TO anon, authenticated;

COMMIT;

-- Verificación (debe devolver hora_extra = true para la reserva de Romina Jiménez):
-- SELECT * FROM public.get_invitacion('096b71e0-27eb-49ad-a328-82a3508cd2ab');

-- ROLLBACK (volver a la versión sin hora_extra): correr el bloque B.1 de rls-reservas.sql
-- precedido de DROP FUNCTION de ambas funciones.
