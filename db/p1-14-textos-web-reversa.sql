-- =====================================================================
--  AL AGUA PATO — REVERSA de db/p1-14-textos-web.sql (P1 #14, 23/10/2026)
-- ---------------------------------------------------------------------
--  Deja la base como estaba antes del cambio. Pegar entero en el SQL
--  Editor. Un solo bloque. No toca reservas ni precios.
--  La web sigue funcionando sin la tabla: la opción Tarjeta vuelve a
--  decir «Solo tarjetas bancarizadas» (lo que haya escrito la admin se
--  pierde: copiarlo antes si hace falta).
-- =====================================================================

BEGIN;

DROP TABLE public.textos_web;               -- arrastra políticas y trigger
DROP FUNCTION public.textos_web_tocar();

COMMIT;

-- VERIFICACIÓN:
--   SELECT to_regclass('public.textos_web');   -- NULL
