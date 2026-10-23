import Link from "next/link"
import { Lock } from "lucide-react"
import { DatoTitular } from "@/components/pie-legal"
import { LEYENDA_AAIP, TITULAR, WHATSAPP_VISIBLE } from "@/lib/datos-titular"

/**
 * Aviso corto junto a los formularios, antes de enviar los datos (Ley 25.326 art. 6 y
 * Res. AAIP 14/2018 art. 3). Texto del informe 26-T, pregunta 3, sección (3).
 * `datos`: lo que pide ESE formulario.
 */
export function AvisoPrivacidad({ datos }: { datos: string }) {
  return (
    <div className="mt-6 pt-5 border-t border-border/50 text-[12px] leading-relaxed text-slate-600 space-y-2">
      <p className="flex gap-2">
        <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
        <span>
          Tus datos ({datos}) se usan solo para gestionar tu reserva y contactarte por WhatsApp. Responsable:{" "}
          {TITULAR.nombre}, CUIT {TITULAR.cuit}, <DatoTitular valor={TITULAR.domicilio} />, Santiago del Estero. Brindarlos
          es voluntario, pero sin ellos no podemos tomar la reserva. Podés ejercer tus derechos de acceso, rectificación y
          supresión escribiendo a {TITULAR.email} o al WhatsApp {WHATSAPP_VISIBLE}.{" "}
          <Link href="/privacidad" className="font-bold text-azul-marino underline underline-offset-2">
            Política de privacidad
          </Link>
        </span>
      </p>
      <p className="text-[11px] text-slate-500">{LEYENDA_AAIP}</p>
    </div>
  )
}
