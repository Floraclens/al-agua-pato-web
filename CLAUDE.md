# AL AGUA PATO — Web

## Contexto del proyecto
- Proyecto **en producción**, vendido y en uso activo por una clienta real.
- Repo en GitHub: Floraclens/al-agua-pato-web
- Stack: Next.js + Supabase + Vercel (deploy automático al hacer push a la rama principal)

## Flujo de trabajo
- Cambios chicos y directos: implementar, no reescribir archivos enteros sin necesidad.
- Después de cada cambio confirmado por mí: `git add <solo los archivos tocados>` (nunca `git add .` ni `-A`) y `git commit`. **El push lo hago yo**: pasame la línea de cmd con el chequeo `git -C <repo> log --oneline origin/<rama>..<rama>` antes. (Cambiado el 22/10: antes el agente hacía `git add .` y el push.)
- El push a GitHub dispara el deploy automático en Vercel.
- Commit desde Cowork: si git no tiene identidad, usar `git -c user.name=... -c user.email=...` con el autor del último commit (`git log -1 --format='%an <%ae>'`); no tocar la config. Pedir antes el permiso de borrado de la carpeta, o git deja `.lock` trabados.

## Cuidado especial
- `.env.local` contiene las keys de Supabase. NUNCA leer su contenido en voz alta, mostrarlo, loguearlo, ni subirlo a git. Ya está protegido en `.gitignore` y `.claudeignore`.
- Es producción con una clienta usando el sistema activamente: evitar cambios que rompan datos existentes o el flujo de la clienta sin avisar primero.
- Cambios de base: como archivo en `db/` (con verificación y reversa escritas de antemano), aplicados a mano en el SQL Editor de Supabase, solo con mi OK al plan. **Un ensayo en producción, aunque se deshaga solo, también necesita mi OK antes** (22/10/2026).
- Nunca crear, cambiar ni borrar reservas reales para probar: las pruebas van en un bloque que termina en error a propósito (se deshace entero), con reservas de prueba en fechas como 2099. La base no guarda fiestas viejas: si una prueba necesita una, la crea adentro del bloque.

## Estructura relevante
- `app/` — rutas y páginas (Next.js App Router)
- `components/` — componentes UI
- `hooks/` — hooks personalizados
- `lib/` — lógica/utilidades (probablemente incluye cliente de Supabase)
- `styles/`, `public/` — estáticos

## Ignorar / no leer
- `node_modules/`, `.next/`, `.vercel/`, `tsconfig.tsbuildinfo`, `package-lock.json` — no son necesarios para entender el código.