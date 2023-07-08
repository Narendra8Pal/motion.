/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
"main-bg": "#272829",

dark: {
  50: '#444444',
  100: '#282424',
  200: '#2A2A2A',
  300: '#191919'
},

gradients: {
1: "#256163",
2: "#1abdd6",
}
      },

    },
  },
  plugins: [],
}
