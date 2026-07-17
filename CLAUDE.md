# AL AGUA PATO — Web

## Contexto del proyecto
- Proyecto **en producción**, vendido y en uso activo por una clienta real.
- Repo en GitHub: Floraclens/al-agua-pato-web
- Stack: Next.js + Supabase + Vercel (deploy automático al hacer push a la rama principal)

## Flujo de trabajo
- Cambios chicos y directos: implementar, no reescribir archivos enteros sin necesidad.
- Después de cada cambio confirmado por mí: `git add .`, `git commit -m "..."`, `git push`.
- El push a GitHub dispara el deploy automático en Vercel — pedime confirmación antes de pushear si el cambio es sensible (ver abajo).

## Cuidado especial
- `.env.local` contiene las keys de Supabase. NUNCA leer su contenido en voz alta, mostrarlo, loguearlo, ni subirlo a git. Ya está protegido en `.gitignore` y `.claudeignore`.
- Es producción con una clienta usando el sistema activamente: evitar cambios que rompan datos existentes o el flujo de la clienta sin avisar primero.

## Estructura relevante
- `app/` — rutas y páginas (Next.js App Router)
- `components/` — componentes UI
- `hooks/` — hooks personalizados
- `lib/` — lógica/utilidades (probablemente incluye cliente de Supabase)
- `styles/`, `public/` — estáticos

## Ignorar / no leer
- `node_modules/`, `.next/`, `.vercel/`, `tsconfig.tsbuildinfo`, `package-lock.json` — no son necesarios para entender el código.