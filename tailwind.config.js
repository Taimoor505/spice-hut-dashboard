/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        spice: {
          50: '#fef7f0',
          100: '#fdeee1',
          200: '#f9d9be',
          300: '#f4be91',
          400: '#ed9a5e',
          500: '#e67d3a',
          600: '#c9682f',
          700: '#a84f22',
          800: '#86401f',
          900: '#6d361d',
          950: '#3b1a0d'
        },
        ink: {
          50: '#fafaf9',
          100: '#f0ede9',
          200: '#e0dbd5',
          300: '#cbc4bb',
          400: '#a8a29e',
          500: '#8a837d',
          600: '#6b6560',
          700: '#57514d',
          800: '#3d3936',
          900: '#1a1715',
          950: '#0d0c0b'
        }
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
        'elevated': '0 12px 32px -8px rgba(0, 0, 0, 0.1), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
        'overlay': '0 20px 48px -12px rgba(0, 0, 0, 0.15)',
        'glow-spice': '0 0 20px rgba(201, 104, 47, 0.15)',
        'inner-soft': 'inset 0 1px 2px rgba(0, 0, 0, 0.04)'
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px'
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }]
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-up': 'slide-up 0.3s ease-out forwards'
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
};
