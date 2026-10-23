/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#0B1020',
          50: '#F0F3FA',
          100: '#E1E7F4',
          200: '#C2CEE9',
          300: '#94A8D6',
          400: '#5E79BB',
          500: '#3A5499',
          600: '#263B73',
          700: '#1A2952',
          800: '#111A35',
          850: '#0E162C',
          900: '#0B1020',
          950: '#060913',
        },
        cobalt: {
          DEFAULT: '#5B5CFF',
          hover: '#4C4DE6',
          light: '#EEF0FF',
          glow: 'rgba(91, 92, 255, 0.25)',
        },
        aqua: {
          DEFAULT: '#43E6D3',
          hover: '#34CFBE',
          light: '#E6FAF8',
          glow: 'rgba(67, 230, 211, 0.25)',
        },
        cloud: {
          DEFAULT: '#F7F8FC',
          pure: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E8ECF5',
        },
        coral: {
          DEFAULT: '#FF786B',
          hover: '#EE6356',
          light: '#FFF0EF',
          glow: 'rgba(255, 120, 107, 0.25)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glow-cobalt': '0 0 25px rgba(91, 92, 255, 0.35)',
        'glow-aqua': '0 0 25px rgba(67, 230, 211, 0.35)',
        'glow-coral': '0 0 25px rgba(255, 120, 107, 0.35)',
        'subtle-card': '0 4px 20px -2px rgba(11, 16, 32, 0.05)',
        'float-card': '0 12px 36px -4px rgba(11, 16, 32, 0.12)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'waveform': 'wave 1.2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
