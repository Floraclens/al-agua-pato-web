"use client"

import { Badge } from "@/components/ui/badge"
import { Banknote, Building2, CreditCard } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { MetodoPago } from "@/lib/reserva"
import { cn } from "@/lib/utils"
import { usePreciosListos } from "@/components/precios-provider"

interface MetodoPagoSelectorProps {
  metodoPago: MetodoPago
  onSelectMetodoPago: (metodo: MetodoPago) => void
  pagoTotalidad: boolean
  onSelectPagoTotalidad: (val: boolean) => void
}

// Con recargo > 0 (editable desde /admin) ya no son cuotas "sin interés". Con 0 el texto queda como siempre.
function descripcionTarjeta(recargoPct: number): string {
  const cuotas = recargoPct > 0 ? `(recargo ${recargoPct}%)` : "sin interés"
  return `Solo tarjetas bancarizadas hasta en 3 cuotas ${cuotas} (Hasta el 31/08)`
}

const metodos = [
  {
    id: "efectivo" as const,
    titulo: "Efectivo",
    descripcion: "Pago en efectivo",
    icon: Banknote,
    color: "text-verde",
    bgColor: "bg-verde/10",
  },
  {
    id: "transferencia" as const,
    titulo: "Transferencia",
    descripcion: "Transferencia bancaria o billetera virtual",
    icon: Building2,
    color: "text-azul-claro",
    bgColor: "bg-azul-claro/10",
  },
  {
    id: "tarjeta" as const,
    titulo: "Tarjeta",
    descripcion: descripcionTarjeta(0),
    icon: CreditCard,
    color: "text-lavanda",
    bgColor: "bg-lavanda/10",
  },
]

export function MetodoPagoSelector({
  metodoPago,
  onSelectMetodoPago,
  pagoTotalidad,
  onSelectPagoTotalidad
}: MetodoPagoSelectorProps) {
  const { precios } = usePreciosListos()
  const descuentoPct = precios.descuento_efectivo_pct

  return (
    <div className="space-y-3">
      {metodos.map((metodo) => {
        const Icon = metodo.icon
        const isSelected = metodoPago === metodo.id

        return (
          <div
            key={metodo.id}
            className={cn(
              "relative flex flex-col rounded-xl border-2 transition-all duration-200 overflow-hidden",
              isSelected
                ? "border-azul-marino bg-azul-claro/5"
                : "border-border/50 hover:border-border bg-white"
            )}
          >
            {/* Convertido a <button> para solucionar clicks en celular y permitir desmarcar */}
            <button
              type="button"
              className="flex items-center p-4 w-full text-left cursor-pointer"
              onClick={() => onSelectMetodoPago(metodo.id as MetodoPago)}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors shrink-0",
                  isSelected ? "border-azul-marino" : "border-border"
                )}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-azul-marino" />
                )}
              </div>

              <div
                className={`w-10 h-10 rounded-full ${metodo.bgColor} flex items-center justify-center mr-4 shrink-0`}
              >
                <Icon className={`w-5 h-5 ${metodo.color}`} />
              </div>

              <div className="flex-1">
                <h4 className="font-bold text-azul-marino mb-0.5">{metodo.titulo}</h4>
                <p className="text-sm text-muted-foreground">
                  {metodo.id === "tarjeta" ? descripcionTarjeta(precios.recargo_tarjeta_pct) : metodo.descripcion}
                </p>
              </div>
            </button>

            {/* DESPLEGABLE EFECTIVO: descuento (%) editable desde /admin */}
            {isSelected && metodo.id === "efectivo" && (
              <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 duration-300 pl-[4.5rem]">
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-white border border-verde/20 rounded-lg shadow-sm">
                  <Checkbox 
                    checked={pagoTotalidad} 
                    onCheckedChange={(checked) => onSelectPagoTotalidad(checked as boolean)}
                    className="mt-0.5 data-[state=checked]:bg-verde data-[state=checked]:border-verde border-slate-300"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-bold text-azul-marino">Abonar la totalidad ahora</span>
                      {descuentoPct > 0 && (
                        <Badge className="bg-verde text-white text-[10px] font-bold px-1.5 py-0 uppercase tracking-wider">
                          {descuentoPct}% OFF
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground leading-snug">
                      {descuentoPct > 0
                        ? "Accedé al descuento pagando el total hoy. Si no lo marcás, solo abonarás la seña sin descuento."
                        : "Pagá el total hoy. Si no lo marcás, solo abonarás la seña."}
                    </span>
                  </div>
                </label>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}