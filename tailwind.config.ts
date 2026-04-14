import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          0: 'hsl(var(--background-0))',
          1: 'hsl(var(--background-1))',
          2: 'hsl(var(--background-2))',
          3: 'hsl(var(--background-3))',
          4: 'hsl(var(--background-4))',
        },
        foreground: {
          0: 'hsl(var(--foreground-0))',
          1: 'hsl(var(--foreground-1))',
          2: 'hsl(var(--foreground-2))',
          3: 'hsl(var(--foreground-3))',
          4: 'hsl(var(--foreground-4))',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '104': '104px',
      },
    },
  },
  plugins: [],
}

export default config
