/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';
import typography from '@tailwindcss/typography';

module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './public/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'red-hat': ['"Red Hat Display"', 'sans-serif'],
        montserrat: ['"Montserrat"', 'sans-serif'],
        'noto-serif': ['"Noto Serif"', 'sans-serif'],
        merriweather: ['"Merriweather"', 'sans-serif'],
        nunito: ['"Nunito"', 'sans-serif'],
        overlock: ['"Overlock"', 'sans-serif'],
        cutive: ['"Cutive"', 'serif'],
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        marquee2: 'marquee2 25s linear infinite',
      },
    },
  },
  daisyui: {
    base: false,
    themes: [
      {
        mytheme: {
          primary: '#7E8D61',
          secondary: '#D7B676',
          accent: '#F2C2CF',
          neutral: '#ffe4e6',
          'base-100': '#F0F1D5',
          info: '#bfdbfe',
          success: '#a3e635',
          warning: '#fcd34d',
          error: '#fb7185',
        },
      },
    ],
  },
  plugins: [daisyui],
};
