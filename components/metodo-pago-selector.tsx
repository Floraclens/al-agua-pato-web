"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Banknote, Building2, CreditCard } from "lucide-react"
import type { MetodoPago } from "@/app/page"
import { cn } from "@/lib/utils"

interface MetodoPagoSelectorProps {
  metodoPago: MetodoPago
  onSelectMetodoPago: (metodo: MetodoPago) => void
}

const metodos = [
  {
    id: "efectivo" as const,
    titulo: "Efectivo",
    descripcion: "Pago en efectivo el día del evento",
    icon: Banknote,
    descuento: true,
    color: "text-verde",
    bgColor: "bg-verde/10",
  },
  {
    id: "transferencia" as const,
    titulo: "Transferencia",
    descripcion: "Transferencia bancaria o billetera virtual",
    icon: Building2,
    descuento: false,
    color: "text-azul-claro",
    bgColor: "bg-azul-claro/10",
  },
  {
    id: "tarjeta" as const,
    titulo: "Tarjeta",
    descripcion: "VISA, MASTERCARD bancarizadas y NARANJA",
    icon: CreditCard,
    descuento: false,
    color: "text-lavanda",
    bgColor: "bg-lavanda/10",
  },
]

export function MetodoPagoSelector({
  metodoPago,
  onSelectMetodoPago,
}: MetodoPagoSelectorProps) {
  return (
    <RadioGroup
      value={metodoPago || ""}
      onValueChange={(value) => onSelectMetodoPago(value as MetodoPago)}
      className="space-y-3"
    >
      {metodos.map((metodo) => {
        const Icon = metodo.icon
        const isSelected = metodoPago === metodo.id

        return (
          <div
            key={metodo.id}
            className={cn(
              "relative flex items-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer",
              isSelected
                ? "border-azul-marino bg-azul-claro/5"
                : "border-border/50 hover:border-border"
            )}
            onClick={() => onSelectMetodoPago(metodo.id)}
          >
            <RadioGroupItem
              value={metodo.id}
              id={metodo.id}
              className="sr-only"
            />

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

            <Label
              htmlFor={metodo.id}
              className="flex-1 cursor-pointer"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-azul-marino">{metodo.titulo}</h4>
                {metodo.descuento && (
                  <Badge className="bg-verde text-white text-xs font-semibold px-2 py-0.5">
                    10% OFF
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {metodo.descripcion}
              </p>
            </Label>
          </div>
        )
      })}
    </RadioGroup>
  )
}
