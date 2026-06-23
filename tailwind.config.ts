import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0FEFF',
          100: '#E0FDFF',
          200: '#B3FCFF',
          300: '#80FAFF',
          400: '#4DF7FF',
          500: '#00D9FF',
          600: '#00B8D4',
          700: '#0088BB',
          800: '#006699',
          900: '#004466',
          950: '#002233',
        },
        secondary: {
          500: '#0066FF',
          600: '#0052CC',
          700: '#003D99',
        },
        dark: {
          800: '#1A1A1A',
          900: '#0F0F0F',
          950: '#050507',
        },
        danger: '#FF3B5C',
        warning: '#FFB534',
        success: '#00C853',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
