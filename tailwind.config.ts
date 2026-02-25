import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#060c1a',
        surface: '#0d1526',
        card: '#111d35',
        border: '#1e2d4a',
        'border-light': '#243452',
        primary: '#e11d48',
        emerald: '#10b981',
        sky: '#0ea5e9',
        indigo: '#6366f1',
        amber: '#f59e0b',
        muted: '#64748b',
      },
      animation: {
        'fade-up': 'fadeUp 0.45s ease both',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
