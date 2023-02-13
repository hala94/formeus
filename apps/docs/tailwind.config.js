module.exports = {
  content: [
    "./components/**/*.{js,tsx}",
    "./nextra-theme-docs/**/*.{js,tsx}",
    "./pages/**/*.{md,mdx,tsx}",
    "./theme.config.js",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        midnight: "#0F0F0F",
      },
    },
  },
}
