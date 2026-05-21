import logoSrc from '../assets/logo-k.png'

export function applyRoundedFavicon() {
  const img = new Image()
  img.src = logoSrc
  img.onload = () => {
    const size   = 64
    const radius = 14   // ~22% del tamaño — mismo radio visual del logo
    const canvas = document.createElement('canvas')
    canvas.width  = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    // Clip con esquinas redondeadas
    ctx.beginPath()
    ctx.moveTo(radius, 0)
    ctx.lineTo(size - radius, 0)
    ctx.quadraticCurveTo(size, 0, size, radius)
    ctx.lineTo(size, size - radius)
    ctx.quadraticCurveTo(size, size, size - radius, size)
    ctx.lineTo(radius, size)
    ctx.quadraticCurveTo(0, size, 0, size - radius)
    ctx.lineTo(0, radius)
    ctx.quadraticCurveTo(0, 0, radius, 0)
    ctx.closePath()
    ctx.clip()

    ctx.drawImage(img, 0, 0, size, size)

    const link = document.querySelector("link[rel='icon']") || document.createElement('link')
    link.rel  = 'icon'
    link.type = 'image/png'
    link.href = canvas.toDataURL('image/png')
    document.head.appendChild(link)
  }
}
