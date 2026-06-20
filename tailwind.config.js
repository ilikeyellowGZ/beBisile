/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './App.tsx', './CartContext.tsx', './constants.ts', './components/**/*.{ts,tsx}', './pages/**/*.{ts,tsx}', './utils/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2A2114',
        secondary: '#F7F4EF',
        accent: '#8A6F35',
        charcoal: '#111111',
        'soft-black': '#5B3A24',
        'muted-white': '#D8D0C3',
        'text-dark': '#2A2114',
        'text-light': '#6f6658',
        'off-white': '#F7F4EF',
      },
      fontFamily: {
        serif: ['"Big Caslon CC"', '"Bodoni Moda"', '"Cormorant Garamond"', '"Times New Roman"', 'serif'],
        subhead: ['"Bodoni Moda"', 'serif'],
        sans: ['"Poppins"', '"Inter"', 'sans-serif'],
        inter: ['"Poppins"', '"Inter"', 'sans-serif'],
      },
      letterSpacing: {
        widest: '.25em',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
