/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Cobre de marca ──────────────────────────────────────────────
        // 500 solo para acciones principales (CTA, precio destacado, links clave)
        // 50–100 para fondos sutiles (hover de cards, badges, alertas suaves)
        // 700–900 para texto con tono de marca sobre fondos claros
        kobber: {
          50:  '#FDF5EF',
          100: '#FAE4D2',
          200: '#F3C49A',
          300: '#EAA467',
          400: '#D78443',
          500: '#C2622E',
          600: '#A04E22',
          700: '#7C3D1B',
          800: '#582B14',
          900: '#38190B',
        },
        // ── Escala neutra cálida ─────────────────────────────────────────
        // 900 solo para footer/header. El resto del sitio respira en 50–100
        graphite: {
          50:  '#FAFAF7',
          100: '#F4F2EC',
          200: '#E8E4DC',
          300: '#D3CEC2',
          400: '#A8A192',
          500: '#7C7567',
          600: '#5C564A',
          700: '#3F3A31',
          800: '#2A2620',
          900: '#1C1916',
        },
        // ── Estados (stock, alerta, error) — nunca decorativos ───────────
        success: '#2D7A4F',
        warning: '#D49C0E',
        danger:  '#B43A2C',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm:    '4px',
        md:    '8px',
        lg:    '12px',
        xl:    '16px',
        '2xl': '24px',
      },
      boxShadow: {
        card:  '0 1px 3px rgba(28,25,22,0.08)',
        float: '0 4px 16px rgba(28,25,22,0.12)',
        modal: '0 8px 40px rgba(28,25,22,0.18)',
      },
    },
  },
  plugins: [],
}
