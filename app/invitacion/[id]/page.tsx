"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Loader2, Download, Share2, AlertTriangle, Sparkles, Palette, Calendar, Clock, MapPin } from "lucide-react"
import Image from "next/image"
import { toPng } from "html-to-image"
import { Button } from "@/components/ui/button"

interface ReservaInfo {
  fecha: string
  turno: string
  nombre_cumpleanero: string
  edad_cumple: string
}

type TemaFondo = "clasico" | "cuadradoblanco" | "acuatico"

interface DatosInvitacion {
  nombre: string
  fechaLegible: string
  horarioLimpio: string
  detalleEdadOTurno: string
}

const UBICACION_NOMBRE = "AL AGUA PATO"
const UBICACION_DETALLE = "Los Flores, Santiago del Estero"

const temasInfo: Record<TemaFondo, string> = {
  acuatico: "ACUÁTICO",
  cuadradoblanco: "TARJETA",
  clasico: "CLÁSICO",
}

/* ============ CONFIG DE FONDOS REALES ============ */

interface CampoPos {
  top: string
  left: string
  align?: "left" | "center"
  maxWidth?: string
}

interface TemaConfig {
  imagen: string
  aspect: string
  colorTexto: string
  colorNombre?: string
  /** Color del texto de edad/turno; default = colorNombre si no se define */
  colorEdad?: string
  sombra: boolean
  nombre: CampoPos
  fecha: CampoPos
  horario: CampoPos
  ubicacion: CampoPos
  /** Si está definido, las 3 filas de ícono+texto se renderizan agrupadas y centradas como bloque en vez de posicionadas individualmente */
  filasAgrupadas?: { top: string; gap: string }
  /** Si es true, cada fila se centra individualmente dentro del bloque agrupado (en vez de alinearse a la izquierda formando una columna de íconos) */
  filasCentradasIndividualmente?: boolean
  /** Color de sombra sólida offset (estilo bubble-letter, sin blur) para nombre/edad, en vez del drop-shadow por defecto */
  colorSombraNombre?: string
  /** Offset (en em) de la sombra sólida de la edad/turno; default "0.06em" */
  sombraOffsetEdad?: string
  /** Si es true, la edad/turno se renderiza sin sombra aunque el nombre sí la tenga (colorSombraNombre) */
  sinSombraEdad?: boolean
  /** Clases de tipografía para fecha/horario/ubicación (línea principal); default si no se define */
  infoMainClass?: string
  /** Clases de tipografía para la línea de detalle de ubicación; default si no se define */
  infoDetailClass?: string
  /** Función que devuelve la clase de margen entre nombre y edad según el largo del nombre; default = margenEdadClass */
  margenEdadFn?: (nombre: string) => string
  /** Función que devuelve la clase de tamaño del nombre según su largo; default = tamañoNombreClass */
  tamañoNombreFn?: (nombre: string) => string
  /** Clase de tamaño de la línea de edad/turno; default "text-xs sm:text-sm" */
  edadTextClass?: string
  /** Tamaño (px) de los íconos de calendario/reloj/pin; default 20 */
  iconSize?: number
}

const TEMAS_CONFIG: Record<TemaFondo, TemaConfig> = {
  clasico: {
    imagen: "/invitacion-clasico.webp",
    aspect: "1102/1427",
    colorTexto: "#FFFFFF",
    colorNombre: "#06BEDD",
    colorEdad: "#FFFFFF",
    sombra: true,
    nombre: { top: "49%", left: "50%", align: "center", maxWidth: "82%" },
    fecha: { top: "61.5%", left: "23%", align: "left" },
    horario: { top: "68.5%", left: "23%", align: "left" },
    ubicacion: { top: "75.5%", left: "23%", align: "left" },
    filasAgrupadas: { top: "69%", gap: "14px" },
    colorSombraNombre: "#046E82",
    infoMainClass: "font-black text-[16px] sm:text-[18px] tracking-wide",
    infoDetailClass: "font-black text-[12px] sm:text-[13px] tracking-wide",
  },
  cuadradoblanco: {
    imagen: "/invitacion-cuadradoblanco.webp",
    aspect: "1081/1455",
    colorTexto: "#123B4A",
    colorNombre: "#06BEDD",
    colorEdad: "#FFFFFF",
    sombra: false,
    nombre: { top: "50%", left: "50%", align: "center", maxWidth: "82%" },
    fecha: { top: "66%", left: "16%", align: "left" },
    horario: { top: "72.5%", left: "16%", align: "left" },
    ubicacion: { top: "79%", left: "16%", align: "left" },
    filasAgrupadas: { top: "74%", gap: "14px" },
    colorSombraNombre: "#046E82",
    sombraOffsetEdad: "0.05em",
    margenEdadFn: margenEdadClassAmplio,
    tamañoNombreFn: tamañoNombreClassGrande,
    edadTextClass: "text-sm sm:text-base",
    iconSize: 24,
    infoMainClass: "font-extrabold text-[16px] sm:text-[18px]",
    infoDetailClass: "font-medium text-[12px] sm:text-[13px]",
  },
  acuatico: {
    imagen: "/invitacion-acuatico.webp",
    aspect: "1087/1447",
    colorTexto: "#123B4A",
    colorNombre: "#06BEDD",
    colorEdad: "#123B4A",
    sombra: false,
    nombre: { top: "58%", left: "50%", align: "center", maxWidth: "80%" },
    fecha: { top: "74%", left: "18%", align: "left" },
    horario: { top: "80%", left: "18%", align: "left" },
    ubicacion: { top: "86%", left: "18%", align: "left" },
    filasAgrupadas: { top: "75.5%", gap: "15px" },
    filasCentradasIndividualmente: true,
    colorSombraNombre: "#046E82",
    sinSombraEdad: true,
    iconSize: 20,
    infoMainClass: "font-extrabold text-[14px] sm:text-[16px]",
    infoDetailClass: "font-medium text-[11px] sm:text-[12px]",
  },
}

/** Achica la tipografía Anton del nombre a medida que el texto es más largo (evita overflow) */
function tamañoNombreClass(nombre: string): string {
  const len = nombre?.length ?? 0
  if (len <= 10) return "text-3xl sm:text-4xl"
  if (len <= 16) return "text-2xl sm:text-3xl"
  if (len <= 24) return "text-xl sm:text-2xl"
  return "text-lg sm:text-xl"
}

/** Variante más grande de tamañoNombreClass, para temas con más espacio disponible arriba de la info */
function tamañoNombreClassGrande(nombre: string): string {
  const len = nombre?.length ?? 0
  if (len <= 10) return "text-4xl sm:text-5xl"
  if (len <= 16) return "text-3xl sm:text-4xl"
  if (len <= 24) return "text-2xl sm:text-3xl"
  return "text-xl sm:text-2xl"
}

/** Margen entre nombre y edad, proporcional al tamaño de fuente del nombre (mismos tiers que tamañoNombreClass) */
function margenEdadClass(nombre: string): string {
  const len = nombre?.length ?? 0
  if (len <= 10) return "mt-0.5"
  if (len <= 16) return "mt-0.5"
  if (len <= 24) return "mt-[1px]"
  return "mt-0"
}

/** Variante con más aire entre nombre y edad, para temas donde el bloque quedó muy pegado */
function margenEdadClassAmplio(nombre: string): string {
  const len = nombre?.length ?? 0
  if (len <= 10) return "mt-2"
  if (len <= 16) return "mt-1.5"
  if (len <= 24) return "mt-1"
  return "mt-0.5"
}

function CampoOverlay({ pos, children }: { pos: CampoPos; children: React.ReactNode }) {
  const align = pos.align ?? "left"
  return (
    <div
      className="absolute"
      style={{
        top: pos.top,
        left: pos.left,
        maxWidth: pos.maxWidth,
        // width explícito: evita que el cálculo de "available width" a partir de left:50%
        // (previo a aplicar el translate visual) le recorte el ancho a la mitad de la tarjeta
        width: align === "center" ? "max-content" : undefined,
        transform: align === "center" ? "translate(-50%, -50%)" : "translateY(-50%)",
        textAlign: align,
      }}
    >
      {children}
    </div>
  )
}

function FilaConIcono({
  pos,
  icon: Icon,
  color,
  size = 20,
  multilinea = false,
  children,
}: {
  pos: CampoPos
  icon: typeof Calendar
  color: string
  size?: number
  multilinea?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`absolute flex gap-2 ${multilinea ? "items-start" : "items-center"}`}
      style={{ top: pos.top, left: pos.left, transform: "translateY(-50%)" }}
    >
      <Icon size={size} color={color} strokeWidth={2.5} className={`shrink-0 ${multilinea ? "mt-0.5" : ""}`} />
      <div>{children}</div>
    </div>
  )
}

/** Versión sin posicionamiento absoluto, para usar dentro de un grupo ya posicionado */
function FilaIconoInline({
  icon: Icon,
  color,
  size = 20,
  multilinea = false,
  gapClass = 'gap-2',
  children,
}: {
  icon: typeof Calendar
  color: string
  size?: number
  multilinea?: boolean
  gapClass?: string
  children: React.ReactNode
}) {
  return (
    <div className={`flex ${gapClass} ${multilinea ? "items-start" : "items-center"}`}>
      <Icon size={size} color={color} strokeWidth={2.5} className={`shrink-0 ${multilinea ? "mt-0.5" : ""}`} />
      <div>{children}</div>
    </div>
  )
}

/* ============ TEMA GENÉRICO SOBRE IMAGEN DE FONDO ============ */

function TemaImagen({ tema, nombre, fechaLegible, horarioLimpio, detalleEdadOTurno }: DatosInvitacion & { tema: TemaFondo }) {
  const cfg = TEMAS_CONFIG[tema]
  const sombraClass = cfg.sombra ? "drop-shadow-[0_3px_10px_rgba(0,0,0,0.5)]" : ""
  const colorNombre = cfg.colorNombre ?? cfg.colorTexto
  const colorEdad = cfg.colorEdad ?? colorNombre
  const infoMainClass = cfg.infoMainClass ?? "font-extrabold text-[13px] sm:text-[15px]"
  const infoDetailClass = cfg.infoDetailClass ?? "font-medium text-[10px] sm:text-[11px]"

  // Sombra sólida offset (bubble-letter, sin blur) en vez del drop-shadow pesado, cuando el tema lo define
  const estiloNombre: React.CSSProperties = cfg.colorSombraNombre
    ? { color: colorNombre, textShadow: `0.08em 0.08em 0 ${cfg.colorSombraNombre}` }
    : { color: colorNombre }
  const estiloEdad: React.CSSProperties = cfg.colorSombraNombre && !cfg.sinSombraEdad
    ? { color: colorEdad, textShadow: `${cfg.sombraOffsetEdad ?? "0.06em"} ${cfg.sombraOffsetEdad ?? "0.06em"} 0 ${cfg.colorSombraNombre}` }
    : { color: colorEdad, opacity: cfg.sinSombraEdad ? 1 : 0.9 }
  const margenEdad = cfg.margenEdadFn ?? margenEdadClass
  const tamañoNombre = cfg.tamañoNombreFn ?? tamañoNombreClass
  const edadTextClass = cfg.edadTextClass ?? "text-xs sm:text-sm"
  const iconSize = cfg.iconSize ?? 20
  const claseSombraNombre = cfg.colorSombraNombre ? "" : sombraClass

  const textCenterClass = tema === 'acuatico' ? 'text-center' : ''
  const gapUbicacion = tema === 'acuatico' ? 'gap-1' : 'gap-2'

  const filaFecha = (
    <p className={`${infoMainClass} uppercase leading-tight ${sombraClass}`} style={{ color: cfg.colorTexto }}>
      {fechaLegible}
    </p>
  )
  const filaHorario = (
    <p className={`${infoMainClass} uppercase leading-tight ${sombraClass}`} style={{ color: cfg.colorTexto }}>
      {horarioLimpio}
    </p>
  )
  const filaUbicacion = (
    <>
      <p className={`${infoMainClass} uppercase leading-tight ${sombraClass} ${textCenterClass}`} style={{ color: cfg.colorTexto }}>
        {UBICACION_NOMBRE}
      </p>
      <p className={`${infoDetailClass} leading-tight ${sombraClass} ${textCenterClass}`} style={{ color: cfg.colorTexto, opacity: 0.85 }}>
        {UBICACION_DETALLE}
      </p>
    </>
  )

  return (
    <div className="relative w-full overflow-hidden transition-[aspect-ratio] duration-500 ease-in-out" style={{ aspectRatio: cfg.aspect }}>
      <Image src={cfg.imagen} alt={`Invitación ${tema}`} fill priority sizes="420px" className="object-cover" />

      <CampoOverlay pos={cfg.nombre}>
        <div className="flex flex-col items-center">
          <h1
            className={`font-[family-name:var(--font-anton)] ${tamañoNombre(nombre)} uppercase leading-tight ${claseSombraNombre}`}
            style={estiloNombre}
          >
            {nombre}
          </h1>
          {detalleEdadOTurno && (
            <p className={`font-semibold ${edadTextClass} uppercase tracking-wide ${margenEdad(nombre)} ${claseSombraNombre}`} style={estiloEdad}>
              {detalleEdadOTurno}
            </p>
          )}
        </div>
      </CampoOverlay>

      {cfg.filasAgrupadas ? (
        <div
          className={`absolute flex flex-col ${cfg.filasCentradasIndividualmente ? "items-center" : "items-start"}`}
          style={{
            top: cfg.filasAgrupadas.top,
            left: "50%",
            gap: cfg.filasAgrupadas.gap,
            width: "max-content",
            transform: "translate(-50%, -50%)",
          }}
        >
          <FilaIconoInline icon={Calendar} color={cfg.colorTexto} size={iconSize}>{filaFecha}</FilaIconoInline>
          <FilaIconoInline icon={Clock} color={cfg.colorTexto} size={iconSize}>{filaHorario}</FilaIconoInline>
          <FilaIconoInline icon={MapPin} color={cfg.colorTexto} size={iconSize} multilinea gapClass={gapUbicacion}>{filaUbicacion}</FilaIconoInline>
        </div>
      ) : (
        <>
          <FilaConIcono pos={cfg.fecha} icon={Calendar} color={cfg.colorTexto} size={iconSize}>{filaFecha}</FilaConIcono>
          <FilaConIcono pos={cfg.horario} icon={Clock} color={cfg.colorTexto} size={iconSize}>{filaHorario}</FilaConIcono>
          <FilaConIcono pos={cfg.ubicacion} icon={MapPin} color={cfg.colorTexto} size={iconSize} multilinea>{filaUbicacion}</FilaConIcono>
        </>
      )}
    </div>
  )
}

/* ============ COMPONENTE PRINCIPAL ============ */

export default function InvitacionVIP() {
  const params = useParams()
  const id = params.id as string

  const [reserva, setReserva] = useState<ReservaInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [temaActual, setTemaActual] = useState<TemaFondo>("acuatico")

  const tarjetaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchReserva() {
      if (!id) return
      const supabase = createBrowserClient()

      // COEXISTENCIA TEMPORAL (hasta 2026-12-13, última fiesta con link viejo):
      // id numérico = link viejo (por id); uuid = token nuevo (no adivinable).
      // A partir del 2026-12-14: quitar la rama numérica y dropear get_invitacion_by_id.
      const esIdNumerico = /^\d+$/.test(id)
      const { data, error } = esIdNumerico
        ? await supabase.rpc("get_invitacion_by_id", { p_id: Number(id) }).maybeSingle()
        : await supabase.rpc("get_invitacion", { p_token: id }).maybeSingle()

      if (error || !data) {
        setError(true)
      } else {
        setReserva(data as ReservaInfo)
      }
      setLoading(false)
    }
    fetchReserva()
  }, [id])

  const capturarImagen = async () => {
    if (!tarjetaRef.current) return null
    try {
      setIsGenerating(true)
      const dataUrl = await toPng(tarjetaRef.current, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
      })
      setIsGenerating(false)
      return dataUrl
    } catch (err) {
      setIsGenerating(false)
      return null
    }
  }

  const handleDownload = async () => {
    const dataUrl = await capturarImagen()
    if (!dataUrl) return
    const link = document.createElement("a")
    link.download = `Invitacion_${reserva?.nombre_cumpleanero || "VIP"}.png`
    link.href = dataUrl
    link.click()
  }

  const handleShare = async () => {
    const dataUrl = await capturarImagen()
    if (!dataUrl) return
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], "invitacion.png", { type: "image/png" })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: '¡Estás invitado!', text: '¡Te espero! ✨' })
      } else {
        handleDownload()
        alert("Imagen descargada. Ya podés compartirla manualmente.")
      }
    } catch (err) {}
  }

  if (loading) return <div className="min-h-[100dvh] bg-black flex items-center justify-center"><Loader2 className="w-10 h-10 text-yellow-500 animate-spin" /></div>

  if (error || !reserva) return <div className="min-h-[100dvh] bg-black flex flex-col items-center justify-center text-white p-4 text-center"><AlertTriangle className="w-12 h-12 text-red-500 mb-4" /><h2 className="text-xl font-bold">Enlace no válido</h2></div>

  const [year, month, day] = reserva.fecha.split("-")
  const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"]
  const fechaLegible = `${day} DE ${meses[Number(month) - 1]}`

  const isEgresadito = reserva.nombre_cumpleanero?.includes("🎓")
  const nombreLimpio = isEgresadito ? reserva.nombre_cumpleanero.replace("🎓", "").trim() : reserva.nombre_cumpleanero
  const edadFormat = reserva.edad_cumple ? (reserva.edad_cumple === "1" ? "1 AÑITO" : `${reserva.edad_cumple} AÑITOS`) : ""
  const detalleEdadOTurno = isEgresadito ? `TURNO ${reserva.edad_cumple}` : edadFormat

  // EXTRAER SOLO LA HORA (ej: si es "1er Turno(12 a 16)" saca "12 a 16")
  const matchHora = reserva.turno?.match(/\((.*?)\)/);
  const horarioLimpio = matchHora ? matchHora[1].trim() : reserva.turno;

  const datosInvitacion: DatosInvitacion = {
    nombre: nombreLimpio,
    fechaLegible,
    horarioLimpio,
    detalleEdadOTurno,
  }

  return (
    <main
      className="min-h-[100dvh] bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center py-12 px-4"
      style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}
    >
      <div className="w-full max-w-[420px] mx-auto">

        {/* ENCABEZADO */}
        <div className="text-center mb-8 sm:mb-12">
          <h1
            className="animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out text-4xl sm:text-6xl font-black mb-2 sm:mb-3 leading-tight"
            style={{
              background: 'linear-gradient(120deg, #00BEE2 0%, #F5803A 60%, #F7C73F 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              filter: 'drop-shadow(0 4px 12px rgba(0,190,226,0.25))',
            }}
          >
            Tu Invitación
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150 ease-out fill-mode-both text-sm sm:text-base font-light tracking-wide px-2" style={{ color: '#64748b' }}>
            Selecciona el diseño y personaliza
          </p>
        </div>

        {/* SELECTOR DE TEMAS - Botones limpios */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-12 justify-center px-1">
          {(Object.keys(temasInfo) as TemaFondo[]).map((key) => (
            <button
              key={key}
              onClick={() => setTemaActual(key)}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                temaActual === key
                  ? "scale-105 sm:scale-110"
                  : "hover:scale-105 active:scale-95 opacity-60 hover:opacity-80 active:opacity-90"
              }`}
              style={{
                background: temaActual === key ? 'linear-gradient(120deg, #00BEE2 0%, #F5803A 60%, #F7C73F 100%)' : 'transparent',
                color: temaActual === key ? '#ffffff' : '#1a202c',
                border: temaActual === key ? 'none' : '2px solid #cbd5e1',
                boxShadow: temaActual === key ? '0 6px 16px rgba(245,128,58,0.35)' : 'none',
                outlineColor: '#1a202c',
              }}
            >
              {temasInfo[key]}
            </button>
          ))}
        </div>

        {/* TARJETA — wrapper con sombra (sin recorte) > wrapper con esquinas redondeadas (solo visual, recorta en pantalla) > nodo capturado para descarga (sin redondeo, para que el PNG exportado mantenga bordes rectos) */}
        <div className="relative mx-auto w-full mb-8 sm:mb-12" style={{
          filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.15))'
        }}>
          <div className="rounded-[24px] sm:rounded-[28px] overflow-hidden">
            <div ref={tarjetaRef} className="relative w-full">
              <TemaImagen tema={temaActual} {...datosInvitacion} />
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN - Diseño limpio y elegante */}
        <div className="flex flex-col gap-3 w-full">
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full h-12 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: '#1a202c',
              color: '#ffffff',
              borderColor: '#1a202c',
              outlineColor: '#1a202c',
            }}
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isGenerating ? 'Generando...' : 'Descargar'}
          </Button>
          <Button
            onClick={handleShare}
            disabled={isGenerating}
            className="w-full h-12 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: '#ffffff',
              color: '#1a202c',
              borderColor: '#1a202c',
              outlineColor: '#1a202c',
            }}
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            {isGenerating ? 'Generando...' : 'Compartir'}
          </Button>
        </div>

      </div>
    </main>
  )
}
