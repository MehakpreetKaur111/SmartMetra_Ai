/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#0A1A2B', 900: '#0E2033', 850: '#122740', 800: '#152B41', 700: '#1E3A57', 600: '#2B5175' },
        brass: { 300: '#FFE08A', 400: '#FFD24D', 500: '#FFC72C', 600: '#F0B01F' },
        ocean: { 50: '#EAF4F6', 100: '#D3E8EC', 200: '#A8D2DA', 500: '#1B7A8F', 600: '#166A7D', 700: '#115566' },
        canvas: '#FAF9F5',
        line: '#ECE8DF',
        success: { 50: '#E7F6EC', 600: '#1B6B3A' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04)',
        pop: '0 12px 32px -8px rgba(10,26,43,0.18)',
        fab: '0 10px 24px -6px rgba(27,122,143,0.55)',
      },
    },
  },
  plugins: [],
};