import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        yuzu: {
          50: '#FFFBF0',    // Lightest cream
          100: '#FFF4DC',   // Light vanilla
          200: '#FFE8B3',   // Soft butter
          300: '#FFD980',   // Light gold
          400: '#FFC94D',   // Warm yellow
          500: '#FFB800',   // Vibrant yuzu (primary accent)
          600: '#E6A500',   // Darker yellow
          700: '#CC9200',   // Deep gold
          800: '#997000',   // Bronze
          900: '#664B00',   // Dark amber
        },
        cream: '#FFFBF0',
        card: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '24px',
        'button': '16px',
      },
      boxShadow: {
        'yuzu': '0 20px 40px rgba(255, 184, 0, 0.15)',
        'yuzu-lg': '0 25px 50px rgba(255, 184, 0, 0.25)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config

