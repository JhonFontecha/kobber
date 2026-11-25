/** Único canal de contacto que ya está publicado en la tienda. */
export const WHATSAPP_NUMBER = '573007187845'
export const WHATSAPP_DISPLAY = '+57 300 718 7845'
export const WHATSAPP_MESSAGE = 'Hola, necesito ayuda con un producto de Kobber'

export function whatsappHref(message = WHATSAPP_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
