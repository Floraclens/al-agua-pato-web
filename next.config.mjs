/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite acceder al dev server desde otros dispositivos de la misma red local
  // (ej. celular para probar /invitacion en un Samsung real) sin que Next.js
  // bloquee las requests internas por origen no confiable.
  //
  // El patrón cubre cualquier IP dentro de 192.168.1.x (rango típico de LAN
  // hogareña/router). Si tu IP cambia de rango (ej. te conectás a otra red,
  // o el router usa otro prefijo como 192.168.0.x o 10.0.0.x):
  //   1. Corré "ipconfig" en una terminal de Windows.
  //   2. Buscá "Dirección IPv4" bajo tu adaptador de red activo (Wi-Fi o Ethernet).
  //   3. Actualizá el patrón de abajo con los primeros 3 octetos de esa IP + ".*".
  //
  // Esto NO afecta producción (Vercel) — allowedDevOrigins solo aplica a "next dev".
  allowedDevOrigins: ['192.168.1.*'],
}

export default nextConfig
