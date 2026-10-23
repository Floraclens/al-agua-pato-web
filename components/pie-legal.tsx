import Link from "next/link"
import { Mail, MessageCircle } from "lucide-react"
import { DEFENSA_CONSUMIDOR_URL, LEYENDA_446, MAPS_URL, TITULAR, WHATSAPP_VISIBLE, whatsappUrl } from "@/lib/datos-titular"

/**
 * Pie legal (P1 #14 de la propuesta): datos de la proveedora (Res. 270/2020, LDC art. 8),
 * link a Defensa del Consumidor (Res. 104/2005), condiciones y privacidad, canales de
 * contacto y leyenda de la Res. 446/2025. Fondo oscuro, igual que el pie de la home.
 */
export function PieLegal() {
  return (
    <div className="bg-[#040A12] text-white/60 text-xs leading-relaxed">
      <div className="container mx-auto px-4 py-6 space-y-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 min-h-11 font-bold text-white/80 hover:text-amarillo"
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp {WHATSAPP_VISIBLE}
          </a>
          <a href={`mailto:${TITULAR.email}`} className="inline-flex items-center gap-1.5 min-h-11 font-bold text-white/80 hover:text-amarillo">
            <Mail className="w-3.5 h-3.5" /> {TITULAR.email}
          </a>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-1" aria-label="Información legal">
          <Link href="/condiciones" className="inline-flex items-center min-h-11 font-bold text-white/80 hover:text-amarillo underline underline-offset-2">
            Condiciones de la reserva
          </Link>
          <Link href="/privacidad" className="inline-flex items-center min-h-11 font-bold text-white/80 hover:text-amarillo underline underline-offset-2">
            Política de privacidad
          </Link>
          <a
            href={DEFENSA_CONSUMIDOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center min-h-11 font-bold text-white/80 hover:text-amarillo underline underline-offset-2"
          >
            Defensa de las y los Consumidores
          </a>
        </nav>

        <p>
          {TITULAR.nombre} – CUIT {TITULAR.cuit} – Domicilio:{" "}
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-amarillo">
            {TITULAR.domicilio}
          </a>{" "}
          – {TITULAR.condicionFiscal}.
        </p>

        <p className="font-bold text-white/70 break-words">{LEYENDA_446}</p>
      </div>
    </div>
  )
}
