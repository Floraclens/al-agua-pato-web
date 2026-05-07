"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ServiciosIncluidos } from "@/components/servicios-incluidos"
import { PhotoGallery } from "@/components/photo-gallery"
import { 
  Sparkles, MapPin, CheckCircle2, Star, Quote, ArrowDown, 
  PartyPopper, Wand2, ArrowRight, ShieldCheck, X
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const scrollToGaleria = () => {
    document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <main className="min-h-screen bg-[#081524] font-sans">
      {/* AQUÍ ESTABA EL ERROR: Le sacamos el pb-20 que generaba la franja blanca */}
      <div className="bg-background">
        
        <header className="bg-white/90 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-amarillo shadow-sm bg-white shrink-0">
                  <Image src="/og-image.jpg" alt="Logo Al Agua Pato" fill className="object-cover" priority />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-extrabold text-azul-marino tracking-tight leading-none">Al Agua Pato</h1>
                    <Sparkles className="h-5 w-5 text-amarillo hidden sm:block" />
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 hidden sm:block">Predio de Eventos</span>
                </div>
              </div>
              <a href="https://google.com/maps" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 border-2 border-azul-marino text-azul-marino hover:bg-azul-marino hover:text-white transition-all duration-200 font-bold text-xs md:text-sm rounded-full shadow-sm hover:shadow-md active:scale-95">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Ver en Maps</span>
                <span className="sm:hidden">Ubicación</span>
              </a>
            </div>
          </div>
        </header>

        {/* --- PORTADA SUPER PREMIUM --- */}
        <section className="relative pt-16 pb-16 md:pt-28 md:pb-24 text-center px-4 overflow-hidden bg-slate-50">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-tr from-rosa/20 via-amarillo/20 to-azul-claro/20 blur-[100px] -z-10 rounded-full" />
          <Sparkles className="absolute top-24 left-[10%] md:left-[20%] w-8 h-8 text-amarillo animate-pulse opacity-70" />
          <PartyPopper className="absolute top-40 right-[5%] md:right-[15%] w-10 h-10 text-azul-claro opacity-50 -rotate-12" />

          <div className="relative z-10 max-w-5xl mx-auto space-y-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-rosa/30 shadow-[0_0_20px_rgba(236,72,153,0.15)] text-rosa font-black text-sm uppercase tracking-widest">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rosa opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rosa"></span>
              </span>
              ¡Agenda 2026 Abierta!
            </div>

            <div className="space-y-6">
              <h1 className="text-6xl md:text-[5.5rem] lg:text-[6.5rem] font-black text-azul-marino tracking-tighter leading-[1.05] drop-shadow-sm">
                Tu evento soñado es <br className="hidden md:block" />
                <span className="relative inline-block mt-2">
                  <span className="absolute -inset-2 bg-gradient-to-r from-rosa via-amarillo to-azul-claro blur-2xl opacity-40"></span>
                  <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-rosa via-naranja to-amarillo">
                    Inolvidable
                  </span>
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto text-balance font-medium leading-relaxed">
                <strong className="text-azul-marino font-extrabold">"Al agua pato"</strong> un espacio lleno de aventuras, juegos y experiencias únicas e inolvidables.
              </p>
            </div>

            <div className="max-w-xl mx-auto relative group mt-12">
              <div className="absolute -inset-1 bg-gradient-to-r from-azul-claro via-lavanda to-rosa rounded-[2rem] blur opacity-30 group-hover:opacity-70 transition duration-500"></div>
              <div className="relative bg-gradient-to-br from-white via-azul-claro/5 to-rosa/5 backdrop-blur-xl ring-1 ring-white/50 rounded-[2rem] p-6 md:p-8 text-left flex items-start sm:items-center gap-5 shadow-2xl overflow-hidden">
                <Sparkles className="absolute -top-4 -left-4 w-12 h-12 text-amarillo opacity-20 rotate-12" />
                <div className="relative z-10 bg-gradient-to-br from-amarillo to-naranja p-4 rounded-2xl shrink-0 shadow-inner">
                  <PartyPopper className="w-8 h-8 text-white" />
                </div>
                <div className="relative z-10">
                  <h4 className="font-black text-azul-marino mb-1.5 text-lg md:text-xl">¡Se viene algo <span className="text-rosa">increíble!</span> 🚀</h4>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium">
                    Muy pronto estrenamos un nuevo espacio que te hará <strong className="text-naranja font-bold">saltar de diversión</strong>... ¿Estás preparado para lo que se viene?
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-8">
              <div className="relative inline-block w-full sm:w-auto px-4 sm:px-0">
                <Star className="absolute -top-2 right-0 sm:-right-10 w-6 h-6 text-rosa animate-bounce opacity-70 z-20" />
                <div className="relative inline-block w-full sm:w-fit">
                  <div className="absolute -inset-x-2 -top-1 -bottom-4 bg-gradient-to-r from-amarillo via-naranja to-rosa rounded-full blur-xl opacity-70 animate-pulse"></div>
                  <Button 
                    onClick={scrollToGaleria}
                    className="group w-full sm:w-auto relative bg-gradient-to-r from-amarillo to-naranja text-azul-marino font-extrabold text-lg h-20 px-12 rounded-full border border-white/40 shadow-lg active:scale-95 transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-white/30 scale-0 rounded-full group-hover:scale-125 transition-transform duration-500 opacity-0 group-hover:opacity-100"></span>
                    <span className="relative z-10 flex items-center justify-center gap-3 uppercase tracking-wider animate-bounce mt-1">
                      ¡Conocenos! <ArrowDown className="h-6 w-6 text-azul-marino" />
                    </span>
                  </Button>
                </div>
              </div>

              <div className="max-w-md mx-auto flex items-center justify-center gap-3.5 px-6 py-3.5 rounded-full bg-gradient-to-br from-white via-rosa/5 to-white/80 backdrop-blur-xl border border-rosa/30 shadow-[0_5px_15px_-5px_rgba(236,72,153,0.15)] hover:shadow-[0_8px_25px_-5px_rgba(236,72,153,0.25)] hover:-translate-y-0.5 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-1000 w-full sm:w-auto text-left sm:text-center">
                <div className="bg-rosa/15 p-2.5 rounded-full shrink-0 shadow-inner">
                  <Sparkles className="w-5 h-5 text-rosa animate-pulse" />
                </div>
                <p className="text-sm md:text-base font-bold text-slate-700 leading-tight">
                  ¡Con tu seña te <strong className="text-rosa font-black tracking-tight">regalamos</strong> la <strong className="text-azul-marino font-black">Invitación Digital Interactiva</strong>! 🎁
                </p>
              </div>
            </div>
          </div>
        </section>

        <div id="galeria">
          <PhotoGallery />
        </div>

        {/* --- TESTIMONIOS --- */}
        <section className="py-16 md:py-24 bg-azul-claro/5 border-b border-border/50 overflow-hidden">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-black text-azul-marino">Lo que dicen las familias</h3>
              <p className="text-muted-foreground text-lg mt-2 font-medium">Cientos de eventos inolvidables nos avalan</p>
            </div>
            <div className="flex overflow-x-auto md:grid md:grid-cols-4 snap-x snap-mandatory gap-4 pb-6 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {[
                { nombre: "Laura G.", texto: "Festejamos los 5 de Mateo y salió todo perfecto. El predio es hermoso, súper limpio y los animadores unos genios totales. ¡Los chicos no pararon de jugar!" },
                { nombre: "Martín P.", texto: "Excelente atención de principio a fin. El show del Robot LED fue una locura, todos los invitados quedaron alucinados. Cero estrés para nosotros." },
                { nombre: "Sabrina V.", texto: "Súper recomendable. La comida, la organización, las chicas que atienden... de 10. Pagás y te olvidás de todo, ellos se encargan. Volveremos el año que viene." },
                { nombre: "Julieta F.", texto: "El mejor lugar al que fuimos. La ambientación es soñada y el pelotero es gigante. Estuvimos súper cómodos y nos atendieron como reyes." }
              ].map((review, i) => (
                <div key={i} className="min-w-[85%] sm:min-w-[60%] md:min-w-0 snap-center bg-white p-6 rounded-3xl shadow-sm border border-border/50 relative flex flex-col hover:-translate-y-1 transition-transform duration-300">
                  <Quote className="absolute top-5 right-5 w-8 h-8 text-azul-claro/20" />
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-5 h-5 fill-amarillo text-amarillo" />)}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-6 relative z-10 italic flex-1 font-medium">"{review.texto}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-azul-marino text-xs">
                      {review.nombre.charAt(0)}
                    </div>
                    <p className="font-bold text-azul-marino text-sm">{review.nombre}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- SECCIÓN QUÉ INCLUYE --- */}
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-azul-marino mb-4 flex flex-col md:flex-row items-center justify-center gap-3">
              <CheckCircle2 className="h-10 w-10 text-verde" /> ¿Qué incluye tu evento?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance font-medium">Todo está pensado para que disfruten al máximo sin preocuparse por nada.</p>
          </div>
          <div className="max-w-5xl mx-auto">
            <ServiciosIncluidos />
          </div>
        </div>

        {/* --- MAGIA A LA CARTA --- */}
        <section className="bg-azul-marino py-20 md:py-28 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lavanda/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-azul-claro/10 blur-[150px] rounded-full pointer-events-none" />

          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="text-center mb-16">
              <span className="text-rosa font-black tracking-widest uppercase text-sm mb-3 block drop-shadow-md">Personalizá tu evento</span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 flex flex-col md:flex-row items-center justify-center gap-3">
                <Wand2 className="h-10 w-10 text-lavanda drop-shadow-lg" /> Magia a la Carta
              </h2>
              <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto text-balance font-medium">
                Elegí entre nuestras increíbles opciones adicionales para llevar tu fiesta al siguiente nivel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[220px]">
              
              {/* Robot LED */}
              <div 
                className="relative group overflow-hidden rounded-[2rem] col-span-1 md:col-span-2 lg:col-span-2 row-span-2 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-zoom-in"
                onClick={() => setSelectedImage('/extras/robot.jpg')}
              >
                <Image src="/extras/robot.jpg" alt="Robot LED" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-azul-marino via-azul-marino/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="bg-amarillo text-azul-marino text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block shadow-lg shadow-amarillo/20">El más pedido</span>
                  <h3 className="text-2xl md:text-4xl font-black text-white mb-2 drop-shadow-md">Show Robot LED</h3>
                  <p className="text-white/80 text-sm md:text-lg font-medium line-clamp-2">Luces, humo y pura energía para hacer bailar a todos los invitados.</p>
                </div>
              </div>

              {/* Astronautas LED */}
              <div 
                className="relative group overflow-hidden rounded-[2rem] col-span-1 md:col-span-1 lg:col-span-2 row-span-1 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-zoom-in"
                onClick={() => setSelectedImage('/extras/astronautas.jpg')}
              >
                <Image src="/extras/astronautas.jpg" alt="Team Astronautas" fill className="object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl md:text-2xl font-black text-white mb-1 drop-shadow-md">Team Astronautas LED</h3>
                  <p className="text-white/80 text-sm md:text-base font-medium">Un show de otro planeta.</p>
                </div>
              </div>

              {/* Zancos LED */}
              <div 
                className="relative group overflow-hidden rounded-[2rem] col-span-1 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-zoom-in"
                onClick={() => setSelectedImage('/extras/zancos.jpg')}
              >
                <Image src="/extras/zancos.jpg" alt="Zancos LED" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-lavanda/90 via-lavanda/30 to-transparent mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl font-black text-white mb-1 drop-shadow-md">Zancos LED</h3>
                  <p className="text-white/80 text-sm font-medium">Diversión de altura.</p>
                </div>
              </div>

              {/* Personajes a elección */}
              <div 
                className="relative group overflow-hidden rounded-[2rem] col-span-1 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-zoom-in"
                onClick={() => setSelectedImage('/extras/personajes.jpg')}
              >
                <Image src="/extras/personajes.jpg" alt="Personajes" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-rosa/90 via-rosa/30 to-transparent mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl font-black text-white mb-1 drop-shadow-md">Personajes</h3>
                  <p className="text-white/80 text-sm font-medium">Elegí el favorito del cumpleañero.</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- PASO A PASO --- */}
        <section className="py-20 md:py-28 container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-3xl md:text-5xl font-black text-azul-marino mb-20">El camino a la fiesta perfecta</h2>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-1.5 bg-gradient-to-r from-azul-claro/30 to-rosa/30 rounded-full" />
            {[
              { n: '1', t: 'Explorá', d: 'Conocé nuestro increíble predio.', c: 'from-azul-claro to-blue-400' },
              { n: '2', t: 'Personalizá', d: 'Elegí tu fecha y sumá tus extras.', c: 'from-lavanda to-purple-400' },
              { n: '3', t: '¡A disfrutar!', d: 'Aboná la seña y recibí tu invitación.', c: 'from-rosa to-pink-400' },
            ].map((s, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center group">
                <div className={`w-24 h-24 bg-gradient-to-br ${s.c} rounded-full shadow-lg flex items-center justify-center border-4 border-white mb-6 transition-transform group-hover:-translate-y-2`}>
                  <span className="text-4xl font-black text-white">{s.n}</span>
                </div>
                <h4 className="text-2xl font-black text-azul-marino mb-2">{s.t}</h4>
                <p className="text-muted-foreground font-medium max-w-[250px]">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- SÚPER BANNER FINAL --- */}
        <section className="relative py-24 overflow-hidden bg-azul-marino">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />
          <div className="absolute -top-[200px] -right-[200px] w-[500px] h-[500px] bg-amarillo/30 blur-[120px] rounded-full" />
          <div className="absolute -bottom-[200px] -left-[200px] w-[500px] h-[500px] bg-rosa/30 blur-[120px] rounded-full" />
          
          <div className="relative z-10 container mx-auto px-4 text-center">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <ShieldCheck className="w-5 h-5 text-verde" />
              <span className="text-white text-sm font-bold tracking-wide">Reserva online 100% segura</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              ¿Listos para vivir la magia?
            </h2>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-medium mb-12 text-balance">
              Elegí tu fecha, armá tu paquete ideal y asegurá el mejor cumpleaños para tu familia.
            </p>

            <div className="relative inline-block w-full sm:w-auto px-4 sm:px-0 mt-8">
               <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-azul-marino text-xs md:text-sm font-extrabold px-4 py-2 rounded-full shadow-xl animate-bounce z-20 border-2 border-rosa/30">
                 🎁 ¡Incluye Invitación Digital VIP!
                 <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-solid border-t-white border-t-8 border-x-transparent border-x-8 border-b-0" />
               </div>

               <div className="absolute -inset-x-2 -top-1 -bottom-4 bg-gradient-to-r from-amarillo via-naranja to-rosa rounded-full blur-2xl opacity-80 animate-pulse" />
               
               <Link href="/reservar" className="block w-full">
                 <Button className="group w-full sm:w-auto relative bg-gradient-to-r from-amarillo to-naranja text-azul-marino font-extrabold text-[16px] sm:text-xl h-auto min-h-[72px] py-4 px-8 sm:px-14 rounded-full border border-white/40 shadow-2xl active:scale-95 transition-all duration-300 overflow-hidden">
                   <span className="absolute inset-0 bg-white/30 scale-0 rounded-full group-hover:scale-125 transition-transform duration-500 opacity-0 group-hover:opacity-100" />
                   <span className="relative z-10 flex items-center justify-center gap-3 uppercase tracking-wide text-center leading-tight">
                     Ver Fechas Disponibles <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                   </span>
                 </Button>
               </Link>
            </div>
          </div>
        </section>
      </div> {/* <-- FIN DEL WRAPPER BLANCO (bg-background) */}

      {/* --- FOOTER COMPACTO (Ahora con padding para el botón móvil) --- */}
      <footer className="bg-[#081524] text-white pt-10 pb-28 lg:pb-10 border-t-4 border-amarillo relative z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-4">
             <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                <Image src="/og-image.jpg" alt="Logo Al Agua Pato" fill className="object-cover" />
             </div>
             <div className="space-y-1">
               <h4 className="text-xl font-bold tracking-wide">Al Agua Pato</h4>
               <p className="text-xs text-white/60 font-medium">Predio de Eventos Mágicos</p>
             </div>
             <div className="w-8 h-px bg-white/10 my-1" />
             <p className="text-[11px] text-white/40 font-medium">
               © {new Date().getFullYear()} Todos los derechos reservados.
             </p>
          </div>
        </div>
      </footer>

      {/* --- BOTÓN FLOTANTE MÓVIL --- */}
      <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
         <Link href="/reservar" className="block w-full">
            <Button className="w-full h-14 bg-azul-marino hover:bg-azul-marino/90 text-white font-extrabold text-base rounded-full shadow-[0_10px_30px_rgba(12,35,60,0.5)] border border-white/10 active:scale-95 transition-all flex items-center justify-center gap-2 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] animate-[shimmer_2s_infinite]" />
              <Sparkles className="w-5 h-5 text-amarillo" /> Reservar Fecha
            </Button>
         </Link>
      </div>

      {/* --- MODAL DE IMAGEN (ZOOM) --- */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-50">
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full max-w-5xl h-[70vh] md:h-[80vh]">
            <Image 
              src={selectedImage} 
              alt="Vista previa" 
              fill 
              className="object-contain animate-in zoom-in-95 duration-300"
            />
          </div>
        </div>
      )}
    </main>
  )
}