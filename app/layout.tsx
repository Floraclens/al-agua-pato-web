import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const nunito = Nunito({ 
  subsets: ["latin"],
  variable: '--font-nunito'
});

export const metadata: Metadata = {
  title: 'Al Agua Pato | Salón de Fiestas Infantiles 🦆✨',
  description: 'Reservá tu lugar mágico. El mejor salón de fiestas infantiles con pelotero, animación y diversión asegurada.',
  openGraph: {
    title: 'Al Agua Pato | Reservas Online',
    description: '¡Armá tu fiesta a medida! Elegí tu fecha, sumá extras y reservá en un toque.',
    url: 'https://alaguapato.com.ar', // Cambiar por el dominio real cuando lo tengas
    siteName: 'Al Agua Pato',
    images: [
      {
        url: '/og-image.jpg', // Tu logo guardado en la carpeta public
        width: 1200,
        height: 630,
        alt: 'Logo Al Agua Pato',
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
  return (
    <html lang="es" className={`${nunito.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}