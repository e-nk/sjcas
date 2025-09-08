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
            red: '#E62221',        // Primary Red
            blue: '#0043B3',       // Primary Blue
            white: '#ffffff',      // White
            black: '#000000',      // Black
            lightBlue: '#bde0fe',  // Light Blue
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