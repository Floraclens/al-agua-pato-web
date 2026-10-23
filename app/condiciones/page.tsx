import type { Metadata } from "next"
import { PaginaLegal, SeccionLegal } from "@/components/pagina-legal"
import { CONDICION_REPROGRAMACION, CONDICION_SALDO } from "@/lib/condiciones"

export const metadata: Metadata = {
  title: "Condiciones de la reserva | Al Agua Pato",
  description: "Reprogramación y saldo de las reservas en Al Agua Pato.",
  alternates: { canonical: "/condiciones" },
}

export default function PaginaCondiciones() {
  return (
    <PaginaLegal titulo="Condiciones de la reserva" bajada="Leelas antes de confirmar tu fecha.">
      {[CONDICION_REPROGRAMACION, CONDICION_SALDO].map((c) => (
        <SeccionLegal key={c.titulo} titulo={c.titulo}>
          <p>{c.texto}</p>
        </SeccionLegal>
      ))}
    </PaginaLegal>
  )
}
