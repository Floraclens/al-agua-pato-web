import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'

const nunito = Nunito({ 
  subsets: ["latin"],
  variable: '--font-nunito',
  display: 'swap', // OPTIMIZACIÓN: Evita el parpadeo de texto en blanco (FOIT)
});

export const metadata: Metadata = {
  metadataBase: new URL('https://al-agua-pato-web.vercel.app'), // OPTIMIZACIÓN: Base para URLs relativas en SEO
  title: 'Al Agua Pato | Salón de Fiestas Infantiles en Santiago del Estero 🦆✨',
  description: 'El mejor salón de fiestas infantiles en Los Flores, Santiago del Estero. Pileta, parque acuático, shows LED y pelotero. ¡Reservá tu fecha online hoy!',
  alternates: {
    canonical: '/',
  },
  // Reemplazá esta partecita en app/layout.tsx:
  openGraph: {
    title: 'Al Agua Pato | Fiestas Infantiles en Sgo. del Estero',
    description: 'Parque acuático, shows LED y todo incluido en este mágico lugar. Elegí tu fecha y reservá tu evento inolvidable.',
    url: 'https://al-agua-pato-web.vercel.app', 
    siteName: 'Al Agua Pato',
    images: [
      {
        url: 'https://al-agua-pato-web.vercel.app/og-image.jpg', // ABSOLUTA: Agregamos el https://...
        width: 1200,
        height: 630, 
        alt: 'Predio de Eventos Al Agua Pato',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Al Agua Pato | Fiestas Infantiles',
    description: 'El mejor salón de fiestas infantiles en Santiago del Estero.',
    images: ['https://al-agua-pato-web.vercel.app/og-image.jpg'], // ABSOLUTA ACÁ TAMBIÉN
  },
  icons: {
    icon: '/logo-circular.png', // Tu Favicon sigue siendo el logo
    apple: '/logo-circular.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    "name": "Al Agua Pato | Salón de Fiestas Infantiles",
    "image": "https://al-agua-pato-web.vercel.app/logo-circular.png",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        
        {/* Vercel Analytics para tus métricas internas */}
        {process.env.NODE_ENV === 'production' && <Analytics />}

        {/* INYECCIÓN DEL PÍXEL DE META (Seguridad: Usando variables de entorno en vez de hardcodear) */}
        {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}'); 
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img 
                height="1" 
                width="1" 
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </body>
    </html>
  )
}