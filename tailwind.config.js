/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./projects/**/*.{html,ts}"
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      display: ['Inter', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        'primary-50': 'var(--primary-50)',
        'primary-100': 'var(--primary-100)',
        'primary-200': 'var(--primary-200)',
        'primary-300': 'var(--primary-300)',
        'primary-400': 'var(--primary-400)',
        'primary-500': 'var(--primary-500)',
        'primary-600': 'var(--primary-600)',
        'primary-700': 'var(--primary-700)',
        'primary-800': 'var(--primary-800)',
        'primary-900': 'var(--primary-900)',
        'surface-0': 'var(--surface-0)',
        'surface-50': 'var(--surface-50)',
        'surface-100': 'var(--surface-100)',
        'surface-200': 'var(--surface-200)',
        'surface-300': 'var(--surface-300)',
        'surface-400': 'var(--surface-400)',
        'surface-500': 'var(--surface-500)',
        'surface-600': 'var(--surface-600)',
        'surface-700': 'var(--surface-700)',
        'surface-800': 'var(--surface-800)',
        'surface-900': 'var(--surface-900)',
        'surface-950': 'var(--surface-950)',
        'text-color': 'var(--text-color)',
        'text-secondary': 'var(--text-secondary)'
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
  corePlugins: {
    preflight: false, // Desactivar preflight para evitar conflictos con PrimeNG
  }
}
