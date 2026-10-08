"use client"

/**
 * Pantalla "Precios" del panel /admin: edita la tabla `precios` (db/precios.sql).
 *
 *  - Se edita todo junto; "Guardar" abre una confirmación con cada cambio (viejo → nuevo).
 *  - Se guarda con la RPC `actualizar_precios` (todo o nada; si otra pestaña cambió un precio
 *    mientras se editaba, aborta). Los CHECK y el trigger de la base son la barrera final.
 *  - Aplica solo a reservas NUEVAS: las ya hechas guardan su total.
 *  - El historial (quién, cuándo, viejo → nuevo) lo escribe un trigger de la base.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { AlertCircle, History, Loader2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatMoneyUI } from "@/lib/reserva"
import { MAX_PORCENTAJE, senaEsValida, validarValorPrecio, type TipoPrecio } from "@/lib/precios"
import { usePrecios } from "@/components/precios-provider"

interface FilaPrecio {
  clave: string
  valor: number
  tipo: TipoPrecio
  grupo: string
  etiqueta: string
  orden: number
}

interface FilaHistorial {
  id: number
  clave: string
  valor_anterior: number
  valor_nuevo: number
  usuario_email: string | null
  cambiado_en: string
}

const GRUPOS: { id: string; titulo: string }[] = [
  { id: "turnos", titulo: "Turnos de cumpleaños" },
  { id: "egresaditos", titulo: "Egresaditos" },
  { id: "extras", titulo: "Extras" },
  { id: "pagos", titulo: "Seña y pagos" },
]

// Cambios de más de este % en un monto se marcan como "revisá que no sea un error de tipeo".
const UMBRAL_CAMBIO_GRANDE = 30

const pct = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1, signDisplay: "always" })

function formatearValor(tipo: TipoPrecio, valor: number): string {
  return tipo === "porcentaje" ? `${valor}%` : formatMoneyUI(valor)
}

function variacion(anterior: number, nuevo: number): number {
  return ((nuevo - anterior) / anterior) * 100
}

export function PanelPrecios({ supabase }: { supabase: SupabaseClient }) {
  // Para que el resto del panel (editar extras, calendario) use los precios nuevos sin recargar la página.
  const { recargar } = usePrecios()

  const [filas, setFilas] = useState<FilaPrecio[]>([])
  const [historial, setHistorial] = useState<FilaHistorial[]>([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(false)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [confirmando, setConfirmando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(async () => {
    const [p, h] = await Promise.all([
      supabase.from("precios").select("clave, valor, tipo, grupo, etiqueta, orden").order("orden"),
      supabase
        .from("precios_historial")
        .select("id, clave, valor_anterior, valor_nuevo, usuario_email, cambiado_en")
        .order("cambiado_en", { ascending: false })
        .limit(50),
    ])
    if (p.error || h.error || !p.data || !h.data) {
      console.error("[precios] Error al cargar el panel:", p.error ?? h.error)
      setErrorCarga(true)
      return
    }
    setFilas(p.data.map((f: any) => ({ ...f, valor: Number(f.valor) })))
    setHistorial(h.data.map((f: any) => ({ ...f, valor_anterior: Number(f.valor_anterior), valor_nuevo: Number(f.valor_nuevo) })))
    setErrorCarga(false)
  }, [supabase])

  useEffect(() => {
    setCargando(true)
    cargar().finally(() => setCargando(false))
  }, [cargar])

  // Estado de cada campo: texto escrito, error de validación y valor nuevo (si es válido).
  const campos = useMemo(
    () =>
      filas.map((fila) => {
        const texto = edits[fila.clave] ?? String(fila.valor)
        const r = validarValorPrecio(fila.tipo, texto)
        return {
          fila,
          texto,
          error: "error" in r ? r.error : null,
          nuevo: "valor" in r ? r.valor : null,
        }
      }),
    [filas, edits]
  )

  const cambios = campos.filter((c) => c.nuevo !== null && c.nuevo !== c.fila.valor)
  const hayErrores = campos.some((c) => c.error !== null)

  // Seña vs. turno más barato, con los valores tal como quedarían (los inválidos cuentan como el valor actual).
  const errorSena = useMemo(() => {
    const valorFinal = (c: (typeof campos)[number]) => c.nuevo ?? c.fila.valor
    const sena = campos.find((c) => c.fila.clave === "sena")
    const turnos = campos.filter((c) => c.fila.grupo === "turnos" || c.fila.grupo === "egresaditos")
    if (!sena || turnos.length === 0) return null
    const minimo = Math.min(...turnos.map(valorFinal))
    if (senaEsValida(valorFinal(sena), minimo)) return null
    return `La seña (${formatMoneyUI(valorFinal(sena))}) tiene que ser menor que el turno más barato (${formatMoneyUI(minimo)}).`
  }, [campos])

  const puedeGuardar = cambios.length > 0 && !hayErrores && !errorSena && !guardando
  const hayCambioGrande = cambios.some(
    (c) => c.fila.tipo === "monto" && Math.abs(variacion(c.fila.valor, c.nuevo as number)) > UMBRAL_CAMBIO_GRANDE
  )

  const etiquetaDe = useMemo(() => new Map(filas.map((f) => [f.clave, f])), [filas])

  const guardar = async () => {
    if (!puedeGuardar) return
    setGuardando(true)
    const { error } = await supabase.rpc("actualizar_precios", {
      p_cambios: cambios.map((c) => ({
        clave: c.fila.clave,
        valor_anterior: c.fila.valor,
        valor_nuevo: c.nuevo,
      })),
    })

    if (error) {
      console.error("[precios] Error al guardar:", error)
      toast.error(error.message || "No se pudieron guardar los precios.")
      // Si otra pestaña cambió algo mientras editaba, se refresca lo que ve para que reedite sobre lo vigente.
      if (error.message?.includes("cambió mientras editabas")) {
        setEdits({})
        await cargar()
      }
      setGuardando(false)
      setConfirmando(false)
      return
    }

    toast.success(cambios.length === 1 ? "Precio actualizado." : `${cambios.length} precios actualizados.`)
    setEdits({})
    setConfirmando(false)
    await Promise.all([cargar(), recargar()])
    setGuardando(false)
  }

  if (cargando) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-azul-claro" />
      </div>
    )
  }

  if (errorCarga) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-border/50 shadow-sm flex flex-col items-center">
        <AlertCircle className="w-12 h-12 text-orange-400 mb-3" />
        <h3 className="text-lg font-bold text-azul-marino mb-1">No se pudieron cargar los precios</h3>
        <p className="text-sm text-muted-foreground mb-5">Revisá tu conexión e intentá de nuevo.</p>
        <Button
          className="h-11"
          onClick={() => {
            setCargando(true)
            cargar().finally(() => setCargando(false))
          }}
        >
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-28">
      <div className="bg-blue-50 border border-blue-200 text-blue-900 text-sm rounded-2xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
        <p className="leading-snug">
          Los cambios aplican a las <strong>reservas nuevas</strong>. Las reservas ya hechas conservan el total con el
          que se guardaron. Las fechas de temporada, los horarios y los feriados no se editan desde acá.
        </p>
      </div>

      {GRUPOS.map((grupo) => {
        const delGrupo = campos.filter((c) => c.fila.grupo === grupo.id)
        if (delGrupo.length === 0) return null
        return (
          <section key={grupo.id} className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
            <h3 className="px-5 py-4 font-extrabold text-azul-marino bg-slate-50/70 border-b border-border/50">
              {grupo.titulo}
            </h3>
            <div className="divide-y divide-border/50">
              {delGrupo.map(({ fila, texto, error, nuevo }) => {
                const cambiado = nuevo !== null && nuevo !== fila.valor
                const esSena = fila.clave === "sena"
                const esRecargo = fila.clave === "recargo_tarjeta_pct"
                const errorMostrado = error ?? (esSena ? errorSena : null)
                return (
                  <div key={fila.clave} className={`px-5 py-4 ${cambiado ? "bg-amarillo/10" : ""}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <label htmlFor={`precio-${fila.clave}`} className="text-sm font-semibold text-slate-700 leading-snug">
                        {fila.etiqueta}
                      </label>
                      <div className="flex items-center gap-2 sm:w-56 shrink-0">
                        {fila.tipo === "monto" && <span className="font-bold text-slate-400">$</span>}
                        <Input
                          id={`precio-${fila.clave}`}
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          value={texto}
                          disabled={guardando}
                          aria-invalid={errorMostrado ? true : undefined}
                          onChange={(e) => setEdits((prev) => ({ ...prev, [fila.clave]: e.target.value }))}
                          className={`h-11 text-base font-bold text-right ${errorMostrado ? "border-red-500 focus-visible:ring-red-500/30" : ""}`}
                        />
                        {fila.tipo === "porcentaje" && <span className="font-bold text-slate-400">%</span>}
                      </div>
                    </div>

                    {cambiado && (
                      <p className="text-xs text-slate-500 mt-1.5 sm:text-right">
                        Actual: {formatearValor(fila.tipo, fila.valor)}
                      </p>
                    )}
                    {errorMostrado && (
                      <p className="text-xs font-semibold text-red-600 mt-1.5 sm:text-right">{errorMostrado}</p>
                    )}
                    {fila.tipo === "porcentaje" && !errorMostrado && (
                      <p className="text-xs text-slate-400 mt-1.5 sm:text-right">Entre 0 y {MAX_PORCENTAJE}.</p>
                    )}
                    {esRecargo && (
                      <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2 mt-2 leading-snug">
                        En la web, la opción Tarjeta dice “hasta en 3 cuotas sin interés”. Si cargás un recargo mayor a 0,
                        pasa a decir “hasta en 3 cuotas (recargo X%)”.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      <section className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
        <h3 className="px-5 py-4 font-extrabold text-azul-marino bg-slate-50/70 border-b border-border/50 flex items-center gap-2">
          <History className="w-5 h-5" /> Historial de cambios
        </h3>
        {historial.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground text-center">Todavía no se cambió ningún precio.</p>
        ) : (
          <ul className="divide-y divide-border/50">
            {historial.map((h) => {
              const fila = etiquetaDe.get(h.clave)
              const tipo: TipoPrecio = fila?.tipo ?? "monto"
              let cuando = h.cambiado_en
              try {
                cuando = format(parseISO(h.cambiado_en), "d MMM yyyy, HH:mm", { locale: es })
              } catch {}
              return (
                <li key={h.id} className="px-5 py-3 text-sm">
                  <p className="font-semibold text-slate-700 leading-snug">{fila?.etiqueta ?? h.clave}</p>
                  <p className="font-bold text-azul-marino">
                    {formatearValor(tipo, h.valor_anterior)} → {formatearValor(tipo, h.valor_nuevo)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {cuando} · {h.usuario_email ?? "usuario desconocido"}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Barra de guardado fija abajo (cómoda en el celular) */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-border shadow-[0_-4px_14px_rgba(0,0,0,0.06)]">
        <div className="container mx-auto px-4 py-3 max-w-3xl flex items-center gap-3">
          <p className="flex-1 text-sm font-semibold text-slate-600 leading-tight">
            {hayErrores || errorSena
              ? "Corregí los campos en rojo para guardar."
              : cambios.length === 0
                ? "Sin cambios."
                : `${cambios.length} ${cambios.length === 1 ? "cambio" : "cambios"} sin guardar`}
          </p>
          {cambios.length > 0 && (
            <Button variant="outline" className="h-11" disabled={guardando} onClick={() => setEdits({})}>
              Descartar
            </Button>
          )}
          <Button
            className="h-11 bg-amarillo hover:bg-amarillo/90 text-azul-marino font-extrabold disabled:opacity-50"
            disabled={!puedeGuardar}
            onClick={() => setConfirmando(true)}
          >
            <Save className="w-4 h-4 mr-2" /> Guardar
          </Button>
        </div>
      </div>

      {/* Confirmación: viejo → nuevo */}
      {confirmando && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="bg-azul-marino p-4 flex items-center justify-between text-white shrink-0">
              <h3 className="font-bold">Confirmar cambios de precios</h3>
              <button
                onClick={() => setConfirmando(false)}
                disabled={guardando}
                aria-label="Cerrar"
                className="hover:bg-white/20 p-1 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <ul className="space-y-3">
                {cambios.map(({ fila, nuevo }) => {
                  const n = nuevo as number
                  const v = variacion(fila.valor, n)
                  const grande = fila.tipo === "monto" && Math.abs(v) > UMBRAL_CAMBIO_GRANDE
                  return (
                    <li key={fila.clave} className={`text-sm rounded-xl border p-3 ${grande ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
                      <p className="font-semibold text-slate-700 leading-snug">{fila.etiqueta}</p>
                      <p className="font-extrabold text-azul-marino text-base">
                        {formatearValor(fila.tipo, fila.valor)} → {formatearValor(fila.tipo, n)}
                        {fila.tipo === "monto" && (
                          <span className={`ml-2 text-xs font-bold ${grande ? "text-red-600" : "text-slate-500"}`}>
                            ({pct.format(v)}%)
                          </span>
                        )}
                      </p>
                    </li>
                  )
                })}
              </ul>

              {hayCambioGrande && (
                <div className="flex gap-2 bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    Hay cambios de más del {UMBRAL_CAMBIO_GRANDE}%. Revisá que no sea un error de tipeo (por ejemplo, un cero de más).
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-500 leading-snug">
                Aplica a las reservas nuevas. Las reservas ya hechas mantienen su precio. Queda registrado en el historial
                con tu usuario y la fecha.
              </p>

              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <Button variant="outline" className="h-12 flex-1" disabled={guardando} onClick={() => setConfirmando(false)}>
                  Volver
                </Button>
                <Button
                  className="h-12 flex-1 bg-amarillo hover:bg-amarillo/90 text-azul-marino font-extrabold disabled:opacity-50"
                  disabled={guardando}
                  onClick={guardar}
                >
                  {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar y guardar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
