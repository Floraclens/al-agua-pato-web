/**
 * Datos de la titular y del sitio que van publicados (pie, /privacidad, /condiciones,
 * botón de arrepentimiento). Un solo lugar para cambiarlos.
 *
 * Los que valen `null` están PENDIENTES de la titular: la web muestra «a completar»
 * en su lugar. No publicar con datos pendientes.
 */

import { WHATSAPP_SALON } from "./config-reservas"

export const TITULAR = {
  nombre: "Lorena Vanesa Soria",
  cuit: "27-26372409-2",
  condicionFiscal: "Titular inscripta en el Régimen Simplificado (Monotributo)",
  email: "lorevsoria77@gmail.com",
  // PENDIENTE de la titular: calle y número (Maps solo dice «Los Flores, G4200 Santiago del Estero»).
  domicilio: null as string | null,
  // PENDIENTE de la titular: horario de atención (Disp. 954/2025, art. 6).
  horarioAtencion: null as string | null,
}

export const SITIO_URL = "https://al-agua-pato-web.vercel.app"
// Sin protocolo, para la leyenda de la Res. 446/2025 («CONSULTE EN …»).
export const SITIO_DOMINIO = "al-agua-pato-web.vercel.app"

export const MAPS_URL = "https://maps.app.goo.gl/YbYAZheBiSx4WAG59"

export const WHATSAPP_VISIBLE = "385 404-3737"

export const PENDIENTE = "a completar"

// Res. AAIP 14/2018, art. 3: texto obligatorio, LITERAL. No tocar ni una coma.
export const LEYENDA_AAIP =
  "LA AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales."

// Res. SIC 446/2025, art. 1.
export const LEYENDA_446 = `PARA MÁS INFORMACIÓN O LIMITACIONES APLICABLES CONSULTE EN ${SITIO_DOMINIO}/condiciones`

export const DEFENSA_CONSUMIDOR_URL = "https://www.argentina.gob.ar/economia/industria-y-comercio/defensadelconsumidor"

export function whatsappUrl(texto?: string): string {
  const base = `https://api.whatsapp.com/send?phone=${WHATSAPP_SALON}`
  return texto ? `${base}&text=${encodeURIComponent(texto)}` : base
}
