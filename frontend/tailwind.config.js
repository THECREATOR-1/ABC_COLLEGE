/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#0F172A',
        accent: '#06B6D4',
        background: '#F8FAFC',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.08)',
        glow: '0 0 30px rgba(37, 99, 235, 0.3)',
      },
    },
  },
  plugins: [],
};
