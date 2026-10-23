import type { Metadata } from "next"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { PaginaLegal } from "@/components/pagina-legal"
import { DatoTitular } from "@/components/pie-legal"
import { FormArrepentimiento } from "@/components/form-arrepentimiento"
import { TITULAR, WHATSAPP_VISIBLE, whatsappUrl } from "@/lib/datos-titular"

export const metadata: Metadata = {
  title: "Botón de arrepentimiento | Al Agua Pato",
  description: "Revocá tu reserva dentro de los 10 días corridos, sin costo.",
  alternates: { canonical: "/arrepentimiento" },
}

export default function PaginaArrepentimiento() {
  return (
    <PaginaLegal
      titulo="BOTÓN DE ARREPENTIMIENTO"
      bajada="Si reservaste a distancia (web o WhatsApp), podés revocar la reserva dentro de los 10 días corridos desde que la hiciste, sin costo: te devolvemos el 100 % de la seña. No hace falta registrarte."
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 min-h-11 font-bold text-azul-marino">
          <MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp {WHATSAPP_VISIBLE}
        </a>
        <span>
          Horario de atención: <DatoTitular valor={TITULAR.horarioAtencion} />
        </span>
      </div>

      <FormArrepentimiento />

      <p className="text-sm text-slate-500">
        No se puede revocar una vez que el servicio fue utilizado. Más detalle en las{" "}
        <Link href="/condiciones" className="font-bold underline underline-offset-2">condiciones de la reserva</Link>.
      </p>
    </PaginaLegal>
  )
}
