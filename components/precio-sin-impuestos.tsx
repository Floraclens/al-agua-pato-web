import { cn } from "@/lib/utils"
import { formatMoneyUI } from "@/lib/reserva"

/**
 * Ley 27.743 art. 99 y Res. SIC 4/2025 art. 2 inc. c): junto a cada precio, en letra
 * menor, el importe sin IVA ni impuestos nacionales indirectos. La titular es
 * monotributista: no cobra IVA por operación, así que es el MISMO importe que el
 * precio final (interpretación del informe 26-T, pregunta 1).
 */
export function PrecioSinImpuestos({ monto, className }: { monto: number; className?: string }) {
  return (
    <span className={cn("block text-[10px] leading-tight font-medium text-slate-500 tracking-wide", className)}>
      PRECIO SIN IMPUESTOS NACIONALES: {formatMoneyUI(monto)}
    </span>
  )
}
