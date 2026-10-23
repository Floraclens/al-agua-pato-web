import Link from "next/link"
import { Undo2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Disp. 954/2025 art. 1: link «BOTÓN DE ARREPENTIMIENTO» a simple vista y en el primer
 * acceso. Va en el encabezado de la home, /reservar y /egresaditos, y en el pie.
 */
export function LinkArrepentimiento({ className }: { className?: string }) {
  return (
    <Link
      href="/arrepentimiento"
      className={cn(
        "inline-flex items-center gap-1.5 min-h-11 text-[11px] font-extrabold tracking-wider underline underline-offset-2",
        className,
      )}
    >
      <Undo2 className="w-3.5 h-3.5 shrink-0" />
      BOTÓN DE ARREPENTIMIENTO
    </Link>
  )
}

/** Franja fina para poner arriba del encabezado de cada página pública. */
export function FranjaArrepentimiento() {
  return (
    <div className="bg-azul-marino text-white">
      <div className="container mx-auto px-4 flex justify-end">
        <LinkArrepentimiento className="min-h-8 text-white/90 hover:text-amarillo" />
      </div>
    </div>
  )
}
