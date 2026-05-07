import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const nunito = Nunito({ 
  subsets: ["latin"],
  variable: '--font-nunito'
});

export const metadata: Metadata = {
  title: 'Al Agua Pato | Salón de Fiestas Infantiles en Santiago del Estero 🦆✨',
  description: 'El mejor salón de fiestas infantiles en Los Flores, Santiago del Estero. Pileta, parque acuático, shows LED y pelotero. ¡Reservá tu fecha online hoy!',
  openGraph: {
    title: 'Al Agua Pato | Fiestas Infantiles en Sgo. del Estero',
    description: 'Parque acuático, shows LED y todo incluido en Los Flores. Elegí tu fecha y reservá tu evento inolvidable.',
    url: 'https://al-agua-pato-web.vercel.app', 
    siteName: 'Al Agua Pato',
    images: [
      {
        url: '/og-image.jpg', 
        width: 1200,
        height: 630,
        alt: 'Predio de Eventos Al Agua Pato',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  // CÓDIGO INVISIBLE PARA GOOGLE (Schema.org / LocalBusiness)
  // Esto posiciona tu web por encima de la competencia en Santiago del Estero
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    "name": "Al Agua Pato | Salón de Fiestas Infantiles",
    "image": "https://al-agua-pato-web.vercel.app/og-image.jpg",
    "url": "https://al-agua-pato-web.vercel.app",
    "telephone": "+5493854470103",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Los Flores",
      "addressLocality": "Santiago del Estero",
      "addressRegion": "Santiago del Estero",
      "postalCode": "G4200",
      "addressCountry": "AR"
    },
    "description": "El mejor salón de fiestas infantiles en Los Flores, Santiago del Estero. Pileta, parque acuático, shows LED y pelotero.",
    "priceRange": "$$"
  }

  return (
    <html lang="es" className={`${nunito.variable} bg-background`}>
      <head>
        {/* Inyección del Schema para SEO Local */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}