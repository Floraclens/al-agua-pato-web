import type { Metadata } from "next"
import Link from "next/link"
import { PaginaLegal, SeccionLegal } from "@/components/pagina-legal"
import { DatoTitular } from "@/components/pie-legal"
import { CONDICION_SALDO, condicionesReserva } from "@/lib/condiciones"
import { MAPS_URL, TITULAR, WHATSAPP_VISIBLE } from "@/lib/datos-titular"

export const metadata: Metadata = {
  title: "Condiciones de la reserva | Al Agua Pato",
  description: "Seña, derecho de revocación, cancelación y reprogramación de las reservas en Al Agua Pato.",
  alternates: { canonical: "/condiciones" },
}

export default function PaginaCondiciones() {
  return (
    <PaginaLegal titulo="Condiciones de la reserva" bajada="Leelas antes de confirmar tu fecha.">
      {[...condicionesReserva(), CONDICION_SALDO].map((c) => (
        <SeccionLegal key={c.titulo} titulo={c.titulo}>
          <p>{c.texto}</p>
        </SeccionLegal>
      ))}

      <SeccionLegal titulo="PRECIOS">
        <p>
          Los precios publicados son finales, en pesos. La titular está inscripta en el Régimen Simplificado
          (Monotributo) y no discrimina IVA: el precio sin impuestos nacionales es el mismo importe que el precio final.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="QUIÉN PRESTA EL SERVICIO">
        <p>
          {TITULAR.nombre} – CUIT {TITULAR.cuit} – {TITULAR.condicionFiscal}.
          <br />
          Domicilio:{" "}
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            <DatoTitular valor={TITULAR.domicilio} />
          </a>
          .
          <br />
          Contacto: <a href={`mailto:${TITULAR.email}`} className="underline underline-offset-2">{TITULAR.email}</a> · WhatsApp{" "}
          {WHATSAPP_VISIBLE} · Horario de atención: <DatoTitular valor={TITULAR.horarioAtencion} />.
        </p>
        <p>
          Para revocar tu reserva usá el{" "}
          <Link href="/arrepentimiento" className="font-bold underline underline-offset-2">
            BOTÓN DE ARREPENTIMIENTO
          </Link>
          .
        </p>
      </SeccionLegal>
    </PaginaLegal>
  )
}
