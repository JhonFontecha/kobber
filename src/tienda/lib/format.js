export const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0)

export const IVA_RATE = 0.19

/** Porción de IVA ya incluida en un precio final. No se suma al total. */
export function ivaIncluido(subtotal) {
  if (!subtotal || subtotal <= 0) return 0
  const base = subtotal / (1 + IVA_RATE)
  return Math.round(subtotal - base)
}

export function envioDe(subtotal, reglas) {
  const umbral = reglas?.gratis_desde ?? 200000
  const costo = reglas?.costo ?? 15000
  if (!subtotal || subtotal <= 0) return 0
  return subtotal >= umbral ? 0 : costo
}

/** Las fotos de Truper pasan por el backend, que las achica. El resto se deja igual. */
export function imageSrc(url, w = 480) {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'https:' && parsed.hostname === 'www.truper.com' && parsed.pathname.startsWith('/media/')) {
      return `/api/store/imagen?w=${w}&src=${encodeURIComponent(url)}`
    }
  } catch {
    /* URL relativa o inválida: se usa tal cual */
  }
  return url
}
