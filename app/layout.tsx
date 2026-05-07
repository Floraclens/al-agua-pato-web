import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script' // Importamos Script de Next.js
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        
        {/* Vercel Analytics para tus métricas internas */}
        {process.env.NODE_ENV === 'production' && <Analytics />}

        {/* INYECCIÓN DEL PÍXEL DE META (Solo carga en producción para no ensuciar datos) */}
        {process.env.NODE_ENV === 'production' && (
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
                fbq('init', 'TU_PIXEL_ID'); // REEMPLAZAR 'TU_PIXEL_ID' POR EL NÚMERO REAL
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img 
                height="1" 
                width="1" 
                style={{ display: 'none' }}
                src="https://www.facebook.com/tr?id=TU_PIXEL_ID&ev=PageView&noscript=1"
                alt=""
              />
            </noscript>
          </>
        )}
      </body>
    </html>
  )
}