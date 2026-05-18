"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { CalendarDays, Clock, MapPin, Loader2, Download, Share2, AlertTriangle, Sparkles, Palette } from "lucide-react"
import Image from "next/image"
import { toPng } from "html-to-image"
import { Button } from "@/components/ui/button"

interface ReservaInfo {
  fecha: string
  turno: string
  nombre_cumpleanero: string
  edad_cumple: string
}

type TemaFondo = "oro" | "blanca" | "azul"

export default function InvitacionVIP() {
  const params = useParams()
  const id = params.id as string

  const [reserva, setReserva] = useState<ReservaInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [temaActual, setTemaActual] = useState<TemaFondo>("oro")
  
  const tarjetaRef = useRef<HTMLDivElement>(null)

  const temas = {
    oro: {
      nombre: "DORADO",
      archivo: "/invita-oro.png",
      colorNombre: "text-white",
      colorLabel: "text-yellow-400",
      colorValor: "text-white",
      colorIconoBg: "bg-gradient-to-br from-yellow-300 to-yellow-500",
      colorIconoRing: "ring-yellow-200/40",
      colorIcono: "text-black",
      colorBadgeBg: "bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500",
      colorBadgeRing: "ring-yellow-300/40",
      colorBadgeText: "text-black",
      colorDot: "bg-yellow-400",
      colorDotShadow: "shadow-[0_0_8px_rgba(255,255,255,0.6)]",
      colorLine: "to-white/40",
      colorFooter: "text-yellow-400/70",
      colorBtnShare: "bg-yellow-500 hover:bg-yellow-400 text-black",
      colorInstruccion: "text-yellow-500",
    },
    blanca: {
      nombre: "CELESTE",
      archivo: "/invita-blanca.png",
      colorNombre: "text-white",
      colorLabel: "text-blue-500",
      colorValor: "text-slate-800",
      colorIconoBg: "bg-gradient-to-br from-blue-400 to-blue-600",
      colorIconoRing: "ring-blue-300/40",
      colorIcono: "text-white",
      colorBadgeBg: "bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600",
      colorBadgeRing: "ring-blue-300/40",
      colorBadgeText: "text-white",
      colorDot: "bg-blue-500",
      colorDotShadow: "shadow-[0_0_8px_rgba(59,130,246,0.6)]",
      colorLine: "to-blue-500/40",
      colorFooter: "text-blue-600/70",
      colorBtnShare: "bg-blue-600 hover:bg-blue-500 text-white",
      colorInstruccion: "text-blue-600",
    },
    azul: {
      nombre: "CIAN",
      archivo: "/invita-azul.png",
      colorNombre: "text-white",
      colorLabel: "text-cyan-400",
      colorValor: "text-white",
      colorIconoBg: "bg-gradient-to-br from-cyan-300 to-cyan-500",
      colorIconoRing: "ring-cyan-200/40",
      colorIcono: "text-black",
      colorBadgeBg: "bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500",
      colorBadgeRing: "ring-cyan-300/40",
      colorBadgeText: "text-black",
      colorDot: "bg-cyan-400",
      colorDotShadow: "shadow-[0_0_8px_rgba(255,255,255,0.6)]",
      colorLine: "to-white/40",
      colorFooter: "text-cyan-400/70",
      colorBtnShare: "bg-cyan-500 hover:bg-cyan-400 text-black",
      colorInstruccion: "text-cyan-400",
    }
  }

  const t = temas[temaActual]

  useEffect(() => {
    async function fetchReserva() {
      if (!id) return
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from("reservas")
        .select("fecha, turno, nombre_cumpleanero, edad_cumple")
        .eq("id", id)
        .single()

      if (error || !data) {
        setError(true)
      } else {
        setReserva(data)
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

  return (
    <main className={`min-h-[100dvh] ${temaActual === 'blanca' ? 'bg-slate-200' : 'bg-neutral-950'} flex flex-col items-center justify-center py-6 px-4 transition-colors duration-500`}>
      <div className="w-full max-w-[400px] mx-auto">
        
        {/* ENCABEZADO ULTRA INTUITIVO */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className={`w-4 h-4 ${t.colorInstruccion} animate-pulse`} />
            <h1 className={`text-sm font-black uppercase tracking-[0.2em] ${t.colorInstruccion}`}>
              ¡Personaliza tu invitación!
            </h1>
            <Sparkles className={`w-4 h-4 ${t.colorInstruccion} animate-pulse`} />
          </div>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${temaActual === 'blanca' ? 'text-slate-600' : 'text-white/60'}`}>
            Toca un botón para cambiar el color 👇
          </p>
        </div>

        {/* SELECTOR TIPO PANEL DE CONTROL */}
        <div className="bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl flex items-center gap-2 mb-6 border border-white/10 mx-auto shadow-2xl">
          <div className="pl-3 pr-1">
             <Palette className={`w-4 h-4 ${t.colorInstruccion}`} />
          </div>
          <div className="flex gap-1.5 flex-1">
            {(Object.keys(temas) as TemaFondo[]).map((key) => (
              <button 
                key={key} 
                onClick={() => setTemaActual(key)} 
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all duration-300 flex items-center justify-center border ${temaActual === key ? "bg-white text-black border-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "bg-black/20 text-slate-400 border-white/5 hover:border-white/20"}`}
              >
                {temas[key].nombre}
              </button>
            ))}
          </div>
        </div>

        {/* TARJETA - REPARACIÓN: Eliminado aspect-[4/5] y agregado contenedor dinámico con Next Image */}
        <div ref={tarjetaRef} className="relative mx-auto w-full min-h-[520px] flex flex-col justify-center overflow-hidden rounded-none shadow-2xl">
          
          {/* IMAGEN OPTIMIZADA POR NEXT.JS PARA CARGA RÁPIDA EN MÓVILES */}
          <Image 
            src={t.archivo} 
            alt="Fondo Invitación" 
            fill 
            priority 
            quality={90}
            className="object-cover z-0" 
          />

          <div className="relative z-10 flex flex-col h-full w-full items-center justify-center p-6 mx-auto">
            
            {/* GRUPO SUPERIOR */}
            <div className="flex flex-col items-center justify-center w-full mx-auto">
              
              <div className="relative w-24 h-24 bg-white rounded-full p-1.5 border-4 border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.5)] overflow-hidden shrink-0 mx-auto">
                {/* Logo con priority para que no titile ni cargue lento */}
                <Image src="/logo-circular.png" alt="Logo" fill priority className="object-cover rounded-full scale-125" />
              </div>

              {/* Ajuste de tamaño responsive: text-[50px] en celulares muy chicos, text-[64px] desde tablets */}
              <h1 className={`font-[family-name:var(--font-anton)] italic text-[50px] sm:text-[64px] ${t.colorNombre} uppercase tracking-normal mt-3 text-center drop-shadow-[0_6px_20px_rgba(0,0,0,0.9)] leading-none mx-auto w-full`}>
                {nombreLimpio}
              </h1>

              {(reserva.edad_cumple || isEgresadito) && (
                <div className="relative mt-3 flex items-center justify-center w-full mx-auto">
                  <div className={`w-1.5 h-7 ${t.colorBadgeBg} transform -skew-x-[24deg] mr-1 opacity-40 blur-[1px]`} />
                  <div className={`w-2 h-7 ${t.colorBadgeBg} transform -skew-x-[24deg] mr-1.5 opacity-80`} />
                  
                  <div className={`transform -skew-x-[24deg] ${t.colorBadgeBg} ring-1 ${t.colorBadgeRing} shadow-[0_10px_30px_rgba(0,0,0,0.6)] px-8 py-1 flex items-center justify-center`}>
                    <p className={`transform skew-x-[24deg] font-[family-name:var(--font-anton)] ${t.colorBadgeText} text-xl sm:text-2xl md:text-3xl italic tracking-wider uppercase leading-none pt-0.5`}>
                      {isEgresadito ? `TURNO ${reserva.edad_cumple}` : edadFormat}
                    </p>
                  </div>
                  
                  <div className={`w-2 h-7 ${t.colorBadgeBg} transform -skew-x-[24deg] ml-1.5 opacity-80`} />
                  <div className={`w-1.5 h-7 ${t.colorBadgeBg} transform -skew-x-[24deg] ml-1 opacity-40 blur-[1px]`} />
                </div>
              )}
            </div>

            {/* GRUPO INFERIOR */}
            <div className="w-full flex justify-center mt-8">
              <div className="w-fit flex flex-col gap-4">
                
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.colorIconoBg} ring-2 ${t.colorIconoRing} shadow-lg flex items-center justify-center shrink-0`}>
                    <CalendarDays className={`w-5 h-5 ${t.colorIcono}`} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col justify-center text-left">
                    <p className={`text-[10px] font-black ${t.colorLabel} uppercase tracking-widest leading-none mb-1`}>Día del evento</p>
                    <p className={`${t.colorValor} font-bold text-[16px] sm:text-[17px] leading-none uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]`}>{fechaLegible}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.colorIconoBg} ring-2 ${t.colorIconoRing} shadow-lg flex items-center justify-center shrink-0`}>
                    <Clock className={`w-5 h-5 ${t.colorIcono}`} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col justify-center text-left">
                    <p className={`text-[10px] font-black ${t.colorLabel} uppercase tracking-widest leading-none mb-1`}>Horario</p>
                    <p className={`${t.colorValor} font-bold text-[16px] sm:text-[17px] leading-none uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]`}>{reserva.turno}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.colorIconoBg} ring-2 ${t.colorIconoRing} shadow-lg flex items-center justify-center shrink-0`}>
                    <MapPin className={`w-5 h-5 ${t.colorIcono}`} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col justify-center text-left">
                    <p className={`text-[10px] font-black ${t.colorLabel} uppercase tracking-widest leading-none mb-1`}>Ubicación</p>
                    <p className={`${t.colorValor} font-bold text-[16px] sm:text-[17px] leading-none uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]`}>Al Agua Pato</p>
                    <p className={`${t.colorValor} opacity-90 text-[10px] font-medium uppercase mt-0.5 leading-none`}>Los Flores, Sgo. del Estero</p>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex items-center justify-center w-full max-w-[200px] mx-auto mt-6 mb-2">
              <div className={`flex-1 h-px bg-gradient-to-r from-transparent ${t.colorLine}`} />
              <div className={`w-1.5 h-1.5 rounded-full mx-3 ${t.colorDot} ${t.colorDotShadow}`} />
              <div className={`flex-1 h-px bg-gradient-to-l from-transparent ${t.colorLine}`} />
            </div>

            <div className="w-full text-center mx-auto mt-2">
              <p className={`text-[8.5px] ${t.colorFooter} uppercase tracking-[0.4em] font-extrabold`}>
                Al Agua Pato • Fiestas Infantiles
              </p>
            </div>

          </div>
        </div>

        {/* BOTONES */}
        <div className="grid grid-cols-2 gap-3 mt-8 mx-auto w-full">
          <Button onClick={handleDownload} disabled={isGenerating} variant="outline" className="h-14 font-black border-2 bg-white text-black hover:bg-slate-100 rounded-2xl uppercase tracking-tighter shadow-md">
             <Download className="w-4 h-4 mr-2" />
             Descargar
          </Button>
          <Button onClick={handleShare} disabled={isGenerating} className={`h-14 font-black shadow-xl rounded-2xl uppercase tracking-tighter ${t.colorBtnShare}`}>
             <Share2 className="w-4 h-4 mr-2" />
             Compartir
          </Button>
        </div>

      </div>
    </main>
  )
}