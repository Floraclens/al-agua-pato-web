import Link from "next/link"
import { ScrollText } from "lucide-react"
import { CONDICION_REPROGRAMACION } from "@/lib/condiciones"
import { cn } from "@/lib/utils"

/**
 * Condiciones de la reserva en caracteres destacados, antes de que el cliente confirme.
 * El saldo ya figura como renglón propio en el resumen. Mismo texto que /condiciones.
 */
export function CondicionesReserva({ className }: { className?: string }) {
  const c = CONDICION_REPROGRAMACION
  return (
    <div className={cn("rounded-xl border-2 border-azul-marino/30 bg-white p-4 text-left", className)}>
      <p className="flex items-center gap-2 text-sm font-extrabold text-azul-marino mb-3">
        <ScrollText className="w-4 h-4 shrink-0" /> Condiciones de la reserva
      </p>
      <dl className="text-[12px] leading-snug text-slate-700">
        <dt className="font-extrabold text-azul-marino">{c.titulo}:</dt>
        <dd>{c.texto}</dd>
      </dl>
      <Link href="/condiciones" target="_blank" className="inline-flex items-center min-h-11 text-xs font-bold text-azul-marino underline underline-offset-2">
        Ver las condiciones completas
      </Link>
    </div>
  )
}
