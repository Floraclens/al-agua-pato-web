"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

export function PhotoGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // -------------------------------------------------------------------------
  // 📸 CONFIGURACIÓN DINÁMICA: 
  // Solo cambia este número cuando agregues fotos a /public/galeria/
  // Asegurate que se llamen 1.jpg, 2.jpg, 3.jpg, etc.
  const CANTIDAD_TOTAL_FOTOS = 24
  // -------------------------------------------------------------------------
  
  const images = Array.from({ length: CANTIDAD_TOTAL_FOTOS }, (_, i) => ({
    src: `/galeria/${i + 1}.jpg`,
    alt: `Salón Al Agua Pato - Foto ${i + 1}`,
  }))

  // Manejo de teclado para PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === "ArrowRight") handleNext(e as any)
      if (e.key === "ArrowLeft") handlePrev(e as any)
      if (e.key === "Escape") setSelectedIndex(null)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIndex])

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1)
    }
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)
    }
  }

  return (
    <>
      <section className="w-full max-w-7xl mx-auto px-4 pt-6 pb-2">
        
        {/* 📱 VISTA MÓVIL (Scroll infinito sin interrupciones) */}
        <div className="flex md:hidden flex-col gap-2 pb-4">
          <div 
            className="relative w-full h-[240px] sm:h-[300px] rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform"
            onClick={() => setSelectedIndex(0)}
          >
            {images[0] && (
              <Image 
                src={images[0].src} 
                alt={images[0].alt} 
                fill 
                className="object-cover" 
                priority // La primera carga de inmediato
                sizes="(max-width: 768px) 100vw, 50vw" // Optimizacion: Le decimos el tamaño real
              />
            )}
            <div className="absolute inset-0 bg-black/5" />
          </div>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-2 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {images.slice(1).map((img, index) => (
              <div 
                key={index + 1} 
                className="relative min-w-[45%] h-[120px] snap-center rounded-xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform"
                onClick={() => setSelectedIndex(index + 1)}
              >
                <Image 
                  src={img.src} 
                  alt={img.alt} 
                  fill 
                  className="object-cover" 
                  sizes="(max-width: 768px) 50vw, 25vw" // Optimizacion: Fotos chiquitas, poco peso
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/5" />
              </div>
            ))}
          </div>
        </div>

        {/* 💻 VISTA ESCRITORIO (Grilla de 4 con indicador inteligente "+X") */}
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[480px]">
          <div className="col-span-2 row-span-2 relative w-full h-full rounded-l-3xl overflow-hidden group cursor-pointer shadow-sm" onClick={() => setSelectedIndex(0)}>
            {images[0] && (
              <Image 
                src={images[0].src} 
                alt={images[0].alt} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105" 
                priority 
                sizes="(max-width: 1200px) 50vw, 33vw"
              />
            )}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
          </div>
          <div className="col-span-2 row-span-1 relative w-full h-full rounded-tr-3xl overflow-hidden group cursor-pointer shadow-sm" onClick={() => setSelectedIndex(1)}>
            {images[1] && (
              <Image 
                src={images[1].src} 
                alt={images[1].alt} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105" 
                sizes="(max-width: 1200px) 50vw, 33vw"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
          </div>
          <div className="col-span-1 row-span-1 relative w-full h-full overflow-hidden group cursor-pointer shadow-sm" onClick={() => setSelectedIndex(2)}>
            {images[2] && (
              <Image 
                src={images[2].src} 
                alt={images[2].alt} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105" 
                sizes="(max-width: 1200px) 25vw, 20vw"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
          </div>
          <div className="col-span-1 row-span-1 relative w-full h-full rounded-br-3xl overflow-hidden group cursor-pointer shadow-sm" onClick={() => setSelectedIndex(3)}>
            {images[3] && (
              <Image 
                src={images[3].src} 
                alt={images[3].alt} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105" 
                sizes="(max-width: 1200px) 25vw, 20vw"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
            
            {images.length > 4 && (
              <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center transition-all duration-300 group-hover:bg-black/70">
                <span className="text-white font-bold text-3xl tracking-wider">
                  +{images.length - 4}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 🔍 VISOR DE FOTOS (LIGHTBOX) - ALTA CALIDAD PARA EL ZOOM */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300 overscroll-none"
          onClick={() => setSelectedIndex(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-all z-20"
            onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
          >
            <X className="w-6 h-6" />
          </button>

          <button 
            className="absolute left-2 sm:left-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-all z-20"
            onClick={handlePrev}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <div className="relative w-full max-w-5xl h-full max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image 
              src={images[selectedIndex].src} 
              alt={images[selectedIndex].alt} 
              fill 
              className="object-contain animate-in fade-in zoom-in-95 duration-300" 
              key={selectedIndex}
              quality={95} // ¡ACÁ ESTÁ LA MAGIA! Calidad casi perfecta cuando hacen zoom
              sizes="100vw" // Le decimos que esta foto va a ocupar toda la pantalla
              priority
            />
          </div>

          <button 
            className="absolute right-2 sm:right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-all z-20"
            onClick={handleNext}
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 bg-black/50 px-4 py-1.5 rounded-full text-sm font-semibold tracking-widest z-20">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}