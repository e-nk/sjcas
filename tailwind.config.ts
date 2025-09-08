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
        // School colors namespace
        school: {
          // Primary colors
          primary: {
            red: '#720026',        // Primary Red
            blue: '#88ccf1',       // Primary Blue
            white: '#FFFFFC',      // White
            black: '#000000',      // Black
            lightBlue: '#97D2FB',  // Light Blue
          },
        },
      },
      fontFamily: {
        // Brand guidelines fonts
        garamond: ['Didact Gothic', 'serif'],  // Primary font
      },
    },
  },
  plugins: [
    
  ],
}

export default config