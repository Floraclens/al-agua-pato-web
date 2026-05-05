"use client"

import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"

export function PhotoGallery() {
  // Estado para el visor de fotos (Lightbox)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const images = [
    { src: "/galeria/1.jpg", alt: "Salón Al Agua Pato principal" },
    { src: "/galeria/2.jpg", alt: "Sector de juegos y pelotero" },
    { src: "/galeria/3.jpg", alt: "Cancha de fútbol y exteriores" },
    { src: "/galeria/4.jpg", alt: "Decoración y mesa principal" },
  ]

  return (
    <>
      <section className="w-full max-w-7xl mx-auto px-4 pt-6 pb-2">
        
        {/* 📱 VISTA MÓVIL: Imagen Principal Destacada + Mini Carrusel */}
        <div className="flex md:hidden flex-col gap-2 pb-4">
          {/* 1. Foto principal bien grande */}
          <div 
            className="relative w-full h-[240px] sm:h-[300px] rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform"
            onClick={() => setSelectedImage(images[0].src)}
          >
            <Image 
              src={images[0].src} 
              alt={images[0].alt} 
              fill 
              className="object-cover" 
              priority 
            />
            <div className="absolute inset-0 bg-black/5" />
          </div>
          
          {/* 2. Las otras 3 fotos en un carrusel deslizable */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-2 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {images.slice(1).map((img, index) => (
              <div 
                key={index} 
                className="relative min-w-[45%] h-[120px] snap-center rounded-xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform"
                onClick={() => setSelectedImage(img.src)}
              >
                <Image 
                  src={img.src} 
                  alt={img.alt} 
                  fill 
                  className="object-cover" 
                />
                <div className="absolute inset-0 bg-black/5" />
              </div>
            ))}
          </div>
        </div>

        {/* 💻 VISTA ESCRITORIO: Mosaico Premium de 4 fotos */}
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[480px]">
          
          <div 
            className="col-span-2 row-span-2 relative w-full h-full rounded-l-3xl overflow-hidden group cursor-pointer shadow-sm"
            onClick={() => setSelectedImage(images[0].src)}
          >
            <Image 
              src={images[0].src} 
              alt={images[0].alt} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
          </div>

          <div 
            className="col-span-2 row-span-1 relative w-full h-full rounded-tr-3xl overflow-hidden group cursor-pointer shadow-sm"
            onClick={() => setSelectedImage(images[1].src)}
          >
            <Image 
              src={images[1].src} 
              alt={images[1].alt} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
          </div>

          <div 
            className="col-span-1 row-span-1 relative w-full h-full overflow-hidden group cursor-pointer shadow-sm"
            onClick={() => setSelectedImage(images[2].src)}
          >
            <Image 
              src={images[2].src} 
              alt={images[2].alt} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
          </div>

          <div 
            className="col-span-1 row-span-1 relative w-full h-full rounded-br-3xl overflow-hidden group cursor-pointer shadow-sm"
            onClick={() => setSelectedImage(images[3].src)}
          >
            <Image 
              src={images[3].src} 
              alt={images[3].alt} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
          </div>

        </div>
      </section>

      {/* 🔍 VISOR DE FOTOS (LIGHTBOX) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          {/* Botón de cerrar */}
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-2 rounded-full transition-all z-10"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Contenedor de la foto en grande */}
          <div className="relative w-full max-w-5xl h-full max-h-[85vh]">
            <Image 
              src={selectedImage} 
              alt="Foto ampliada" 
              fill 
              className="object-contain" 
            />
          </div>
        </div>
      )}
    </>
  )
}