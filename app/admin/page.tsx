"use client"

import { useState, useEffect, useCallback } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Calendar, 
  Trash2, 
  LogOut, 
  Waves, 
  Phone, 
  User, 
  Banknote,
  Loader2,
  Mail,
  CheckCircle2,
  Clock,
  Lock
} from "lucide-react"

export default function AdminPage() {
  const [supabase] = useState(() => createBrowserClient())

  const [usuario, setUsuario] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [reservas, setReservas] = useState<any[]>([])
  const [isFetching, setIsFetching] = useState(true)

  const fetchReservas = useCallback(async () => {
    setIsFetching(true)
    const { data, error } = await supabase
      .from("reservas")
      .select("*")
      .order("fecha", { ascending: true })

    if (!error && data) {
      setReservas(data)
    }
    setIsFetching(false)
  }, [supabase])

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session)
        if (session) fetchReservas()
        else setIsFetching(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session)
        if (_event === 'SIGNED_IN') fetchReservas()
        if (_event === 'SIGNED_OUT') {
          setReservas([])
          setIsFetching(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchReservas])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // MAGIA DE SEGURIDAD: Convertimos el usuario "LorenaAdmin" en email para Supabase
    let loginEmail = usuario
    if (!usuario.includes("@")) {
      loginEmail = `${usuario}@alaguapato.com`
    }

    const { error } = await supabase.auth.signInWithPassword({ 
      email: loginEmail, 
      password 
    })
    
    if (error) {
      window.alert("Error al iniciar sesión: Usuario o contraseña incorrectos")
    }
    setIsLoading(false)
  }

  const handleLogout = async () => await supabase.auth.signOut()

  const handleEliminarReserva = async (id: number, nombre: string, fecha: string) => {
    const confirmar = window.confirm(`¿Estás segura de que querés ELIMINAR la reserva de ${nombre}?`)
    if (!confirmar) return

    const { error } = await supabase.from("reservas").delete().eq("id", id)
    if (error) window.alert("Hubo un error al eliminar la reserva.")
    else setReservas(reservas.filter((r) => r.id !== id))
  }

  const handleToggleEstado = async (id: number, estadoActual: string) => {
    const nuevoEstado = (!estadoActual || estadoActual === "Pendiente") ? "Confirmada" : "Pendiente"
    
    const { error } = await supabase
      .from("reservas")
      .update({ estado: nuevoEstado })
      .eq("id", id)

    if (error) {
      window.alert("Error al actualizar el estado.")
    } else {
      setReservas(reservas.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r))
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-16 h-16 bg-azul-claro/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-azul-claro" />
            </div>
            <h1 className="text-2xl font-bold text-azul-marino">Acceso Privado</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Input 
                type="text" 
                placeholder="Ej: LorenaAdmin"
                value={usuario} 
                onChange={(e) => setUsuario(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <Button type="submit" className="w-full h-12 bg-azul-marino hover:bg-azul-marino/90 font-bold text-white mt-4" disabled={isLoading}>
              {isLoading && <Loader2 className="h-5 w-5 animate-spin mr-2" />} Ingresar
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <nav className="bg-azul-marino text-white p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="h-6 w-6 text-amarillo" />
            <span className="font-bold text-lg">Panel de Lorena</span>
          </div>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Salir
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 mt-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-azul-marino">Próximos Eventos</h2>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-border shadow-sm flex items-center gap-2">
            <Calendar className="h-5 w-5 text-azul-claro" />
            <span className="font-bold text-azul-marino">{reservas.length} activas</span>
          </div>
        </div>

        {isFetching ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-azul-claro" /></div>
        ) : reservas.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-border shadow-sm">
            <h3 className="text-xl font-bold text-azul-marino">No hay reservas pendientes</h3>
          </div>
        ) : (
          <div className="grid gap-4">
            {reservas.map((reserva) => {
              let fechaFormateada = reserva.fecha
              try { fechaFormateada = format(parseISO(reserva.fecha), "EEEE d 'de' MMMM, yyyy", { locale: es }) } catch (e) {}
              
              const isConfirmada = reserva.estado === "Confirmada"

              return (
                <div key={reserva.id} className="bg-white rounded-xl border border-border shadow-sm p-5 md:p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                  <div className="grid sm:grid-cols-2 gap-4 lg:gap-8 flex-1 w-full">
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-azul-claro uppercase tracking-wider">Fecha y Turno</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${isConfirmada ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {isConfirmada ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {isConfirmada ? 'CONFIRMADA' : 'PENDIENTE'}
                        </span>
                      </div>
                      <p className="font-bold text-lg text-azul-marino capitalize">{fechaFormateada}</p>
                      <p className="text-muted-foreground font-medium">{reserva.turno}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-bold text-azul-claro uppercase tracking-wider">Cliente</p>
                      <div className="flex items-center gap-2 text-azul-marino font-semibold">
                        <User className="h-4 w-4 text-muted-foreground" /> {reserva.nombre}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" /> {reserva.telefono}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground break-all">
                        <Mail className="h-4 w-4 shrink-0" /> {reserva.email || "Sin email registrado"}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-bold text-azul-claro uppercase tracking-wider">Detalles</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-azul-marino">Cumpleañero:</span> {reserva.nombre_cumpleanero || "N/A"} ({reserva.edad_cumple ? reserva.edad_cumple + " años" : "-"})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-azul-marino">Extras:</span> {reserva.extras_elegidos || "Ninguno"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-bold text-azul-claro uppercase tracking-wider">Pago</p>
                      <div className="flex items-center gap-2 text-azul-marino">
                        <Banknote className="h-4 w-4 text-verde" /> <span className="font-semibold">{reserva.metodo_pago}</span>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">Total: ${reserva.total.toLocaleString("es-AR")}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border min-w-[160px]">
                    <Button 
                      variant={isConfirmada ? "outline" : "default"}
                      className={isConfirmada ? "" : "bg-verde hover:bg-verde/90 text-white"}
                      onClick={() => handleToggleEstado(reserva.id, reserva.estado)}
                    >
                      {isConfirmada ? "Marcar Pendiente" : "Confirmar Seña"}
                    </Button>

                    {reserva.telefono ? (
                      <a 
                        href={`https://wa.me/549${reserva.telefono.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                        className="w-full flex justify-center items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-2 px-4 rounded-md border border-green-200 transition-colors text-sm"
                      >
                        <Phone className="h-4 w-4" /> WhatsApp
                      </a>
                    ) : null}
                    
                    <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleEliminarReserva(reserva.id, reserva.nombre, reserva.fecha)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}