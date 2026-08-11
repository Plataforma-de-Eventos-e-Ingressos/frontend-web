/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          100: '#cee5f2', // Azul bem claro
          200: '#accbe1', // Azul claro acinzentado
          300: '#7c98b3', // Azul médio
          400: '#637081', // Ardósia / Grafite claro
          500: '#536b78', // Ardósia escuro
        }
      }
    },
  },
  plugins: [],
}

