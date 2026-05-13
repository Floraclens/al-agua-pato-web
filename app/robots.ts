import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/'], // Bloqueamos el panel de control para que no aparezca en Google
    },
    sitemap: 'https://al-agua-pato-web.vercel.app/sitemap.xml',
  }
}