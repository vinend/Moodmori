/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['VT323', 'monospace'],
        heading: ['VT323', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 15s linear infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'button-press': 'buttonPress 0.2s ease-out',
        'zoom-in-stay': 'zoomInStay 0.3s ease-out forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-120%)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        buttonPress: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        zoomInStay: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        }
      },
      boxShadow: {
        'omori-default': '8px 8px 0 rgba(0,0,0)',
        'omori-hover': '12px 12px 0 rgba(0,0,0,0.9)',
      }
    },
  },
  plugins: [],
}
