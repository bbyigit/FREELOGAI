
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { brand: { blue: "#1D3D6C", orange: "#F58220", ink: "#0b1220" } },
      boxShadow: { soft: "0 10px 30px -10px rgba(0,0,0,0.2)" },
      borderRadius: { '2xl': "1rem" }
    },
  },
  plugins: [],
}
