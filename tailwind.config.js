/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'rgb(var(--bg) / <alpha-value>)',
          soft: 'rgb(var(--bg-soft) / <alpha-value>)',
          card: 'rgb(var(--bg-card) / <alpha-value>)',
          hover: 'rgb(var(--bg-hover) / <alpha-value>)',
        },
        // Theme-aware replacement for raw `white/N` opacity overlays (borders,
        // subtle hover surfaces). White in dark mode, near-black in light mode.
        line: 'rgb(var(--line) / <alpha-value>)',
        // Mirrored slate scale: light[N] === dark[1000-N], so every existing
        // text-slate-* class automatically gets correct contrast in both themes.
        slate: {
          50: 'rgb(var(--slate-50) / <alpha-value>)',
          100: 'rgb(var(--slate-100) / <alpha-value>)',
          200: 'rgb(var(--slate-200) / <alpha-value>)',
          300: 'rgb(var(--slate-300) / <alpha-value>)',
          400: 'rgb(var(--slate-400) / <alpha-value>)',
          500: 'rgb(var(--slate-500) / <alpha-value>)',
          600: 'rgb(var(--slate-600) / <alpha-value>)',
          700: 'rgb(var(--slate-700) / <alpha-value>)',
          800: 'rgb(var(--slate-800) / <alpha-value>)',
          900: 'rgb(var(--slate-900) / <alpha-value>)',
          950: 'rgb(var(--slate-950) / <alpha-value>)',
        },
        brand: {
          50: '#eef4ff',
          100: '#dbe7ff',
          200: '#b8d0ff',
          300: '#8ab0ff',
          400: '#5c8bff',
          500: '#3d6bff',
          600: '#2b4ef0',
          700: '#233dcb',
          800: '#2135a3',
          900: '#1f3082',
        },
        accent: {
          teal: '#2dd4bf',
          amber: '#f5b942',
          rose: '#fb7185',
          violet: '#a78bfa',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(61,107,255,0.15), 0 8px 30px -8px rgba(61,107,255,0.35)',
        card: 'var(--shadow-card)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.8' },
          '80%, 100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.2,0.6,0.35,1) infinite',
      },
    },
  },
  plugins: [],
}
