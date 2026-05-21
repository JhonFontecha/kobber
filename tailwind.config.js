/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:      '#F7F4F0',
        surface: '#FFFFFF',
        border: {
          DEFAULT: '#EAE5DD',
          strong:  '#D4CEC5',
        },
        accent: {
          DEFAULT: '#C8762C',
          dim:     '#FDF1E4',
          text:    '#9A5818',
          dark:    '#A85E20',
        },
        ink: {
          DEFAULT: '#1A1510',
          2:       '#6B6258',
          3:       '#9E9890',
        },
        success: '#2E7D52',
        danger:  '#C62828',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm:  '6px',
        md:  '8px',
        lg:  '12px',
        xl:  '16px',
        '2xl': '24px',
      },
      boxShadow: {
        card:  '0 1px 4px rgba(0,0,0,0.06)',
        float: '0 4px 16px rgba(0,0,0,0.10)',
        modal: '0 8px 32px rgba(0,0,0,0.14)',
      },
    },
  },
  plugins: [],
}
