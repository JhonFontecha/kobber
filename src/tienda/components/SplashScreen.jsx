import { useEffect, useState } from 'react'
import splashImg from '../../assets/kobber-bn.png'

export default function SplashScreen({ onComplete }) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setOpen(true), 1400)
    const t2 = setTimeout(() => { setDone(true); onComplete?.() }, 2300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onComplete])

  if (done) return null

  const transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
  const imgStyle   = { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden' }}>

      {/* Mitad izquierda — recorta la imagen al 50% izquierdo y desliza a la izquierda */}
      <div style={{
        position: 'absolute', inset: 0,
        clipPath: 'inset(0 50% 0 0)',
        transform: open ? 'translateX(-50%)' : 'translateX(0)',
        transition,
      }}>
        <img src={splashImg} alt="" aria-hidden="true" style={imgStyle} />
      </div>

      {/* Mitad derecha — recorta la imagen al 50% derecho y desliza a la derecha */}
      <div style={{
        position: 'absolute', inset: 0,
        clipPath: 'inset(0 0 0 50%)',
        transform: open ? 'translateX(50%)' : 'translateX(0)',
        transition,
      }}>
        <img src={splashImg} alt="" aria-hidden="true" style={imgStyle} />
      </div>
    </div>
  )
}
