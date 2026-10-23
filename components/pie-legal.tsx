import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { LinkArrepentimiento } from "@/components/link-arrepentimiento"
import {
  DEFENSA_CONSUMIDOR_URL,
  LEYENDA_446,
  MAPS_URL,
  PENDIENTE,
  TITULAR,
  WHATSAPP_VISIBLE,
  whatsappUrl,
} from "@/lib/datos-titular"

/** Dato pendiente de la titular: se ve marcado para que no se publique así por error. */
export function DatoTitular({ valor }: { valor: string | null }) {
  if (valor) return <>{valor}</>
  return <span className="px-1 rounded bg-amarillo text-azul-marino font-bold">[{PENDIENTE}]</span>
}

/**
 * Pie legal (P1 #14 de la propuesta): datos de la proveedora (Res. 270/2020, LDC art. 8),
 * link a Defensa del Consumidor (Res. 104/2005), condiciones y privacidad, canal de
 * atención con horario (Disp. 954/2025 art. 6) y leyenda de la Res. 446/2025.
 * Fondo oscuro, igual que el pie de la home.
 */
export function PieLegal() {
  return (
    <div className="bg-[#040A12] text-white/60 text-xs leading-relaxed">
      <div className="container mx-auto px-4 py-6 space-y-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <LinkArrepentimiento className="text-amarillo hover:text-white" />
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 min-h-11 font-bold text-white/80 hover:text-amarillo"
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp {WHATSAPP_VISIBLE}
          </a>
          <span>
            Horario de atención: <DatoTitular valor={TITULAR.horarioAtencion} />
          </span>
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
            <DatoTitular valor={TITULAR.domicilio} />
          </a>{" "}
          – <a href={`mailto:${TITULAR.email}`} className="hover:text-amarillo">{TITULAR.email}</a> – {TITULAR.condicionFiscal}.
        </p>

        <p className="font-bold text-white/70 break-words">{LEYENDA_446}</p>
      </div>
    </div>
  )
}
