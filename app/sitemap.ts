import type { MetadataRoute } from 'next'

const SITE_URL = 'https://pixora-zeta-ten.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/convert', '/resize', '/about', '/support', '/contact', '/privacy-policy', '/terms-conditions']

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/convert' || route === '/resize' ? 0.8 : 0.5,
  }))
}
