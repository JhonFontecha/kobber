export const normalizeSearch = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '')
export function matchesSearch(values, query) {
  const text = normalizeSearch(values.join(' '))
  return String(query).trim().split(/\s+/).every(term => text.includes(normalizeSearch(term)))
}
export function productMatches(product, query) {
  return matchesSearch([product.nombre, product.marca, product.categoria, product.categoria_ml,
    product.descripcion, ...(product.caracteristicas ?? []),
    ...(product.atributos ?? []).flatMap(a => [a.nombre, a.valor, a.unidad]),
    ...(product.variantes ?? []).flatMap(v => [v.clave, v.codigo, v.descripcion])], query)
}
export function matchingVariant(product, query) {
  if (!query.trim()) return 0
  const variants = product.variantes ?? []
  const index = variants.findIndex(v => matchesSearch([product.nombre, product.marca, v.clave, v.codigo, v.descripcion], query))
  return index < 0 ? 0 : index
}
export function productTitle(product, variant) {
  const name = product?.nombre ?? ''
  const detail = variant?.descripcion?.trim()
  if (!detail || normalizeSearch(name).includes(normalizeSearch(detail))) return name
  return `${name}${/^\d/.test(detail) ? ' de ' : ' · '}${detail}`
}
export function productSummary(product, variant) {
  return [variant?.clave && `Ref. ${variant.clave}`, variant?.codigo && `Código ${variant.codigo}`,
    product.caracteristicas?.[0] || product.categoria_ml || product.categoria].filter(Boolean).join(' · ')
}
