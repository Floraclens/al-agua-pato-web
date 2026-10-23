import Link from "next/link"
import { ChevronDown, Lock } from "lucide-react"
import { LEYENDA_AAIP, TITULAR, WHATSAPP_VISIBLE } from "@/lib/datos-titular"

/**
 * Aviso junto a los formularios, antes de enviar los datos (Ley 25.326 art. 6 y
 * Res. AAIP 14/2018 art. 3), en dos capas: una línea visible y el detalle en un
 * desplegable cerrado. La leyenda de la AAIP va siempre visible, debajo.
 * Texto del informe 26-T, pregunta 3, sección (3).
 * `datos`: lo que pide ESE formulario.
 */
export function AvisoPrivacidad({ datos }: { datos: string }) {
  return (
    <div className="mt-6 pt-4 border-t border-border/50 text-[12px] leading-relaxed text-slate-600">
      <details className="group [&_summary::-webkit-details-marker]:hidden">
        <summary className="block py-3 cursor-pointer select-none list-none">
          <Lock className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5 text-slate-400" />
          Usamos tus datos solo para gestionar tu reserva. Responsable: Lorena V. Soria.{" "}
          <span className="inline-flex items-center gap-0.5 font-bold text-azul-marino underline underline-offset-2">
            Ver detalle
            <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:-rotate-180" />
          </span>
        </summary>
        <div className="mb-2 text-[11px] text-slate-500">
          <p>
            Datos que pedimos: {datos}. Los usamos para gestionar tu reserva y contactarte por WhatsApp. Responsable:{" "}
            {TITULAR.nombre}, CUIT {TITULAR.cuit}, {TITULAR.domicilio}. Brindarlos es voluntario, pero sin ellos no podemos
            tomar la reserva. Podés ejercer tus derechos de acceso, rectificación y supresión escribiendo a {TITULAR.email} o
            al WhatsApp {WHATSAPP_VISIBLE}.{" "}
            <Link href="/privacidad" className="font-bold text-azul-marino underline underline-offset-2">
              Política de privacidad
            </Link>
          </p>
        </div>
      </details>
      {/* Res. AAIP 14/2018: la leyenda queda siempre a la vista, fuera del desplegable. */}
      <p className="text-[11px] text-slate-500">{LEYENDA_AAIP}</p>
    </div>
  )
}
