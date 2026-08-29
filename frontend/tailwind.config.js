/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#040711',
        surface: {
          25: '#1a243b',
          50: '#141d30',
          100: '#0d1525',
          200: '#090f1b',
          300: '#040711',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        cyan: {
          glow: '#06b6d4',
          accent: '#22d3ee',
          400: '#22d3ee',
          500: '#06b6d4',
        },
        emerald: {
          glow: '#10b981',
          accent: '#34d399',
          400: '#34d399',
          500: '#10b981',
        },
        violet: {
          glow: '#8b5cf6',
          accent: '#a78bfa',
          400: '#a78bfa',
          500: '#8b5cf6',
        },
        rose: {
          glow: '#f43f5e',
          accent: '#fb7185',
          400: '#fb7185',
          500: '#f43f5e',
        },
        amber: {
          glow: '#f59e0b',
          accent: '#fbbf24',
          400: '#fbbf24',
          500: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'in-out-smooth': 'cubic-bezier(0.77, 0, 0.175, 1)',
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15), transparent 70%)',
        'grid-pattern': 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-spin': 'spin 12s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'laser-flow': 'laser-flow 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
