"use client"

import { Badge } from "@/components/ui/badge"
import { Banknote, Building2, CreditCard, AlertTriangle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { MetodoPago } from "@/app/page"
import { cn } from "@/lib/utils"

interface MetodoPagoSelectorProps {
  metodoPago: MetodoPago
  onSelectMetodoPago: (metodo: MetodoPago) => void
  pagoTotalidad: boolean
  onSelectPagoTotalidad: (val: boolean) => void
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
    descripcion: "Solo tarjetas bancarizadas hasta en 3 cuotas sin interés (Hasta el 31/08)",
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
                  {metodo.descripcion}
                </p>
              </div>
            </button>

            {/* DESPLEGABLE EFECTIVO: 10% OFF */}
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
                      <Badge className="bg-verde text-white text-[10px] font-bold px-1.5 py-0 uppercase tracking-wider">
                        10% OFF
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground leading-snug">
                      Accedé al descuento pagando el total hoy. Si no lo marcás, solo abonarás la seña sin descuento.
                    </span>
                  </div>
                </label>
              </div>
            )}

            {/* DESPLEGABLE TARJETA: 20% RECARGO */}
            {isSelected && metodo.id === "tarjeta" && (
              <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 duration-300 pl-[4.5rem]">
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-bold text-red-700">Recargo del 20%</span>
                    </div>
                    <span className="text-xs text-red-600/90 leading-snug">
                      Los pagos procesados con tarjeta de débito o crédito tienen un recargo financiero sobre el valor a abonar.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}