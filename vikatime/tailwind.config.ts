// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body:    ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        cream: {
          DEFAULT: '#FDFAF5',
          dark:    '#F5EFE2',
        },
        orange: {
          DEFAULT: '#E8611A',
          light:   '#FFF0E6',
          dark:    '#C44F10',
        },
        vika: {
          green:       '#2E7D5A',
          'green-light': '#E8F5EE',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
