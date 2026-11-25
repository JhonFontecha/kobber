import { useEffect } from 'react'

const SITE = 'https://kobber-tienda.onrender.com'

function upsert(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!value) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

export default function Seo({ title, description, path = '/', image, type = 'website' }) {
  useEffect(() => {
    const full = title.includes('Kobber') ? title : `${title} | Kobber`
    document.title = full
    const url = path.startsWith('http') ? path : `${SITE}${path.startsWith('/') ? path : `/${path}`}`
    const img = image
      ? (image.startsWith('http') ? image : `${SITE}${image}`)
      : `${SITE}/og.jpg`
    upsert('name', 'description', description)
    upsert('property', 'og:title', full)
    upsert('property', 'og:description', description)
    upsert('property', 'og:url', url)
    upsert('property', 'og:image', img)
    upsert('property', 'og:type', type)
    upsert('property', 'og:locale', 'es_CO')
    upsert('property', 'og:site_name', 'Kobber')
    upsert('name', 'twitter:card', 'summary_large_image')
    upsert('name', 'twitter:title', full)
    upsert('name', 'twitter:description', description)
    upsert('name', 'twitter:image', img)
    let link = document.head.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = url
  }, [title, description, path, image, type])

  return null
}
